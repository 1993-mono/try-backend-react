import { useState } from 'react'
import { API_BASE, supabaseHeaders, supabaseObjectHeaders } from '@/config/api'

export default function UrlQuery() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // 단건 — Supabase는 /todos/1 경로 대신 ?id=eq.1 쿼리
  async function fetchByPath() {
    setResult(null)
    setError(null)

    // id=eq.1 → 어느 행(필터) / select=* → 응답 컬럼 전부 (SELECT *)
    const url = `${API_BASE}/todos?id=eq.1&select=*`

    try {
      const response = await fetch(url, {
        headers: supabaseObjectHeaders,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'id 필터 (단건)', // Supabase식 단건
        url,
        dataType: 'object', // 단건 → 객체 (Accept object)
        count: 1,
        data,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // 쿼리 — ?user_id=eq.1 → 조건에 맞는 목록
  async function fetchByQuery() {
    setResult(null)
    setError(null)

    const url = `${API_BASE}/todos?user_id=eq.1&select=*`

    try {
      const response = await fetch(url, {
        headers: supabaseHeaders,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'user_id 필터 (목록)',
        url,
        dataType: 'array',
        count: data.length,
        data,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>URL 구조 실습</h1>
      <p>
        Supabase: 단건도 쿼리(<code>id=eq.1</code>) / 목록 필터(<code>user_id=eq.1</code>)
      </p>

      <p>
        <button type="button" onClick={fetchByPath}>
          GET …?id=eq.1 (단건)
        </button>
        {' '}
        <button type="button" onClick={fetchByQuery}>
          GET …?user_id=eq.1 (필터)
        </button>
      </p>

      <p>
        <small>
          Network 탭에서 요청 URL 전체(?id=eq.1 / ?user_id=eq.1)를 확인해 보세요
        </small>
      </p>

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <p>조회 방식: {result.kind}</p>
          <p>요청 URL: {result.url}</p>
          <p>데이터 형태: {result.dataType}</p>
          <p>개수: {result.count}</p>

          {result.dataType === 'array' ? (
            <ul>
              {result.data.slice(0, 5).map((todo) => (
                <li key={todo.id}>
                  #{todo.id} user_id={todo.user_id} — {todo.title}
                </li>
              ))}
            </ul>
          ) : (
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          )}

          {result.dataType === 'array' && (
            <p>
              <small>목록이 길어서 앞 5개만 표시 (전체 {result.count}개)</small>
            </p>
          )}
        </div>
      )}
    </div>
  )
}