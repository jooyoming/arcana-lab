export const MAJOR_ARCANA = [
  '0 - 바보 (The Fool)',
  '1 - 마법사 (The Magician)',
  '2 - 여사제 (The High Priestess)',
  '3 - 여황제 (The Empress)',
  '4 - 황제 (The Emperor)',
  '5 - 교황 (The Hierophant)',
  '6 - 연인 (The Lovers)',
  '7 - 전차 (The Chariot)',
  '8 - 힘 (Strength)',
  '9 - 은둔자 (The Hermit)',
  '10 - 운명의 수레바퀴 (Wheel of Fortune)',
  '11 - 정의 (Justice)',
  '12 - 매달린 사람 (The Hanged Man)',
  '13 - 죽음 (Death)',
  '14 - 절제 (Temperance)',
  '15 - 악마 (The Devil)',
  '16 - 탑 (The Tower)',
  '17 - 별 (The Star)',
  '18 - 달 (The Moon)',
  '19 - 태양 (The Sun)',
  '20 - 심판 (Judgement)',
  '21 - 세계 (The World)'
];

const SUITS = [
  { name: '지팡이 (Wands)', symbol: 'Wands' },
  { name: '컵 (Cups)', symbol: 'Cups' },
  { name: '검 (Swords)', symbol: 'Swords' },
  { name: '펜타클 (Pentacles)', symbol: 'Pentacles' }
];

const RANKS = [
  'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'
];

export const MINOR_ARCANA = SUITS.flatMap(suit => 
  RANKS.map(rank => `${suit.name} - ${rank} (${rank} of ${suit.symbol})`)
);

export const ALL_TARGET_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export interface TarotLayout {
  label: string;
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
  rotate?: number; // degrees
}

export type SpreadCategory = '전체' | '연애' | '취업' | '금전' | '학업' | '인간관계' | '기타';

export interface SpreadType {
  value: string;
  label: string;
  count: number;
  scale?: number;
  layout: TarotLayout[];
  usage?: string;
  description?: string;
  category: SpreadCategory[];
}

