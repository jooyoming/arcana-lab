'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Title, Container, Table, Badge, Card, Group, ActionIcon, Text,
  Avatar, Modal, Stack, Paper, ScrollArea, Loader, Center,
  Notification, Box, Tooltip, Button,
} from '@mantine/core';
import {
  IconAddressBook, IconChevronRight, IconTrash, IconCheck, IconAlertCircle, IconFileDownload,
} from '@tabler/icons-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { generateTarotPDF } from '@/lib/TarotReportGenerator';
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

export default function ClientsDashboardPage() {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [notif, setNotif] = useState<NotifState | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  
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
    const confirmed = window.confirm('해당 상담 기록을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // selectedClient 상태 업데이트
      setSelectedClient((prev) => {
        if (!prev) return prev;
        return { ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) };
      });

      // clients 목록의 해당 고객 세션도 갱신
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient?.id
            ? { ...c, sessions: c.sessions.filter((s) => s.id !== sessionId) }
            : c
        )
      );

      showNotif('상담 기록이 삭제되었습니다.');
    } catch (err: any) {
      showNotif('삭제 중 오류가 발생했습니다.', true);
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
  const handleDownloadPDF = async (session: SessionInfo) => {
    if (!selectedClient) return;
    setPdfLoading(session.id);
    try {
      await generateTarotPDF({
        clientName: selectedClient.name,
        masterNickname: masterNickname,
        category: session.category,
        date: dayjs(session.created_at).format('YYYY-MM-DD HH:mm'),
        readingResult: session.ai_reading_result,
        cardImages: session.card_images || []
      });
      showNotif('PDF 보고서가 생성되었습니다.');
    } catch (err) {
      showNotif('PDF 생성 중 오류가 발생했습니다.', true);
    } finally {
      setPdfLoading(null);
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
      <Table.Tr key={client.id}>
        <Table.Td>
          <Group gap="sm" onClick={() => openClientDetails(client)} style={{ cursor: 'pointer' }}>
            <Avatar color="indigo" radius="xl">{client.name.charAt(0)}</Avatar>
            <Text size="sm" fw={700} c="indigo.7" style={{ textDecoration: 'underline' }}>
              {client.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color="gray">{client.platform}</Badge>
        </Table.Td>
        <Table.Td>{lastReadingType}</Table.Td>
        <Table.Td>{lastVisit}</Table.Td>
        <Table.Td>{totalSessions}회</Table.Td>
        <Table.Td>{totalPaid.toLocaleString()}원</Table.Td>
        <Table.Td>
          <Badge
            color={statusBadge === '단골' ? 'grape' : statusBadge === '재방문' ? 'indigo' : 'cyan'}
            variant="filled"
          >
            {statusBadge}
          </Badge>
        </Table.Td>
        {/* 상세 + 삭제 버튼 */}
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Tooltip label="상세 보기" withArrow>
              <ActionIcon variant="subtle" color="indigo" radius="xl" onClick={() => openClientDetails(client)}>
                <IconChevronRight size="1.2rem" stroke={2} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="고객 삭제" withArrow color="red">
              <ActionIcon
                variant="subtle"
                color="red"
                radius="xl"
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
    <Container size="xl" py="xl">
      <Group mb="xl" align="center">
        <IconAddressBook size={32} color="var(--mantine-color-indigo-6)" />
        <Title order={2} style={{ letterSpacing: '-0.5px' }}>내담자 관리 대시보드</Title>
      </Group>

      <Card shadow="sm" radius="xl" withBorder padding="0" style={{ overflow: 'hidden', minHeight: 400 }}>
        {loading ? (
          <Center h={400}>
            <Loader color="indigo" />
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={880}>
            <Table verticalSpacing="md" horizontalSpacing="lg" striped highlightOnHover>
              <Table.Thead bg="var(--mantine-color-gray-0)">
                <Table.Tr>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">이름 (닉네임)</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">유입 플랫폼</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">최근 상담 종류</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">최근 방문일</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">상담 횟수</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">누적 결제 금액</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">고객 분류</Text></Table.Th>
                  <Table.Th><Text size="xs" c="dimmed" fw={600} tt="uppercase">작업</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? rows : (
                  <Table.Tr>
                    <Table.Td colSpan={8}>
                      <Text ta="center" py="xl" c="dimmed">등록된 내담자가 없습니다.</Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* ─── 고객 상세 모달 ───────────────────────────────────── */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text size="xl" fw={700}>내담자 상세: {selectedClient?.name}</Text>}
        size="xl"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedClient && (
          <Stack gap="xl">
            <Group>
              <Badge size="lg" variant="light" color="blue">플랫폼: {selectedClient.platform}</Badge>
              <Badge size="lg" variant="dot" color="indigo">총 상담 횟수: {selectedClient.sessions.length}회</Badge>
              <Badge size="lg" variant="dot" color="teal">
                누적 금액: {selectedClient.sessions.reduce((acc, curr) => acc + (curr.payment_amount || 0), 0).toLocaleString()}원
              </Badge>
            </Group>

            <Text size="lg" fw={700} pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
              과거 상담 기록
            </Text>

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
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {session.situation || '입력된 상황이 없습니다.'}
                    </Text>
                  </Paper>

                  <Text size="sm" fw={600} mt="md">AI 리딩 결과 (말투: {session.tone_and_manner})</Text>
                  <Paper
                    p="sm" withBorder mt={4}
                    bg="var(--mantine-color-indigo-0)"
                    style={{ borderColor: 'var(--mantine-color-indigo-2)' }}
                  >
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }} c="indigo.9">
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
