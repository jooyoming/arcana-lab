'use client';

import { AppShell, Burger, Group, NavLink, Title, useMantineTheme, Text, Button, Divider, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { IconCircleLetterA, IconDashboard, IconCards, IconUsers, IconBook, IconBulb, IconLogout, IconUserCircle } from '@tabler/icons-react';
import { GateSplash } from '@/components/Effects/GateSplash';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (pathname?.startsWith('/auth')) {
    return (
      <main>
        <GateSplash />
        {children}
      </main>
    );
  }

  return (
    <>
      <GateSplash />
      <AppShell
        header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header style={{ borderBottom: '1px solid #C5A059', backgroundColor: '#F9F7F2' }}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#1A2F2F" />
            <Group gap="xs">
              <IconCircleLetterA size={28} color="#C5A059" stroke={2} />
              <Title
                order={1}
                style={{ 
                  fontSize: '1.2rem', 
                  fontFamily: 'var(--font-serif)', 
                  letterSpacing: '1px',
                  color: '#1A2F2F',
                  fontWeight: 900
                }}
              >
                아르카나 랩 <span style={{ fontSize: '0.8rem', color: '#C5A059', fontWeight: 400 }}>Arcana Lab</span>
              </Title>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ backgroundColor: '#F9F7F2', borderRight: '1px solid #C5A059' }}>
        <Stack gap="xs">
          <NavLink
            component={Link}
            href="/"
            label="대시보드"
            leftSection={<IconDashboard size="1rem" stroke={1.5} />}
            active={pathname === '/'}
            color="bori-deep"
            variant="filled"
            style={{ borderRadius: '4px' }}
            onClick={close}
          />
          <NavLink
            component={Link}
            href="/session"
            label="상담 일지"
            leftSection={<IconCards size="1rem" stroke={1.5} />}
            active={pathname === '/session'}
            color="bori-deep"
            variant="filled"
            style={{ borderRadius: '4px' }}
            onClick={close}
          />
          <NavLink
            component={Link}
            href="/spreads"
            label="스프레드 백과"
            leftSection={<IconBook size="1rem" stroke={1.5} />}
            active={pathname === '/spreads'}
            color="bori-deep"
            variant="filled"
            style={{ borderRadius: '4px' }}
            onClick={close}
          />
          <NavLink
            component={Link}
            href="/clients"
            label="고객 목록"
            leftSection={<IconUsers size="1rem" stroke={1.5} />}
            active={pathname === '/clients'}
            color="bori-deep"
            variant="filled"
            style={{ borderRadius: '4px' }}
            onClick={close}
          />
          <NavLink
            component={Link}
            href="/tips"
            label="상담 TIP"
            leftSection={<IconBulb size="1rem" stroke={1.5} />}
            active={pathname === '/tips'}
            color="bori-deep"
            variant="filled"
            style={{ borderRadius: '4px' }}
            onClick={close}
          />
        </Stack>

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
            onClick={() => {
              close();
              sessionStorage.removeItem('arcana_gate_opened');
              signOut();
            }}
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
    </>
  );
}
