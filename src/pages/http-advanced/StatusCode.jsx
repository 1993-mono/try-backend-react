import { useState } from 'react'
import { API_BASE, supabaseObjectHeaders } from '@/config/api'

export default function StatusCode() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  /*
  * async / await 관련 정리 (이 파일 + HTTP 실습에서 자주 쓰는 것)
  *
  * [이 파일에서 이미 쓰는 것]
  * - async function  : 함수가 항상 Promise를 반환한다
  * - await             : Promise가 끝날 때까지 기다린다 (fetch, response.json 등)
  * - try / catch       : await 중 reject(네트워크 실패, JSON 파싱 실패 등)를 잡는다
  * - return            : async 함수 안의 return 값도 Promise로 감싸진다
  *
  * [같은 async 함수 안에서 더 쓸 수 있는 것]
  * - finally           : try/catch 성공·실패와 관계없이 마지막에 항상 실행 (로딩 끄기 등)
  * - throw             : 에러를 직접 던진다 → catch로 들어간다
  *
  * [await 없이 Promise를 다루는 다른 방식]
  * - .then() / .catch() / .finally()  : async/await와 같은 일을 다른 문법으로 표현
  *
  * [여러 요청을 다룰 때 (다음 실습에서 등장 가능)]
  * - Promise.all([...])        : 여러 await를 동시에, 하나라도 실패하면 전체 실패
  * - Promise.allSettled([...]) : 전부 끝날 때까지 기다리고, 각각 성공/실패 결과를 받음
  *
  * [호출하는 쪽 (버튼 onClick)]
  * - request(url)              : async 함수를 await 없이 호출해도 된다 (백그라운드 실행)
  * - await request(url)        : 호출하는 함수도 async여야 한다
  *
  * [주의 — fetch + HTTP]
  * - 404, 500 같은 HTTP 에러는 catch로 안 잡힌다 → response.ok / response.status로 본다
  *
  * [Supabase 참고]
  * - ?id=eq.99999 만 쓰면 빈 배열 [] + 200 이 올 수 있음
  * - Accept: application/vnd.pgrst.object+json 이면 0건일 때 보통 406
  */
  // headers를 바꿔가며 200 / 4xx를 비교한다
  async function request(url, headers) {
    setResult(null)
    setError(null)

    try {
      const response = await fetch(url, { headers })

      // body보다 먼저 status / ok 를 본다
      const info = {
        url,
        status: response.status,
        ok: response.ok,
        // 응답 헤더에서 Content-Type만 살짝 확인 (다음 실습 예고)
        contentType: response.headers.get('content-type'),
      }

      // ok가 아니라면 JSON 파싱 전에 실패로 처리
      if (!response.ok) {
        setResult(info)
        setError(`실패로 판단: HTTP ${response.status}`)
        return
      }

      const data = await response.json()
      setResult({ ...info, data })
    } catch (err) {
      // 네트워크 자체 실패 등
      setError(err.message)
    } finally {
      // setLoading(false) ← 성공/실패 상관없이 실행
    }
  }

  return (
    <div>
      <h1>상태 코드 실습</h1>
      <p>2xx → 성공 / 4xx → 요청 쪽 문제 / 5xx → 서버 쪽 문제</p>

      <p>
        <button
          type="button"
          onClick={() =>
            request(
              `${API_BASE}/todos?id=eq.1&select=*`,
              supabaseObjectHeaders,
            )
          }
        >
          있는 자원 (기대: 200)
        </button>
        {' '}
        <button
          type="button"
          onClick={() =>
            request(
              `${API_BASE}/todos?id=eq.99999&select=*`,
              supabaseObjectHeaders,
            )
          }
        >
          없는 자원 (기대: 406)
        </button>
      </p>

      <p>
        <small>
          Supabase는 경로 404 대신, 단건 Accept일 때 0건이면 보통 406을 줍니다.
          (목록 헤더만 쓰면 빈 배열 + 200)
        </small>
      </p>

      {error && <p>에러: {error}</p>}

      {result && (
        <div>
          <p>url: {result.url}</p>
          <p>status: {result.status}</p>
          <p>ok: {String(result.ok)}</p>
          <p>content-type: {result.contentType}</p>
          {result.data && (
            <>
              {/* JSON.stringify(값, replacer, space)
                - null : replacer 없음 → 모든 속성 그대로 직렬화
                - 2    : 들여쓰기 공백 2칸 (읽기 쉽게 줄바꿈·정렬) */}
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  )
}