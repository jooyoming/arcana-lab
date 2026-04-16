'use client';

import { AppShell, Burger, Group, NavLink, Title, useMantineTheme, Text, Button, Divider, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDashboard, IconCards, IconUsers, IconBook, IconBulb, IconLogout, IconUserCircle } from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // 인증 관련 페이지에서는 사이드바를 숨김
  if (pathname?.startsWith('/auth')) {
    return <main>{children}</main>;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: 'violet', to: 'grape', deg: 90 }}
              style={{ fontSize: '1.25rem' }}
            >
              Magician Deck
            </Text>
          </Group>
          <ThemeToggle />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          component={Link}
          href="/"
          label="대시보드"
          leftSection={<IconDashboard size="1rem" stroke={1.5} />}
          active={pathname === '/'}
          variant="filled"
        />
        <NavLink
          component={Link}
          href="/session"
          label="상담 일지"
          leftSection={<IconCards size="1rem" stroke={1.5} />}
          active={pathname === '/session'}
          variant="filled"
        />
        <NavLink
          component={Link}
          href="/spreads"
          label="스프레드 백과"
          leftSection={<IconBook size="1rem" stroke={1.5} />}
          active={pathname === '/spreads'}
          variant="filled"
        />
        <NavLink
          component={Link}
          href="/clients"
          label="고객 목록"
          leftSection={<IconUsers size="1rem" stroke={1.5} />}
          active={pathname === '/clients'}
          variant="filled"
        />
        <NavLink
          component={Link}
          href="/tips"
          label="상담 TIP"
          leftSection={<IconBulb size="1rem" stroke={1.5} />}
          active={pathname === '/tips'}
          variant="filled"
        />

        <Stack gap="xs" mt="auto" pt="xl">
          <Divider label="내 계정" labelPosition="center" />
          <Group px="md" py="xs" wrap="nowrap" gap="sm">
            <IconUserCircle size={24} color="gray" />
            <Text size="xs" truncate style={{ flex: 1 }}>
              {user?.email}
            </Text>
          </Group>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconLogout size={16} />}
            onClick={signOut}
            fullWidth
          >
            로그아웃
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
