'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Title, Container, Table, Badge, Card, Group, ActionIcon, Text,
  Avatar, Modal, Stack, Paper, ScrollArea, Loader, Center,
  Notification, Box, Tooltip, Button, Radio,
} from '@mantine/core';
import {
  IconAddressBook, IconChevronRight, IconTrash, IconCheck, IconAlertCircle, IconFileDownload,
  IconSun, IconMoonStars, IconPlant2,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { generateTarotPDF, PDFTheme, TitleType } from '@/lib/TarotReportGenerator';
import dayjs from 'dayjs';

interface ClientInfo {
  id: string;
  name: string;
  platform: string;
  created_at: string;
  sessions: SessionInfo[];
}

interface SessionInfo {
  id: string;
  category: string;
  situation: string;
  bonus_card: string;
  use_oracle: boolean;
  oracle_deck_name: string;
  tone_and_manner: string;
  ai_reading_result: string;
  payment_amount: number;
  created_at: string;
  card_images?: Array<{
    name: string;
    url: string;
    orientation: string;
    type: string;
  }>;
}

interface NotifState {
  message: string;
  color: 'teal' | 'red';
  icon: React.ReactNode;
}

const HANJI_BG = '#F9F7F2';
const MAIN_INK = '#1A2F2F';
const POINT_GOLD = '#C5A059';
const SEAL_RED = '#8B0000';

export default function ClientsDashboardPage() {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [notif, setNotif] = useState<NotifState | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  
  // PDF 옵션 모달 상태
  const [exportModalOpened, setExportModalOpened] = useState(false);
  const [selectedSessionForPdf, setSelectedSessionForPdf] = useState<SessionInfo | null>(null);
  const [pdfTheme, setPdfTheme] = useState<PDFTheme>('oriental');
  const [pdfTitleType, setPdfTitleType] = useState<TitleType>('standard');
  
  const supabase = createClient();
  const { user } = useAuth();
  const masterNickname = user?.user_metadata?.nickname || '타로 마스터';

  // ─── 토스트 헬퍼 ───────────────────────────────────────────────
  const showNotif = useCallback((message: string, isError = false) => {
    setNotif({
      message,
      color: isError ? 'red' : 'teal',
      icon: isError ? <IconAlertCircle size={18} /> : <IconCheck size={18} />,
    });
    setTimeout(() => setNotif(null), 3000);
  }, []);

  // ─── 데이터 패칭 ──────────────────────────────────────────────
  const fetchClientsData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`*, sessions (*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data as ClientInfo[]);
    } catch (err: any) {
      console.error('고객 정보 로드 오류:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientsData();
  }, [fetchClientsData]);

  // ─── 고객 전체 삭제 ───────────────────────────────────────────
  const deleteClient = async (client: ClientInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      `"${client.name}" 고객과 관련된 모든 상담 기록이 영구 삭제됩니다.\n정말 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      if (error) throw error;

      // 로컬 상태 즉시 갱신
      setClients((prev) => prev.filter((c) => c.id !== client.id));
      showNotif(`"${client.name}" 고객이 삭제되었습니다.`);
    } catch (err: any) {
      showNotif('삭제 중 오류가 발생했습니다.', true);
      console.error(err);
    }
  };

  // ─── 개별 상담 기록 삭제 ─────────────────────────────────────
  const deleteSession = async (sessionId: string) => {
    const sessionToDelete = selectedClient?.sessions.find(s => s.id === sessionId);
    const amountToDeduct = sessionToDelete?.payment_amount || 0;

    const confirmed = window.confirm(
      `해당 상담 기록을 비밀 명부에서 영구히 말소하시겠습니까?\n이 작업은 되돌릴 수 없으며, 마스터님의 통계 데이터에서도 즉시 차감됩니다.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // 1. 전체 clients 목록 갱신 (전역적 통계 반영)
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient?.id
            ? { ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) }
            : c
        )
      );

      // 2. 현재 선택된 고객의 상세 모달 상태 갱신
      setSelectedClient((prev) => {
        if (!prev) return prev;
        return { ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) };
      });

      showNotif(`상담 기록이 말소되었습니다. (차감액: ${amountToDeduct.toLocaleString()}원)`);
    } catch (err: any) {
      showNotif('말소 처리 중 오류가 발생했습니다.', true);
      console.error(err);
    }
  };

  // ─── 모달 열기 ───────────────────────────────────────────────
  const openClientDetails = (client: ClientInfo) => {
    const sortedClient = {
      ...client,
      sessions: (client.sessions || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    };
    setSelectedClient(sortedClient);
    setModalOpened(true);
  };

  // ─── PDF 생성 ─────────────────────────────────────────────
  const handleDownloadPDF = (session: SessionInfo) => {
    setSelectedSessionForPdf(session);
    setExportModalOpened(true);
  };

  const executePdfDownload = async () => {
    if (!selectedClient || !selectedSessionForPdf) return;
    
    setPdfLoading(selectedSessionForPdf.id);
    setExportModalOpened(false);
    
    try {
      await generateTarotPDF({
        clientName: selectedClient.name,
        masterNickname: masterNickname,
        category: selectedSessionForPdf.category,
        date: dayjs(selectedSessionForPdf.created_at).format('YYYY-MM-DD HH:mm'),
        readingResult: selectedSessionForPdf.ai_reading_result,
        cardImages: selectedSessionForPdf.card_images || [],
        theme: pdfTheme,
        titleType: pdfTitleType,
      });
      showNotif('PDF 보고서가 성공적으로 생성되었습니다.');
    } catch (err) {
      showNotif('PDF 생성 중 오류가 발생했습니다.', true);
    } finally {
      setPdfLoading(null);
      setSelectedSessionForPdf(null);
    }
  };

  // ─── 테이블 행 렌더링 ─────────────────────────────────────────
  const rows = clients.map((client) => {
    const totalSessions = client.sessions?.length || 0;
    const totalPaid = client.sessions?.reduce((acc, curr) => acc + (curr.payment_amount || 0), 0) || 0;

    let lastVisit = dayjs(client.created_at).format('YYYY-MM-DD');
    let lastReadingType = '-';

    if (totalSessions > 0) {
      const sorted = [...client.sessions].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastVisit = dayjs(sorted[0].created_at).format('YYYY-MM-DD');
      lastReadingType = sorted[0].category;
    }

    const statusBadge = totalSessions >= 5 ? '단골' : totalSessions >= 2 ? '재방문' : '신규';

    return (
      <Table.Tr key={client.id} style={{ borderBottom: `1px solid ${MAIN_INK}11` }}>
        <Table.Td>
          <Group gap="sm" onClick={() => openClientDetails(client)} style={{ cursor: 'pointer' }}>
            <Avatar color="dark" radius="md" style={{ border: `1px solid ${POINT_GOLD}` }}>{client.name.charAt(0)}</Avatar>
            <Text size="sm" fw={800} c={MAIN_INK} className="font-serif" style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              {client.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge 
            variant="filled" 
            style={{ 
              backgroundColor: SEAL_RED, 
              color: HANJI_BG, 
              borderRadius: 2, 
              fontFamily: 'var(--font-serif)',
              fontSize: '10px',
              padding: '4px 6px',
              height: 'auto'
            }}
          >
            {client.platform}
          </Badge>
        </Table.Td>
        <Table.Td className="font-serif">{lastReadingType}</Table.Td>
        <Table.Td style={{ opacity: 0.6 }}>{lastVisit}</Table.Td>
        <Table.Td fw={700}>{totalSessions}회</Table.Td>
        <Table.Td fw={900} c={SEAL_RED} style={{ letterSpacing: '0.5px' }}>
          {totalPaid.toLocaleString()}원
        </Table.Td>
        <Table.Td>
          <Badge
            variant="outline"
            style={{ color: MAIN_INK, borderColor: MAIN_INK, borderRadius: 2, fontSize: '10px' }}
          >
            {statusBadge}
          </Badge>
        </Table.Td>
        {/* 상세 + 삭제 버튼 */}
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Tooltip label="비밀 명부 확인" withArrow>
              <ActionIcon variant="subtle" color="dark" radius="md" onClick={() => openClientDetails(client)}>
                <IconChevronRight size="1.2rem" stroke={2} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="기록 말소" withArrow color="red">
              <ActionIcon
                variant="light"
                color="red"
                radius="md"
                style={{ backgroundColor: 'rgba(139, 46, 46, 0.05)', border: '1px solid rgba(139, 46, 46, 0.1)' }}
                onClick={(e) => deleteClient(client, e)}
              >
                <IconTrash size="1.1rem" stroke={2} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Container size="xl" py="xl" style={{ backgroundColor: HANJI_BG, minHeight: '100vh', backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')" }}>
      <Group mb="xl" align="center">
        <IconAddressBook size={32} color={MAIN_INK} />
        <Title order={2} className="font-serif" style={{ letterSpacing: '-1px', color: MAIN_INK, fontWeight: 900 }}>
          아르카나 랩 | 내담자 비밀 명부
        </Title>
      </Group>

      <Paper shadow="xs" p="0" style={{ background: 'transparent', minHeight: 400 }}>
        {loading ? (
          <Center h={400}>
            <Loader color={POINT_GOLD} />
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={880}>
            <Table verticalSpacing="lg" horizontalSpacing="lg">
              <Table.Thead style={{ borderBottom: `2px solid ${MAIN_INK}` }}>
                <Table.Tr>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">내담자 성함</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">유입 방편</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">최근 비망</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">최근 내방일</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">인연 횟수</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">누적 복채</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">인연 분류</Text></Table.Th>
                  <Table.Th><Text size="xs" c={MAIN_INK} fw={900} className="font-serif">관리</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text ta="center" py={100} c="dimmed" className="font-serif">기록된 인연이 아직 없습니다.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>


      {/* ─── 고객 상세 모달 ───────────────────────────────────── */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text size="xl" fw={900} className="font-serif" color={MAIN_INK}>내담자 비밀 명부: {selectedClient?.name}</Text>}
        size="xl"
        centered
        styles={{
          content: { 
            backgroundColor: HANJI_BG, 
            backgroundImage: "url('https://www.transparenttextures.com/patterns/paper-fibers.png')",
            border: `2px solid ${POINT_GOLD}`
          }
        }}
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedClient && (
          <Stack gap="xl">
            <Group>
              <Badge 
                size="lg" variant="filled" 
                style={{ backgroundColor: SEAL_RED, borderRadius: 2, fontFamily: 'var(--font-serif)' }}
              >
                플랫폼: {selectedClient.platform}
              </Badge>
              <Badge 
                size="lg" variant="outline" 
                style={{ color: MAIN_INK, borderColor: MAIN_INK, borderRadius: 2 }}
              >
                총 상담 횟수: {selectedClient.sessions.length}회
              </Badge>
              <Badge 
                size="lg" variant="outline" 
                style={{ color: SEAL_RED, borderColor: SEAL_RED, borderRadius: 2 }}
              >
                누적 복채: {selectedClient.sessions.reduce((acc, curr) => acc + (curr.payment_amount || 0), 0).toLocaleString()}원
              </Badge>
            </Group>

            <Title order={4} className="font-serif" c={MAIN_INK} pb="xs" style={{ borderBottom: `1.5px solid ${MAIN_INK}` }}>
              과거 비망록 (상담 기록)
            </Title>


            {selectedClient.sessions.length > 0 ? (
              selectedClient.sessions.map((session) => (
                <Paper key={session.id} p="md" radius="md" withBorder bg="var(--mantine-color-gray-0)">
                  {/* 헤더: 카테고리 + 날짜 + 삭제 버튼 */}
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge color="violet" size="sm">{session.category}</Badge>
                      <Text size="xs" c="dimmed">
                        {dayjs(session.created_at).format('YYYY년 MM월 DD일 HH:mm')}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Button
                        variant="light"
                        color="indigo"
                        size="compact-xs"
                        leftSection={<IconFileDownload size={14} />}
                        onClick={() => handleDownloadPDF(session)}
                        loading={pdfLoading === session.id}
                      >
                        PDF 보고서
                      </Button>
                      <Tooltip label="이 상담 기록 삭제" withArrow color="red">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                        >
                          <IconTrash size={15} stroke={2} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {session.card_images && session.card_images.length > 0 && (
                    <Box mb="md">
                      <Text size="xs" fw={700} c="dimmed" mb={8} tt="uppercase">복기용 카드 배열</Text>
                      <Group gap="xs">
                        {session.card_images.map((img, i) => (
                          <Tooltip key={i} label={`${img.name} (${img.orientation})`}>
                            <Box style={{ 
                              width: 60, height: 90, 
                              borderRadius: 4, overflow: 'hidden', 
                              border: '1px solid var(--mantine-color-gray-3)',
                              backgroundColor: 'white'
                            }}>
                              <img 
                                src={img.url} 
                                alt={img.name}
                                style={{ 
                                  width: '100%', height: '100%', objectFit: 'cover',
                                  transform: img.orientation === '역방향' ? 'rotate(180deg)' : 'none'
                                }}
                              />
                            </Box>
                          </Tooltip>
                        ))}
                      </Group>
                    </Box>
                  )}

                  <Group gap="xs" mb="sm">
                    <Text size="sm" fw={600}>단가: {session.payment_amount?.toLocaleString() || 0}원</Text>
                    {session.bonus_card !== '선택안함' && (
                      <Badge variant="outline" color="orange" size="xs">보너스: {session.bonus_card}</Badge>
                    )}
                    {session.use_oracle && (
                      <Badge variant="outline" color="cyan" size="xs">오라클 사용</Badge>
                    )}
                  </Group>

                  <Text size="sm" fw={600} mt="md">내담자 상황</Text>
                  <Paper p="sm" withBorder mt={4} bg="white">
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}>
                      {session.situation || '입력된 상황이 없습니다.'}
                    </Text>
                  </Paper>

                  <Text size="sm" fw={600} mt="md">AI 리딩 결과 (말투: {session.tone_and_manner})</Text>
                  <Paper
                    p="sm" withBorder mt={4}
                    bg="var(--mantine-color-indigo-0)"
                    style={{ borderColor: 'var(--mantine-color-indigo-2)' }}
                  >
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }} c="indigo.9">
                      {session.ai_reading_result}
                    </Text>
                  </Paper>
                </Paper>
              ))
            ) : (
              <Text c="dimmed">저장된 상담 기록이 없습니다.</Text>
            )}
          </Stack>
        )}
      </Modal>

      {/* ─── PDF 출력 옵션 모달 ────────────────────────────────── */}
      <Modal
        opened={exportModalOpened}
        onClose={() => setExportModalOpened(false)}
        title={<Text size="lg" fw={800} style={{ fontFamily: 'var(--font-serif)' }}>리포트 출력 옵션 설정</Text>}
        centered
        radius="md"
        size="md"
      >
        <Stack gap="xl">
          <Box>
            <Text fw={700} size="sm" mb="xs">1. 원하시는 보고서 테마를 선택하세요</Text>
            <Radio.Group value={pdfTheme} onChange={(val) => setPdfTheme(val as PDFTheme)}>
              <Stack gap="sm">
                <Paper withBorder p="sm" radius="md" style={{ borderColor: pdfTheme === 'oriental' ? 'var(--bori-gold)' : undefined }}>
                  <Radio value="oriental" label={
                    <Group gap="xs">
                      <IconPlant2 size={16} color="var(--bori-gold)" />
                      <Text size="sm" fw={pdfTheme === 'oriental' ? 700 : 400}>동양풍 (Oriental)</Text>
                      <Text size="xs" c="dimmed">한지 질감, 고서 느낌의 전통적 디자인</Text>
                    </Group>
                  } />
                </Paper>
                <Paper withBorder p="sm" radius="md" style={{ borderColor: pdfTheme === 'western' ? '#7950f2' : undefined }}>
                  <Radio value="western" label={
                    <Group gap="xs">
                      <IconMoonStars size={16} color="#7950f2" />
                      <Text size="sm" fw={pdfTheme === 'western' ? 700 : 400}>서양풍 (Western)</Text>
                      <Text size="xs" c="dimmed">신비로운 아우라, 화려한 정통 타로 테마</Text>
                    </Group>
                  } />
                </Paper>
                <Paper withBorder p="sm" radius="md" style={{ borderColor: pdfTheme === 'minimal' ? 'gray' : undefined }}>
                  <Radio value="minimal" label={
                    <Group gap="xs">
                      <IconSun size={16} />
                      <Text size="sm" fw={pdfTheme === 'minimal' ? 700 : 400}>기본/미니멀 (Minimal)</Text>
                      <Text size="xs" c="dimmed">깔끔한 웰니스 센터 스타일의 전문 보고서</Text>
                    </Group>
                  } />
                </Paper>
              </Stack>
            </Radio.Group>
          </Box>

          <Box>
            <Text fw={700} size="sm" mb="xs">2. 상단 타이틀 브랜딩 형식을 선택하세요</Text>
            <Radio.Group value={pdfTitleType} onChange={(val) => setPdfTitleType(val as TitleType)}>
              <Stack gap="xs">
                <Radio value="standard" label={<Text size="sm">Tarot Consult by {masterNickname}</Text>} />
                <Radio value="record" label={<Text size="sm">{masterNickname}의 운명 기록부</Text>} />
                <Radio value="nameOnly" label={<Text size="sm">{masterNickname}</Text>} />
              </Stack>
            </Radio.Group>
          </Box>

          <Button 
            fullWidth 
            className="btn-seal" 
            size="md" 
            onClick={executePdfDownload}
            leftSection={<IconFileDownload size={18} />}
          >
            PDF 리포트 생성 및 저장
          </Button>
        </Stack>
      </Modal>

      {/* ─── 플로팅 토스트 알림 ──────────────────────────────────── */}
      {notif && (
        <Box style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, width: 320 }}>
          <Notification
            color={notif.color}
            icon={notif.icon}
            onClose={() => setNotif(null)}
            withBorder
            radius="md"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
          >
            {notif.message}
          </Notification>
        </Box>
      )}
    </Container>
  );
}
