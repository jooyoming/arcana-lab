import { createBrowserClient } from '@supabase/ssr';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase 환경 변수가 누락되었습니다. .env.local 파일을 확인하고 서버를 재시작하세요.');
  }

  return createBrowserClient(
    supabaseUrl!,
    supabaseAnonKey!
  );
}
