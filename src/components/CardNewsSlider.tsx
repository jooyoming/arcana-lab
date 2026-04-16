'use client';

import { useState, useRef, useCallback } from 'react';
import { Box, Text, Group } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// ── 타입 ─────────────────────────────────────────────────────────────────
interface TipSlide {
  tip_number: number;
  emoji: string;
  title: string;
  body: string;
}

// ── 워터마크 SVG (타로 감성 - 초승달 + 별) ────────────────────────────────
function TarotWatermark({ style }: { style?: string }) {
  if (style === 'moon') {
    return (
      <svg
        width="220" height="220" viewBox="0 0 220 220"
        style={{ position: 'absolute', right: -30, bottom: -30, opacity: 0.045, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <path
          d="M110 20 C60 20 20 60 20 110 C20 160 60 200 110 200 C90 180 78 148 78 110 C78 72 90 42 110 20 Z"
          fill="currentColor"
        />
        <circle cx="155" cy="55" r="8" fill="currentColor" />
        <circle cx="175" cy="90" r="5" fill="currentColor" />
        <circle cx="140" cy="30" r="4" fill="currentColor" />
      </svg>
    );
  }
  // 별 스타일
  return (
    <svg
      width="200" height="200" viewBox="0 0 200 200"
      style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.04, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <polygon
        points="100,10 115,70 175,70 128,108 145,168 100,133 55,168 72,108 25,70 85,70"
        fill="currentColor"
      />
      <circle cx="160" cy="40" r="12" fill="currentColor" />
      <circle cx="40" cy="60" r="7" fill="currentColor" />
      <circle cx="170" cy="140" r="5" fill="currentColor" />
    </svg>
  );
}

// ── 인트로 슬라이드 (고정 첫 번째 카드) ───────────────────────────────────
function IntroSlide({ totalCount, date }: { totalCount: number; date: string }) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Box
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, #f8f4ff 0%, #fdf9ff 100%)',
        padding: '40px 32px',
        position: 'relative', overflow: 'hidden', color: '#1a1a2e',
      }}
    >
      <TarotWatermark style="moon" />

      <Box style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* 장식선 */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
          <Box style={{ width: 40, height: 1, background: 'linear-gradient(to right, transparent, #7c3aed)' }} />
          <Text style={{ fontSize: 26, lineHeight: 1 }}>🔮</Text>
          <Box style={{ width: 40, height: 1, background: 'linear-gradient(to left, transparent, #7c3aed)' }} />
        </Box>

        <Text
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 4,
            color: '#7c3aed', textTransform: 'uppercase', marginBottom: 16,
          }}
        >
          Daily Tarot Tip
        </Text>
        <Text
          style={{
            fontSize: 28, fontWeight: 800, color: '#1a1a2e',
            lineHeight: 1.3, marginBottom: 12,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          오늘의 상담 TIP
        </Text>
        <Text style={{ fontSize: 13, color: '#9333ea', fontWeight: 600, marginBottom: 24 }}>
          {formatted}
        </Text>

        <Box
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 100, padding: '8px 20px',
          }}
        >
          <Text style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>
            총 {totalCount}가지 팁 ›
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

// ── 팁 슬라이드 (본문 카드) ────────────────────────────────────────────────
function TipSlideCard({ slide, index, total }: { slide: TipSlide; index: number; total: number }) {
  const isMoon = index % 2 === 0;

  return (
    <Box
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg, #ffffff 0%, #faf7ff 100%)',
        padding: '36px 32px 28px',
        position: 'relative', overflow: 'hidden', color: '#1a1a2e',
      }}
    >
      <TarotWatermark style={isMoon ? 'moon' : 'star'} />

      {/* 상단 배지 */}
      <Group justify="space-between" align="center" mb={28} style={{ position: 'relative', zIndex: 1 }}>
        <Box
          style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: 100, padding: '4px 14px',
            fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: 1,
          }}
        >
          TIP {slide.tip_number}
        </Box>
        <Text style={{ fontSize: 11, color: '#c4b5fd', fontWeight: 500 }}>
          {index + 1} / {total}
        </Text>
      </Group>

      {/* 이모지 + 제목 */}
      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <Text style={{ fontSize: 40, marginBottom: 16, lineHeight: 1 }}>{slide.emoji}</Text>

        <Text
          style={{
            fontSize: 22, fontWeight: 800, color: '#1a1a2e',
            lineHeight: 1.3, marginBottom: 20,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          {slide.title}
        </Text>

        {/* 구분선 */}
        <Box
          style={{
            width: 40, height: 2,
            background: 'linear-gradient(to right, #7c3aed, #a855f7)',
            borderRadius: 2, marginBottom: 20,
          }}
        />

        <Text
          style={{
            fontSize: 14, lineHeight: 1.85, color: '#374151',
            fontWeight: 400,
          }}
        >
          {slide.body}
        </Text>
      </Box>

      {/* 하단 장식 */}
      <Box style={{ marginTop: 24, position: 'relative', zIndex: 1 }}>
        <Box style={{ width: '100%', height: 1, background: 'linear-gradient(to right, rgba(124,58,237,0.15), transparent)' }} />
        <Text style={{ fontSize: 10, color: '#c4b5fd', marginTop: 12, letterSpacing: 2, fontWeight: 600 }}>
          MAGICIAN DECK
        </Text>
      </Box>
    </Box>
  );
}

