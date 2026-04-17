'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// ── 한글 폰트 등록 ──────────────────────────────────────────────────
// Note: @react-pdf/renderer에서 한글을 사용하려면 반드시 ttf/woff 폰트를 등록해야 함
Font.register({
  family: 'Noto Serif KR',
  src: 'https://fonts.gstatic.com/s/notoserifkr/v31/3JnoSDn90Gmq2mr3blnHaTZXbOtLJDvui3JOncjmeM52.ttf',
  fontWeight: 'normal',
});

Font.register({
  family: 'Noto Serif KR',
  src: 'https://fonts.gstatic.com/s/notoserifkr/v31/3JnoSDn90Gmq2mr3blnHaTZXbOtLJDvui3JOncgBf852.ttf',
  fontWeight: 'bold',
});

// 이모지 지원: Twemoji PNG 소스 등록 (깨짐 방지 및 컬러 지원)
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
});

// ── 스타일 정의 ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 60,
    paddingBottom: 20, // 연속적인 느낌을 위해 하단 패딩 축소
    backgroundColor: '#F9F7F2',
    fontFamily: 'Noto Serif KR',
    color: '#2C2C2C',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  // 헤더 영역
  header: {
    paddingBottom: 20,
    marginBottom: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C5A059',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    opacity: 0.8,
  },
  infoRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    opacity: 0.7,
  },
  // 본문 정보 그리드
  gridContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  gridItem: {
    flex: 1,
    padding: '10 0',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 9,
    color: '#888',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 타로 카드 영역
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    marginBottom: 40,
  },
  cardBox: {
    width: 100,
    alignItems: 'center',
  },
  cardImage: {
    width: 100,
    height: 150,
    marginBottom: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#C5A059',
  },
  cardName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardOrientation: {
    fontSize: 9,
    color: '#228be6',
    marginTop: 2,
  },
  cardOrientationReverse: {
    fontSize: 9,
    color: '#ff6b6b',
    marginTop: 2,
  },
  // 리딩 결과 영역
  readingBox: {
    borderWidth: 1,
    borderColor: '#C5A059',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
    minHeight: 200,
  },
  readingTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#C5A059',
    marginBottom: 15,
    textDecoration: 'underline',
  },
  readingText: {
    fontSize: 13,
    lineHeight: 1.8,
    textAlign: 'justify',
    // 이모지 깨짐 방지를 위한 폰트 폴백 설정 (지원되는 경우)
    fontFamily: 'Noto Serif KR',
  },
  // 마지막 페이지 전용 푸터 스타일 (낙관 스타일)
  finalFooter: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(197, 160, 89, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 10,
    color: '#C5A059',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  urlText: {
    fontSize: 8,
    color: '#AAA',
    marginTop: 4,
  },
  // 푸터 영역
  footer: {
    display: 'none',
  },
  pageNumber: {
    fontSize: 8,
    color: '#CCC',
    position: 'absolute',
    bottom: 20,
    right: 30,
  }
});

// ── 데이터 타입 ──────────────────────────────────────────────────────
interface Card {
  name: string;
  url: string;
  orientation: string;
  type: string;
}

interface OrientalReportProps {
  clientName: string;
  masterNickname: string;
  category: string;
  date: string;
  readingResult: string;
  formattedTitle: string;
  cardImages: Card[];
}

// ── 컴포넌트 ────────────────────────────────────────────────────────
export const OrientalReport = ({
  clientName = 'seeker',
  masterNickname = 'master',
  category = 'general',
  date = 'today',
  readingResult = '',
  formattedTitle = 'Reading Report',
  cardImages = [],
}: OrientalReportProps) => (
  <Document title={`ArcanaLab_${clientName || 'Report'}`}>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{formattedTitle || 'Tarot Reading'}</Text>
        <Text style={styles.subtitle}>Professional Tarot Reading Analysis</Text>
        <View style={styles.infoRow}>
          <Text>Arcana Lab Oriental Theme</Text>
          <Text>분석일시: {date || '-'}</Text>
        </View>
      </View>

      {/* Grid Info (Borders & Backgrounds Removed) */}
      <View style={styles.gridContainer}>
        <View style={styles.gridItem}>
          <Text style={styles.label}>SEEKER (내담자)</Text>
          <Text style={styles.value}>{clientName || '-'} 님</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.label}>TOPIC (상담 주제)</Text>
          <Text style={styles.value}>{category || '-'}</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {cardImages && cardImages.length > 0 ? cardImages.map((card, idx) => (
          <View key={idx} style={styles.cardBox}>
            {card.url ? (
              <Image 
                src={{ uri: card.url, method: 'GET', headers: {}, body: '' }} 
                style={[
                  styles.cardImage,
                  card.orientation === '역방향' ? { transform: 'rotate(180deg)' } : {}
                ]} 
              />
            ) : (
              <View style={[styles.cardImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 8 }}>이미지 없음</Text>
              </View>
            )}
            <Text style={styles.cardName}>{card.name ? card.name.split(' - ')[0] : 'Unknown'}</Text>
            <Text style={card.orientation === '역방향' ? styles.cardOrientationReverse : styles.cardOrientation}>
              {card.orientation || '정방향'}
            </Text>
          </View>
        )) : (
            <Text style={{ fontSize: 10, opacity: 0.5 }}>기록된 카드 이미지가 없습니다.</Text>
        )}
      </View>

      {/* Reading Result */}
      <View style={styles.readingBox}>
        <Text style={styles.readingTitle}>READING ANALYSIS</Text>
        <Text style={styles.readingText} wrap={true}>
          {readingResult || '분석 결과가 없습니다.'}
        </Text>
      </View>

      {/* Footer (Last Page Only via Logic) */}
      <View 
        style={styles.finalFooter}
        render={({ pageNumber, totalPages }) => (
          pageNumber === totalPages ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.sealText}>ARCANALAB</Text>
              <Text style={styles.urlText}>https://arcanalab.vip-center.kr/</Text>
            </View>
          ) : null
        )}
      />

      {/* Page Number */}
      <Text 
        style={styles.pageNumber} 
        render={({ pageNumber, totalPages }) => (
          totalPages ? `${pageNumber} / ${totalPages}` : `${pageNumber}`
        )} 
        fixed 
      />
    </Page>
  </Document>
);
