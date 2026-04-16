'use client';

import { useEffect, useState } from 'react';
import { Container, Box, Text, Button, Group, Loader } from '@mantine/core';
import { IconBulb, IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { CardNewsSlider } from '@/components/CardNewsSlider';

interface TipSlide {
  tip_number: number;
  emoji: string;
  title: string;
  body: string;
}

interface DailyTip {
  id: string;
  publish_date: string;
  slides: TipSlide[];
}

export default function DailyTipPage() {
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];

  // 오늘 팁 불러오기
  const fetchTip = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('publish_date', today)
        .maybeSingle();

      if (dbError) throw dbError;
      setTip(data as DailyTip | null);
    } catch (e: any) {
      setError(e.message || '데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 오늘 팁 수동 생성 (API 호출)
  const generateTip = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/daily-tip', { method: 'GET' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || '생성 실패');
      // 생성 후 다시 불러오기
      await fetchTip();
    } catch (e: any) {
      setError(e.message || '팁 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchTip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fafbff 0%, #f3f0ff 100%)' }}>
      <Container size="sm" py="xl">
        {/* 헤더 */}
        <Box ta="center" mb={36}>
          <Group justify="center" gap="xs" mb={10}>
            <IconBulb size={26} color="#7c3aed" />
            <Text style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>오늘의 상담 TIP</Text>
          </Group>
          <Text c="rgba(124,58,237,0.7)" size="sm">
            초보 리더를 위한 실전 카드뉴스 · 매일 업데이트
          </Text>
        </Box>

        {/* 로딩 */}
        {loading && (
          <Box ta="center" py={80}>
            <Loader color="violet" size="md" />
            <Text c="dimmed" size="sm" mt={16}>오늘의 팁을 불러오는 중...</Text>
          </Box>
        )}

        {/* 오류 */}
        {!loading && error && (
          <Box
            ta="center" py={40}
            style={{
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 16, background: 'rgba(239,68,68,0.04)',
            }}
          >
            <IconAlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
            <Text c="red.6" size="sm" mb={16}>{error}</Text>
            <Button variant="subtle" color="violet" size="xs" onClick={fetchTip}>
              다시 시도
            </Button>
          </Box>
        )}

        {/* 팁 없을 때 — 수동 생성 버튼 */}
        {!loading && !error && !tip && (
          <Box
            ta="center" py={60}
            style={{
              border: '1px dashed rgba(124,58,237,0.25)',
              borderRadius: 20, background: 'rgba(124,58,237,0.03)',
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔮</Text>
            <Text fw={700} c="#1a1a2e" mb={8}>오늘의 팁이 아직 없어요</Text>
            <Text c="dimmed" size="sm" mb={28} maw={300} mx="auto" lh={1.7}>
              AI가 오늘의 실전 상담 팁을 제작합니다.<br />보통 10~20초 정도 걸려요.
            </Text>
            <Button
              onClick={generateTip}
              loading={generating}
              leftSection={<IconRefresh size={16} />}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
              radius="xl"
            >
              오늘의 팁 생성하기
            </Button>
          </Box>
        )}

        {/* 카드뉴스 슬라이더 */}
        {!loading && !error && tip && tip.slides.length > 0 && (
          <Box>
            <CardNewsSlider slides={tip.slides} date={tip.publish_date} />

            {/* 새로고침 버튼 */}
            <Group justify="center" mt={28}>
              <Button
                variant="subtle"
                color="violet"
                size="xs"
                leftSection={<IconRefresh size={14} />}
                onClick={fetchTip}
              >
                새로고침
              </Button>
            </Group>
          </Box>
        )}
      </Container>
    </Box>
  );
}
