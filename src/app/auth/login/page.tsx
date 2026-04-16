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
          현대적 감각의 타로 리빙 솔루션, Arcana Lab
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="로그인 실패" color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
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
            className="btn-seal"
            size="md"
          >
            로그인 (Login)
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
