'use client';

import { useState } from 'react';
import { TextInput, Textarea, Button, Container, Select, Paper, Stack, Group, Text, Switch, FileInput, Card, Divider, NumberInput, ActionIcon, Flex } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconWand, IconDeviceFloppy, IconSearch, IconTrash, IconPlus } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { MAJOR_ARCANA, MINOR_ARCANA, SPREAD_TYPES, getCardImageUrl } from '@/lib/tarotData';

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

interface RecognizedCard {
  index: number;
  name: string;
  orientation: string;
  /** 배열법 포지션 명칭 (예: '현재 상황') */
  positionLabel?: string;
}

// AI가 반환하는 다양한 정/역방향 표현을 드롭다운 값으로 정규화
const normalizeOrientation = (orientation: string): string => {
  if (!orientation) return '정방향';
  const o = orientation.trim().toLowerCase();
  if (o.includes('역') || o.includes('reverse') || o === 'rx' || o === 'reversed') {
    return '역방향';
  }
  return '정방향';
};

// 카드명이 기존 목록에 없으면 AI 인식 결과 그룹을 최상단에 추가
const ALL_CARD_NAMES = new Set([...MAJOR_ARCANA, ...MINOR_ARCANA]);
const getCardSelectData = (cardName: string) => {
  if (ALL_CARD_NAMES.has(cardName)) return TAROT_CARDS_DATA;
  return [
    { group: '🤖 AI 인식 결과 (수정 권장)', items: [cardName] },
    ...TAROT_CARDS_DATA,
  ];
};

