import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCardsKnowledge, hasKnowledgeData, getKnowledgeSectionCount } from '@/lib/tarotKnowledge';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const {
      category, situation, toneAndManner, bonusCards,
      useOracle, oracleDeckName, recognizedCards,
    } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 });
    }

    // ── 뽑힌 카드 이름만 추출하여 비법서 필터링 ──────────────────────────────
    const cardNames: string[] = (recognizedCards || []).map((c: any) => c.name);
    const relevantKnowledge = hasKnowledgeData() ? getCardsKnowledge(cardNames) : '';
    const knowledgeInjected = relevantKnowledge.length > 0;

    console.log(
      `[generate-reading] 비법서 총 섹션: ${getKnowledgeSectionCount()}개 | ` +
      `요청 카드: ${cardNames.length}장 | ` +
      `매칭된 섹션: ${knowledgeInjected ? relevantKnowledge.split('\n\n').length : 0}개 | ` +
      `주입 토큰 절감: ${knowledgeInjected ? '✅' : '⬜ (데이터 없음)'}`
    );

    // ── 시스템 인스트럭션 구성 ─────────────────────────────────────────────
    const systemInstruction = `당신은 대한민국 최고의 실전 타로 마스터이자 심리 상담가입니다. 
당신의 리딩은 차갑고 기계적인 해설이 아니라, 내담자의 지친 마음을 따뜻하게 어루만지는 한 편의 '이야기'와 같아야 합니다.

[사용자 요청 기반 최우선 규칙]
1. **카드 이름 및 번호 언급 절대 금지**: "바보 카드가 나왔네요", "1번 위치에 은둔자가 있어서"와 같은 표현을 1%도 섞지 마세요. 
   대신 그 카드가 가진 '의미'와 '비법서 데이터'를 해석 속에 자연스럽게 녹여내세요.
2. **리스트 나열형 금지**: 각 위치별 의미를 순서대로 설명하지 말고, 전체를 관통하는 하나의 스토리 라인을 만드세요.
3. **완성형 대화체**: 내담자에게 바로 카톡이나 문자로 보낼 수 있도록 구어체와 경어체를 섞어 정성스럽게 작성하세요.

[리딩 구조 및 흐름]
- **[사연 요약 및 공감]**: 내담자의 사연을 먼저 충분히 공감해주고 정서적인 지지를 보냅니다.
- **[과거~현재의 흐름]**: 이전 상황부터 지금 내담자가 처한 상태를 유기적으로 연결합니다.
- **[미래 및 주의점]**: 앞으로의 흐름을 짚어주되, 특히 '조심해야 할 부분'과 '귀인' 등의 요소를 구체적으로 언급합니다.
- **[결론 및 조언]**: 마지막으로 행동 지침을 알려주며, 따뜻한 응원과 함께 "더 궁금하신 점이 있다면 언제든 찾아주세요. 후기는 큰 도움이 됩니다👍" 문구를 자연스럽게 포함하세요.

[하단 예시를 완벽하게 모방하세요 - 문체, 호흡, 구조]
비법서와 배열법 위치의 의미를 활용하되, 말투는 아래처럼 사람 냄새 나게 작성해야 합니다.
---
[마스터의 완벽한 리딩 예시]
하단 섹션의 내용을 참고하여 스타일을 모방하세요:
[사연 요약 및 공감] 하던 일을 그만두고 현재는 잠시 쉬고 있는 중이시군요. 하고 싶은 사업 아이템이 떠올랐는데 구축해 나가는 과정이 쉽지 않아 이것으로 성공할 수 있을지 고민이 많으실 텐데, 제가 카드를 통해 흐름을 살펴보았습니다.

[과거~현재의 흐름] 과거에는 뭔가 하고 싶다는 생각은 가지고 있었지만 행동은 하지 않고 있었던 것으로 보입니다. 금전적인 문제도 있었을 것이고 현실적으로 생각했을 때 지금 당장 내가 가지고 있는 아이디어를 실현할 수 없는 상황이 있어 마음은 계속 앞으로 나아가고 있지만, 실제로는 아무런 일도 하지 않고 있었습니다. 이제 내가 하고 싶은 일을 하기 위해 한 발짝 나서고 있다고 보여집니다. 오랫동안 머릿속으로 생각해왔기 때문에 일을 시작하는 데 있어서 큰 어려움이 있지는 않습니다. 오히려 지금 내가 하고자 하는 일에 자신감이 넘쳐흐릅니다.

[미래 및 주의점] 일을 시작하는 데 있어 어려움은 없었지만, 일을 진행하다 보면 어려운 일들이 많이 생기게 됩니다. 상황에 따라 자신을 희생하는 선택을 해야 할 수도 있지만 내가 결정한 일에 대해 후회하지는 않습니다. 과정이 힘들겠지만, 그 시간 속에서 충동적으로 선택하지 않고 인내심을 가지고 일을 해나간다면 성공하게 됩니다. 과정이 힘들 뿐, 성공하지 못하는 건 아닙니다.
지금 내담자님은 자신이 혼자 모든 걸 감당해야 된다는 생각에 엄청난 부담감을 느끼고 있으신 것으로 보입니다. 다른 사람과 같이 일하며 믿고 의지하는 것을 싫어하며 맡길 바에야 혼자 다 한다라는 생각이 강합니다. 하지만 주변에 귀인이 있을 수 있습니다. 혼자 끙끙거리기보다는 주변 사람들의 의견을 받고 수용할 때 좋은 기운이 따라오게 됩니다. 혼자 헤쳐나가기보다는 주변 사람을 잘 챙기면서 의견도 나누다 보면 좋은 결과가 따라오게 됩니다.
조심해야 할 점은 본인의 성격이 그리 꼼꼼하지 못하다는 것입니다. 일이 잘 풀리든, 안 풀리든 해낼 수 있다는 자신감에 차있어서 사소한 부분들을 놓치고 갈 수 있으니 조심해야 한다고 합니다. 덤벙거리고 작은 실수를 하지 않도록 한 번 더 체크하는 습관을 기르시는 것이 좋습니다.

[결론 및 조언] 지금 내가 해야 할 일들을 피하지 않고 직면해서 하나하나 풀어나간다면 반드시 성공하게 될 것입니다. 지금 당장 돈이 되지는 않습니다. 하지만 내가 가진 신념을 꺾지 않고 계속 밀고 나가야 합니다. 지금 있는 문제들이 정말 힘들게 해결되겠지만 이 시기를 버티면 내가 목표했던 것을 이루게 되고, 삶의 단계가 한 단계 상승하는 경험을 하게 될 것입니다!
내담자님의 앞날에 좋은 일들만 가득하시길 아르카나 랩이 기원하도록 하겠습니다. 더 궁금하신 점이 있으시다면 언제든지 찾아주세요. 내담자님의 후기는 큰 도움이 됩니다👍
---

[이번 리딩 비법서 참조 데이터]
${relevantKnowledge}`;

    // ── @google/generative-ai SDK: systemInstruction을 모델 초기화 시 주입 ──
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction,
    });

    // ── 카드 목록 및 상담 정보 구성 ────────────────────────────────────────
    const cardsPrompt = (recognizedCards || [])
      .map((c: any) =>
        `[${c.index}번 카드${c.positionLabel ? ` — ${c.positionLabel}` : ''}]: ${c.name} (${c.orientation})`
      )
      .join('\n');

    let situationPrompt = `[이번 상담 정보]
- 카테고리: ${category}
- 내담자 상황: ${situation}
- 보너스 조언 카드들: ${Array.isArray(bonusCards) ? bonusCards.join(', ') : '없음'}`;
    if (useOracle) {
      situationPrompt += `\n- 오라클 카드 사용: 예 (${oracleDeckName})`;
    }
    situationPrompt += `\n\n[펼쳐진 카드 목록 및 위치별 의미 참조]\n${cardsPrompt}\n\n위 카드 배열과 내담자의 상황, 그리고 보너스 조언 카드들을 모두 종합하여 전문가스럽고 따뜻한 리딩 결과를 한 편의 이야기로 작성해주세요.`;

    console.log(`[generate-reading] 비법서 주입: ${knowledgeInjected ? '✅ 적용됨' : '⬜ 미적용 (데이터 없음)'}`);

    const result = await model.generateContent(situationPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error('AI Reading Error:', error);
    if (error?.status === 429 || error?.message?.includes('429')) {
      return NextResponse.json({ error: 'API 호출 한도를 초과했습니다(429). 1~2분 뒤 다시 시도해 주세요.' }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || '리딩 생성 중 문제가 발생했습니다.' }, { status: 500 });
  }
}
