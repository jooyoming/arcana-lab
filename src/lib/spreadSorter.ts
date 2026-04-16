/**
 * SpreadSorter — 바운딩박스 좌표를 기반으로 카드를 배열법에 맞게 정렬합니다.
 *
 * Gemini box 좌표 규격: [ymin, xmin, ymax, xmax]  (0 ~ 1000 정수 범위)
 * SPREAD_TYPES layout 좌표: { x, y }  (0 ~ 100 % 범위, CSS 기준)
 *
 * 알고리즘: Greedy Nearest-Neighbor Matching
 *  - 각 포지션과 가장 가까운 카드 중심점을 순서대로 할당합니다.
 *  - 켈틱 크로스 / 미니 켈틱처럼 rotate 속성이 있는 포지션(교차 카드)은
 *    가로 종횡비(aspect ratio > 1.2)가 큰 카드를 우선 매칭합니다.
 */

import { SPREAD_TYPES } from './tarotData';

// ─── 공개 타입 ─────────────────────────────────────────────────────────────
export interface DetectedCard {
  name: string;
  orientation: string;
  /** Gemini 바운딩박스 [ymin, xmin, ymax, xmax], 0-1000 범위 (선택) */
  box?: [number, number, number, number];
}

export interface SortedCard {
  index: number;
  name: string;
  orientation: string;
  /** 해당 포지션의 한글 명칭 (예: "현재 상황") */
  positionLabel?: string;
}

// ─── 내부 타입 ─────────────────────────────────────────────────────────────
interface EnrichedCard {
  origIdx: number;
  name: string;
  orientation: string;
  /** 이미지 0-100% 기준 중심 x */
  cx: number;
  /** 이미지 0-100% 기준 중심 y */
  cy: number;
  /** width/height > 1.2  →  90° 회전(교차) 카드로 판단 */
  isRotated: boolean;
  hasBox: boolean;
}

// ─── 메인 함수 ─────────────────────────────────────────────────────────────

/**
 * @param cards    Gemini API가 반환한 카드 배열 (box 포함 여부 무관)
 * @param spreadType  SPREAD_TYPES 의 value 값 (예: 'celtic-cross')
 * @returns 포지션 순서대로 정렬된 SortedCard 배열
 */
export function sortCardsBySpread(
  cards: DetectedCard[],
  spreadType: string
): SortedCard[] {
  const spread = SPREAD_TYPES.find((s) => s.value === spreadType);
  const hasBoxes = cards.some(
    (c) => Array.isArray(c.box) && c.box.length === 4
  );

  // 배열법 정보 없거나 바운딩박스 없으면 원래 순서 반환
  if (!spread || !hasBoxes) {
    return cards.map((c, i) => ({
      index: i + 1,
      name: c.name,
      orientation: c.orientation,
    }));
  }

  const layout = spread.layout;

  // 각 카드의 중심 좌표 계산 (0-100% 공간)
  const enriched: EnrichedCard[] = cards.map((c, origIdx) => {
    if (!c.box || c.box.length < 4) {
      return {
        origIdx, name: c.name, orientation: c.orientation,
        cx: -1, cy: -1, isRotated: false, hasBox: false,
      };
    }
    const [ymin, xmin, ymax, xmax] = c.box;
    const cx = (xmin + xmax) / 20;   // center, /2 then /10 = /20
    const cy = (ymin + ymax) / 20;
    const w = xmax - xmin;
    const h = ymax - ymin;
    // 너비가 높이의 1.2배 이상이면 가로 방향(회전) 카드
    const isRotated = h > 0 && w / h > 1.2;
    return { origIdx, name: c.name, orientation: c.orientation, cx, cy, isRotated, hasBox: true };
  });

  const assigned = new Set<number>();
  const result: (SortedCard | null)[] = new Array(layout.length).fill(null);

  /**
   * 주어진 포지션 좌표에 가장 가까운 미할당 카드를 반환합니다.
   * preferRotated=true 이면 isRotated 카드를 먼저 탐색하고,
   * 없으면 어떤 카드든 가장 가까운 것을 반환합니다.
   */
  const findBest = (
    posX: number,
    posY: number,
    preferRotated: boolean
  ): number => {
    let bestIdx = -1;
    let minDist = Infinity;

    const tryFind = (rotatedOnly: boolean) => {
      enriched.forEach((card) => {
        if (assigned.has(card.origIdx)) return;
        if (!card.hasBox) return;
        if (rotatedOnly && !card.isRotated) return;

        const dx = card.cx - posX;
        const dy = card.cy - posY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          bestIdx = card.origIdx;
        }
      });
    };

    if (preferRotated) {
      tryFind(true);           // 1차: 회전 카드만
      if (bestIdx === -1) tryFind(false); // 2차: 없으면 아무거나
    } else {
      tryFind(false);
    }

    return bestIdx;
  };

  // ── Pass 1: rotate 속성 포지션 먼저 처리 (켈틱 크로스 교차 카드) ──────────
  layout.forEach((pos, posIdx) => {
    if (!pos.rotate) return;
    const idx = findBest(pos.x, pos.y, true);
    if (idx >= 0) {
      assigned.add(idx);
      result[posIdx] = {
        index: posIdx + 1,
        name: enriched[idx].name,
        orientation: enriched[idx].orientation,
        positionLabel: pos.label,
      };
    }
  });

  // ── Pass 2: 나머지 포지션 처리 ────────────────────────────────────────────
  layout.forEach((pos, posIdx) => {
    if (result[posIdx] !== null) return;
    const idx = findBest(pos.x, pos.y, false);
    if (idx >= 0) {
      assigned.add(idx);
      result[posIdx] = {
        index: posIdx + 1,
        name: enriched[idx].name,
        orientation: enriched[idx].orientation,
        positionLabel: pos.label,
      };
    }
  });

  // ── Pass 3: box가 없는 카드를 빈 포지션에 순서대로 채움 ─────────────────
  const noBoxCards = enriched.filter((c) => !c.hasBox && !assigned.has(c.origIdx));
  let nbi = 0;
  result.forEach((slot, posIdx) => {
    if (slot !== null || nbi >= noBoxCards.length) return;
    const card = noBoxCards[nbi++];
    assigned.add(card.origIdx);
    result[posIdx] = {
      index: posIdx + 1,
      name: card.name,
      orientation: card.orientation,
      positionLabel: layout[posIdx].label,
    };
  });

  // ── 최종 배열 구성 (null 제거 + 초과 카드 추가) ─────────────────────────
  const final: SortedCard[] = result.filter(Boolean) as SortedCard[];
  enriched.forEach((card) => {
    if (!assigned.has(card.origIdx)) {
      final.push({
        index: final.length + 1,
        name: card.name,
        orientation: card.orientation,
      });
    }
  });

  return final;
}
