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
import { IconAlertCircle, IconSparkles } from '@tabler/icons-react';
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
        <Paper withBorder shadow="md" p={30} radius="md" ta="center">
          <IconSparkles size={40} color="var(--mantine-color-teal-filled)" style={{ marginBottom: 20 }} />
          <Title order={2} mb="md">회원가입 완료!</Title>
          <Text mb="xl">
            가입한 이메일로 인증 메일이 발송되었습니다.<br />
            이메일 확인 후 로그인을 진행해주세요.
          </Text>
          <Button component={Link} href="/auth/login" fullWidth color="violet">
            로그인 페이지로 이동
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={80}>
      <Stack align="center" mb={30}>
        <IconSparkles size={40} color="var(--mantine-color-violet-filled)" />
        <Title order={2} ta="center" fw={900}>
          새로운 시작
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          Magician Deck과 함께 스마트하게 상담을 관리하세요
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

          <Button type="submit" fullWidth mt="xl" loading={loading} color="violet" radius="md">
            회원가입
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
