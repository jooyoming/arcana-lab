import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// 서버 사이드 Supabase (service role이 없으면 anon key 사용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TipSlide {
  tip_number: number;
  emoji: string;
  title: string;
  body: string;
}

// GET: 수동 트리거 또는 Vercel Cron에서 호출
// 보호: ?secret=YOUR_CRON_SECRET 쿼리 파라미터로 간단 인증
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // 프로덕션에서는 환경변수로 시크릿 비교 권장
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // 오늘 데이터가 이미 있으면 스킵
    const { data: existing } = await supabase
      .from('daily_tips')
      .select('id')
      .eq('publish_date', today)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ message: `오늘(${today}) 팁은 이미 생성되어 있습니다.`, skipped: true });
    }

    // ── Gemini로 팁 생성 ────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: `당신은 10년 경력의 프로 타로 마스터이자 강사입니다.
초보 타로 리더들이 실전 상담에서 바로 써먹을 수 있는 실용적이고 구체적인 팁을 알려줍니다.
항상 따뜻하고 전문적인 어조를 유지합니다.`,
    });

    const prompt = `초보 타로 리더가 실전 상담에서 바로 사용할 수 있는 오늘의 팁을 3~4개 작성해 주세요.

[중요 규칙]
- 반드시 JSON 배열만 출력하세요. 마크다운(코드블록, \`\`\`)을 절대 포함하지 마세요.
- 각 팁은 독립된 하나의 슬라이드가 됩니다.
- title은 10자 이내의 임팩트 있는 한글 제목
- body는 2~3문장의 실용적인 설명 (구체적인 예시 포함)
- emoji는 내용과 어울리는 이모지 1개

출력 형식:
[
  {
    "tip_number": 1,
    "emoji": "🔮",
    "title": "제목",
    "body": "설명 내용..."
  },
  ...
]`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();

    // JSON 파싱 (코드블록 제거)
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const slides: TipSlide[] = JSON.parse(cleaned);

    if (!Array.isArray(slides) || slides.length === 0) {
      throw new Error('AI 응답 파싱 실패: 슬라이드 배열이 비어있습니다.');
    }

    // ── Supabase에 저장 ──────────────────────────────────────────────────────
    const { error: insertError } = await supabase
      .from('daily_tips')
      .insert({ publish_date: today, slides });

    if (insertError) throw insertError;

    console.log(`[daily-tip] ${today} 팁 ${slides.length}개 생성 완료`);
    return NextResponse.json({ success: true, date: today, count: slides.length, slides });
  } catch (error: any) {
    console.error('[daily-tip] 오류:', error);
    return NextResponse.json({ error: error.message || '팁 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
