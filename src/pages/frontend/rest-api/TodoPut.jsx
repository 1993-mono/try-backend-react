import { useState } from 'react'
import { API_BASE, supabaseObjectHeaders } from '@/config/api'

export default function TodoPut() {
  const [title, setTitle] = useState('수정된 제목')
  const [completed, setCompleted] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Supabase(PostgREST)는 경로 /todos/1 PUT보다
    // PATCH로 "보낼 필드를 전부" 넣는 방식이 전체 교체에 가깝다.
    // (학습용: PATCH vs PUT 개념은 body에 넣는 범위로 비교)
    fetch(`${API_BASE}/todos?id=eq.1`, {
      method: 'PATCH',
      headers: supabaseObjectHeaders,
      // 자원 필드 전체를 보냄 (일부만 보내는 PATCH 실습과 대비)
      body: JSON.stringify({
        title: title,
        completed: completed,
        user_id: 1,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setResult(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div>
      <h1>JSON PUT (전체 수정)</h1>
      <p>
        id=1 을 통째로 덮는 느낌으로, title·completed·user_id를 모두 보냅니다.
        (Supabase에서는 PATCH + 전체 필드로 실습)
      </p>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
        />
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          completed
        </label>
        <button type="submit" disabled={loading}>
          {loading ? '전송 중...' : '전체 필드로 교체'}
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