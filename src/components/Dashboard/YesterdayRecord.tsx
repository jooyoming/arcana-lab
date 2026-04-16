'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Group, Text, Stack, Skeleton, Title, ThemeIcon } from '@mantine/core';
import { IconUsers, IconCoin } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import dayjs from 'dayjs';

const POINT_GOLD = '#C5A059';
const MAIN_INK = '#1A2F2F';
const HANJI_BG = '#F9F7F2';

export function YesterdayRecord() {
  const [stats, setStats] = useState<{ count: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchYesterdayData = async () => {
      try {
        // 어제 날짜 계산 (로컬 기준)
        const yesterday = dayjs().subtract(1, 'day');
        const start = yesterday.startOf('day').toISOString();
        const end = yesterday.endOf('day').toISOString();

        const { data, error } = await supabase
          .from('sessions')
          .select('payment_amount')
          .gte('created_at', start)
          .lte('created_at', end);

        if (error) throw error;

        const count = data?.length || 0;
        const total = data?.reduce((acc, curr) => acc + (curr.payment_amount || 0), 0) || 0;

        setStats({ count, total });
      } catch (err) {
        console.error('Yesterday data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchYesterdayData();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton height={200} radius="md" />;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: '100%' }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box 
          mb={20}
          style={{ 
            position: 'relative',
            padding: '12px 0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 족자 상단 롤러 */}
          <Box style={{ 
            position: 'absolute', top: 0, left: '2%', right: '2%', height: 6, 
            background: 'linear-gradient(to bottom, #5C4033, #3D2B22)', 
            borderRadius: 3, zIndex: 5,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }} />

          <Paper
            p={0}
            style={{
              background: HANJI_BG,
              backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
              borderLeft: '1px solid rgba(0,0,0,0.05)',
              borderRight: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}
          >
            <Stack p="lg" gap="xs" style={{ flex: 1 }}>
              <Group gap="xs">
                <Text size="10px" c={POINT_GOLD} fw={900} style={{ letterSpacing: 2 }}>일일 비망록</Text>
                <Box style={{ h: 1, flex: 1, background: `linear-gradient(to right, ${POINT_GOLD}44, transparent)` }} />
              </Group>

              <Box mt={4}>
                <Text 
                  className="font-serif" 
                  lh={1.6} 
                  c={MAIN_INK} 
                  style={{ fontSize: '1rem', wordBreak: 'keep-all', fontWeight: 500 }}
                >
                  어제 하루, 연구소에 <span style={{ color: POINT_GOLD, fontWeight: 900, fontSize: '1.2rem' }}>{stats?.count || 0}</span>번의 인연이 머물다 갔습니다.
                </Text>
              </Box>

              <Group mt="md" grow>
                <Paper p="xs" radius="xs" style={{ background: 'rgba(197, 160, 89, 0.05)', border: `1px solid ${POINT_GOLD}22` }}>
                  <Stack gap={2} align="center">
                    <Text size="10px" c="dimmed" fw={700}>상담 건수</Text>
                    <Group gap={4}>
                       <IconUsers size={14} color={POINT_GOLD} />
                       <Text fw={900} c={MAIN_INK}>{stats?.count || 0}건</Text>
                    </Group>
                  </Stack>
                </Paper>
                <Paper p="xs" radius="xs" style={{ background: 'rgba(26, 47, 47, 0.05)', border: `1px solid ${MAIN_INK}22` }}>
                  <Stack gap={2} align="center">
                    <Text size="10px" c="dimmed" fw={700}>어제 총 복채</Text>
                    <Group gap={4}>
                       <IconCoin size={14} color={MAIN_INK} />
                       <Text fw={900} c={MAIN_INK}>{stats?.total.toLocaleString() || 0}원</Text>
                    </Group>
                  </Stack>
                </Paper>
              </Group>

              <Box mt="auto" pt="xs">
                <Text size="10px" c={MAIN_INK} opacity={0.6} className="font-serif italic">
                  기록된 인연 하나하나가 마스터님의 지혜로 피어났습니다.
                </Text>
              </Box>
            </Stack>
          </Paper>

          {/* 족자 하단 롤러 */}
          <Box style={{ 
            position: 'absolute', bottom: 0, left: '2%', right: '2%', height: 8, 
            background: 'linear-gradient(to bottom, #3D2B22, #5C4033)', 
            borderRadius: 4, zIndex: 5,
            boxShadow: '0 -2px 4px rgba(0,0,0,0.2)'
          }} />
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
