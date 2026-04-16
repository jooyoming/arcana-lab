import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { SPREAD_TYPES } from '@/lib/tarotData';
import { sortCardsBySpread, type DetectedCard } from '@/lib/spreadSorter';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const tarotImage = formData.get('tarotImage') as File | null;
    const oracleImage = formData.get('oracleImage') as File | null;
    const spreadType = (formData.get('spreadType') as string) || '3-card';

    if (!tarotImage || tarotImage.size === 0) {
      return NextResponse.json({ error: '타로 카드 이미지가 제공되지 않았습니다.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const fileToInlinePart = async (file: File): Promise<Part> => {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      return {
        inlineData: {
          data: base64Data,
          mimeType: file.type as any,
        },
      };
    };

    // ── 선택된 배열법 정보 준비 ────────────────────────────────────────────
    const spread = SPREAD_TYPES.find((s) => s.value === spreadType);
    const spreadContextBlock = spread
      ? `
[현재 선택된 배열법]
배열법 이름: ${spread.label} (총 ${spread.count}장)
${spread.description ? `배열 특징: ${spread.description}\n` : ''}
아래는 각 포지션의 상대적 위치입니다 (이미지 좌상단 기준 %, 가로=x, 세로=y):
${spread.layout.map(
  (pos, i) =>
    `  포지션 ${i + 1} [${pos.label}]: x=${pos.x}%, y=${pos.y}%${pos.rotate ? ' ← 이 카드는 옆으로 교차/겹쳐있는 카드입니다' : ''}`
).join('\n')}

이 좌표를 참고하여 각 카드가 몇 번 포지션에 해당하는지 box 좌표가 정확히 반영되도록 인식해 주세요.`
      : '';

    // ── 최종 프롬프트 ──────────────────────────────────────────────────────
    const systemPrompt = `당신은 이미지 정밀 분석 AI입니다. 제공된 사진 속에 있는 타로 카드들을 모두 식별해 주세요.

[중요 예외 조항]
사진에 가로로 겹쳐 있는 카드가 있다면 '켈틱 크로스' 배열일 확률이 높습니다! 
가로로 덮인 카드와 그 아래 깔린 카드를 가장 주의 깊게 분석하고, 
가려진 부분의 테두리 두께, 고유한 색감, 기호의 일부분을 논리적으로 유추하여 카드를 식별하세요.
${spreadContextBlock}
[카드 이름 형식 규칙 - 반드시 준수]
카드 이름은 반드시 아래 형식을 그대로 사용하세요. 영어만 쓰거나 임의로 변형하지 마세요.

▶ 메이저 아르카나 형식: "숫자 - 한글명 (영문명)"
  예시: "0 - 바보 (The Fool)", "1 - 마법사 (The Magician)", "2 - 여사제 (The High Priestess)",
        "3 - 여황제 (The Empress)", "4 - 황제 (The Emperor)", "5 - 교황 (The Hierophant)",
        "6 - 연인 (The Lovers)", "7 - 전차 (The Chariot)", "8 - 힘 (Strength)",
        "9 - 은둔자 (The Hermit)", "10 - 운명의 수레바퀴 (Wheel of Fortune)", "11 - 정의 (Justice)",
        "12 - 매달린 사람 (The Hanged Man)", "13 - 죽음 (Death)", "14 - 절제 (Temperance)",
        "15 - 악마 (The Devil)", "16 - 탑 (The Tower)", "17 - 별 (The Star)",
        "18 - 달 (The Moon)", "19 - 태양 (The Sun)", "20 - 심판 (Judgement)", "21 - 세계 (The World)"

▶ 마이너 아르카나 형식: "한글슈트명 (영문슈트명) - 숫자/직위 (영문숫자/직위 of 영문슈트)"
  슈트 이름 대응: 완드=지팡이 (Wands), 컵=컵 (Cups), 소드=검 (Swords), 펜타클=펜타클 (Pentacles)
  숫자/직위 표기: Ace, 2, 3, 4, 5, 6, 7, 8, 9, 10, Page, Knight, Queen, King
  예시: "지팡이 (Wands) - Ace (Ace of Wands)", "지팡이 (Wands) - Knight (Knight of Wands)",
        "컵 (Cups) - King (King of Cups)", "검 (Swords) - 7 (7 of Swords)",
        "펜타클 (Pentacles) - 4 (4 of Pentacles)", "펜타클 (Pentacles) - Page (Page of Pentacles)"

[응답 형식 - 반드시 준수]
반드시 순수 JSON 배열만 출력하세요. 설명 텍스트, 마크다운 코드블록(없음)은 절대 포함하지 마세요.
각 카드마다 box 필드(이미지 크기 0~1000 기준 [ymin, xmin, ymax, xmax])를 포함해 주세요.
box를 인식하기 어려운 카드는 null로 표기해주세요.

출력 예시:
[
  { "index": 1, "name": "0 - 바보 (The Fool)", "orientation": "정방향", "box": [120, 300, 450, 550] },
  { "index": 2, "name": "지팡이 (Wands) - Knight (Knight of Wands)", "orientation": "역방향", "box": [130, 560, 460, 810] }
]`;

    // ── 멀티파트 콘텐츠 구성 ───────────────────────────────────────────────
    const parts: Part[] = [
      { text: systemPrompt },
      await fileToInlinePart(tarotImage),
    ];

    if (oracleImage && oracleImage.size > 0) {
      parts.push({ text: '다음은 보조적으로 사용된 오라클 카드 이미지입니다.' });
      parts.push(await fileToInlinePart(oracleImage));
    }

    const result = await model.generateContent(parts);
    const responseText = result.response.text();

    // JSON 코드 블록 제거
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsedCards: DetectedCard[] = JSON.parse(cleanedText);

    // ── 바운딩박스 기반 위치 정렬 ─────────────────────────────────────────
    const sorted = sortCardsBySpread(parsedCards, spreadType);

    console.log(`[SpreadSorter] spreadType=${spreadType}, 인식=${parsedCards.length}장, 정렬 후=${sorted.length}장`);

    return NextResponse.json({ result: sorted });
  } catch (error: any) {
    console.error('AI Card Analysis Error:', error);
    if (error?.status === 429 || error?.message?.includes('429')) {
      return NextResponse.json({ error: 'API 호출 한도를 초과했습니다(429). 1~2분 뒤 다시 시도해 주세요.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || '카드 인식 중 문제가 발생했습니다.' }, { status: 500 });
  }
}
