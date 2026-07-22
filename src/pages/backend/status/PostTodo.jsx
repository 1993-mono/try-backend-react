import { useState } from 'react'
import { EXPRESS_API_BASE } from '@/config/express-api'

export default function PostTodo() {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)
    setStatus(null)

    fetch(`${EXPRESS_API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
      }),
    })
      .then(async (response) => {
        setStatus(response.status)
        const data = await response.json()

        if (!response.ok) {
          // 400 등 — 서버가 보낸 { error: '... }
          throw new Error(data.error ?? `요청 실패: ${response.status}`)
        }
        return data
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
      <h1>status — POST /todos</h1>
      <p>제목 비우고 보내면 400, 채우면 201</p>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일 제목"
        />
        <button type="submit" disabled={loading}>
          {loading ? '전송 중...' : 'POST'}
        </button>
      </form>

      {status !== null && <p>status: {status}</p>}

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <h2>응답 JSON</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}