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
import { IconAlertCircle, IconMoonStars } from '@tabler/icons-react';
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
        <IconMoonStars size={40} color="var(--mantine-color-violet-filled)" />
        <Title order={2} ta="center" fw={900}>
          Magician Deck
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          타로 리더님, 다시 오신 것을 환영합니다
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
          </Group>

          <Button type="submit" fullWidth mt="xl" loading={loading} color="violet">
            로그인
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
