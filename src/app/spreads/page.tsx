'use client';

import { useState, useEffect } from 'react';
import {
  Container, Title, Text, Group, Box, Badge, Modal, Divider, SimpleGrid, Tooltip, Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconX } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPREAD_TYPES, type SpreadType, type SpreadCategory } from '@/lib/tarotData';

// ── 카테고리 탭 설정 ────────────────────────────────────────────────────────
const CATEGORIES: SpreadCategory[] = ['전체', '연애', '취업', '금전', '학업', '인간관계', '기타'];

// 전통 아이콘 정의
const ScrollIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 4V18M7 4C7 2.89543 7.89543 2 9 2H19C20.1046 2 21 2.89543 21 4V16C21 17.1046 20.1046 18 19 18H9C7.89543 18 7 18.8954 7 20C7 21.1046 6.10457 22 5 22H3C1.89543 22 1 21.1046 1 20V6C1 4.89543 1.89543 4 3 4H7Z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11 6H17M11 10H17M11 14H15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LanternIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V5M12 19V22M7 5H17M5 8C5 6.89543 5.89543 6 7 6H17C18.1046 6 19 6.89543 19 8V16C19 17.1046 18.1046 18 17 18H7C5.89543 18 5 17.1046 5 16V8Z" stroke={color} strokeWidth="1.5" />
    <path d="M9 6V18M15 6V18" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    <path d="M5 12H19" stroke={color} strokeWidth="1" />
  </svg>
);

const BrushIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3L21 6M18 3L11 10M18 3L21 6M21 6L14 13M11 10L14 13M11 10L4 21L3 20L6 13M14 13L11 10M6 13L11 10M14 13L17 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 21C3.5 19 5.5 18 7 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MAIN_INK = '#1A2F2F';
const POINT_GOLD = '#C5A059';
const HANJI_BG = '#F9F7F2';

// ── 애니메이션 조각 컴포넌트 ───────────────────────────────────────────
const SparkParticles = () => {
  return (
    <Box style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 60 }}>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 0.8, 0],
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 100,
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeOut" 
          }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 4,
            height: 4,
            backgroundColor: POINT_GOLD,
            borderRadius: '50%',
            boxShadow: `0 0 10px ${POINT_GOLD}`,
          }}
        />
      ))}
    </Box>
  );
};

