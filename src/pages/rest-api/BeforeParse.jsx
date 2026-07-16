import { useState, useEffect } from 'react'

export default function BeforeParse() {
  const [status, setStatus] = useState(null)
  const [ok, setOk] = useState(null)
  const [contentType, setContentType] = useState(null)
  // 파싱 전 본문 — JSON 객체가 아니라 문자열
  const [bodyText, setBodyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // HTTP GET — response.json() 없이 응답 상자와 본문 텍스트를 본다
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(async (response) => {
        setStatus(response.status)
        setOk(response.ok)
        setContentType(response.headers.get('content-type'))

        // 본문을 문자열로 읽음 (아직 JS 객체 아님)
        const text = await response.text()
        setBodyText(text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>불러오는 중...</p>
  if (error) return <p>에러: {error}</p>

  return (
    <div>
      <h1>파싱 전</h1>
      <p>
        <code>response.json()</code> 하기 전 단계입니다.
        본문은 아직 <strong>텍스트</strong>입니다.
      </p>

      <h2>응답 메타</h2>
      <ul>
        <li>status: {status}</li>
        <li>ok: {String(ok)}</li>
        <li>content-type: {contentType}</li>
      </ul>

      <h2>본문 (파싱 전 텍스트)</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {bodyText}
      </pre>
    </div>
  )
}