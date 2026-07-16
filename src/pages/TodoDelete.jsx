import { useState } from 'react'

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

    // HTTP DELETE → REST API 창구 /todos/1 (삭제)
    // 보통 body·Content-Type 없음 (보낼 수정 데이터가 없음)
    fetch('https://jsonplaceholder.typicode.com/todos/1', {
      method: 'DELETE',
    })
      .then(async (response) => {
        // 성공 여부는 주로 상태 코드로 판단
        setStatus(response.status)

        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }

        // 본문 유무·형태는 백엔드 설계에 따름 (비어 있는 경우 많음)
        // JSONPlaceholder는 보통 빈 객체 {}
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
      <p>/todos/1 삭제 요청 (JSONPlaceholder는 실제로 지우지 않음)</p>

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