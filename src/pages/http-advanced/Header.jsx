import { useState } from 'react'
import { API_BASE } from '../../config/api'

export default function Header() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // GET — 응답 헤더 읽기
  async function getWithHeaders() {
    setResult(null)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE}/todos/1`
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'GET',
        status: response.status,
        // 응답 헤더 (서버가 알려준 것)
        responseHeaders: {
          contentType: response.headers.get('content-type'),
        },
        data,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // POST — 요청 헤더를 직접 넣고, 응답 헤더도 확인
  async function postWithHeaders() {
    setResult(null)
    setError(null)

    // 내가 보내는 요청 헤더 (코드에 적은 값)
    const requestHeaders = {
      'Content-Type': 'application/json',
    }

    try {
      const response = await fetch(
        `${API_BASE}/todos`,
        {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify({
            title: '헤더 실습',
            completed: false,
            userId: 1,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setResult({
        kind: 'POST',
        // 요청 헤더 (내가 넣은 것)
        requestHeaders,
        // 응답 헤더 (서버가 돌려준 것)
        responseHeaders: {
          contentType: response.headers.get('content-type'),
        },
        status: response.status, // POST 성공 시 201도 확인해보기
        data,
      })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>헤더 실습</h1>
      <p>
        body = JSON 내용 / headers = 타입·인증 등 부가 정보
      </p>

      <p>
        <button type="button" onClick={getWithHeaders}>
          GET — 응답 헤더 보기
        </button>
        {' '}
        <button type="button" onClick={postWithHeaders}>
          POST — Content-Type 넣어 보내기
        </button>
      </p>

      <p>
        <small>
          DevTools → Network → 요청 클릭 → Request/Response Headers도 함께 확인
        </small>
      </p>

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <p>요청 종류: {result.kind}</p>

          {result.requestHeaders && (
            <p>요청 Content-Type: {result.requestHeaders['Content-Type']}</p>
          )}

          <p>응답 status: {result.status}</p>
          <p>응답 Content-Type: {result.responseHeaders.contentType}</p>

          <pre>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}