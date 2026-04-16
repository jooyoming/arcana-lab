'use client';

import { useEffect, useState } from 'react';
import {
  Title, SimpleGrid, Card, Text, Group, Container,
  Stack, Divider, Badge, Skeleton, ThemeIcon, Box, Paper,
} from '@mantine/core';
import { IconUsers, IconCoin, IconTrendingUp, IconCalendar, IconUser, IconTag } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { TodayTopic } from '@/components/Dashboard/TodayTopic';
import { YesterdayRecord } from '@/components/Dashboard/YesterdayRecord';
import { RevenueCalendarModal } from '@/components/Dashboard/RevenueCalendarModal';
import { useDisclosure } from '@mantine/hooks';

interface RecentSession {
  id: string;
  category: string;
  payment_amount: number;
  created_at: string;
  clients: {
    name: string;
    platform: string;
  } | null;
}

interface Stats {
  todayClients: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

const formatKRW = (amount: number) =>
  amount.toLocaleString('ko-KR') + '원';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const PLATFORM_COLOR: Record<string, string> = {
  '카카오톡': 'yellow',
  '크몽': 'violet',
  '인스타그램': 'pink',
  '네이버': 'green',
  '당근': 'orange',
  '오프라인': 'gray',
  '기타': 'blue',
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ todayClients: 0, todayRevenue: 0, monthlyRevenue: 0 });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpened, { open: openCalendar, close: closeCalendar }] = useDisclosure(false);

  const supabase = createClient();
  const { user } = useAuth();
  const nickname = user?.user_metadata?.nickname || '타로 마스터';

  // 시간대별 감성 인사말 로직
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return '좋은 아침입니다';
    if (hour >= 12 && hour < 18) return '영감이 가득한 오후네요';
    if (hour >= 18 && hour < 22) return '평온한 저녁 보내고 계신가요';
    return '오늘 밤도 빛나고 있네요';
  };

  const greeting = getGreeting();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const now = new Date();

        // 오늘 00:00:00
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // 이번 달 1일 00:00:00
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // 오늘 세션
        const { data: todaySessions } = await supabase
          .from('sessions')
          .select('client_id, payment_amount')
          .gte('created_at', todayStart.toISOString());

        const todayClients = new Set(todaySessions?.map((s) => s.client_id) ?? []).size;
        const todayRevenue = (todaySessions ?? []).reduce((sum, s) => sum + (s.payment_amount ?? 0), 0);

        // 월간 세션
        const { data: monthlySessions } = await supabase
          .from('sessions')
          .select('payment_amount')
          .gte('created_at', monthStart.toISOString());

        const monthlyRevenue = (monthlySessions ?? []).reduce((sum, s) => sum + (s.payment_amount ?? 0), 0);

        setStats({ todayClients, todayRevenue, monthlyRevenue });

        // 최근 리딩 기록 (clients 조인)
        const { data: recent } = await supabase
          .from('sessions')
          .select(`id, category, payment_amount, created_at, clients (name, platform)`)
          .order('created_at', { ascending: false })
          .limit(10);

        const formattedRecent = (recent || []).map((s: any) => ({
          ...s,
          clients: Array.isArray(s.clients) ? s.clients[0] : s.clients,
        }));

        setRecentSessions(formattedRecent as RecentSession[]);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: '오늘의 내담자 수',
      value: loading ? '—' : `${stats.todayClients}명`,
      icon: <IconUsers size={20} />,
      color: 'bori-deep',
    },
    {
      title: '오늘 수익',
      value: loading ? '—' : formatKRW(stats.todayRevenue),
      icon: <IconCoin size={20} />,
      color: 'bori-gold',
    },
    {
      title: '월간 수익',
      value: loading ? '—' : formatKRW(stats.monthlyRevenue),
      icon: <IconTrendingUp size={20} />,
      color: 'bori-deep',
      onClick: openCalendar
    },
  ];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* 🏮 상단 족자 섹션 (금일의 화두 & 일일 비망록) */}
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" style={{ alignItems: 'stretch' }}>
          <TodayTopic nickname={nickname} />
          <YesterdayRecord />
        </SimpleGrid>

        {/* 🎉 환영 카드 (동양풍) */}
        <Paper 
          p={40} 
          className="bori-card"
          style={{ 
            textAlign: 'center', 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* 장식용 배경 요소 */}
          <Box style={{ 
            position: 'absolute', top: -20, left: -20, opacity: 0.05,
            fontSize: '120px', fontFamily: 'var(--font-serif)', color: 'var(--bori-deep)'
          }}>
            雅
          </Box>
          <Box style={{ 
            position: 'absolute', bottom: -20, right: -20, opacity: 0.05,
            fontSize: '120px', fontFamily: 'var(--font-serif)', color: 'var(--bori-gold)'
          }}>
            林
          </Box>

          <Stack align="center" gap="xs">
            <Text size="lg" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '2px', color: 'var(--bori-gold)', fontWeight: 700 }}>
              ARCANA LAB
            </Text>
            <Title 
              order={1} 
              style={{ 
                fontFamily: 'var(--font-serif)', 
                fontSize: '2.5rem',
                color: 'var(--bori-deep)',
                letterSpacing: '-1px'
              }}
            >
              <span style={{ fontWeight: 400 }}>{greeting}, </span>
              <span style={{ 
                color: 'var(--bori-gold)', 
                textDecoration: 'underline', 
                textUnderlineOffset: '8px',
                textDecorationThickness: '2px'
              }}>
                {nickname}
              </span>님
            </Title>
            <Text size="sm" c="dimmed" mt="md" style={{ letterSpacing: '0.5px' }}>
              오늘의 기운이 마스터님의 통찰력과 함께 빛나길 기원합니다.
            </Text>
          </Stack>
        </Paper>

        {/* 📊 성과 요약 (동양풍 카드) */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {statCards.map((stat, idx) => (
            <Card 
              key={stat.title} 
              className="bori-card" 
              p="xl"
              onClick={stat.onClick}
              style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
            >
              <Group justify="space-between" mb="xs">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '1px' }}>{stat.title}</Text>
                <ThemeIcon variant="light" color={stat.color} size="md" radius="sm">
                  {stat.icon}
                </ThemeIcon>
              </Group>
              {loading ? (
                <Skeleton height={32} width={100} radius="xs" mt="sm" />
              ) : (
                <Text mt="xs" fz={28} fw={800} style={{ color: `var(--bori-deep)`, fontFamily: 'var(--font-serif)' }}>
                  {stat.value}
                </Text>
              )}
            </Card>
          ))}
        </SimpleGrid>

        {/* 📅 월간 세입 비망록 모달 */}
        <RevenueCalendarModal opened={calendarOpened} onClose={closeCalendar} />

        {/* 최근 리딩 기록 */}
        <Box>
          <Group justify="space-between" mb="md">
            <Title order={3} fw={700} style={{ fontFamily: 'var(--font-serif)', color: 'var(--bori-deep)' }}>최근 진행한 리딩 기록</Title>
            <Text size="xs" c="dimmed">최근 10건</Text>
          </Group>

          <Paper className="bori-card" p={0} style={{ overflow: 'hidden' }}>
            {loading ? (
              <Stack gap={0} p="md">
                {[1, 2, 3].map((i) => <Skeleton key={i} height={52} radius="xs" mb="sm" />)}
              </Stack>
            ) : recentSessions.length === 0 ? (
              <Box p="xl" ta="center">
                <Text c="dimmed" size="sm">아직 기록이 없습니다. '상담 일지' 탭에서 새 기록을 작성해보세요.</Text>
              </Box>
            ) : (
              <Stack gap={0}>
                {recentSessions.map((session, idx) => (
                  <Box key={session.id}>
                    <Group
                      px="lg"
                      py="md"
                      justify="space-between"
                      style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(197, 160, 89, 0.03)' }}
                      wrap="nowrap"
                    >
                      <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <ThemeIcon variant="light" color="bori-deep" size="sm" radius="xs">
                          <IconUser size={12} />
                        </ThemeIcon>
                        <Text fw={700} size="sm" style={{ whiteSpace: 'nowrap' }}>
                          {session.clients?.name ?? '알 수 없음'}
                        </Text>
                        <Badge
                          size="xs"
                          variant="outline"
                          color="bori-deep"
                          style={{ borderColor: 'var(--bori-gold)' }}
                        >
                          {session.clients?.platform ?? '—'}
                        </Badge>
                      </Group>

                      <Group gap="xs" wrap="nowrap" style={{ flex: 1, justifyContent: 'center' }}>
                        <IconTag size={13} color="var(--bori-gold)" />
                        <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                          {session.category}
                        </Text>
                      </Group>

                      <Group gap="sm" wrap="nowrap" justify="flex-end" style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm" fw={800} style={{ color: 'var(--bori-seal)', whiteSpace: 'nowrap' }}>
                          {formatKRW(session.payment_amount ?? 0)}
                        </Text>
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(session.created_at)}
                        </Text>
                      </Group>
                    </Group>
                    {idx < recentSessions.length - 1 && <Divider color="rgba(197, 160, 89, 0.2)" />}
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Stack>
    </Container>
  );
}
