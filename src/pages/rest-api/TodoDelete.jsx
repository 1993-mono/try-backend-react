import { useState } from 'react'
import { API_BASE, supabaseHeaders } from '@/config/api'

export default function TodoDelete() {
  const [status, setStatus] = useState(null)
  const [bodyText, setBodyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleDelete = () => {
    setLoading(true)
    setError(null)
    setStatus(null)
    setBodyText('')

    // HTTP DELETE → todos?id=eq.1 (실제 DB에서 삭제됨)
    fetch(`${API_BASE}/todos?id=eq.1`, {
      method: 'DELETE',
      headers: supabaseHeaders,
    })
      .then(async (response) => {
        setStatus(response.status)

        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }

        // Prefer: return=representation 이면 삭제된 row JSON이 올 수 있음
        const text = await response.text()
        setBodyText(text === '' ? '(본문 없음)' : text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }

  return (
    <div>
      <h1>JSON DELETE (삭제)</h1>
      <p>
        id=1 삭제 요청 — <strong>실제로 DB에서 지워집니다.</strong>
        Table Editor나 POST로 다시 추가할 수 있습니다.
      </p>

      <button type="button" onClick={handleDelete} disabled={loading}>
        {loading ? '전송 중...' : 'DELETE로 삭제'}
      </button>

      {error && <p>에러: {error}</p>}

      {status !== null && (
        <div>
          <h2>응답</h2>
          <p>status: {status}</p>
          <p>본문: {bodyText}</p>
        </div>
      )}
    </div>
  )
}