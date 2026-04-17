import { pdf } from '@react-pdf/renderer';
import dayjs from 'dayjs';
import React from 'react';
import { OrientalReport } from './OrientalReport';

export type PDFTheme = 'oriental' | 'western' | 'minimal';
export type TitleType = 'standard' | 'record' | 'nameOnly';

interface ReportData {
  clientName: string;
  masterNickname: string;
  category: string;
  date: string;
  readingResult: string;
  theme: PDFTheme;
  titleType: TitleType;
  cardImages: Array<{
    name: string;
    url: string;
    orientation: string;
    type: string;
  }>;
}

/**
 * [내담자], [타로] 변수를 실제 이름으로 치환합니다.
 */
export const substituteVariables = (text: string, clientName: string, masterNickname: string) => {
  if (!text) return '';
  return text
    .replaceAll('[내담자]', clientName)
    .replaceAll('[타로]', masterNickname);
};

/**
 * 타이틀 형식을 생성합니다.
 */
const getFormattedTitle = (type: TitleType, nickname: string) => {
  return `${nickname} 님을 위한 타로 리딩 리포트`;
};

/**
 * 타로 리딩 결과 보고서를 PDF로 생성하고 다운로드합니다.
 */
export const generateTarotPDF = async (data: ReportData) => {
  const formattedTitle = getFormattedTitle(data.titleType, data.masterNickname);
  const substitutedResult = substituteVariables(data.readingResult, data.clientName, data.masterNickname);

  try {
    console.log('PDF 생성 시작:', data.clientName);
    
    // ── @react-pdf/renderer를 이용한 PDF 생성 ───────────────────────
    const blob = await pdf(
      <OrientalReport 
        clientName={data.clientName}
        masterNickname={data.masterNickname}
        category={data.category}
        date={data.date}
        readingResult={substitutedResult}
        formattedTitle={formattedTitle}
        cardImages={data.cardImages}
      />
    ).toBlob();

    if (!blob) {
      throw new Error('PDF Blob 생성에 실패했습니다.');
    }

    console.log('PDF Blob 생성 완료, 다운로드 시작');

    // ── 파일 다운로드 ──────────────────────────────────────────────
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `ArcanaLab_${data.theme}_${data.clientName}_${dayjs().format('YYMMDD_HHmm')}.pdf`.replace(/ /g, '_');
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log('PDF 다운로드 완료');

  } catch (error: any) {
    console.error('PDF 생성 최종 실패:', error);
    // 상세 에러 정보 로깅
    if (error.message) console.error('Error Message:', error.message);
    if (error.stack) console.error('Stack Trace:', error.stack);
    throw error;
  }
};

