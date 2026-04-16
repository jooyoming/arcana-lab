'use client';

import { useState, useCallback } from 'react';
import { Box, Text, Group, Stack, Paper, Title } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// ── 타입 ─────────────────────────────────────────────────────────────────
interface TipSlide {
  tip_number: number;
  emoji: string;
  title: string;
  body: string;
}

// ── 전통 무늬 워터마크 (대나무/구름) ────────────────────────────────
function OrientalWatermark() {
  return (
    <svg
      width="200" height="200" viewBox="0 0 200 200"
      style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, pointerEvents: 'none', color: '#3A4D39' }}
      aria-hidden="true"
    >
      <path
        d="M50 10 Q60 50 50 190 M48 10 Q58 50 48 190 M100 10 Q110 80 100 190 M98 10 Q108 80 98 190"
        stroke="currentColor" strokeWidth="2" fill="none"
      />
      <path d="M40 40 L60 35 M40 100 L60 95 M90 70 L110 65" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// ── 낙관(도장) 배지 ──────────────────────────────────────────────────────
function SealBadge({ text }: { text: string }) {
  return (
    <Box
      style={{
        width: 44, height: 44,
        backgroundColor: 'var(--bori-seal)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        border: '1px solid var(--bori-gold)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: 'var(--font-serif)',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1.1,
        textAlign: 'center',
        padding: 4,
        userSelect: 'none'
      }}
    >
      {text.split('').map((char, i) => <div key={i}>{char}</div>)}
    </Box>
  );
}

// ── 병풍 패널 컴포넌트 ──────────────────────────────────────────────────────
function ByungpungPanel({ 
  children, 
  active, 
  direction 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  direction: 'left' | 'right' | 'center' 
}) {
  return (
    <Box
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: active ? 1 : 0,
        visibility: active ? 'visible' : 'hidden',
        transform: active 
          ? 'rotateY(0deg) scale(1)' 
          : `rotateY(${direction === 'left' ? -90 : 90}deg) scale(0.9)`,
        transformOrigin: direction === 'left' ? 'right center' : 'left center',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: active ? 2 : 1,
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </Box>
  );
}

