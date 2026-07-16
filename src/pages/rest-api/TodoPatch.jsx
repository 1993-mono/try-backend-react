import { useState } from 'react'
import { API_BASE } from '../../config/api'

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

    // HTTP PATCH → REST API 창구 /todos/1 (일부 수정)
    // PUT과 달리 body에 "바꿀 필드만" 넣는다
    fetch(`${API_BASE}/todos/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      // 예: completed만 수정 (title 등은 보내지 않음)
      body: JSON.stringify({
        completed: completed,
      }),
    })
      // 응답 처리 패턴은 POST/GET과 동일
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // JSONPlaceholder는 수정된 것처럼 보이는 객체를 돌려줌 (실제 DB 반영 없음)
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
      <p>/todos/1 의 completed만 부분 수정합니다.</p>

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
          <p>userId: {result.userId}</p>
        </div>
      )}
    </div>
  )
}