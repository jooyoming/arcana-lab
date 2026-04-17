-- 1. 유저 등급 및 기본 정보 테이블 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  grade TEXT NOT NULL DEFAULT '무료 체험', -- 무료 체험, 견습, 숙련, 통찰
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 일일 사용량 기록 테이블 (daily_usage)
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Seoul')::DATE,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, usage_date)
);

-- 3. 프로필 생성 트리거 (auth.users 가입 시 자동 생성)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, grade)
  VALUES (NEW.id, '무료 체험');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RLS 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own daily usage" ON public.daily_usage
  FOR SELECT USING (auth.uid() = user_id);

-- 5. 등급별 일일 한도 함수 (체크용)
-- grade_limits: 무료(1), 견습(3), 숙련(15), 통찰(40)
CREATE OR REPLACE FUNCTION public.get_grade_limit(user_grade TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE
    WHEN user_grade = '무료 체험' THEN 1
    WHEN user_grade = '견습' THEN 3
    WHEN user_grade = '숙련' THEN 15
    WHEN user_grade = '통찰' THEN 40
    ELSE 1
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