// ── 메인 병풍 슬라이더 ────────────────────────────────────────────────
export function CardNewsSlider({ slides, date }: { slides: TipSlide[]; date: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalSlides = slides.length + 2; // 인트로 + 팁 + 아웃트로

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(totalSlides - 1, index)));
  }, [totalSlides]);

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  const renderContent = (idx: number) => {
    // 1. 인트로
    if (idx === 0) {
      return (
        <Stack align="center" justify="center" h="100%" style={{ textAlign: 'center', padding: 40, color: 'var(--bori-deep)' }}>
          <OrientalWatermark />
          <Box mb="xl">
            <SealBadge text="상담비책" />
          </Box>
          <Text size="xs" fw={700} c="var(--bori-gold)" style={{ letterSpacing: 4, textTransform: 'uppercase', marginBottom: 8 }}>
            Arcana Lab Daily Tip
          </Text>
          <Title order={2} className="font-serif" style={{ fontSize: 32, marginBottom: 12 }}>
            오늘의 상담 비책
          </Title>
          <Text size="sm" c="dimmed" style={{ fontStyle: 'italic' }}>{date}</Text>
          <Box h={2} w={40} bg="var(--bori-gold)" my="xl" />
          <Text size="sm" style={{ lineHeight: 1.8 }}>
            훌륭한 마스터는 카드의 숫자가 아닌<br />그 너머의 운명을 읽습니다.
          </Text>
        </Stack>
      );
    }

    // 2. 아웃트로
    if (idx === totalSlides - 1) {
      return (
        <Stack align="center" justify="center" h="100%" style={{ textAlign: 'center', padding: 40, color: 'var(--bori-deep)' }}>
          <OrientalWatermark />
          <Text size="xl" mb="md">🏮</Text>
          <Title order={3} className="font-serif" style={{ fontSize: 24, marginBottom: 16 }}>
            지혜로운 조언으로<br />길을 밝혀주소서.
          </Title>
          <Text size="sm" c="dimmed" lh={1.8}>
            이 비책이 마스터님의 상담에<br />깊은 통찰이 되길 기원합니다.
          </Text>
          <Box mt="xl">
            <Text fw={800} size="xs" style={{ letterSpacing: 3, opacity: 0.4 }}>ARCANA LAB</Text>
          </Box>
        </Stack>
      );
    }

    // 3. 팁 슬라이드
    const slide = slides[idx - 1];
    return (
      <Box p="xl" h="100%" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <OrientalWatermark />
        <Group justify="space-between" mb="xl">
          <Box style={{ border: '1px solid var(--bori-gold)', padding: '2px 10px', borderRadius: 2 }}>
            <Text size="xs" fw={800} c="var(--bori-gold)">비책 {slide.tip_number}</Text>
          </Box>
          <Text size="xs" c="dimmed" fw={600}>{idx} / {totalSlides - 2}</Text>
        </Group>

        <Box style={{ flex: 1 }}>
          <Text style={{ fontSize: 40, marginBottom: 20 }}>{slide.emoji}</Text>
          <Title order={3} className="font-serif" style={{ fontSize: 24, color: 'var(--bori-deep)', marginBottom: 20, lineHeight: 1.4 }}>
            {slide.title}
          </Title>
          <Box h={1} w="100%" bg="rgba(197, 160, 89, 0.2)" mb="lg" />
          <Text size="md" style={{ lineHeight: 1.9, color: 'var(--bori-text)', textAlign: 'justify' }}>
            {slide.body}
          </Text>
        </Box>

        <Box mt="auto" pt="xl">
          <Text size="10px" c="var(--bori-gold)" fw={800} ta="center" style={{ letterSpacing: 4, borderTop: '1px solid rgba(197, 160, 89, 0.1)', paddingTop: 12 }}>
            ARCANA LAB ORIENTAL
          </Text>
        </Box>
      </Box>
    );
  };

  return (
    <Box style={{ width: '100%', maxWidth: 440, margin: '0 auto' }}>
      {/* 뷰포트 - 병풍 케이스 */}
      <Box
        style={{
          width: '100%',
          aspectRatio: '4/5',
          background: 'var(--bori-bg)',
          borderRadius: 4,
          border: '8px solid var(--bori-deep)',
          outline: '1px solid var(--bori-gold)',
          outlineOffset: '-4px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
          position: 'relative',
          perspective: 1500,
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => (
          <ByungpungPanel 
            key={i} 
            active={currentIndex === i} 
            direction={i < currentIndex ? 'left' : 'right'}
          >
            {renderContent(i)}
          </ByungpungPanel>
        ))}
      </Box>

      {/* 내비게이션 */}
      <Group justify="center" gap={30} mt={24}>
        <Box
          onClick={goPrev}
          className="btn-brush"
          style={{ 
            cursor: currentIndex === 0 ? 'default' : 'pointer',
            opacity: currentIndex === 0 ? 0.3 : 1,
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <IconChevronLeft size={20} /> <Text size="sm" fw={700}>이전</Text>
        </Box>

        <Group gap={6}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <Box
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: currentIndex === i ? 'var(--bori-gold)' : 'rgba(197, 160, 89, 0.2)',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </Group>

        <Box
          onClick={goNext}
          className="btn-brush"
          style={{ 
            cursor: currentIndex === totalSlides - 1 ? 'default' : 'pointer',
            opacity: currentIndex === totalSlides - 1 ? 0.3 : 1,
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Text size="sm" fw={700}>다음</Text> <IconChevronRight size={20} />
        </Box>
      </Group>

      <Text ta="center" size="xs" c="dimmed" mt="xs">
        비책을 좌우로 넘겨보세요
      </Text>
    </Box>
  );
}
