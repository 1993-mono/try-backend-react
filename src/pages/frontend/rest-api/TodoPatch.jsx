import { useState } from 'react'
import { API_BASE, supabaseObjectHeaders } from '@/config/api'

export default function TodoPatch() {
  const [completed, setCompleted] = useState(true)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // HTTP PATCH → todos?id=eq.1 (일부 수정)
    // PUT과 달리 body에 "바꿀 필드만" 넣는다
    fetch(`${API_BASE}/todos?id=eq.1`, {
      method: 'PATCH',
      headers: supabaseObjectHeaders,
      // 예: completed만 수정 (title 등은 보내지 않음)
      body: JSON.stringify({
        completed: completed,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // DB에 실제로 반영됨
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
      <h1>JSON PATCH (수정)</h1>
      <p>id=1 의 completed만 부분 수정합니다. (실제 DB 반영)</p>

      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          completed
        </label>
        <button type="submit" disabled={loading}>
          {loading ? '전송 중...' : 'PATCH로 수정'}
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