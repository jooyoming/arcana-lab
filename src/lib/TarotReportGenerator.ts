import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportData {
  clientName: string;
  masterNickname: string;
  category: string;
  date: string;
  readingResult: string;
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
 * 타로 리딩 결과 보고서를 PDF로 생성하고 다운로드합니다.
 */
export const generateTarotPDF = async (data: ReportData) => {
  // 임시 컨테이너 생성 (화면에는 보이지 않음)
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; // A4 비율에 근사
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Inter, Apple SD Gothic Neo, sans-serif';
  container.style.color = '#1a1a1a';
  container.style.lineHeight = '1.6';

  const substitutedResult = substituteVariables(data.readingResult, data.clientName, data.masterNickname);

  // HTML 구조 작성
  container.innerHTML = `
    <div style="border-bottom: 2px solid #5c5fef; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <h1 style="margin: 0; font-size: 28px; color: #5c5fef; font-weight: 900; letter-spacing: -1px;">Arcana Lab</h1>
        <p style="margin: 4px 0 0 0; font-size: 14px; color: #868e96;">Professional Tarot Reading Report</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 0; font-size: 12px; color: #adb5bd;">상담 일시: ${data.date}</p>
      </div>
    </div>

    <div style="margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <p style="margin: 0; font-size: 11px; color: #868e96; text-transform: uppercase; font-weight: 700;">Client</p>
        <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${data.clientName} 님</p>
      </div>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <p style="margin: 0; font-size: 11px; color: #868e96; text-transform: uppercase; font-weight: 700;">Tarot Master</p>
        <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700;">${data.masterNickname} 마스터</p>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 16px; margin-bottom: 15px; border-left: 4px solid #5c5fef; padding-left: 10px;">상담 주제: ${data.category}</h3>
    </div>

    <div style="margin-bottom: 40px;">
      <p style="font-size: 14px; font-weight: 700; color: #495057; margin-bottom: 15px;">🔍 사용된 타로 카드</p>
      <div style="display: flex; flex-wrap: wrap; gap: 15px;">
        ${data.cardImages.map(card => `
          <div style="width: 120px; text-align: center;">
            <div style="width: 120px; height: 180px; overflow: hidden; border-radius: 6px; border: 1px solid #dee2e6; margin-bottom: 8px;">
              <img src="${card.url}" style="width: 100%; height: 100%; object-fit: cover; ${card.orientation === '역방향' ? 'transform: rotate(180deg);' : ''}" />
            </div>
            <p style="margin: 0; font-size: 11px; font-weight: 600;">${card.name.split(' - ')[0]}</p>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: ${card.orientation === '역방향' ? '#fa5252' : '#228be6'};">${card.orientation}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="background: #ffffff; border: 1px solid #e9ecef; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <p style="font-size: 14px; font-weight: 700; color: #5c5fef; margin-bottom: 15px;">✨ 스프레드 정밀 리딩 결과</p>
      <div style="font-size: 14px; white-space: pre-wrap; color: #212529; text-align: justify; word-break: break-all;">
        ${substitutedResult}
      </div>
    </div>

    <div style="margin-top: 50px; text-align: center; border-t: 1px solid #f1f3f5; padding-top: 20px;">
      <p style="font-size: 12px; color: #adb5bd;">내담자님의 앞날에 좋은 일들만 가득하시길 아르카나 랩이 기원합니다.</p>
      <p style="font-size: 10px; color: #ced4da; margin-top: 10px;">&copy; Arcana Lab. All Rights Reserved.</p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // 이미지가 모두 로드될 때까지 대기
    const images = container.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    await Promise.all(imagePromises);

    const canvas = await html2canvas(container, {
      useCORS: true,
      scale: 2, // 해상도 높임
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // 페이지 크기에 맞춰 삽입
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // 파일명 생성
    const fileName = `ArcanaLab_Report_${data.clientName}_${data.date.replace(/[: ]/g, '_')}.pdf`;
    pdf.save(fileName);

  } catch (error) {
    console.error('PDF 생성 실패:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
};