export default function TarotInputFormPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [recognizedCards, setRecognizedCards] = useState<RecognizedCard[]>([]);
  const [readingResult, setReadingResult] = useState('');
  
  const supabase = createClient();
  const { user, signOut } = useAuth();

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
      
      // 배열법 선택
      spreadType: '3-card',

      // CRM 정보
      clientName: '',
      platform: '카카오톡',
      paymentAmount: 0,
    }
  });

  // [1단계] 사진 분석 요청
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

      // 디버그: API 원본 응답 확인
      console.log('[카드 인식 원본 응답]', JSON.stringify(data.result, null, 2));

      // 정/역방향 정규화 후 상태 업데이트
      const normalizedCards = (data.result || []).map((card: RecognizedCard) => ({
        ...card,
        orientation: normalizeOrientation(card.orientation),
      }));

      console.log('[정규화된 카드 데이터]', normalizedCards);
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

  // [2단계] 확정된 카드로 최종 리딩 요청
  const generateFinalReading = async () => {
    if (recognizedCards.length === 0) {
      alert("분석된 카드가 한 장도 없습니다. 카드를 추가하거나 다시 사진을 분석해주세요.");
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
        headers: {
          'Content-Type': 'application/json'
        },
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
      alert('내담자 이름(닉네임)을 입력해주세요.');
      return;
    }
    if (!readingResult.trim()) {
      alert('먼저 AI 리딩을 완료한 후 저장할 수 있습니다.');
      return;
    }

    setIsSaving(true);
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

      if (!clientId) throw new Error('내담자 ID를 식별하지 못했습니다.');

      // 카드 이미지 정보 구성
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
          tarot_image_url: null, 
          oracle_image_url: null
        });

      if (sessionError) throw sessionError;

      alert(`성공적으로 저장되었습니다! (${isExistingClient ? '기존 방문 내담자' : '신규 내담자'} 인식됨)`);
      
      // 상태 초기화
      form.reset();
      setRecognizedCards([]);
      setReadingResult('');
      setStep(1);
      
    } catch (error: any) {
      console.error(error);
      alert(`저장 중 오류 발생: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Card shadow="sm" padding="xl" radius="xl" withBorder>
        <Stack align="center" mb="xl">
          <Text size="2xl" fw={800} variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 45 }} style={{ letterSpacing: '-0.5px' }}>
            새로운 타로 리딩 (2단계 분석)
          </Text>
          <Text size="sm" c="dimmed">사진을 분석하여 카드를 정확하게 확인하고 정교한 리딩을 받아보세요.</Text>
        </Stack>

        <Stack gap="lg">
          <Select
            label="1. 상담 카테고리"
            data={['연애운', '취업운', '금전운', '학업운', '인간관계', '기타']}
            {...form.getInputProps('category')}
            radius="md" size="md"
          />

          <Select
            label="2. 배열법 선택 (촬영한 스프레드)"
            data={SPREAD_TYPES.map((s) => ({ value: s.value, label: `${s.label}` }))}
            {...form.getInputProps('spreadType')}
            radius="md" size="md"
            description="사진에 깔린 카드 배열법과 동일하게 선택해야 순서가 정확히 매핑됩니다."
          />

          <Textarea
            label="3. 내담자 상황"
            placeholder="현재 내담자의 고민과 상황을 상세히 적어주세요..."
            minRows={4} autosize
            {...form.getInputProps('situation')}
            radius="md" size="md"
          />

          <Paper p="md" radius="md" withBorder>
            <Stack gap="xs">
              <Text fw={600} size="sm">4. 타로 / 오라클 카드 사진 업로드</Text>
              
              <Paper p="sm" bg="gray.0" radius="md" mb="xs">
                <Text size="xs" c="dimmed">
                  💡 켈틱 크로스처럼 카드가 겹치는 배열은, 아래 카드의 모서리나 기호가 살짝 보이도록 엇갈리게 놓아주시면 AI가 더 정확하게 인식합니다.
                </Text>
              </Paper>

              <FileInput
                placeholder="터치하여 이미지 업로드"
                accept="image/*"
                leftSection={<IconUpload size={18} />}
                {...form.getInputProps('tarotImage')}
                radius="md" size="md"
              />

              <Group justify="space-between" mt="md">
                <Text size="sm" fw={600}>오라클 카드 사용 여부</Text>
                <Switch 
                  {...form.getInputProps('useOracle', { type: 'checkbox' })}
                  size="md" color="indigo"
                />
              </Group>
              
              {form.values.useOracle && (
                <Stack gap="sm" mt="xs">
                  <TextInput
                    label="오라클 덱 이름"
                    placeholder="예: 문올로지 오라클, 로맨스 엔젤 등"
                    {...form.getInputProps('oracleDeckName')}
                    radius="md" size="md"
                  />
                  <FileInput
                    label="오라클 카드 촬영 본"
                    placeholder="터치하여 업로드"
                    accept="image/*"
                    leftSection={<IconUpload size={18} />}
                    {...form.getInputProps('oracleImage')}
                    radius="md" size="md"
                  />
                </Stack>
              )}
            </Stack>
          </Paper>

          <Stack gap="xs">
            <Text fw={600} size="sm">5. 보너스 조언 카드 (최대 5장)</Text>
            {form.values.bonusCards.map((_card, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Select
                  data={BONUS_CARD_DATA}
                  searchable
                  maxDropdownHeight={280}
                  {...form.getInputProps(`bonusCards.${index}`)}
                  radius="md"
                  size="sm"
                  style={{ flex: 1 }}
                />
                {form.values.bonusCards.length > 1 && (
                  <ActionIcon 
                    color="red" 
                    variant="subtle" 
                    onClick={() => form.removeListItem('bonusCards', index)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            ))}
            {form.values.bonusCards.length < 5 && (
              <Button
                variant="light"
                color="indigo"
                size="compact-xs"
                leftSection={<IconPlus size={14} />}
                onClick={() => form.insertListItem('bonusCards', '선택안함')}
                mt={2}
              >
                조언 카드 추가
              </Button>
            )}
          </Stack>

          <Select
            label="6. 리딩 톤 앤 매너"
            data={['따뜻하고 공감적인 위로', '객관적이고 뼈때리는 팩트', '희망차고 긍정적인 응원', '전문적이고 심오한 분석']}
            {...form.getInputProps('toneAndManner')}
            radius="md" size="md"
          />

          {/* 1단계: 분석하기 버튼 */}
          {step === 1 && (
            <Button 
              size="lg" radius="xl" 
              variant="outline" color="indigo"
              leftSection={<IconSearch size={20} />}
              mt="md"
              onClick={analyzeCards}
              loading={isAnalyzing}
              disabled={isAnalyzing}
            >
              [1단계] 사진 속 카드 AI로 분석하기
            </Button>
          )}

          {/* 2단계: 결과 검토 영역 */}
          {step >= 2 && (
            <Paper p="lg" radius="md" withBorder bg="indigo.0" style={{ borderColor: 'var(--mantine-color-indigo-2)' }}>
              <Group justify="space-between" mb="md">
                <Text fw={700} c="indigo.9">🔍 카드 인식 검토 및 수정</Text>
                <Button size="xs" variant="light" color="indigo" onClick={addManualCard}>+ 카드 직접 추가</Button>
              </Group>
              
              {recognizedCards.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="md">인식된 카드가 없습니다. 다시 시도하거나 직접 추가해주세요.</Text>
              ) : (
                <Stack gap="md">
                  {recognizedCards.map((card, idx) => (
                    <Group key={idx} align="flex-end" grow>
                      <Select
                        label={`${idx + 1}번 카드${card.positionLabel ? ` — ${card.positionLabel}` : ''}`}
                        data={getCardSelectData(card.name)}
                        searchable maxDropdownHeight={300}
                        value={card.name}
                        onChange={(val) => updateCardName(idx, val)}
                        allowDeselect={false}
                      />
                      <Select
                        label="정/역방향"
                        data={['정방향', '역방향']}
                        value={card.orientation}
                        onChange={(val) => updateCardOrientation(idx, val)}
                        style={{ maxWidth: '120px' }}
                      />
                      <ActionIcon
                        color="red"
                        variant="filled"
                        size="xl"
                        radius="md"
                        mb={4}
                        onClick={() => removeCard(idx)}
                        title="카드 삭제"
                      >
                        <IconTrash size={20} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              )}

              {step === 2 && (
                <Button 
                  fullWidth
                  size="lg" radius="xl" 
                  variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}
                  leftSection={<IconWand size={20} />}
                  mt="xl"
                  onClick={generateFinalReading}
                  loading={isGenerating}
                  disabled={isGenerating}
                >
                  [2단계] 검토 완료 및 최종 리딩 시작
                </Button>
              )}
            </Paper>
          )}

          {/* 3단계: AI 리딩 결과 영역 */}
          {step === 3 && readingResult && (
            <Paper p="lg" radius="md" bg="var(--mantine-color-indigo-0)" style={{ border: '1px solid var(--mantine-color-indigo-2)' }}>
              <Text fw={700} c="indigo.9" mb="xs">✨ 최종 AI 리딩 결과</Text>
              <Textarea 
                value={readingResult}
                onChange={(e) => setReadingResult(e.currentTarget.value)}
                minRows={8}
                autosize
                radius="md"
              />
            </Paper>
          )}

          <Divider my="sm" label={<Text size="sm" c="dimmed">아래 정보를 입력하여 상담 내역을 저장하세요</Text>} labelPosition="center" />

          {/* CRM 로직 */}
          <TextInput
            label="내담자 이름 (닉네임)"
            placeholder="예: 김타로"
            {...form.getInputProps('clientName')}
            radius="md" size="md"
            required
          />
          <Group grow>
            <Select
              label="상담 플랫폼"
              data={['카카오톡', '크몽', '인스타그램', '네이버', '당근', '오프라인', '기타']}
              {...form.getInputProps('platform')}
              radius="md" size="md"
            />
            <NumberInput
              label="결제 금액 (단가)"
              placeholder="예: 50000"
              suffix=" 원"
              thousandSeparator
              allowNegative={false}
              {...form.getInputProps('paymentAmount')}
              radius="md" size="md"
            />
          </Group>

          <Button 
            size="lg" radius="xl" color="dark"
            leftSection={<IconDeviceFloppy size={20} />}
            mt="xl"
            onClick={saveToCRM}
            loading={isSaving}
          >
            상담 내용 및 CRM 저장
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
