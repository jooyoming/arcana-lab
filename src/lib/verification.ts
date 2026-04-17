import { createClient } from './supabase/client';

/**
 * 포트원(Portone) 본인인증 전용 스크립트 로드
 */
export function loadPortoneSDK(): Promise<void> {
  return new Promise((resolve) => {
    if (window.IMP) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * 본인인증 실행
 */
export async function requestIdentityVerification(userEmail: string, userName: string) {
  await loadPortoneSDK();
  const IMP = window.IMP;
  
  // 가맹점 식별코드 (포트원 관리자 페이지에서 확인 필요)
  // 임시 코드로 설정 (실제 운영 시 환경변수 처리 권장)
  const IMP_CODE = process.env.NEXT_PUBLIC_PORTONE_IMP_CODE || 'imp00000000';
  IMP.init(IMP_CODE);

  return new Promise((resolve, reject) => {
    IMP.certification({
      pg: 'inicis_unified.official', // PG사 설정
      merchant_uid: `cert_${new Date().getTime()}`,
      m_redirect_url: `${window.location.origin}/auth/verify-result`, // 모바일용 리다이렉트 URL
      popup: false // 모바일 환경을 위해 팝업 대신 페이지 이동 권장 (필요시 true)
    }, async (rsp: any) => {
      if (rsp.success) {
        // 인증 성공 시 서버에서 실명 정보 확인 및 프로필 업데이트 로직 필요
        // 여기서는 성공 여부만 반환
        resolve(rsp);
      } else {
        reject(new Error(rsp.error_msg));
      }
    });
  });
}

/**
 * 본인인증 성공 후 유저 프로필 업데이트 (Server Action 대용 또는 직접 호출)
 */
export async function updateProfileVerification(userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_verified: true, grade: '견습' }) // 인증 성공 시 '견습' 등급으로 상향 예시
    .eq('id', userId);

  if (error) throw error;
  return true;
}

declare global {
  interface Window {
    IMP: any;
  }
}
