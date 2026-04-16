'use client';

import { useState, useRef } from 'react';
import { TextInput, Textarea, Button, Container, Select, Paper, Stack, Group, Text, Switch, Card, Divider, NumberInput, ActionIcon, Modal, Box, Image, Center, AspectRatio } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconWand, IconDeviceFloppy, IconTrash, IconPlus, IconCamera, IconX } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { MAJOR_ARCANA, MINOR_ARCANA, SPREAD_TYPES, getCardImageUrl } from '@/lib/tarotData';
import { CameraModal } from '@/components/Session/CameraModal';

const TAROT_CARDS_DATA = [
  { group: '메이저 아르카나 (Major)', items: MAJOR_ARCANA },
  { group: '지팡이 (Wands)', items: MINOR_ARCANA.filter(c => c.includes('(Wands)')) },
  { group: '컵 (Cups)', items: MINOR_ARCANA.filter(c => c.includes('(Cups)')) },
  { group: '검 (Swords)', items: MINOR_ARCANA.filter(c => c.includes('(Swords)')) },
  { group: '펜타클 (Pentacles)', items: MINOR_ARCANA.filter(c => c.includes('(Pentacles)')) },
];

const BONUS_CARD_DATA = [
  { group: '기본 선택', items: ['선택안함'] },
  ...TAROT_CARDS_DATA
];

// 전통 문양 아이콘 컴포넌트
const MirrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <path d="M12 3V5M12 19V21M3 12H5M19 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.636 5.636L7.05 7.05M16.95 16.95L18.364 18.364M5.636 18.364L7.05 16.95M16.95 7.05L18.364 5.636" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ScrollIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 4V18M7 4C7 2.89543 7.89543 2 9 2H19C20.1046 2 21 2.89543 21 4V16C21 17.1046 20.1046 18 19 18H9C7.89543 18 7 18.8954 7 20C7 21.1046 6.10457 22 5 22H3C1.89543 22 1 21.1046 1 20V6C1 4.89543 1.89543 4 3 4H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11 6H17M11 10H17M11 14H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

interface RecognizedCard {
  index: number;
  name: string;
  orientation: string;
  positionLabel?: string;
}

const normalizeOrientation = (orientation: string): string => {
  if (!orientation) return '정방향';
  const o = orientation.trim().toLowerCase();
  if (o.includes('역') || o.includes('reverse') || o === 'rx' || o === 'reversed') {
    return '역방향';
  }
  return '정방향';
};

const ALL_CARD_NAMES = new Set([...MAJOR_ARCANA, ...MINOR_ARCANA]);
const getCardSelectData = (cardName: string) => {
  if (ALL_CARD_NAMES.has(cardName)) return TAROT_CARDS_DATA;
  return [
    { group: '🤖 AI 인식 결과 (수정 권장)', items: [cardName] },
    ...TAROT_CARDS_DATA,
  ];
};