export const SPREAD_TYPES: SpreadType[] = [
  { 
    value: '1-card', label: '1 카드 (1장)', count: 1,
    category: ['연애', '취업', '금전', '학업', '인간관계', '기타'],
    usage: '단답형 질문, 오늘의 운세, 핵심 조언이 필요할 때',
    description: '가장 직관적이고 단순한 배열법입니다. 여러 카드를 펼칠 필요 없이 하나의 카드에 집중하여 사건의 결론이나 명확한 방향성을 찾고자 할 때 훌륭한 길잡이가 됩니다.',
    layout: [{ label: '결과/조언', x: 50, y: 50 }]
  },
  { 
    value: '2-card', label: '양자택일 배열법 (2장)', count: 2,
    category: ['연애', '취업', '학업', '기타'],
    usage: 'A와 B, 두 가지 선택지 사이에서 고민할 때',
    description: '두 갈래 길에서 헤매고 있는 내담자에게 명확한 장단점을 제시합니다. 어느 쪽을 선택했을 때 더 긍정적인 방향으로 흘러갈지 직관적으로 비교할 수 있습니다.',
    layout: [
      { label: '선택 A', x: 35, y: 50 },
      { label: '선택 B', x: 65, y: 50 }
    ]
  },
  { 
    value: '3-card', label: '3 카드 (과거-현재-미래)', count: 3,
    category: ['연애', '취업', '금전', '학업', '인간관계', '기타'],
    usage: '사건의 전반적인 흐름을 빠르게 파악하고 싶을 때',
    description: '시간의 흐름에 따른 인과관계를 가장 잘 보여주는 뼈대 배열법입니다. 문제의 원인이 무엇이었는지, 지금 어떤 상태인지 관통하여 미래의 방향을 예측합니다.',
    layout: [
      { label: '과거', x: 25, y: 50 },
      { label: '현재', x: 50, y: 50 },
      { label: '미래', x: 75, y: 50 }
    ]
  },
  { 
    value: 'horseshoe', label: '말발굽 배열법 (5장)', count: 5,
    category: ['취업', '금전', '학업', '기타'],
    usage: '상황이 복잡하여 미처 보지 못한 숨은 요인을 찾고자 할 때',
    description: '과거부터 미래까지 이어지는 아치 형태는 문제에 관여하는 보이지 않는 영향력을 섬세하게 분석하는 데 특화되어 있습니다.',
    layout: [
      { label: '과거', x: 15, y: 70 },
      { label: '현재', x: 25, y: 35 },
      { label: '숨겨진 영향', x: 50, y: 15 },
      { label: '장애물', x: 75, y: 35 },
      { label: '결과', x: 85, y: 70 }
    ]
  },
  { 
    value: 'selection', label: '선택 배열법 (5장)', count: 5,
    category: ['연애', '취업', '학업', '기타'],
    usage: '취업, 진학, 연애 등 구체적인 두 갈래길의 과정을 볼 때',
    description: '단순한 양자택일을 넘어, 각 선택지를 골랐을 때 맞이하게 될 과정(어려움)과 최종 결과를 모두 보여주어 내담자가 후회 없는 선택을 하도록 돕습니다.',
    layout: [
      { label: '질문자의 현재', x: 50, y: 80 },
      { label: '선택 A의 과정', x: 30, y: 45 },
      { label: '선택 A의 결과', x: 15, y: 15 },
      { label: '선택 B의 과정', x: 70, y: 45 },
      { label: '선택 B의 결과', x: 85, y: 15 }
    ]
  },
  { 
    value: 'cross', label: '크로스 배열법 (5장)', count: 5,
    category: ['연애', '취업', '금전', '학업', '인간관계', '기타'],
    usage: '확실한 고민거리를 해결할 구체적인 돌파구가 필요할 때',
    description: '문제를 명확히 짚고, 이를 해결할 수 있는 방법과 방해하는 요소를 십자가 모양으로 배치해 단기적인 문제 해결에 아주 실용적입니다.',
    layout: [
      { label: '과거', x: 25, y: 50 },
      { label: '미래', x: 75, y: 50 },
      { label: '해결책', x: 50, y: 15 },
      { label: '장애물', x: 50, y: 85 },
      { label: '결과', x: 50, y: 50 }
    ]
  },
  { 
    value: 'yearly-6', label: '1년 운세 배열법 (6장)', count: 6,
    category: ['기타'],
    usage: '새해, 생일, 기념일 등 2개월 단위의 단기 흐름을 보고 싶을 때',
    description: '1년을 2달 단위의 상/하반기 흐름을 짚어내고, 무슨 일이 생길지 전반적인 테마와 핵심 주제를 알아보시는데 훌륭한 배열법입니다.',
    layout: [
      { label: '1/2월', x: 25, y: 30 },
      { label: '3/4월', x: 50, y: 30 },
      { label: '5/6월', x: 75, y: 30 },
      { label: '7/8월', x: 25, y: 70 },
      { label: '9/10월', x: 50, y: 70 },
      { label: '11/12월', x: 75, y: 70 }
    ]
  },
  { 
    value: 'mini-celtic', label: '미니 켈틱 크로스 (6장)', count: 6,
    category: ['연애', '취업', '금전', '인간관계', '기타'],
    usage: '켈틱 크로스를 간소화하여 빠르지만 깊게 보고 싶을 때',
    description: '정통 켈틱 크로스의 뼈대만을 차용해 문제의 본질(인과관계 및 장애물)과 현황을 신속하고 통찰력 있게 보여줍니다.',
    layout: [
      { label: '현재 상황', x: 50, y: 50 },
      { label: '방해물', x: 50, y: 50, rotate: 90 },
      { label: '목표/이상', x: 50, y: 15 },
      { label: '기반/원인', x: 50, y: 85 },
      { label: '과거', x: 25, y: 50 },
      { label: '미래/결과', x: 75, y: 50 }
    ]
  },
  { 
    value: 'magic-seven', label: '매직 세븐 배열법 (7장)', count: 7,
    category: ['취업', '금전', '학업', '기타'],
    usage: '어떤 일을 시작하거나, 큰 결정을 내릴 때 내외부 요인까지 점검할 때',
    description: '7이라는 마법적인 숫자를 쓰는 만큼 신비로우며, "외부 환경"과 "장애물"을 비춰주기 때문에 프로젝트의 성공 가능성을 높게 점칠 수 있습니다.',
    layout: [
      { label: '과거', x: 50, y: 15 },
      { label: '현재', x: 20, y: 35 },
      { label: '미래', x: 20, y: 65 },
      { label: '결과에 대한 힌트', x: 50, y: 85 },
      { label: '외부 환경', x: 80, y: 65 },
      { label: '장애물', x: 80, y: 35 },
      { label: '최종 결과', x: 50, y: 50 }
    ]
  },
  { 
    value: 'cup-of-relationship', label: '컵 오브 릴레이션쉽 (7장)', count: 7,
    category: ['연애', '인간관계'],
    usage: '연애, 동업, 가족 등 두 사람 사이의 확실한 속마음을 알고 싶을 때',
    description: '관계 타로의 끝판왕입니다. 나와 상대방이 각각 무엇을 바라고 있는지, 속마음은 어떤지 컵처럼 담겨진 형태로 대조해볼 수 있습니다.',
    layout: [
      { label: '상대방의 마음', x: 25, y: 20 },
      { label: '나의 마음', x: 75, y: 20 },
      { label: '상대방이 바라는 것', x: 25, y: 50 },
      { label: '내가 바라는 것', x: 75, y: 50 },
      { label: '현재 우리의 상태', x: 50, y: 35 },
      { label: '장애물', x: 50, y: 65 },
      { label: '미래의 결과', x: 50, y: 90 }
    ]
  },
  { 
    value: 'harmony-9', label: '타로 궁합 (9장 배열)', count: 9,
    category: ['연애', '인간관계'],
    usage: '소개팅, 연애, 혹은 결혼 등 상대와 깊은 인연의 총체적 분석 시',
    description: '나, 너, 우리라는 3x3 구조로 관계를 철저히 파헤칩니다. 갈등이 일어나는 지점과 앞으로 보완할 부분을 모두 찾을 수 있습니다.',
    layout: [
      { label: '나의 현재', x: 20, y: 20 },
      { label: '관계의 현재', x: 50, y: 20 },
      { label: '상대의 현재', x: 80, y: 20 },
      { label: '내가 바라는 점', x: 20, y: 50 },
      { label: '관계의 문제점', x: 50, y: 50 },
      { label: '상대가 바라는 점', x: 80, y: 50 },
      { label: '나의 미래', x: 20, y: 80 },
      { label: '관계의 미래', x: 50, y: 80 },
      { label: '상대의 미래', x: 80, y: 80 }
    ]
  },
  { 
    value: 'celtic-cross', label: '켈틱 크로스 (10장)', count: 10, scale: 0.8,
    category: ['연애', '취업', '금전', '학업', '인간관계', '기타'],
    usage: '모든 상황에서 적용 가능한 궁극의 심층 분석이 필요할 때',
    description: '가장 널리 알려지고 많이 쓰이는 타로 배열의 정수인 켈틱 크로스입니다. 질문자의 무의식, 외부 영향력 및 환경 패턴을 깊이 파고들어 전반적인 해결책을 마련합니다.',
    layout: [
      { label: '현재 상황', x: 35, y: 50 },
      { label: '도전/장애물', x: 35, y: 50, rotate: 90 },
      { label: '기반/무의식', x: 35, y: 80 },
      { label: '최근의 과거', x: 15, y: 50 },
      { label: '목표/의식', x: 35, y: 20 },
      { label: '가까운 미래', x: 55, y: 50 },
      { label: '질문자의 태도', x: 80, y: 80 },
      { label: '주변 환경', x: 80, y: 60 },
      { label: '희망과 두려움', x: 80, y: 40 },
      { label: '최종 결과', x: 80, y: 20 }
    ]
  },
  {
    value: '4-card-elements', label: '4-카드 요소 배열법 (4장)', count: 4,
    category: ['기타', '인간관계'],
    usage: '상황을 구성하는 4대 요소(공기, 불, 물, 흙)의 균형을 점검할 때',
    description: '지(Earth), 수(Water), 화(Fire), 풍(Air)의 에너지가 현재 어떻게 작용하고 있는지 분석하여 균형 잡힌 해결책을 제시합니다.',
    layout: [
      { label: '공기 (생각)', x: 50, y: 20 },
      { label: '불 (행동)', x: 80, y: 50 },
      { label: '물 (감정)', x: 50, y: 80 },
      { label: '흙 (현실)', x: 20, y: 50 }
    ]
  },
  {
    value: '4-card-progress', label: '4-카드 전개 배열법 (4장)', count: 4,
    category: ['연애', '취업', '금전'],
    usage: '사건의 흐름과 최종 조언을 함께 보고 싶을 때',
    description: '과거, 현재, 미래의 흐름 끝에 구체적인 조언(Advice)을 덧붙여 실질적인 행동 지침을 제공합니다.',
    layout: [
      { label: '과거', x: 20, y: 50 },
      { label: '현재', x: 40, y: 50 },
      { label: '미래', x: 60, y: 50 },
      { label: '조언', x: 80, y: 50 }
    ]
  },
  {
    value: 'four-powers', label: 'The Four Powers (4장)', count: 4,
    category: ['기타', '학업'],
    usage: '내면의 힘과 잠재력을 기하학적 대칭 구조로 분석할 때',
    description: '육각형과 상하 대칭의 신비로운 배치를 통해 질문자가 가진 네 가지 핵심 에너지를 시각화합니다.',
    layout: [
      { label: '잠재력 (상)', x: 50, y: 20 },
      { label: '현실력 (하)', x: 50, y: 80 },
      { label: '의지력 (좌)', x: 20, y: 50 },
      { label: '실천력 (우)', x: 80, y: 50 }
    ]
  },
  {
    value: 'inner-wheel', label: 'The Inner Wheel (9장)', count: 9, scale: 0.7,
    category: ['기타'],
    usage: '1년의 흐름(8절기)과 중심 테마를 원형으로 분석할 때',
    description: '중앙의 지표 카드를 중심으로 8개의 절기를 수레바퀴 모양으로 배치하여 운명의 순환과 리듬을 읽어냅니다.',
    layout: [
      { label: '중심 지표 (Center)', x: 50, y: 50 },
      { label: '삼하인 (Samhain)', x: 50, y: 15 },
      { label: '율 (Yule)', x: 75, y: 25 },
      { label: '임볼크 (Imbolc)', x: 85, y: 50 },
      { label: '오스타라 (Ostara)', x: 75, y: 75 },
      { label: '벨테인 (Beltane)', x: 50, y: 85 },
      { label: '리타 (Litha)', x: 25, y: 75 },
      { label: '루나사 (Lughnasadh)', x: 15, y: 50 },
      { label: '마본 (Mabon)', x: 25, y: 25 }
    ]
  },
];

export function getCardImageUrl(cardName: string): string {
  if (cardName.match(/^\d+ \-/)) {
    const num = parseInt(cardName.split(' -')[0]);
    return `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m${num.toString().padStart(2, '0')}.jpg`;
  }
  
  const suitMatch = cardName.match(/\((Wands|Cups|Swords|Pentacles)\)/);
  if (suitMatch) {
    const suitChar = suitMatch[1].charAt(0).toLowerCase();
    const rankStr = cardName.split(' - ')[1].split(' ')[0];
    let num = 1;
    if (rankStr === 'Ace') num = 1;
    else if (rankStr === 'Page') num = 11;
    else if (rankStr === 'Knight') num = 12;
    else if (rankStr === 'Queen') num = 13;
    else if (rankStr === 'King') num = 14;
    else num = parseInt(rankStr);
    
    return `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/${suitChar}${num.toString().padStart(2, '0')}.jpg`;
  }

  return '';
}
