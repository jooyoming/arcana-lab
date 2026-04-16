'use client';

import { Box, Text } from '@mantine/core';
import { SPREAD_TYPES } from '@/lib/tarotData';
import { motion } from 'framer-motion';

const POINT_GOLD = '#C5A059';
const MAIN_INK = '#1A2F2F';

interface CameraOverlayProps {
  spreadType: string;
}

export function CameraOverlay({ spreadType }: CameraOverlayProps) {
  const spread = SPREAD_TYPES.find((s) => s.value === spreadType);

  if (!spread) return null;

  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 가이드라인 컨테이너 (실제 촬영 영역에 맞춤) */}
      <Box style={{ position: 'relative', width: '100%', height: '100%', transform: `scale(${spread.scale || 1})` }}>
        {spread.layout.map((pos, idx) => {
          // 가로 가이드 세로 길이를 기준으로 카드 비율(약 1:1.6) 적용
          const cardW = 12; // % 기준
          const cardH = 20; // % 기준

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                position: 'absolute',
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: `translate(-50%, -50%) rotate(${pos.rotate || 0}deg)`,
                width: pos.rotate ? `${cardH}%` : `${cardW}%`,
                height: pos.rotate ? `${cardW}%` : `${cardH}%`,
                border: `1.5px dashed ${POINT_GOLD}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(197, 160, 89, 0.03)',
              }}
            >
              <Box 
                style={{ 
                  backgroundColor: POINT_GOLD, 
                  color: MAIN_INK, 
                  width: 18, 
                  height: 18, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900
                }}
              >
                {idx + 1}
              </Box>
            </motion.div>
          );
        })}
      </Box>

      {/* 중앙 안내 문구 */}
      <Box 
        style={{ 
          position: 'absolute', 
          bottom: '20%', 
          left: '50%', 
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(26, 47, 47, 0.8)',
          padding: '8px 20px',
          borderRadius: '20px',
          border: `1px solid ${POINT_GOLD}44`,
          backdropFilter: 'blur(4px)',
          zIndex: 20
        }}
      >
        <Text size="sm" fw={800} c={POINT_GOLD} ta="center" className="font-serif">
          배열법 가이드에 맞춰 카드를 놓아주세요
        </Text>
      </Box>
    </Box>
  );
}
