'use client';

import { useRef, useEffect, useState } from 'react';
import { Modal, Box, Button, ActionIcon, Center, Text, Stack } from '@mantine/core';
import { IconCamera, IconX, IconRefresh } from '@tabler/icons-react';
import { CameraOverlay } from './CameraOverlay';

const HANJI_BG = '#F9F7F2';
const POINT_GOLD = '#C5A059';

interface CameraModalProps {
  opened: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  spreadType: string;
}

export function CameraModal({ opened, onClose, onCapture, spreadType }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: 'environment' } // 후면 카메라 우선
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('카메라에 접근할 수 없습니다. 권한을 확인해 주세요.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (opened) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [opened]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // 비디오 크기에 맞춰 캔버스 설정
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 현재 프레임 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 이미지 파일로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      padding={0}
      withCloseButton={false}
      styles={{
        content: { backgroundColor: '#000' },
        body: { height: '100%', padding: 0 }
      }}
    >
      <Box style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* 비디오 스트림 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* 캔버스 (숨김) */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* 1. 가이드라인 오버레이 */}
        <CameraOverlay spreadType={spreadType} />

        {/* 2. 상단 컨트롤 바 */}
        <Box 
          style={{ 
            position: 'absolute', 
            top: 20, 
            left: 20, 
            right: 20, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            zIndex: 30 
          }}
        >
          <ActionIcon 
            variant="filled" 
            color="rgba(0,0,0,0.5)" 
            size="xl" 
            radius="xl" 
            onClick={onClose}
            style={{ border: `1px solid ${POINT_GOLD}44` }}
          >
            <IconX size={24} color="#fff" />
          </ActionIcon>
          
          <Text fw={900} size="sm" c={POINT_GOLD} className="font-serif shadow-sm">
             아르카나 찰나의 기록
          </Text>

          <ActionIcon 
            variant="filled" 
            color="rgba(0,0,0,0.5)" 
            size="xl" 
            radius="xl" 
            onClick={startCamera}
          >
            <IconRefresh size={24} color="#fff" />
          </ActionIcon>
        </Box>

        {/* 3. 하단 컨트롤 바 및 캡처 버튼 */}
        <Box 
          style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: '140px', 
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 30
          }}
        >
          <Box 
            onClick={handleCapture}
            style={{ 
              width: 70, 
              height: 70, 
              borderRadius: '50%', 
              border: `4px solid #fff`, 
              backgroundColor: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.1s active',
              boxShadow: `0 0 20px rgba(0,0,0,0.5)`
            }}
          >
            <Box style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: '#fff' }} />
          </Box>
          <Text size="xs" mt="sm" c="#fff" opacity={0.8} fw={600}>촬영 (봉인 기록)</Text>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Center style={{ position: 'absolute', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.8)' }}>
             <Stack align="center">
                <Text c="red" fw={800}>{error}</Text>
                <Button variant="light" color="gray" onClick={onClose}>취소</Button>
             </Stack>
          </Center>
        )}
      </Box>
    </Modal>
  );
}
