'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Text, Center } from '@mantine/core';

export function GateSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    // 세션 상에서 이미 열렸는지 확인
    const hasOpened = sessionStorage.getItem('arcana_gate_opened');
    if (hasOpened) {
      setIsVisible(false);
      return;
    }

    // 1.2초 후 자동으로 문 열기 (기존 2.8초에서 단축하여 속도감 개선)
    const autoOpenTimer = setTimeout(() => {
      handleOpen();
    }, 1200);

    return () => clearTimeout(autoOpenTimer);
  }, []);

  const handleOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    sessionStorage.setItem('arcana_gate_opened', 'true');
    
    // 애니메이션 완료 후 컴포넌트 전체 제거 (1.2초 후)
    setTimeout(() => {
      setIsVisible(false);
    }, 1200);
  };

  if (!isVisible) return null;

  return (
    <Box
      onClick={handleOpen}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#000',
        overflow: 'hidden',
        cursor: isOpened ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence>
        {isVisible && (
          <>
            {/* 문 뒤쪽 금색 광원 (Glow) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: isOpened ? 1 : 0, 
                scale: isOpened ? 1.5 : 0.8,
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(197, 160, 89, 0.4) 0%, rgba(197, 160, 89, 0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />

            {/* 왼쪽 대문 */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isOpened ? -105 : 0 }}
              transition={{ duration: 1.4, ease: [0.45, 0.05, 0.55, 0.95] }}
              style={{
                position: 'absolute',
                left: 0,
                width: '50%',
                height: '100%',
                backgroundColor: '#2D1B0D',
                backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(255,255,255,0.05)), url("https://www.transparenttextures.com/patterns/black-wood.png")',
                borderRight: '2px solid #1A1108',
                transformOrigin: 'left',
                boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '20px',
              }}
            >
              {/* 왼쪽 문고리 장식 */}
              <Box 
                style={{ 
                  width: 100, height: 200, 
                  border: '2px solid rgba(197, 160, 89, 0.4)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '12px 0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginRight: -2,
                }}
              >
                {/* 전통 매듭/장식 느낌 */}
                <Box style={{ 
                  position: 'absolute', top: 20, width: 30, height: 2, backgroundColor: '#C5A059', opacity: 0.5 
                }} />
                <Box style={{ 
                  width: 50, height: 50, borderRadius: '50%', 
                  border: '5px solid #C5A059', 
                  backgroundImage: 'radial-gradient(circle, #E5C079 0%, #C5A059 70%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.8), 0 0 20px rgba(197, 160, 89, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   {/* 고급스러운 중앙 점 */}
                   <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2D1B0D' }} />
                </Box>
                <Box style={{ 
                  position: 'absolute', bottom: 20, width: 30, height: 2, backgroundColor: '#C5A059', opacity: 0.5 
                }} />
              </Box>
            </motion.div>

            {/* 오른쪽 대문 */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: isOpened ? 105 : 0 }}
              transition={{ duration: 1.4, ease: [0.45, 0.05, 0.55, 0.95] }}
              style={{
                position: 'absolute',
                right: 0,
                width: '50%',
                height: '100%',
                backgroundColor: '#2D1B0D',
                backgroundImage: 'linear-gradient(to left, rgba(0,0,0,0.2), rgba(255,255,255,0.05)), url("https://www.transparenttextures.com/patterns/black-wood.png")',
                borderLeft: '2px solid #1A1108',
                transformOrigin: 'right',
                boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingLeft: '20px',
              }}
            >
              {/* 오른쪽 문고리 장식 */}
              <Box 
                style={{ 
                  width: 100, height: 200, 
                  border: '2px solid rgba(197, 160, 89, 0.4)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '0 12px 12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginLeft: -2,
                }}
              >
                <Box style={{ 
                  position: 'absolute', top: 20, width: 30, height: 2, backgroundColor: '#C5A059', opacity: 0.5 
                }} />
                <Box style={{ 
                  width: 50, height: 50, borderRadius: '50%', 
                  border: '5px solid #C5A059', 
                  backgroundImage: 'radial-gradient(circle, #E5C079 0%, #C5A059 70%)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.8), 0 0 20px rgba(197, 160, 89, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                   <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2D1B0D' }} />
                </Box>
                <Box style={{ 
                  position: 'absolute', bottom: 20, width: 30, height: 2, backgroundColor: '#C5A059', opacity: 0.5 
                }} />
              </Box>
            </motion.div>

            {/* 안내 텍스트 */}
            {!isOpened && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  color: '#C5A059',
                  zIndex: 10,
                }}
              >
                <Text size="xs" fw={700} style={{ letterSpacing: 4, opacity: 0.6, marginBottom: 8 }}>ARCANA LAB</Text>
                <Text className="font-serif" size="xl" fw={900} style={{ letterSpacing: 2 }}>대문을 두드려 입장하세요</Text>
                <Box mt="md" style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ width: 1, height: 40, backgroundColor: '#C5A059' }}
                    />
                </Box>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </Box>
  );
}
