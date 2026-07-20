// Supabase Data API base (.env 끝의 / 유무와 관계없이 통일)
export const API_BASE = String(import.meta.env.VITE_SUPABASE_URL || '').replace(
  /\/$/,
  '',
)

// Publishable(anon) 키 — 브라우저용
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// 모든 요청에 붙는 헤더
export const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  // POST/PATCH/PUT 때 생성·수정된 row를 응답 body로 받기
  Prefer: 'return=representation',
}

// 단건을 배열이 아닌 객체로 받기 (0건이면 보통 406)
export const supabaseObjectHeaders = {
  ...supabaseHeaders,
  Accept: 'application/vnd.pgrst.object+json',
}