export default function TarotInputFormPage() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsGeneratingSave] = useState(false);
  
  const [recognizedCards, setRecognizedCards] = useState<RecognizedCard[]>([]);
  const [readingResult, setReadingResult] = useState('');
  
  const supabase = createClient();
  const { user } = useAuth();

  const form = useForm({
    initialValues: {
      category: '연애운',
      situation: '',
      tarotImage: null as File | null,
      bonusCards: ['선택안함'] as string[],
      useOracle: false,
      oracleImage: null as File | null,
      oracleDeckName: '',
      toneAndManner: '따뜻하고 공감적인 위로',
      spreadType: '3-card',
      clientName: '',
      platform: '카카오톡',
      paymentAmount: 0,
    }
  });

  const [uploadModalOpened, setUploadModalOpened] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'tarot' | 'oracle'>('tarot');
  const [tarotPreview, setTarotPreview] = useState<string | null>(null);
  const [oraclePreview, setOraclePreview] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [cameraModalOpened, setCameraModalOpened] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadTarget === 'tarot') {
      form.setFieldValue('tarotImage', file);
      if (tarotPreview) URL.revokeObjectURL(tarotPreview);
      setTarotPreview(URL.createObjectURL(file));
    } else {
      form.setFieldValue('oracleImage', file);
      if (oraclePreview) URL.revokeObjectURL(oraclePreview);
      setOraclePreview(URL.createObjectURL(file));
    }
    setUploadModalOpened(false);
    e.target.value = '';
  };

  const handleCapture = (file: File) => {
    if (uploadTarget === 'tarot') {
      form.setFieldValue('tarotImage', file);
      if (tarotPreview) URL.revokeObjectURL(tarotPreview);
      setTarotPreview(URL.createObjectURL(file));
    } else {
      form.setFieldValue('oracleImage', file);
      if (oraclePreview) URL.revokeObjectURL(oraclePreview);
      setOraclePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (target: 'tarot' | 'oracle') => {
    if (target === 'tarot') {
      form.setFieldValue('tarotImage', null);
      if (tarotPreview) URL.revokeObjectURL(tarotPreview);
      setTarotPreview(null);
    } else {
      form.setFieldValue('oracleImage', null);
      if (oraclePreview) URL.revokeObjectURL(oraclePreview);
      setOraclePreview(null);
    }
  };

  const openUploadModal = (target: 'tarot' | 'oracle') => {
    setUploadTarget(target);
    setUploadModalOpened(true);
  };

  const analyzeCards = async () => {
    if (!form.values.tarotImage) {
      alert("타로 카드 이미지를 업로드해주세요.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('tarotImage', form.values.tarotImage);
      formData.append('spreadType', form.values.spreadType);
      if (form.values.useOracle && form.values.oracleImage) {
        formData.append('oracleImage', form.values.oracleImage);
      }

      const response = await fetch('/api/analyze-cards', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const normalizedCards = (data.result || []).map((card: RecognizedCard) => ({
        ...card,
        orientation: normalizeOrientation(card.orientation),
      }));

      setRecognizedCards(normalizedCards);
      setStep(2);
    } catch (err: any) {
      alert(`카드 인식 실패: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateCardName = (idx: number, newName: string | null) => {
    if (!newName) return;
    const newData = [...recognizedCards];
    newData[idx] = { ...newData[idx], name: newName };
    setRecognizedCards(newData);
  };

  const updateCardOrientation = (idx: number, newOr: string | null) => {
    if (!newOr) return;
    const newData = [...recognizedCards];
    newData[idx] = { ...newData[idx], orientation: newOr };
    setRecognizedCards(newData);
  };

  const removeCard = (idx: number) => {
    const newData = [...recognizedCards];
    newData.splice(idx, 1);
    setRecognizedCards(newData);
  };

  const addManualCard = () => {
    setRecognizedCards([...recognizedCards, { index: recognizedCards.length + 1, name: '0 - 바보 (The Fool)', orientation: '정방향' }]);
  };

  const generateFinalReading = async () => {
    if (recognizedCards.length === 0) {
      alert("분석된 카드가 한 장도 없습니다.");
      return;
    }

    setIsGenerating(true);
    setReadingResult('');

    try {
      const payload = {
        category: form.values.category,
        situation: form.values.situation,
        toneAndManner: form.values.toneAndManner,
        bonusCards: form.values.bonusCards.filter(c => c !== '선택안함'),
        useOracle: form.values.useOracle,
        oracleDeckName: form.values.oracleDeckName,
        recognizedCards
      };

      const response = await fetch('/api/generate-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setReadingResult(data.result);
      setStep(3);
    } catch (err: any) {
      alert(`AI 생성 실패: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToCRM = async () => {
    const { clientName, platform, paymentAmount, category, situation, bonusCards, useOracle, oracleDeckName, toneAndManner } = form.values;

    if (!clientName.trim()) {
      alert('내담자 이름을 입력해주세요.');
      return;
    }
    if (!readingResult.trim()) {
      alert('먼저 AI 리딩을 완료해주세요.');
      return;
    }

    setIsGeneratingSave(true);
    try {
      let clientId = null;
      let isExistingClient = false;
      const { data: existingClients, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('name', clientName)
        .eq('platform', platform)
        .limit(1);
        
      if (searchError) throw searchError;

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
        isExistingClient = true;
      } else {
        const { data: newClient, error: insertError } = await supabase
          .from('clients')
          .insert({ name: clientName, platform })
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        if (newClient) clientId = newClient.id;
      }

      const cardImages = [
        ...recognizedCards.map(c => ({
          name: c.name,
          url: getCardImageUrl(c.name),
          orientation: c.orientation,
          type: 'main'
        })),
        ...bonusCards.filter(c => c !== '선택안함').map(c => ({
          name: c,
          url: getCardImageUrl(c),
          orientation: '정방향',
          type: 'bonus'
        }))
      ];

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          client_id: clientId,
          category,
          situation,
          bonus_card: bonusCards.filter(c => c !== '선택안함').join(', '),
          card_images: cardImages,
          use_oracle: useOracle,
          oracle_deck_name: oracleDeckName,
          tone_and_manner: toneAndManner,
          ai_reading_result: readingResult,
          payment_amount: paymentAmount,
        });

      if (sessionError) throw sessionError;

      alert(`저장 완료! (${isExistingClient ? '기존' : '신규'} 내담자)`);
      form.reset();
      setRecognizedCards([]);
      setReadingResult('');
      setTarotPreview(null);
      setOraclePreview(null);
      setStep(1);
      
    } catch (error: any) {
      alert(`저장 오류: ${error.message}`);
    } finally {
      setIsGeneratingSave(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <style jsx global>{`
        .ink-bleed-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .ink-bleed-btn:active::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 5px;
          height: 5px;
          background: rgba(26, 47, 47, 0.15);
          opacity: 0;
          border-radius: 100%;
          transform: scale(1) translate(-50%, -50%);
          transform-origin: 50% 50%;
          animation: ink-ripple 0.6s ease-out;
        }
        @keyframes ink-ripple {
          0% { transform: scale(0) translate(-50%, -50%); opacity: 1; }
          100% { transform: scale(40) translate(-50%, -50%); opacity: 0; }
        }
        .bori-action-sheet .mantine-Modal-content {
          background-image: url('https://www.transparenttextures.com/patterns/paper-fibers.png');
          background-color: #F9F7F2 !important;
          box-shadow: 0 -10px 40px rgba(26, 47, 47, 0.1) !important;
        }
      `}</style>

      {/* 이미지 업로드용 숨겨진 Input */}
      <input 
        type="file" accept="image/*" capture="environment" 
        style={{ display: 'none' }} ref={cameraInputRef} 
        onChange={handleFileChange}
      />
      <input 
        type="file" accept="image/*" 
        style={{ display: 'none' }} ref={albumInputRef} 
        onChange={handleFileChange}
      />

      {/* 동양풍 업로드 옵션 모달 */}
      <Modal
        opened={uploadModalOpened}
        onClose={() => setUploadModalOpened(false)}
        title={uploadTarget === 'tarot' ? "아르카나 기록의 서" : "오라클 비방의 서"}
        position="bottom"
        radius="xl"
        padding="xl"
        className="bori-action-sheet"
        styles={{
          content: { borderTop: '3px solid #C5A059' },
          header: { background: 'transparent' },
          title: { fontWeight: 900, color: '#1A2F2F', fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }
        }}
      >
        <Stack gap="lg">
          <Paper 
            withBorder p="md" radius="md" className="ink-bleed-btn"
            onClick={() => {
              setUploadModalOpened(false);
              setCameraModalOpened(true);
            }}
            style={{ 
              cursor: 'pointer', borderColor: '#C5A059', backgroundColor: 'rgba(197, 160, 89, 0.05)',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}
          >
            <Center style={{ width: 48, height: 48, borderRadius: '12px', background: '#1A2F2F', color: '#F9F7F2' }}>
              <MirrorIcon />
            </Center>
            <Box style={{ flex: 1 }}>
              <Text fw={800} size="md" c="#1A2F2F">[현장의 찰나 기록]</Text>
              <Text size="xs" c="#1A2F2F" opacity={0.7}>실시간 사진 촬영 기능</Text>
            </Box>
          </Paper>

          <Paper 
            withBorder p="md" radius="md" className="ink-bleed-btn"
            onClick={() => albumInputRef.current?.click()}
            style={{ 
              cursor: 'pointer', borderColor: '#C5A059', backgroundColor: 'rgba(197, 160, 89, 0.05)',
              display: 'flex', alignItems: 'center', gap: '16px'
            }}
          >
            <Center style={{ width: 48, height: 48, borderRadius: '12px', background: '#1A2F2F', color: '#F9F7F2' }}>
              <ScrollIcon />
            </Center>
            <Box style={{ flex: 1 }}>
              <Text fw={800} size="md" c="#1A2F2F">[비방의 기록 불러오기]</Text>
              <Text size="xs" c="#1A2F2F" opacity={0.7}>기존 앨범(갤러리)에서 사진 선택</Text>
            </Box>
          </Paper>
          
          <Button variant="subtle" color="gray" onClick={() => setUploadModalOpened(false)} radius="md">
            기록 중단 (Close)
          </Button>
        </Stack>
      </Modal>

      <Card shadow="sm" padding="xl" radius="md" withBorder className="bori-card">
        <Stack align="center" mb="xl">
          <Text size="2xl" fw={900} className="font-serif" style={{ color: 'var(--bori-deep)', letterSpacing: '-0.5px' }}>
            새로운 타로 리딩 (AI 분석)
          </Text>
          <Text size="sm" c="dimmed">사진 속에 담긴 운명의 기운을 AI로 해독합니다.</Text>
        </Stack>

        <Stack gap="lg">
          <Select
            label="1. 상담 카테고리"
            data={['연애운', '취업운', '금전운', '학업운', '인간관계', '기타']}
            className="bori-input"
            {...form.getInputProps('category')}
            radius="md" size="md"
          />

          <Select
            label="2. 배열법 선택"
            data={SPREAD_TYPES.map((s) => ({ value: s.value, label: `${s.label}` }))}
            className="bori-input"
            {...form.getInputProps('spreadType')}
            radius="md" size="md"
          />

          <Textarea
            label="3. 내담자 상황"
            placeholder="하늘의 뜻을 묻기 전, 현재의 상황을 정갈히 적어주세요..."
            className="bori-input"
            minRows={4} autosize
            {...form.getInputProps('situation')}
            radius="md" size="md"
          />

          <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'rgba(197, 160, 89, 0.05)', borderColor: '#C5A059' }}>
            <Stack gap="xs">
              <Text fw={800} size="sm" c="#1A2F2F">4. 운명의 기록 (사진 업로드)</Text>
              
              <Box mb="sm">
                <Text size="xs" mb={4} fw={600} opacity={0.7} c="#1A2F2F">• 타로 스프레드 (필수)</Text>
                {!tarotPreview ? (
                  <Paper 
                    withBorder p="xl" radius="md" 
                    onClick={() => openUploadModal('tarot')}
                    style={{ 
                      cursor: 'pointer', borderStyle: 'dashed', backgroundColor: '#fff', borderColor: '#C5A059',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
                    }}
                  >
                    <IconCamera size={36} color="#C5A059" stroke={1} />
                    <Text size="sm" fw={700} c="#C5A059">사진을 봉인 해제하여 업로드</Text>
                  </Paper>
                ) : (
                  <Box style={{ position: 'relative' }}>
                    <AspectRatio ratio={16/9}>
                      <Image src={tarotPreview} radius="md" alt="tarot preview" />
                    </AspectRatio>
                    <ActionIcon 
                      variant="filled" color="red" radius="xl"
                      style={{ position: 'absolute', top: -10, right: -10, zIndex: 10, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                      onClick={() => removeImage('tarot')}
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Box>
                )}
              </Box>

              <Group justify="space-between" mt="xs">
                <Text size="sm" fw={800} c="#1A2F2F">오라클의 비방 추가</Text>
                <Switch 
                  {...form.getInputProps('useOracle', { type: 'checkbox' })}
                  size="md" color="teal"
                />
              </Group>
              
              {form.values.useOracle && (
                <Stack gap="sm" mt="sm">
                  <TextInput
                    className="bori-input"
                    label="오라클 덱 명칭"
                    placeholder="예: 영혼의 등불 오라클"
                    {...form.getInputProps('oracleDeckName')}
                    radius="md" size="sm"
                  />
                  <Box>
                    <Text size="xs" mb={4} fw={600} opacity={0.7} c="#1A2F2F">• 오라클 조언 사진</Text>
                    {!oraclePreview ? (
                      <Paper 
                        withBorder p="md" radius="md" 
                        onClick={() => openUploadModal('oracle')}
                        style={{ 
                          cursor: 'pointer', borderStyle: 'dashed', backgroundColor: '#fff', borderColor: '#C5A059',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <IconUpload size={24} color="#C5A059" stroke={1} />
                        <Text size="xs" fw={700} c="#C5A059">비방 사진 업로드</Text>
                      </Paper>
                    ) : (
                      <Box style={{ position: 'relative' }}>
                        <AspectRatio ratio={16/9}>
                          <Image src={oraclePreview} radius="md" alt="oracle preview" />
                        </AspectRatio>
                        <ActionIcon 
                          variant="filled" color="red" radius="xl" size="sm"
                          style={{ position: 'absolute', top: -8, right: -8, zIndex: 10 }}
                          onClick={() => removeImage('oracle')}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      </Box>
                    )}
                  </Box>
                </Stack>
              )}
            </Stack>
          </Paper>

          <Stack gap="xs">
            <Text fw={600} size="sm">5. 보너스 조언 카드 (최대 5장)</Text>
            {form.values.bonusCards.map((_card, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Select
                  className="bori-input"
                  data={BONUS_CARD_DATA}
                  searchable
                  {...form.getInputProps(`bonusCards.${index}`)}
                  radius="md" size="sm" style={{ flex: 1 }}
                />
                {form.values.bonusCards.length > 1 && (
                  <ActionIcon color="red" variant="subtle" onClick={() => form.removeListItem('bonusCards', index)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            {form.values.bonusCards.length < 5 && (
              <Button
                variant="light" color="teal" size="compact-xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('bonusCards', '선택안함')}
              >
                조언 카드 추가
              </Button>
            )}
          </Stack>

          <Select
            label="6. 리딩의 색채 (Ton & Manner)"
            className="bori-input"
            data={['따뜻하고 공감적인 위로', '객관적이고 뼈때리는 팩트', '희망차고 긍정적인 응원', '전문적이고 심오한 분석']}
            {...form.getInputProps('toneAndManner')}
            radius="md" size="md"
          />

          {step === 1 && (
            <Button 
              size="lg"
              className={tarotPreview ? "btn-oriental btn-oriental-teal ink-bleed-btn" : "btn-oriental"}
              leftSection={<IconWand size={22} />}
              mt="md" onClick={analyzeCards}
              loading={isAnalyzing}
              disabled={!tarotPreview || isAnalyzing}
            >
              [1단계] 이 기록으로 분석 시작
            </Button>
          )}

          {step >= 2 && (
            <Paper p="lg" radius="md" withBorder bg="rgba(26, 47, 47, 0.03)" style={{ borderColor: '#C5A059' }}>
              <Group justify="space-between" mb="md">
                <Text fw={800} style={{ color: '#1A2F2F' }}>🔍 운명의 배열 검사 및 수정</Text>
                <Button size="xs" variant="outline" color="teal" onClick={addManualCard}>+ 카드 수동 추가</Button>
              </Group>
              
              <Stack gap="md">
                {recognizedCards.map((card, idx) => (
                  <Group key={idx} align="flex-end" grow>
                    <Select
                      label={`${idx + 1}번 기운${card.positionLabel ? ` — ${card.positionLabel}` : ''}`}
                      data={getCardSelectData(card.name)}
                      searchable value={card.name}
                      onChange={(val) => updateCardName(idx, val)}
                      className="bori-input"
                    />
                    <Select
                      label="방향"
                      data={['정방향', '역방향']}
                      value={card.orientation}
                      onChange={(val) => updateCardOrientation(idx, val)}
                      style={{ maxWidth: '100px' }}
                      className="bori-input"
                    />
                    <ActionIcon color="red" variant="filled" size="lg" radius="md" mb={4} onClick={() => removeCard(idx)}>
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>

              {step === 2 && (
                <Button 
                  fullWidth className="btn-oriental btn-oriental-teal" size="md"
                  leftSection={<IconWand size={20} />}
                  mt="xl" onClick={generateFinalReading}
                  loading={isGenerating}
                >
                  최종 비방 조제 (AI Insight)
                </Button>
              )}
            </Paper>
          )}

          {step === 3 && readingResult && (
            <Paper p="lg" radius="md" bg="rgba(197, 160, 89, 0.05)" style={{ border: '1px solid #C5A059' }}>
              <Text fw={900} style={{ color: '#1A2F2F' }} mb="xs">✨ AI 리딩 결과 (운명의 서)</Text>
              <Textarea 
                value={readingResult}
                onChange={(e) => setReadingResult(e.currentTarget.value)}
                minRows={8} autosize radius="md"
                className="bori-input"
              />
            </Paper>
          )}

          <Divider my="sm" className="bori-divider" label={<Text size="sm" c="dimmed" fw={700}>상담 기록 보관</Text>} labelPosition="center" />

          <TextInput
            label="내담자 성함 / 별칭"
            placeholder="예: 김아르카나"
            className="bori-input"
            {...form.getInputProps('clientName')}
            radius="md" size="md" required
          />
          <Group grow>
            <Select
              label="상담 방편"
              data={['카카오톡', '크몽', '인스타그램', '네이버', '당근', '오프라인', '기타']}
              className="bori-input"
              {...form.getInputProps('platform')}
              radius="md" size="md"
            />
            <NumberInput
              label="상담 사례 (복채)"
              placeholder="예: 30000"
              suffix=" 원"
              className="bori-input"
              thousandSeparator
              {...form.getInputProps('paymentAmount')}
              radius="md" size="md"
            />
          </Group>

          <Button 
            size="lg"
            className="btn-seal-stamp"
            leftSection={<IconDeviceFloppy size={22} />}
            mt="xl" onClick={saveToCRM}
            loading={isSaving}
            fullWidth
          >
            기록 관인 찍기 (Press Seal)
          </Button>
        </Stack>
      </Card>

      {/* 📸 실시간 가이드라인 카메라 모달 */}
      <CameraModal 
        opened={cameraModalOpened} 
        onClose={() => setCameraModalOpened(false)} 
        onCapture={handleCapture}
        spreadType={form.values.spreadType}
      />
    </Container>
  );
}