const HazeEffect = () => {
  return (
    <motion.div
      animate={{ 
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
      style={{
        position: 'absolute',
        width: 120,
        height: 120,
        background: 'radial-gradient(circle, rgba(197, 160, 89, 0.2) 0%, transparent 70%)',
        filter: 'blur(15px)',
        zIndex: 45,
        pointerEvents: 'none',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
};

// ── 미니 타블로 시각화 컴포넌트 ────────────────────────────────────────────
function SpreadVisual({ spread, size = 'card', isSamhain = false }: { spread: SpreadType; size?: 'card' | 'modal', isSamhain?: boolean }) {
  const isModal = size === 'modal';
  const height = isModal ? 320 : 200;
  const cardW = isModal ? 44 : 33;
  const cardH = isModal ? 70 : 54;

  const isCelticCross = spread.value === 'celtic-cross' || spread.value === 'mini-celtic';
  const isInnerWheel = spread.value === 'inner-wheel';

  // 삼하인 확장용 레이아웃 생성
  let displayLayout = [...spread.layout];
  if (isInnerWheel && isSamhain) {
    // 1번(삼하인) 포지션을 3개로 복제하여 가로로 나열
    const samhainBase = spread.layout[1];
    displayLayout.splice(1, 1, 
      { ...samhainBase, label: '삼하인 (1-1)', x: samhainBase.x - 8 },
      { ...samhainBase, label: '삼하인 (1-2)', x: samhainBase.x },
      { ...samhainBase, label: '삼하인 (1-3)', x: samhainBase.x + 8 }
    );
  }

  return (
    <Box
      style={{
        height,
        position: 'relative',
        backgroundColor: '#E8E4D9',
        borderRadius: isModal ? '12px' : '8px',
        overflow: 'hidden',
        border: `1px solid ${POINT_GOLD}44`,
      }}
    >
      {/* 수묵 안개용 기본 레이어 */}
      <Box 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 70% 30%, rgba(26, 47, 47, 0.08) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(26, 47, 47, 0.05) 0%, transparent 50%)',
          filter: 'blur(20px)',
        }}
      />

      {/* 수레바퀴 시각화 장식 (Inner Wheel 전용) */}
      {isInnerWheel && (
        <Box style={{ position: 'absolute', inset: '10%', border: `1px dashed ${POINT_GOLD}22`, borderRadius: '50%', zIndex: 0 }} />
      )}

      <Box style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${spread.scale || 1})` }}>
        {displayLayout.map((pos, idx) => {
          // 켈틱 크로스 등에서 2번 카드가 1번 카드 위에 겹쳐지도록 z-index 조정
          const zIndex = pos.rotate ? 50 : (idx === 0 ? 10 : 5);
          
          // Inner Wheel 원형 배치를 위한 자동 회전 계산
          let autoRotate = pos.rotate || 0;
          if (isInnerWheel && idx > 0) {
              // 1번부터 8번까지 원형으로 정렬 (idx 0은 센터)
              const wheelIdx = idx - 1;
              autoRotate = wheelIdx * 45; 
          }

          return (
            <div key={`${spread.value}-${idx}`} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, width: 0, height: 0, zIndex }}>
              <Tooltip label={`${idx + 1}. ${pos.label}`} position="top" withArrow>
                <motion.div
                  initial={idx === 1 ? { scale: 0.8, opacity: 0 } : { opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) rotate(${autoRotate}deg)`,
                    width: pos.rotate ? cardH : cardW,
                    height: pos.rotate ? cardW : cardH,
                    background: 'linear-gradient(135deg, #F9F7F2 0%, #E8E4D9 100%)',
                    border: `1.5px solid ${zIndex >= 50 ? POINT_GOLD : MAIN_INK}aa`,
                    boxShadow: zIndex >= 50 ? `0 0 15px ${POINT_GOLD}44` : '2px 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'default',
                  }}
                >
                  <Text size={isModal ? 'xs' : '10px'} fw={900} c={MAIN_INK} style={{ lineHeight: 1 }}>
                    {idx + 1}
                  </Text>
                  {isModal && !pos.rotate && (
                    <Text size="8px" c={MAIN_INK} opacity={0.6} ta="center" mt={2} px={1} style={{ lineHeight: 1.1, wordBreak: 'keep-all' }}>
                      {pos.label.length > 5 ? pos.label.slice(0, 4) + '..' : pos.label}
                    </Text>
                  )}
                </motion.div>
              </Tooltip>

              {/* 켈틱 크로스 1, 2번 특수 효과 */}
              {idx === 1 && isCelticCross && (
                <>
                  <SparkParticles />
                  <HazeEffect />
                </>
              )}
            </div>
          );
        })}
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
        borderRadius: 8,
        overflow: 'hidden',
        border: hovered ? `1.5px solid ${POINT_GOLD}` : `1px solid ${MAIN_INK}11`,
        background: HANJI_BG,
        boxShadow: hovered
          ? '0 12px 30px rgba(26, 47, 47, 0.12)'
          : '0 4px 12px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <SpreadVisual spread={spread} size="card" />

      <Box p="md" pt="sm">
        <Group justify="space-between" mb={6} align="flex-start">
          <Text fw={900} c={MAIN_INK} size="md" className="font-serif" style={{ lineHeight: 1.3, flex: 1 }}>
            {spread.label}
          </Text>
          <Badge
            size="xs"
            variant="outline"
            style={{ borderColor: POINT_GOLD, color: POINT_GOLD, flexShrink: 0 }}
          >
            {spread.count}장
          </Badge>
        </Group>

        {spread.usage && (
          <Text size="xs" c={MAIN_INK} opacity={0.6} lineClamp={2} style={{ lineHeight: 1.5 }}>
            {spread.usage}
          </Text>
        )}

        <Group gap={4} mt={10}>
          {spread.category.slice(0, 3).map((cat) => (
            <Badge
              key={cat}
              size="xs"
              variant="outline"
              style={{ color: MAIN_INK, borderColor: `${MAIN_INK}44`, fontSize: 9, borderRadius: 2 }}
            >
              # {cat}
            </Badge>
          ))}
        </Group>
      </Box>
    </Box>
  );
}

