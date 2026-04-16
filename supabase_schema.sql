-- 내담자 관리 테이블 (clients)
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(), -- 담당 리더 ID
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 예: 카카오톡, 크몽, 인스타그램 등
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기존 내담자 식별을 위해 (이름 + 플랫폼) 조합이 고유할 수 있으나,
-- 여기서는 일단 이름과 플랫폼을 기준으로 찾도록 설정

-- 타로 상담 기록 및 결제 등 CRM 관리용 (sessions)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(), -- 담당 리더 ID
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  situation TEXT,
  tarot_image_url TEXT,
  card_images JSONB DEFAULT '[]', -- 사용된 카드들의 상세 정보 (이름, URL, 방향 등)
  bonus_card TEXT,
  use_oracle BOOLEAN DEFAULT FALSE,
  oracle_deck_name TEXT,
  oracle_image_url TEXT,
  tone_and_manner TEXT,
  ai_reading_result TEXT,
  payment_amount INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 성능 향상을 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON public.sessions(client_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 1일 1개 상담 TIP 카드뉴스 테이블 (daily_tips)
-- slides: JSONB 배열, 각 요소는 { title, body, emoji?, tip_number } 구조
-- 예시: [
--   { "tip_number": 1, "emoji": "🔮", "title": "첫인상을 믿어라", "body": "..." },
--   { "tip_number": 2, "emoji": "💡", "title": "침묵도 도구다", "body": "..." }
-- ]
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_date DATE        NOT NULL UNIQUE,            -- 하루에 1개만 존재
  slides       JSONB       NOT NULL DEFAULT '[]',      -- 슬라이드 배열
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 날짜 기준 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_tips_publish_date ON public.daily_tips(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- Row Level Security (RLS) 설정
-- ────────────────────────────────────────────────────────────────────────────

-- 1. RLS 활성화
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

-- 2. clients 정책: 유저는 자신의 고객만 조회/수정/삭제 가능
CREATE POLICY "Users can manage their own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

-- 3. sessions 정책: 유저는 자신의 상담 기록만 조회/수정/삭제 가능
CREATE POLICY "Users can manage their own sessions" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

-- 4. daily_tips 정책: 모든 인증된 유저는 조회 가능, 발행(INSERT/UPDATE/DELETE)은 특정 조건 혹은 관리자만 가능
-- (여기서는 단순화를 위해 조화는 전체 허용, 쓰기는 금지 후 필요시 설정하도록 가이드)
CREATE POLICY "Anyone can view daily tips" ON public.daily_tips
  FOR SELECT USING (true);

-- 특정 관리자 UID를 알고 있다면 아래와 같이 추가 가능 (예시)
-- CREATE POLICY "Admin can manage daily tips" ON public.daily_tips
--   FOR ALL USING (auth.uid() = '여기에_관리자_UUID_입력');


