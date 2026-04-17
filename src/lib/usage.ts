import { createClient } from './supabase/client';

export type UserGrade = '무료 체험' | '견습' | '숙련' | '통찰';

export const GRADE_LIMITS: Record<UserGrade, number> = {
  '무료 체험': 1,
  '견습': 3,
  '숙련': 15,
  '통찰': 40,
};

/**
 * 한국 표준시(KST) 기준 현재 날짜 문자열 반환 (YYYY-MM-DD)
 */
export function getKSTDateString() {
  const now = new Date();
  // UTC+9 (KST) 계산
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split('T')[0];
}

/**
 * 사용자의 오늘 사용량을 확인하고, 필요한 경우 카운트를 증가시킵니다.
 */
export async function checkAndIncrementUsage(supabase: any, userId: string, shouldIncrement: boolean = true) {
  const today = getKSTDateString();

  // 1. 유저 등급 조회
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('grade')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching profile:', profileError);
    // 프로필이 없는 경우 기본적으로 '무료 체험'으로 간주하거나 에러 처리
    return { canUse: false, remaining: 0, message: '사용자 프로필을 찾을 수 없습니다.' };
  }

  const grade = profile.grade as UserGrade;
  const limit = GRADE_LIMITS[grade] || 1;

  // 2. 오늘의 사용량 조회
  const { data: usage, error: usageError } = await supabase
    .from('daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single();

  const currentCount = usage ? usage.count : 0;

  if (currentCount >= limit) {
    return {
      canUse: false,
      remaining: 0,
      message: `오늘의 운명 해독 에너지가 모두 소진되었습니다. (${grade} 등급 일일 한도 ${limit}회)`,
    };
  }

  if (!shouldIncrement) {
    return {
      canUse: true,
      remaining: limit - currentCount,
      message: `현재 에너지: ${limit - currentCount}회 남음`,
    };
  }

  // 3. 카운트 증가
  const { error: updateError } = await supabase
    .from('daily_usage')
    .upsert(
      { user_id: userId, usage_date: today, count: currentCount + 1 },
      { onConflict: 'user_id, usage_date' }
    );

  if (updateError) {
    console.error('Error updating usage:', updateError);
    return { canUse: false, remaining: 0, message: '사용량 업데이트 중 오류가 발생했습니다.' };
  }

  return {
    canUse: true,
    remaining: limit - (currentCount + 1),
    message: `해독 성공! 남은 에너지는 ${limit - (currentCount + 1)}회 입니다.`,
  };
}
