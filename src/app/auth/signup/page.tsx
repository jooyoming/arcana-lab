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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconCircleLetterA } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      email: '',
      nickname: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : '유효한 이메일을 입력해주세요'),
      nickname: (val) => (val.length < 2 ? '별칭은 최소 2자 이상이어야 합니다' : null),
      password: (val) => (val.length < 6 ? '비밀번호는 최소 6자 이상이어야 합니다' : null),
      confirmPassword: (val, values) =>
        val !== values.password ? '비밀번호가 일치하지 않습니다' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nickname: values.nickname,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container size={420} my={80}>
        <Paper className="bori-card" p={40} ta="center" style={{ textAlign: 'center' }}>
          <IconCircleLetterA size={50} color="var(--bori-gold)" style={{ marginBottom: 20 }} />
          <Title order={2} mb="md" style={{ fontFamily: 'var(--font-serif)', color: 'var(--bori-deep)' }}>인연의 시작</Title>
          <Text mb="xl" size="sm" c="dimmed">
            가입하신 이메일로 인증 메일이 발송되었습니다.<br />
            이메일 확인을 마치시면 아르카나 랩의 모든 기능을 사용하실 수 있습니다.
          </Text>
          <Button component={Link} href="/auth/login" fullWidth className="btn-seal" size="md">
            로그인 페이지로 이동
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={80}>
      <Stack align="center" mb={30}>
        <IconCircleLetterA size={50} color="var(--bori-gold)" stroke={1.5} />
        <Title 
          order={1} 
          ta="center" 
          style={{ 
            fontFamily: 'var(--font-serif)', 
            fontSize: '2.2rem',
            color: 'var(--bori-deep)',
            letterSpacing: '1px'
          }}
        >
          아르카나 랩
        </Title>
        <Text c="dimmed" size="sm" ta="center" style={{ letterSpacing: '0.5px' }}>
          새로운 리더님의 영입을 환영합니다, Arcana Lab
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="회원가입 실패" color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="타로 별칭 (마스터 네임)"
              placeholder="예: 마법사 잭"
              required
              {...form.getInputProps('nickname')}
            />
            <TextInput
              label="이메일"
              placeholder="hello@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="비밀번호"
              placeholder="최소 6자 이상"
              required
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              required
              {...form.getInputProps('confirmPassword')}
            />
          </Stack>

          <Group justify="space-between" mt="lg">
            <Anchor component={Link} href="/auth/login" size="sm">
              이미 계정이 있으신가요? 로그인
            </Anchor>
          </Group>

          <Button 
            type="submit" 
            fullWidth 
            mt="xl" 
            loading={loading} 
            className="btn-seal"
            size="md"
          >
            시작하기 (Join Us)
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
