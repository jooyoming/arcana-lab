'use client';

import { useEffect, useState } from 'react';
import { Modal, Text, Group, Stack, Box, SimpleGrid, Paper, Loader, Center, Title, Divider } from '@mantine/core';
import { IconCircleDot, IconCircles, IconBookmarkFilled } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

const HANJI_BG = '#F9F7F2';
const MAIN_INK = '#1A2F2F';
const POINT_GOLD = '#C5A059';
const SEAL_RED = '#8B0000';
const HOLIDAY_ORANGE = '#D97706'; // 연주홍

interface DayStats {
  total: number;
  count: number;
}

interface RevenueCalendarModalProps {
  opened: boolean;
  onClose: () => void;
}

export function RevenueCalendarModal({ opened, onClose }: RevenueCalendarModalProps) {
  const [data, setData] = useState<Record<string, DayStats>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const supabase = createClient();

  const now = dayjs();
  const monthStart = now.startOf('month');
  const monthEnd = now.endOf('month');
  
  const startDay = monthStart.day();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay;
    return monthStart.add(day, 'day');
  });

  useEffect(() => {
    if (!opened) return;

    const fetchMonthlyRevenue = async () => {
      setLoading(true);
      try {
        const { data: sessions, error } = await supabase
          .from('sessions')
          .select('created_at, payment_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (error) throw error;

        const dailyMap: Record<string, DayStats> = {};
        sessions?.forEach((s) => {
          const dateKey = dayjs(s.created_at).format('YYYY-MM-DD');
          if (!dailyMap[dateKey]) {
            dailyMap[dateKey] = { total: 0, count: 0 };
          }
          dailyMap[dateKey].total += (s.payment_amount || 0);
          dailyMap[dateKey].count += 1;
        });

        setData(dailyMap);
        // 오늘 날짜 기본 선택
        const today = dayjs().format('YYYY-MM-DD');
        setSelectedDate(today);
      } catch (err) {
        console.error('Monthly revenue fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, [opened]);

  const KnotCloseButton = () => (
    <Group 
      gap={4} 
      onClick={onClose} 
      style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} 
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      <Text size="xs" fw={700} c={MAIN_INK} className="font-serif">접기</Text>
      <Box style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <IconCircles size={20} color={POINT_GOLD} stroke={2} />
      </Box>
    </Group>
  );

  const selectedStats = selectedDate ? data[selectedDate] : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="xl"
      centered
      padding={0}
      styles={{
        content: {
          backgroundColor: HANJI_BG,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
          border: `2px solid ${POINT_GOLD}`,
          borderRadius: 4,
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        },
        body: { padding: 0 }
      }}
    >
      <Box p="xl">
        <Group justify="space-between" mb="xl" pb="md" style={{ borderBottom: `1px solid ${POINT_GOLD}33` }}>
          <Title order={2} style={{ fontFamily: 'var(--font-serif)', color: MAIN_INK, letterSpacing: '-1px' }}>
            {now.format('M월')} 세입 비망록
          </Title>
          <KnotCloseButton />
        </Group>

        {loading ? (
          <Center h={400}>
            <Loader color={POINT_GOLD} />
          </Center>
        ) : (
          <Stack gap="xs">
            <SimpleGrid cols={7} spacing="xs">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <Text key={day} ta="center" size="xs" fw={900} c={i === 0 ? HOLIDAY_ORANGE : i === 6 ? 'indigo.7' : MAIN_INK} className="font-serif">
                  {day}
                </Text>
              ))}
            </SimpleGrid>

            <SimpleGrid cols={7} spacing="xs" mt="sm">
              {calendarDays.map((date, idx) => {
                const dateKey = date.format('YYYY-MM-DD');
                const stats = data[dateKey];
                const isCurrentMonth = date.month() === now.month();
                const isSelected = selectedDate === dateKey;
                const isToday = date.isSame(dayjs(), 'day');
                const dayOfWeek = date.day();
                
                return (
                  <Paper
                    key={idx}
                    withBorder
                    p={4}
                    h={85}
                    onClick={() => setSelectedDate(dateKey)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                      borderColor: isSelected ? POINT_GOLD : isToday ? `${POINT_GOLD}66` : `${POINT_GOLD}22`,
                      opacity: isCurrentMonth ? 1 : 0.3,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                      zIndex: isSelected ? 10 : 1
                    }}
                  >
                    <Group justify="space-between" align="center" gap={0} mb={2}>
                      <Text 
                        size="xs" 
                        fw={isSelected ? 900 : 700}
                        c={dayOfWeek === 0 ? HOLIDAY_ORANGE : dayOfWeek === 6 ? 'indigo.8' : MAIN_INK}
                      >
                        {date.date()}
                      </Text>
                      {stats && stats.total > 0 && (
                        <IconCircleDot size={8} color={SEAL_RED} stroke={4} />
                      )}
                    </Group>

                    {stats && stats.total > 0 && (
                      <Stack gap={0} mt="auto" align="flex-end">
                        <Text 
                          size="9px" 
                          c={SEAL_RED} 
                          fw={900} 
                          style={{ 
                            fontSize: stats.total > 100000 ? '10px' : '9px',
                            lineHeight: 1
                          }}
                        >
                          +{stats.total.toLocaleString()}
                        </Text>
                        <Text 
                          size="8px" 
                          c="dimmed" 
                          fw={600}
                          style={{ fontSize: '8px' }}
                        >
                          {stats.count}회
                        </Text>
                      </Stack>
                    )}
                    {!stats && isCurrentMonth && (
                       <Box mt="auto" style={{ alignSelf: 'flex-end' }} pr={4} pb={2}>
                         <Box style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: `${MAIN_INK}22` }} />
                       </Box>
                    )}
                  </Paper>
                );
              })}
            </SimpleGrid>

            {/* ✅ 하단 일별 요약 비망록 */}
            <Paper 
              mt="xl" 
              p="md" 
              style={{ 
                background: 'rgba(26, 47, 47, 0.03)', 
                border: `1px solid ${POINT_GOLD}44`,
                borderLeft: `4px solid ${POINT_GOLD}`
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                   <IconBookmarkFilled size={18} color={POINT_GOLD} />
                   <Text className="font-serif" fw={900} size="md" c={MAIN_INK}>
                     {dayjs(selectedDate).format('YYYY년 MM월 DD일')} 비망
                   </Text>
                </Group>
                <Divider orientation="vertical" />
                <Group gap="xl">
                  <Stack gap={0}>
                    <Text size="10px" c="dimmed" fw={700}>총 인연 (상담)</Text>
                    <Text fw={900} c={MAIN_INK}>{selectedStats?.count || 0}회</Text>
                  </Stack>
                  <Stack gap={0}>
                    <Text size="10px" c="dimmed" fw={700}>총 세입 (수익)</Text>
                    <Text fw={900} c={SEAL_RED}>{(selectedStats?.total || 0).toLocaleString()}원</Text>
                  </Stack>
                </Group>
              </Group>
            </Paper>
          </Stack>
        )}

        <Text size="10px" mt="xl" ta="center" c="dimmed" fs="italic" className="font-serif">
          귀한 인연들이 남기고 간 흔적을 비망록에 새깁니다.
        </Text>
      </Box>
    </Modal>
  );
}
