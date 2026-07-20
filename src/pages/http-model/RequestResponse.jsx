import { useState } from 'react'
import {
  API_BASE,
  supabaseHeaders,
  supabaseObjectHeaders,
} from '@/config/api'

export default function RequestResponse() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // GET — 요청 4조각 / 응답 3조각을 한 화면에 고정
  async function getRoundTrip() {
    setResult(null)
    setError(null)

    const url = `${API_BASE}/todos?id=eq.1&select=*`
    const method = 'GET'
    const headers = supabaseObjectHeaders
    const body = null // GET은 body 없음

    try {
      const response = await fetch(url, { method, headers })
      // 네트워크 왕복 완료 = 요청을 보냈고, 응답(response)을 받은 상태

      const snapshot = {
        request: {
          url,
          method,
          headers: {
            'Content-Type': headers['Content-Type'],
            Accept: headers.Accept,
            apikey: '(설정됨)',
            Authorization: 'Bearer (설정됨)',
          },
          body,
        },
        response: {
          status: response.status,
          ok: response.ok,
          headers: {
            contentType: response.headers.get('content-type'),
          },
          body: null,
        },
      }

      if (!response.ok) {
        setResult(snapshot)
        throw new Error(`HTTP ${response.status}`)
      }

      snapshot.response.body = await response.json()
      setResult(snapshot)
    } catch (error) {
      setError(error.message)
    }
  }

  async function postRoundTrip() {
    setResult(null)
    setError(null)

    const url = `${API_BASE}/todos`
    const method = 'POST'
    const headers = supabaseHeaders
    const body = {
      title: '한 바퀴 실습',
      completed: false,
      user_id: 1,
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      })
      // 네트워크 왕복 완료 = 요청을 보냈고, 응답(response)을 받은 상태

      const snapshot = {
        request: {
          url,
          method,
          headers: {
            'Content-Type': headers['Content-Type'],
            Prefer: headers.Prefer,
            apikey: '(설정됨)',
            Authorization: 'Bearer (설정됨)',
          },
          body,
        },
        response: {
          status: response.status,
          ok: response.ok,
          headers: {
            contentType: response.headers.get('content-type'),
          },
          body: null,
        },
      }

      if (!response.ok) {
        setResult(snapshot)
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      // Supabase 특징: POST 1건도 응답이 배열일 수 있음 → [0]만 사용
      snapshot.response.body = Array.isArray(data) ? data[0] : data
      setResult(snapshot)
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <h1>요청-응답 한 바퀴</h1>
      <p>
        요청: URL + method + (headers) + (body)
        {' / '}
        응답: status + (headers) + (body)
      </p>

      <p>
        <button type="button" onClick={getRoundTrip}>
          GET 한 바퀴
        </button>
        {' '}
        <button type="button" onClick={postRoundTrip}>
          POST 한 바퀴
        </button>
      </p>

      <p>
        <small>
          DevTools + Network에서 같은 요청을 열어, 화면 스냅샷과 맞춰 보세요
        </small>
      </p>

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <h2>요청 (request)</h2>
          <pre>{JSON.stringify(result.request, null, 2)}</pre>

          <h2>응답 (response)</h2>
          <pre>{JSON.stringify(result.response, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}