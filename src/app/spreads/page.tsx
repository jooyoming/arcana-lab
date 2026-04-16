'use client';

import { useState } from 'react';
import {
  Container, Title, Text, Group, Box, Badge, Modal, Divider, SimpleGrid, Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconBook, IconCards, IconX } from '@tabler/icons-react';
import { SPREAD_TYPES, type SpreadType, type SpreadCategory } from '@/lib/tarotData';

// ── 카테고리 탭 설정 ────────────────────────────────────────────────────────
const CATEGORIES: SpreadCategory[] = ['전체', '연애', '취업', '금전', '학업', '인간관계', '기타'];

const CATEGORY_ICONS: Record<string, string> = {
  전체: '🔮', 연애: '💕', 취업: '💼', 금전: '💰', 학업: '📚', 인간관계: '🤝', 기타: '✨',
};

const CATEGORY_COLORS: Record<string, string> = {
  전체: '#7c3aed',
  연애: '#e11d48',
  취업: '#0284c7',
  금전: '#d97706',
  학업: '#059669',
  인간관계: '#7c3aed',
  기타: '#6b7280',
};

// ── 미니 타블로 시각화 컴포넌트 ────────────────────────────────────────────
function SpreadVisual({ spread, size = 'card' }: { spread: SpreadType; size?: 'card' | 'modal' }) {
  const isModal = size === 'modal';
  const height = isModal ? 320 : 200;
  const cardW = isModal ? 44 : 30;
  const cardH = isModal ? 70 : 50;

  return (
    <Box
      style={{
        height,
        position: 'relative',
        background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f0f1a 100%)',
        borderRadius: isModal ? '12px' : '8px',
        overflow: 'hidden',
      }}
    >
      {/* 별빛 효과 */}
      {[...Array(12)].map((_, i) => (
        <Box
          key={i}
          style={{
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            left: `${(i * 37 + 11) % 94}%`,
            top: `${(i * 53 + 7) % 90}%`,
          }}
        />
      ))}

      <Box style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${spread.scale || 1})` }}>
        {spread.layout.map((pos, idx) => (
          <Tooltip key={idx} label={`${idx + 1}. ${pos.label}`} position="top" withArrow>
            <Box
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotate || 0}deg)`,
                width: pos.rotate ? cardH : cardW,
                height: pos.rotate ? cardW : cardH,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(168,85,247,0.15) 100%)',
                border: '1px solid rgba(167,139,250,0.5)',
                borderRadius: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: pos.rotate ? 10 : 5,
                cursor: 'default',
                backdropFilter: 'blur(4px)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Text size={isModal ? 'xs' : '10px'} fw={800} c="white" style={{ lineHeight: 1 }}>
                {idx + 1}
              </Text>
              {isModal && !pos.rotate && (
                <Text size="9px" c="rgba(196,181,253,0.9)" ta="center" mt={2} px={2} style={{ lineHeight: 1.2 }}>
                  {pos.label.length > 5 ? pos.label.slice(0, 5) + '…' : pos.label}
                </Text>
              )}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}

// ── 스프레드 카드 컴포넌트 ──────────────────────────────────────────────────
function SpreadCard({ spread, onClick }: { spread: SpreadType; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer',
        borderRadius: 16,
        overflow: 'hidden',
        border: hovered ? '1.5px solid rgba(139,92,246,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
        background: hovered
          ? 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,15,26,0.98) 100%)'
          : 'linear-gradient(135deg, rgba(18,18,30,0.95) 0%, rgba(10,10,18,0.98) 100%)',
        boxShadow: hovered
          ? '0 12px 40px rgba(139,92,246,0.25), 0 0 0 1px rgba(139,92,246,0.15)'
          : '0 4px 16px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* 비주얼 영역 */}
      <SpreadVisual spread={spread} size="card" />

      {/* 텍스트 영역 */}
      <Box p="md" pt="sm">
        <Group justify="space-between" mb={6} align="flex-start">
          <Text fw={700} c="white" size="sm" style={{ lineHeight: 1.3, flex: 1 }}>
            {spread.label}
          </Text>
          <Badge
            size="xs"
            variant="filled"
            style={{ background: 'rgba(139,92,246,0.3)', color: '#c4b5fd', flexShrink: 0 }}
          >
            {spread.count}장
          </Badge>
        </Group>

        {spread.usage && (
          <Text size="xs" c="rgba(196,181,253,0.7)" lineClamp={2} style={{ lineHeight: 1.5 }}>
            {spread.usage}
          </Text>
        )}

        {/* 카테고리 뱃지 */}
        <Group gap={4} mt={8}>
          {spread.category.slice(0, 3).map((cat) => (
            <Badge
              key={cat}
              size="xs"
              variant="dot"
              style={{ color: CATEGORY_COLORS[cat], borderColor: 'transparent', fontSize: 10 }}
            >
              {cat}
            </Badge>
          ))}
          {spread.category.length > 3 && (
            <Text size="10px" c="dimmed">+{spread.category.length - 3}</Text>
          )}
        </Group>
      </Box>
    </Box>
  );
}

