import { useState } from 'react'
import { API_BASE } from '../../config/api'

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

    // HTTP PUT → REST API 창구 /todos/1 (전체 교체에 가깝게)
    // PATCH: 바꿀 필드만 / PUT: 자원 전체를 새 내용으로 덮는 느낌
    fetch(`${API_BASE}/todos/1`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 1,
        title: title,
        completed: completed,
        userId: 1,
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
      <p>/todos/1 을 통째로 교체하는 요청입니다. (PATCH는 일부만)</p>

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
          {loading ? '전송 중...' : 'PUT으로 교체'}
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