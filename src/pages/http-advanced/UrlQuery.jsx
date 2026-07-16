import { useState } from 'react'
import { API_BASE } from '../../config/api'

export default function UrlQuery() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // 경로(path) — /todos/1 → 자원 하나
  async function fetchByPath() {
    setResult(null)
    setError(null)

    const url = `${API_BASE}/todos/1`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'path', // 임의 라벨: 경로로 단건 조회
        url,
        dataType: 'object', // 단건 → 객체
        count: 1,
        data,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // 쿼리(query) — /todos?userId=1 → 조건에 맞는 목록
  async function fetchByQuery() {
    setResult(null)
    setError(null)

    const url = `${API_BASE}/todos?userId=1`

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'query', // 임의 라벨: 쿼리로 필터
        url,
        dataType: 'array', // 목록 → 배열
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
        path = 어느 자원 / query = 어떻게 걸러서
      </p>

      <p>
        <button type="button" onClick={fetchByPath}>
          GET /todos/1 (경로 — 단건)
        </button>
        {' '}
        <button type="button" onClick={fetchByQuery}>
          GET /todos?userId=1 (쿼리 — 필터)
        </button>
      </p>

      <p>
        <small>
          Network 탭에서 요청 URL 전체(path / ?userId=1)를 확인해 보세요
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
                  #{todo.id} userId={todo.userId} — {todo.title}
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