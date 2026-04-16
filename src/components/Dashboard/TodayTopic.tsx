'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Group, Text, Stack, Image, Skeleton, Title } from '@mantine/core';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyCard, getDailyAdvice } from '@/lib/dailyTopic';

const POINT_GOLD = '#C5A059';
const MAIN_INK = '#1A2F2F';
const SEAL_RED = '#8B0000';
const HANJI_BG = '#F9F7F2';

// ── 낙관(Seal) 컴포넌트 ──────────────────────────────────────────────
const MasterSeal = ({ nickname }: { nickname: string }) => {
  // 닉네임이 길 경우 첫 2글자만 사용하거나 적절히 배치
  const displayTitle = nickname.length > 2 ? nickname.substring(0, 2) : nickname;
  const secondTitle = nickname.length > 2 ? nickname.substring(2, 4) : '';

  return (
    <Box
      style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 28,
        height: 28,
        border: `1.5px solid ${SEAL_RED}`,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        transform: 'rotate(-2deg)',
        boxShadow: `0 0 2px ${SEAL_RED}44`,
        backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.1) 80%)',
      }}
    >
      <Text
        size="10px"
        fw={900}
        c={SEAL_RED}
        style={{
          fontFamily: 'var(--font-serif)',
          letterSpacing: '-1.5px',
          lineHeight: 1.1,
          textAlign: 'center',
          textShadow: `0.5px 0.5px 0px ${SEAL_RED}22`,
        }}
      >
        {displayTitle.split('').map((char, i) => (
          <span key={i}>{char}{i === 0 && displayTitle.length > 1 ? <br /> : ''}</span>
        ))}
      </Text>
      <Box style={{ position: 'absolute', inset: -1, border: `1px dashed ${SEAL_RED}33`, opacity: 0.5 }} />
    </Box>
  );
};

// ── 금빛 아지랑이 효과 컴포넌트 ───────────────────────────────────────────
const GoldenHaze = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileHover={{ opacity: 0.4 }}
    style={{
      position: 'absolute',
      inset: -10,
      background: `radial-gradient(circle, ${POINT_GOLD}44 0%, transparent 70%)`,
      filter: 'blur(10px)',
      zIndex: -1,
      pointerEvents: 'none',
    }}
  />
);

interface TodayTopicProps {
  nickname: string;
}

export function TodayTopic({ nickname }: TodayTopicProps) {
  const [data, setData] = useState<{ name: string; imageUrl: string; advice: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const card = getDailyCard();
    const advice = getDailyAdvice(card.name);
    
    const timer = setTimeout(() => {
      setData({ ...card, advice });
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Skeleton height={200} radius="md" />;
  }

  if (!data) return null;

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
            <Group gap={0} wrap="nowrap" align="stretch">
              {/* 좌측 카드 이미지 영역 */}
              <Box 
                p="md" 
                style={{ 
                  width: 120, 
                  backgroundColor: 'rgba(26, 47, 47, 0.02)',
                  borderRight: `1px solid ${POINT_GOLD}22`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <motion.div style={{ position: 'relative' }} whileHover="hover">
                  <GoldenHaze />
                  <Paper 
                    shadow="xl" 
                    p={3} 
                    style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: 2,
                      border: `1px solid ${POINT_GOLD}33`,
                      position: 'relative',
                    }}
                  >
                    <Image 
                      src={data.imageUrl} 
                      alt={data.name} 
                      width={80} 
                      height={128} 
                      fit="contain"
                    />
                    <MasterSeal nickname={nickname || '마스터'} />
                  </Paper>
                </motion.div>
              </Box>

              {/* 우측 텍스트 영역 */}
              <Stack p="lg" gap="xs" style={{ flex: 1 }}>
                <Group gap="xs">
                  <Text size="10px" c={POINT_GOLD} fw={900} style={{ letterSpacing: 2 }}>금일의 화두</Text>
                  <Box style={{ h: 1, flex: 1, background: `linear-gradient(to right, ${POINT_GOLD}44, transparent)` }} />
                </Group>
                
                <Title 
                  order={3} 
                  className="font-serif" 
                  style={{ color: MAIN_INK, fontSize: '1.2rem', fontWeight: 900, lineHeight: 1.2 }}
                >
                  {data.name.split(' (')[0]}
                </Title>

                <Box mt={4}>
                  <Text 
                    className="font-serif" 
                    lh={1.5} 
                    fs="italic" 
                    c={MAIN_INK} 
                    style={{ fontSize: '0.9rem', wordBreak: 'keep-all' }}
                  >
                    "{data.advice}"
                  </Text>
                </Box>

                <Box mt="auto" pt="xs">
                  <Text size="10px" c={MAIN_INK} opacity={0.6} mt={4} className="font-serif">
                    오늘 연구소를 찾는 이들에게 <span style={{ color: POINT_GOLD, fontWeight: 900 }}>[{data.name.split(' (')[0].split(' - ').pop()}]</span>의 지혜를 나누어 주소서.
                  </Text>
                </Box>
              </Stack>
            </Group>
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
