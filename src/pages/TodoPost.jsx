import { useState } from 'react'

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

    // HTTP POST → REST API 창구 /todos (생성)
    fetch('https://jsonplaceholder.typicode.com/todos', {
      method: 'POST',
      headers: {
        // 본문이 JSON임을 서버에 알림
        'Content-Type': 'application/json',
      },
      // JS 객체 → JSON 문자열로 변환
      body: JSON.stringify({
        title: title,
        completed: false,
        userId: 1,
      }),
    })
      // POST 요청이 끝난 뒤의 HTTP 응답 처리 (GET과 같은 패턴)
      // - 상태 코드: 매 응답에 있음 → response.ok / response.status 로 성공 여부 판단
      // - 본문(body): 있을 수도/없을 수도 있고, 구성도 백엔드 API 설계에 따름
      // - JSONPlaceholder는 관례적으로 "보낸 내용 + 가짜 id"를 본문으로 돌려줌
      .then((response) => {
        // response.ok로 성공 여부 확인 (본문과 별개)
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        // 본문이 있는 경우: JSON 문자열 → JS 객체로 변환해 화면에 사용
        return response.json()
      })
      .then((data) => {
        // JSONPlaceholder는 실제 저장 없이 가짜 id(예: 201)를 돌려줌
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
      <h1>JSON POST (생성)</h1>

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
          <p>userId: {result.userId}</p>
        </div>
      )}
    </div>
  )
}