// ── 모달 컴포넌트 ───────────────────────────────────────────────────────────
function SpreadModal({ spread, opened, onClose }: { spread: SpreadType | null; opened: boolean; onClose: () => void }) {
  if (!spread) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          background: '#0f0f1a',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: 20,
          overflow: 'hidden',
        },
        overlay: { backdropFilter: 'blur(6px)' },
      }}
    >
      {/* 모달 헤더 */}
      <Box
        p="xl"
        pb="md"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="xs" mb={4}>
              <IconCards size={20} color="#a78bfa" />
              <Text size="xs" c="#a78bfa" fw={600} tt="uppercase" style={{ letterSpacing: 1 }}>
                Spread Encyclopedia
              </Text>
            </Group>
            <Title order={3} c="white" mb={4}>
              {spread.label}
            </Title>
            <Group gap={6}>
              {spread.category.map((cat) => (
                <Badge
                  key={cat}
                  size="sm"
                  style={{
                    background: `${CATEGORY_COLORS[cat]}22`,
                    color: CATEGORY_COLORS[cat],
                    border: `1px solid ${CATEGORY_COLORS[cat]}44`,
                  }}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </Badge>
              ))}
              <Badge size="sm" style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd' }}>
                총 {spread.count}장
              </Badge>
            </Group>
          </Box>

          <Box
            onClick={onClose}
            style={{
              cursor: 'pointer',
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <IconX size={16} color="rgba(255,255,255,0.5)" />
          </Box>
        </Group>
      </Box>

      <Box p="xl">
        {/* 배열 시각화 */}
        <SpreadVisual spread={spread} size="modal" />

        {/* 추천 상황 */}
        {spread.usage && (
          <Box
            mt="lg"
            p="md"
            style={{
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 12,
            }}
          >
            <Text size="sm" c="#a78bfa" fw={700} mb={4}>💡 추천 상황</Text>
            <Text size="sm" c="rgba(255,255,255,0.8)" lh={1.6}>{spread.usage}</Text>
          </Box>
        )}

        {/* 배열 설명 */}
        {spread.description && (
          <Text size="sm" c="rgba(255,255,255,0.65)" lh={1.8} mt="md">
            {spread.description}
          </Text>
        )}

        <Divider my="lg" color="rgba(255,255,255,0.07)" />

        {/* 포지션 목록 */}
        <Text size="sm" fw={700} c="#a78bfa" mb="md">📋 각 위치의 의미</Text>
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
          {spread.layout.map((pos, idx) => (
            <Group key={idx} gap="xs" align="flex-start" wrap="nowrap">
              <Box
                style={{
                  minWidth: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: 'rgba(139,92,246,0.25)',
                  border: '1px solid rgba(139,92,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="xs" fw={700} c="#c4b5fd">{idx + 1}</Text>
              </Box>
              <Text size="xs" c="rgba(255,255,255,0.75)" lh={1.5}>
                {pos.label}
                {pos.rotate ? ' ↔' : ''}
              </Text>
            </Group>
          ))}
        </SimpleGrid>
      </Box>
    </Modal>
  );
}

// ── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function SpreadsGuidePage() {
  const [activeCategory, setActiveCategory] = useState<SpreadCategory>('전체');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const filtered = activeCategory === '전체'
    ? SPREAD_TYPES
    : SPREAD_TYPES.filter((s) => s.category.includes(activeCategory));

  const handleCardClick = (spread: SpreadType) => {
    setSelectedSpread(spread);
    open();
  };

  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a14 0%, #0f0f1e 100%)' }}>
      <Container size="lg" py="xl">
        {/* 헤더 */}
        <Box ta="center" mb={40}>
          <Group justify="center" gap="xs" mb={12}>
            <IconBook size={28} color="#a78bfa" />
            <Title order={2} style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>
              스프레드 백과
            </Title>
          </Group>
          <Text c="rgba(196,181,253,0.7)" size="sm" maw={480} mx="auto" lh={1.7}>
            질문 유형에 맞는 최적의 배열법을 골라보세요. 카드를 클릭하면 상세 포지션 설명을 확인할 수 있습니다.
          </Text>
        </Box>

        {/* 카테고리 탭 */}
        <Box mb={32}>
          <Group justify="center" gap={8} wrap="wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === '전체' ? SPREAD_TYPES.length : SPREAD_TYPES.filter(s => s.category.includes(cat)).length;

              return (
                <Box
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: 100,
                    border: isActive
                      ? `1.5px solid ${CATEGORY_COLORS[cat]}`
                      : '1.5px solid rgba(255,255,255,0.1)',
                    background: isActive
                      ? `${CATEGORY_COLORS[cat]}20`
                      : 'rgba(255,255,255,0.03)',
                    color: isActive ? CATEGORY_COLORS[cat] : 'rgba(255,255,255,0.4)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                  }}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span>{cat}</span>
                  <Box
                    style={{
                      minWidth: 18,
                      height: 18,
                      borderRadius: 9,
                      background: isActive ? `${CATEGORY_COLORS[cat]}40` : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </Box>
                </Box>
              );
            })}
          </Group>
        </Box>

        {/* 카드 그리드 */}
        {filtered.length === 0 ? (
          <Box ta="center" py={60}>
            <Text c="rgba(255,255,255,0.3)" size="lg">해당 카테고리에 배열법이 없습니다.</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {filtered.map((spread) => (
              <SpreadCard key={spread.value} spread={spread} onClick={() => handleCardClick(spread)} />
            ))}
          </SimpleGrid>
        )}

        {/* 총 개수 표시 */}
        <Text ta="center" c="rgba(255,255,255,0.2)" size="xs" mt={32}>
          {activeCategory === '전체' ? '전체' : `[${activeCategory}]`} 배열법 {filtered.length}개
        </Text>
      </Container>

      {/* 상세 모달 */}
      <SpreadModal spread={selectedSpread} opened={opened} onClose={close} />
    </Box>
  );
}
