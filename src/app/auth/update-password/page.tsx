'use client';

import { useState } from 'react';
import {
  PasswordInput,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Stack,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLock, IconCheck } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (val) => (val.length < 6 ? '비밀번호는 최소 6자 이상이어야 합니다' : null),
      confirmPassword: (val, values) =>
        val !== values.password ? '비밀번호가 일치하지 않습니다' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
  };

  return (
    <Container size={420} my={80}>
      <Stack align="center" mb={30}>
        <IconLock size={40} color="var(--mantine-color-violet-filled)" />
        <Title order={2} ta="center" fw={900}>
          새 비밀번호 설정
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          새롭게 사용할 비밀번호를 입력해 주세요.
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="변경 실패" color="red" mb="md">
            {error}
          </Alert>
        )}

        {success ? (
          <Stack align="center" py="xl">
            <IconCheck size={40} color="var(--mantine-color-teal-filled)" />
            <Text fw={700} size="lg">비밀번호 변경 완료!</Text>
            <Text c="dimmed" size="sm" ta="center">
              비밀번호가 성공적으로 변경되었습니다.<br />
              잠시 후 로그인 페이지로 이동합니다.
            </Text>
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <PasswordInput
                label="새 비밀번호"
                placeholder="최소 6자 이상"
                required
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label="새 비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                required
                {...form.getInputProps('confirmPassword')}
              />
            </Stack>

            <Button type="submit" fullWidth mt="xl" loading={loading} color="violet">
              비밀번호 변경하기
            </Button>
          </form>
        )}
      </Paper>
    </Container>
  );
}
