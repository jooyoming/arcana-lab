'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Text } from '@mantine/core';

export function GateSplash() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 세션 상에서 이미 열렸는지 확인
    const hasOpened = sessionStorage.getItem('arcana_gate_opened');
    if (hasOpened) {
      setIsVisible(false);
      return;
    }

    // 4초 후 자동으로 이동 (3~5초 권장 사항 중 중간값)
    const timer = setTimeout(() => {
      handleComplete();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    sessionStorage.setItem('arcana_gate_opened', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Box
      id="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000',
        backgroundImage: 'url("/images/mystic_gate.png")', // 사용자가 제공한 영험한 솟을대문 에셋
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <>
            {/* 스크린 리더용 현판 텍스트 (숨김 처리) */}
            <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
              아르카나 랩
            </h1>

            {/* 영험한 빛 (Dappling Light) */}
            <div className="light-dapple" />

            {/* 자욱한 연기 (Incense Smoke) */}
            <div className="mystic-smoke" />
            
            {/* 연기 입자들 (랜덤 배치 효과) */}
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="smoke-particle" 
                style={{ 
                  left: `${10 + i * 20}%`, 
                  bottom: '-10%', 
                  width: `${200 + i * 100}px`, 
                  height: `${200 + i * 100}px`,
                  animationDelay: `${i * 1.2}s`
                }} 
              />
            ))}

            {/* 하단 안내 텍스트 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 1, duration: 2 }}
              style={{
                position: 'absolute',
                bottom: '12%',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                width: '100%',
                padding: '0 20px',
              }}
            >
              <Text 
                className="font-serif" 
                size="xs" 
                style={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  letterSpacing: '1px',
                  fontWeight: 400,
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                운명을 해독하는 영험한 공간
              </Text>
              <Text 
                className="font-serif" 
                size="xs" 
                mt={4}
                style={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '0.5px',
                  fontSize: '10px'
                }}
              >
                연구소로 들어가는 영적인 통로... 잠시 후 자동으로 이동합니다.
              </Text>
            </motion.div>

            {/* 중앙 빛무리 (은은한 Glow) */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vw',
              height: '100vh',
              background: 'radial-gradient(circle, rgba(255,245,200,0.05) 0%, transparent 80%)',
              pointerEvents: 'none',
            }} />
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