// ── 아웃트로 슬라이드 (마지막 카드) ──────────────────────────────────────
function OutroSlide() {
  return (
    <Box
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)',
        padding: '40px 32px', position: 'relative', overflow: 'hidden',
      }}
    >
      <TarotWatermark style="star" />

      <Box style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Text style={{ fontSize: 36, marginBottom: 20 }}>✨</Text>
        <Text
          style={{
            fontSize: 20, fontWeight: 800, color: 'white',
            lineHeight: 1.4, marginBottom: 12,
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          오늘 리딩도<br />빛나길 바랍니다
        </Text>
        <Text style={{ fontSize: 13, color: 'rgba(196,181,253,0.8)', lineHeight: 1.7 }}>
          카드는 길을 보여줄 뿐,<br />선택은 언제나 내담자 본인의 것입니다.
        </Text>

        <Box style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Box style={{ width: 20, height: 1, background: 'rgba(196,181,253,0.3)' }} />
          <Text style={{ fontSize: 10, color: 'rgba(196,181,253,0.5)', letterSpacing: 3, fontWeight: 600 }}>
            MAGICIAN DECK
          </Text>
          <Box style={{ width: 20, height: 1, background: 'rgba(196,181,253,0.3)' }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── 메인 카드뉴스 컴포넌트 ────────────────────────────────────────────────
export function CardNewsSlider({ slides, date }: { slides: TipSlide[]; date: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const startXRef = useRef<number | null>(null);
  const isDragging = useRef(false);

  // 인트로 + 팁 슬라이드들 + 아웃트로
  const totalSlides = slides.length + 2; // +2: 인트로, 아웃트로

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(totalSlides - 1, index)));
  }, [totalSlides]);

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  // 터치/마우스 스와이프
  const handlePointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    isDragging.current = false;
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    if (Math.abs(e.clientX - startXRef.current) > 5) isDragging.current = true;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (startXRef.current === null) return;
    const delta = e.clientX - startXRef.current;
    if (isDragging.current && Math.abs(delta) > 40) {
      delta < 0 ? goNext() : goPrev();
    }
    startXRef.current = null;
    isDragging.current = false;
  };

  const renderSlide = (idx: number) => {
    if (idx === 0) return <IntroSlide totalCount={slides.length} date={date} />;
    if (idx === totalSlides - 1) return <OutroSlide />;
    return <TipSlideCard slide={slides[idx - 1]} index={idx - 1} total={slides.length} />;
  };

  return (
    <Box
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: 420, margin: '0 auto',
      }}
    >
      {/* 슬라이더 뷰포트 */}
      <Box
        style={{
          width: '100%',
          aspectRatio: '4/5',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(124,58,237,0.15), 0 4px 20px rgba(0,0,0,0.12)',
          position: 'relative',
          cursor: isDragging.current ? 'grabbing' : 'grab',
          userSelect: 'none',
          border: '1px solid rgba(196,181,253,0.2)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { startXRef.current = null; }}
      >
        {renderSlide(currentIndex)}
      </Box>

      {/* 화살표 + 페이지 인디케이터 */}
      <Group justify="center" align="center" gap={20} mt={20}>
        <Box
          onClick={goPrev}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: currentIndex === 0 ? 'default' : 'pointer',
            background: currentIndex === 0 ? 'rgba(124,58,237,0.05)' : 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            opacity: currentIndex === 0 ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
        >
          <IconChevronLeft size={18} color="#7c3aed" />
        </Box>

        {/* 도트 인디케이터 */}
        <Group gap={6}>
          {Array.from({ length: totalSlides }).map((_, i) => (
            <Box
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === currentIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentIndex ? '#7c3aed' : 'rgba(124,58,237,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          ))}
        </Group>

        <Box
          onClick={goNext}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: currentIndex === totalSlides - 1 ? 'default' : 'pointer',
            background: currentIndex === totalSlides - 1 ? 'rgba(124,58,237,0.05)' : 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.2)',
            opacity: currentIndex === totalSlides - 1 ? 0.3 : 1,
            transition: 'all 0.2s',
          }}
        >
          <IconChevronRight size={18} color="#7c3aed" />
        </Box>
      </Group>

      <Text style={{ fontSize: 11, color: '#c4b5fd', marginTop: 12, letterSpacing: 1 }}>
        {currentIndex + 1} / {totalSlides} · 좌우로 스와이프하세요
      </Text>
    </Box>
  );
}
