'use client';

import { useState } from 'react';
import {
  TextInput,
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
import { IconAlertCircle, IconMail, IconArrowLeft, IconCircleLetterA } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : '유효한 이메일을 입력해주세요'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={80}>
      <Stack align="center" mb={30}>
        <IconCircleLetterA size={50} color="var(--bori-gold)" stroke={1.5} />
        <Title order={2} ta="center" style={{ fontFamily: 'var(--font-serif)', color: 'var(--bori-deep)' }}>
          비밀번호 찾기
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          가입하신 이메일을 입력하시면 아르카나 랩의 재설정 링크를 보내드립니다.
        </Text>
      </Stack>

      <Paper withBorder shadow="md" p={30} radius="md">
        {error && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="요청 실패" color="red" mb="md">
            {error}
          </Alert>
        )}

        {success ? (
          <Stack>
            <Alert color="teal" title="이메일 발송 완료">
              비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일 안의 링크를 확인해 주세요.
            </Alert>
            <Button component={Link} href="/auth/login" variant="light" color="bori-deep" fullWidth mt="md">
              로그인 페이지로 돌아가기
            </Button>
          </Stack>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="이메일"
                placeholder="hello@example.com"
                required
                {...form.getInputProps('email')}
              />
            </Stack>

            <Button type="submit" fullWidth mt="xl" loading={loading} className="btn-seal" size="md">
              비밀번호 재설정 링크 받기
            </Button>

            <Group justify="center" mt="lg">
              <Anchor component={Link} href="/auth/login" size="sm" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <IconArrowLeft size={14} /> 로그인으로 돌아가기
              </Anchor>
            </Group>
          </form>
        )}
      </Paper>
    </Container>
  );
}
