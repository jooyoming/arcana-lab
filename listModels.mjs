/**
 * 현재 API 키로 사용 가능한 Gemini 모델 목록 확인 스크립트
 * 실행: node listModels.mjs
 */
import { readFileSync } from 'fs';
import { join } from 'path';

// .env.local 수동 파싱 (dotenv 불필요)
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) envVars[key.trim()] = rest.join('=').trim();
}

// 키 이름 대소문자 무관하게 찾기
const apiKey =
  envVars['GEMINI_API_KEY'] ||
  envVars['Gemini_API_Key'] ||
  envVars['gemini_api_key'];

if (!apiKey) {
  console.error('❌ API 키를 찾을 수 없습니다. .env.local 파일을 확인하세요.');
  process.exit(1);
}

console.log('✅ API 키 확인됨:', apiKey.slice(0, 10) + '...');
console.log('📋 사용 가능한 모델 목록 조회 중...\n');

// REST API로 모델 목록 조회
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`;

try {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    console.error('❌ API 오류:', json.error?.message || JSON.stringify(json));
    process.exit(1);
  }

  const models = json.models || [];

  // generateContent 지원 모델만 필터링
  const generativeModels = models.filter(m =>
    m.supportedGenerationMethods?.includes('generateContent')
  );

  console.log(`✅ generateContent 지원 모델 (총 ${generativeModels.length}개):\n`);
  for (const m of generativeModels) {
    const name = m.name.replace('models/', '');
    console.log(`  - ${name}`);
    if (m.displayName) console.log(`    표시명: ${m.displayName}`);
  }

  console.log('\n📌 권장 모델 (systemInstruction 지원):\n');
  const recommended = generativeModels.filter(m => {
    const n = m.name.toLowerCase();
    return n.includes('gemini-1.5') || n.includes('gemini-2') || n.includes('flash') || n.includes('pro');
  });
  for (const m of recommended) {
    console.log(`  ✨ ${m.name.replace('models/', '')}`);
  }
} catch (e) {
  console.error('❌ 네트워크 오류:', e.message);
}
