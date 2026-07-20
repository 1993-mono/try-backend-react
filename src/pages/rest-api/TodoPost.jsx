import { useState } from 'react'
import { API_BASE, supabaseHeaders } from '@/config/api'

export default function TodoPost() {
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // HTTP POST → /todos (생성) — Supabase DB에 실제 저장됨
    fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: supabaseHeaders,
      // JS 객체 → JSON 문자열로 변환 (컬럼명: user_id)
      body: JSON.stringify({
        title: title,
        completed: false,
        user_id: 1,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        // Prefer: return=representation → 생성된 row 배열
        return response.json()
      })
      .then((data) => {
        // 배열로 오면 첫 행만 화면에 표시
        setResult(Array.isArray(data) ? data[0] : data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div>
      <h1>JSON POST (생성)</h1>
      <p>Supabase todos 테이블에 실제로 추가됩니다.</p>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일 제목"
        />
        <button type="submit" disabled={loading}>
          {loading ? '전송 중...' : 'POST로 생성'}
        </button>
      </form>

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <h2>응답 JSON</h2>
          <p>id: {result.id}</p>
          <p>title: {result.title}</p>
          <p>completed: {result.completed ? '완료' : '미완료'}</p>
          <p>user_id: {result.user_id}</p>
        </div>
      )}
    </div>
  )
}