// ── 모달 컴포넌트 ───────────────────────────────────────────────────────────
function SpreadModal({ spread, opened, onClose }: { spread: SpreadType | null; opened: boolean; onClose: () => void }) {
  const [isSamhain, setIsSamhain] = useState(false);
  if (!spread) return null;

  const isInnerWheel = spread.value === 'inner-wheel';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      padding={0}
      withCloseButton={false}
      styles={{
        content: {
          background: HANJI_BG,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
          border: `2px solid ${POINT_GOLD}`,
          borderRadius: 16,
          overflow: 'hidden',
        },
        overlay: { backdropFilter: 'blur(4px)' },
      }}
    >
      <Box
        p="xl"
        pb="md"
        style={{ borderBottom: `1px solid ${POINT_GOLD}33` }}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="xs" mb={4}>
              <ScrollIcon size={20} color={POINT_GOLD} />
              <Text size="xs" c={POINT_GOLD} fw={800} style={{ letterSpacing: 1 }}>
                아르카나 랩 | 배열법 가이드
              </Text>
            </Group>
            <Title order={3} c={MAIN_INK} mb={4} className="font-serif">
              {spread.label}
            </Title>
            <Group gap={6}>
              {spread.category.map((cat) => (
                <Badge
                  key={cat}
                  size="sm"
                  variant="outline"
                  style={{ color: MAIN_INK, borderColor: `${MAIN_INK}44`, borderRadius: 4 }}
                >
                  {cat}
                </Badge>
              ))}
              <Badge size="sm" variant="filled" style={{ background: MAIN_INK, color: HANJI_BG }}>
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
              background: 'rgba(0,0,0,0.05)',
            }}
          >
            <IconX size={16} color={MAIN_INK} />
          </Box>
        </Group>
      </Box>

      <Box p="xl">
        <SpreadVisual spread={spread} size="modal" isSamhain={isSamhain} />

        {isInnerWheel && (
          <Box 
            p="md" mt="md" 
            style={{ 
              backgroundColor: isSamhain ? 'rgba(139, 0, 0, 0.05)' : 'rgba(26, 47, 47, 0.03)',
              border: `1px solid ${isSamhain ? '#8B0000' : POINT_GOLD}44`,
              borderRadius: 8,
              cursor: 'pointer'
            }}
            onClick={() => setIsSamhain(!isSamhain)}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isSamhain ? '#8B0000' : POINT_GOLD }} />
                <Text size="sm" fw={800} c={isSamhain ? '#8B0000' : MAIN_INK}>오늘이 삼하인(Samhain) 절기인가요?</Text>
              </Group>
              <Badge variant={isSamhain ? 'filled' : 'outline'} color={isSamhain ? 'red' : 'gray'}>
                {isSamhain ? '확장됨' : '선택'}
              </Badge>
            </Group>
            {isSamhain && (
              <Text size="xs" c="#8B0000" mt={8} opacity={0.8} fs="italic">
                * 삼하인 절기에는 1번 포지션의 카드가 3장으로 확장되어 더 깊은 통찰을 제공합니다.
              </Text>
            )}
          </Box>
        )}

        {spread.usage && (
          <Box
            mt="lg"
            p="md"
            style={{
              background: 'rgba(197, 160, 89, 0.05)',
              border: `1px solid ${POINT_GOLD}33`,
              borderRadius: 8,
            }}
          >
            <Group gap={6} mb={4}>
              <LanternIcon size={16} color={POINT_GOLD} />
              <Text size="sm" c={POINT_GOLD} fw={800}>비방 전수 (추천 상황)</Text>
            </Group>
            <Text size="sm" c={MAIN_INK} opacity={0.8} lh={1.6}>{spread.usage}</Text>
          </Box>
        )}

        {spread.description && (
          <Text size="sm" c={MAIN_INK} opacity={0.7} lh={1.8} mt="md">
            {spread.description}
          </Text>
        )}

        <Divider my="lg" color={`${POINT_GOLD}22`} />

        <Group gap={6} mb="md">
          <BrushIcon size={18} color={POINT_GOLD} />
          <Text size="sm" fw={800} c={POINT_GOLD}>각 위치의 비예 (의미 파악)</Text>
        </Group>
        
        <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
          {spread.layout.map((pos, idx) => {
            const isSamhainSlot = isInnerWheel && isSamhain && idx === 1;
            return (
              <Group key={idx} gap="xs" align="flex-start" wrap="nowrap">
                <Box
                  style={{
                    minWidth: 22,
                    height: 22,
                    borderRadius: 4,
                    background: isSamhainSlot ? '#8B0000' : MAIN_INK,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xs" fw={800} c={HANJI_BG}>{idx + 1}</Text>
                </Box>
                <Text size="xs" c={MAIN_INK} opacity={0.8} lh={1.4} fw={600}>
                  {pos.label} {isSamhainSlot && '(3장 확장)'}
                </Text>
              </Group>
            );
          })}
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
    // History API를 이용해 뒤로가기 시 모달만 닫히도록 설정
    window.history.pushState({ modal: 'spread-guide' }, '');
    open();
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (opened) {
        close();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [opened, close]);

  const handleClose = () => {
    if (opened) {
      if (window.history.state?.modal === 'spread-guide') {
        window.history.back();
      }
      close();
    }
  };

  return (
    <Box style={{ 
      minHeight: '100vh', 
      backgroundColor: HANJI_BG,
      backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
      position: 'relative'
    }}>
      {/* 수묵 안개 장식 효과 */}
      <Box 
        style={{
          position: 'fixed',
          top: 0, right: 0,
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(26, 47, 47, 0.05) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0, pointerEvents: 'none'
        }}
      />
      <Box 
        style={{
          position: 'fixed',
          bottom: -100, left: -100,
          width: '50vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(26, 47, 47, 0.03) 0%, transparent 70%)',
          filter: 'blur(80px)',
          zIndex: 0, pointerEvents: 'none'
        }}
      />

      <Container size="lg" py="xl" style={{ position: 'relative', zIndex: 1 }}>
        {/* 헤더 */}
        <Box ta="center" mb={50}>
          <Stack align="center" gap="sm">
            <ScrollIcon size={40} color={POINT_GOLD} />
            <Title order={2} className="font-serif responsive-title" style={{ color: MAIN_INK, fontSize: 32, fontWeight: 900, letterSpacing: '-1px' }}>
              아르카나 랩 | 배열법 가이드
            </Title>
            <Divider color={POINT_GOLD} size="sm" style={{ width: 120 }} />
            <Text c={MAIN_INK} opacity={0.6} size="md" maw={520} mx="auto" lh={1.8} fw={600} mt="xs" className="responsive-desc">
              질문의 깊이에 맞는 최적의 배열법을 엄선하였습니다.<br />
              비기를 클릭하여 각 위치에 담긴 운명의 진의를 확인하십시오.
            </Text>
          </Stack>
        </Box>

        {/* 카테고리 탭 */}
        <Box mb={40}>
          <Group justify="center" gap={12} wrap="wrap">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Box
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    cursor: 'pointer',
                    padding: '8px 20px',
                    borderRadius: 4,
                    border: isActive
                      ? `2px solid ${MAIN_INK}`
                      : `1px solid ${MAIN_INK}22`,
                    background: isActive ? MAIN_INK : 'transparent',
                    color: isActive ? HANJI_BG : MAIN_INK,
                    fontWeight: 900,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
                    userSelect: 'none',
                    boxShadow: isActive ? '0 4px 12px rgba(26, 47, 47, 0.2)' : 'none'
                  }}
                >
                  <span>{cat}</span>
                </Box>
              );
            })}
          </Group>
        </Box>

        {/* 카드 그리드 */}
        {filtered.length === 0 ? (
          <Box ta="center" py={100} style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 20 }}>
            <Text c={MAIN_INK} opacity={0.3} size="lg" fw={800}>해당 카테고리에 비기가 없습니다.</Text>
          </Box>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl" className="spread-card-container">
            {filtered.map((spread) => (
              <SpreadCard key={spread.value} spread={spread} onClick={() => handleCardClick(spread)} />
            ))}
          </SimpleGrid>
        )}

        {/* 총 개수 표시 */}
        <Group justify="center" mt={50}>
          <Box style={{ padding: '4px 16px', borderRadius: 20, border: `1px solid ${POINT_GOLD}44`, backgroundColor: `${POINT_GOLD}11` }}>
            <Text c={POINT_GOLD} size="xs" fw={900}>
              {activeCategory === '전체' ? '총계' : `[${activeCategory}]`} {filtered.length}개의 비기 수록
            </Text>
          </Box>
        </Group>
      </Container>

      <SpreadModal spread={selectedSpread} opened={opened} onClose={handleClose} />
    </Box>
  );
}
