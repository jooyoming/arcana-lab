import { ALL_TARGET_CARDS, getCardImageUrl } from './tarotData';
import { TAROT_SECRET_BOOK } from './tarotKnowledge';

/**
 * 특정 날짜에 고정된 무작위 카드를 반환합니다.
 */
export function getDailyCard() {
  const today = new Date();
  const dateStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  
  // 간단한 해시 함수로 날짜별 고정된 인덱스 생성
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  
  const index = Math.abs(hash) % ALL_TARGET_CARDS.length;
  const cardName = ALL_TARGET_CARDS[index];
  
  return {
    name: cardName,
    imageUrl: getCardImageUrl(cardName),
    index
  };
}

/**
 * 타로 비법서에서 해당 카드의 '조언' 부분을 추출합니다.
 */
export function getDailyAdvice(cardName: string): string {
  // 카드명에서 번호나 부가 정보를 제외하고 핵심 이름만 추출 시도
  // 예: "0 - 바보 (The Fool)" -> "0. 바보" 또는 "바보"
  const cleanName = cardName.split(' - ')[0]; // "0" 또는 "지팡이 Ace"
  
  // 비법서에서 [0. 바보 (The Fool)] 형식을 찾음
  // 실제 비법서는 [0. 바보 (The Fool)] 또는 [지팡이 Ace (Ace of Wands)] 형식
  const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\[${escapedName}.*?\\]([\\s\\S]*?)(?=\\n\\[|$)`, 'i');
  
  const match = TAROT_SECRET_BOOK.match(regex);
  if (!match) return "오늘의 지혜를 내면에서 찾아보세요. 당신의 직관이 가장 정확한 답을 알고 있습니다.";

  const content = match[1];
  const adviceMatch = content.match(/- 조언:\s*(.*)/);
  
  if (adviceMatch) {
    return adviceMatch[1].trim();
  }

  // 조언 항목이 없으면 성격/특성이나 앞부분을 일부 추출
  const summaryMatch = content.match(/- 성격\/특성:\s*(.*)/);
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }

  return "오늘 하루도 당신의 통찰력이 빛나길 기원합니다.";
}
