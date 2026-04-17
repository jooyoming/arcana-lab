'use client';

import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
  Anchor,
  Stack,
  Alert,
  Box,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCircleLetterA } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : '유효한 이메일을 입력해주세요'),
      password: (val) => (val.length <= 0 ? '비밀번호를 입력해주세요' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' ? '이메일 또는 비밀번호가 올바르지 않습니다.' : error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: 'https://arcanalab.vip-center.kr/auth/callback',
        },
      });

      if (error) throw error;
      
    } catch (e: any) {
      console.error(`OAuth Login Error (${provider}):`, e);
      setError('로그인 설정 중입니다. 잠시 후 다시 시도해 주세요.');
      setLoading(false);
    }
  };

  return (
    <Box style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      backgroundColor: 'var(--bori-ivory)',
      overflow: 'hidden'
    }}>
      {/* 💨 향 연기 & 빛 무리 오버레이 */}
      <Box className="mystic-smoke" />
      <Box className="smoke-particle" style={{ width: 400, height: 400, top: '10%', left: '0%' }} />
      <Box className="smoke-particle" style={{ width: 500, height: 500, bottom: '0%', right: '-10%', animationDelay: '3s' }} />
      <Box className="light-dapple" />

      <Container size={420} style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        <Stack align="center" mb={40}>
          <IconCircleLetterA size={56} color="var(--bori-gold)" stroke={1.5} />
          <Title 
            order={1} 
            ta="center" 
            style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '2.5rem',
              color: 'var(--bori-deep)',
              letterSpacing: '2px',
              fontWeight: 900
            }}
          >
            아르카나 랩
          </Title>
          <Text size="sm" ta="center" style={{ letterSpacing: '1px', color: 'var(--bori-deep)', opacity: 0.7 }}>
            프리미엄 타로 리딩 솔루션
          </Text>
        </Stack>

        <Paper p={40} radius="md" className="bori-card" style={{ position: 'relative', zIndex: 2 }}>
          {/* 단청 워터마크 (카드 내부) */}
          <Box className="mystic-watermark" style={{ top: -150, right: -150, opacity: 0.04 }} />

        <Box style={{ position: 'relative', zIndex: 1 }}>
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="로그인 실패" color="red" mb="md" style={{ fontFamily: 'var(--font-serif)' }}>
              {error}
            </Alert>
          )}

          <Stack mb="xl">
            <Button 
              fullWidth 
              size="md" 
              loading={loading}
              onClick={() => handleOAuthLogin('google')}
              style={{ 
                border: '1px solid var(--bori-gold)', 
                color: '#F9F7F2', 
                backgroundColor: '#8B0000', /* 깊은 자적색 (구글 대체) */
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                letterSpacing: '1px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Google 계정으로 입장하기
            </Button>
            <Button 
              fullWidth 
              size="md" 
              loading={loading}
              onClick={() => handleOAuthLogin('kakao')}
              style={{ 
                border: '1px solid var(--bori-gold)', 
                color: '#3A2305', 
                backgroundColor: '#D4B872', /* 깊은 비황색 (카카오 톤다운) */
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                letterSpacing: '1px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              카카오 계정으로 입장하기
            </Button>
          </Stack>

          <Divider label="또는 이메일로 입장" labelPosition="center" my="lg" color="rgba(197, 160, 89, 0.3)" styles={{ label: { fontFamily: 'var(--font-serif)', color: 'var(--bori-deep)' } }} />

          <form onSubmit={form.onSubmit(handleSubmit)} className="bori-input">
          <Stack>
            <TextInput
              label="이메일"
              placeholder="hello@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              required
              {...form.getInputProps('password')}
            />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Anchor component={Link} href="/auth/signup" size="sm">
              계정이 없으신가요? 회원가입
            </Anchor>
            <Anchor component={Link} href="/auth/forgot-password" size="sm" color="blue">
              비밀번호 재설정
            </Anchor>
          </Group>

          <Button 
            type="submit" 
            fullWidth 
            mt="xl" 
            loading={loading} 
            className="btn-oriental-jujube"
            size="md"
            style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}
          >
            입장하기 (Login)
          </Button>
        </form>
        </Box>
      </Paper>
    </Container>
    </Box>
  );
}
