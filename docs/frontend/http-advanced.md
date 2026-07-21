# HTTP 심화

`docs/frontend/fundamentals.md`의 HTTP 기초(요청·응답·메서드)를 전제로,  
**상태 코드 · 헤더 · URL 구조**를 더 정확히 읽는 단계다.

프론트·백엔드 공통으로 쓰인다.

선행: `docs/frontend/fundamentals.md` §5 HTTP  
실습 API: [Supabase](https://supabase.com/) Data API — `.env`의 `VITE_SUPABASE_URL` · `src/config/api.js`

---

## 한눈에 정리

| 주제             | 한 줄                                                  |
| ---------------- | ------------------------------------------------------ |
| **상태 코드**    | 응답이 성공인지·실패인지·누구 책임인지 **숫자로** 말함 |
| **헤더**         | body 밖의 **부가 정보** (타입, 인증 등)                |
| **경로 (path)**  | **어느 테이블·컬렉션**인지 (`/rest/v1/todos`)          |
| **쿼리 (query)** | **어떻게 걸러·찾을지** (`?id=eq.1`, `?user_id=eq.1`)   |

요청·응답 한 줄:

```
요청: URL + method + (headers) + (body)
응답: status + headers + body
```

---

## 1. 상태 코드 (Status Code)

서버가 응답할 때 **맨 앞에 붙는 세 자리 숫자**다.  
본문(JSON)만 보지 말고, **상태 코드로 성공/실패를 먼저** 본다.

### 자리수의 의미 (백의 자리)

| 구간    | 이름            | 대략 의미                              |
| ------- | --------------- | -------------------------------------- |
| **2xx** | 성공            | 요청을 잘 처리했다                     |
| **4xx** | 클라이언트 오류 | **보내는 쪽** 문제 (주소·내용·권한 등) |
| **5xx** | 서버 오류       | **서버 쪽** 문제 (처리 중 고장 등)     |

(1xx는 중간 응답, 3xx는 리다이렉트 — 지금은 2·4·5만 익혀도 충분하다.)

### 자주 보는 코드

| 코드  | 의미                            | 언제 보나 (예)                       |
| ----- | ------------------------------- | ------------------------------------ |
| `200` | OK — 성공                       | `GET`으로 조회 성공                  |
| `201` | Created — 생성 성공             | `POST`로 새로 만듦                   |
| `204` | No Content — 성공인데 body 없음 | `DELETE` 후 본문 없이 끝나는 경우    |
| `400` | Bad Request — 요청이 잘못됨     | JSON 형식 깨짐, 필수 값 누락 등      |
| `401` | Unauthorized — 인증 필요        | 로그인·토큰이 없거나 틀림            |
| `403` | Forbidden — 권한 없음           | 로그인은 됐는데 이 자원은 못 씀      |
| `404` | Not Found — 없음                | REST 경로 자체가 없을 때 (Supabase 단건 필터 0건은 보통 `406` — 아래 참고) |
| `500` | Internal Server Error           | 서버 코드/DB 등에서 예기치 못한 오류 |

포인트:

- **4xx** → “내가 보낸 요청을 다시 보자”
- **5xx** → “서버(또는 API) 쪽을 의심하자”
- 같은 “실패”라도 숫자가 다르면 **고치는 위치**가 다르다

### `response.ok`와 `response.status`

`fetch`의 Response 객체:

| 속성              | 의미                                            |
| ----------------- | ----------------------------------------------- |
| `response.status` | 상태 코드 숫자 (예: `200`, `404`)               |
| `response.ok`     | status가 **200~299**이면 `true`, 아니면 `false` |

```js
// supabaseHeaders → src/config/api.js
const response = await fetch(
    `${API_BASE}/todos?id=eq.1&select=*`,
    { headers: supabaseObjectHeaders },
);

console.log(response.status); // 예: 200
console.log(response.ok); // 예: true

if (!response.ok) {
    // 4xx / 5xx — body를 파싱하기 전에 실패로 처리하는 편이 안전
    throw new Error(`HTTP ${response.status}`);
}

const data = await response.json();
```

**Supabase 참고:** 단건을 `Accept: application/vnd.pgrst.object+json`으로 받을 때, 조건에 맞는 행이 **0건**이면 `404`가 아니라 **`406`** 이 올 수 있다. 목록(배열) Accept면 빈 배열 `[]` + `200`인 경우도 있다.

주의:

- `fetch`는 **네트워크가 연결되면** 4xx/5xx여도 **Promise를 reject하지 않는다.**  
  → “실패”는 직접 `response.ok` / `status`로 판별한다.
- `response.ok`만 봐도 되고, 로그·메시지를 구체화할 때는 `status`를 함께 쓴다.

### Network 탭으로 확인

브라우저 개발자 도구 → **Network** → 요청 하나 클릭 → **Headers** 또는 상태 줄에서  
`200`, `404` 등을 확인할 수 있다.

---

## 2. 헤더 (Header)

**헤더** = 본문(body) 밖에 붙는 **이름: 값** 형태의 부가 정보다.

비유:

|             | 택배                           |
| ----------- | ------------------------------ |
| **body**    | 상자 안 물건 (JSON 내용)       |
| **headers** | 송장·취급 주의 (타입, 인증 등) |

요청에도 붙고, 응답에도 붙는다.

### 지금 가장 중요한 것: `Content-Type`

**이 본문이 무슨 형식인지** 알려 준다.

| 방향 | 예                               | 의미                          |
| ---- | -------------------------------- | ----------------------------- |
| 요청 | `Content-Type: application/json` | “내가 보내는 body는 JSON이다” |
| 응답 | `Content-Type: application/json` | “내가 주는 body는 JSON이다”   |

`POST` / `PATCH`에서 JSON을 보낼 때는 `Content-Type`과 함께 **Supabase 인증 헤더**도 넣는다.

```js
await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: supabaseHeaders, // apikey, Authorization, Content-Type, Prefer 등
    body: JSON.stringify({
        title: "공부하기",
        completed: false,
        user_id: 1,
    }),
});
```

서버·클라이언트 모두 “문자열인데 JSON으로 해석해야 한다”는 약속을 헤더로 맞춘다.

### Supabase에서 추가로 보는 헤더

| 헤더            | 대략                                               |
| --------------- | -------------------------------------------------- |
| `apikey`        | Publishable(anon) 키 — **요청마다 필수**           |
| `Authorization` | `Bearer <같은 키>` — **요청마다 필수**             |
| `Prefer`        | `return=representation` — POST/PATCH 후 생성·수정 row를 body로 받기 |
| `Accept`        | 단건 객체로 받을 때 `application/vnd.pgrst.object+json` |

### 그 외에 이름만 알아두면 좋은 헤더 (지금은 깊게 X)

| 헤더            | 대략                                               |
| --------------- | -------------------------------------------------- |
| `Accept`        | 클라이언트가 받고 싶은 형식 (배열 vs 단건 객체)    |
| `Authorization` | 인증 정보 (Supabase에서는 anon/publishable 키)     |
| `Cookie`        | 브라우저가 자동으로 실어 보내는 경우 많음 — 나중에 |

인증·CORS와 본격적으로 만날 때 다시 보면 된다.

### Network 탭으로 확인

1. 개발자 도구 → **Network**
2. `fetch`가 보낸 요청 클릭
3. **Request Headers** / **Response Headers**에서 `content-type` 등 확인

요청에 넣은 `Content-Type`·`apikey`와, 응답의 `content-type: application/json`을 직접 보면 개념이 고정된다.

---

## 3. URL 구조 — 경로 vs 쿼리

기초에서 본 URL을 조금 더 쪼갠다.  
Supabase(PostgREST)는 **단건도 경로 `/todos/1`보다 쿼리 필터**를 쓰는 경우가 많다.

예:

```
https://<project-ref>.supabase.co/rest/v1/todos?id=eq.1&select=*
         │              │              │      │  │      │
         │              │              │      │  │      └─ select (가져올 컬럼)
         │              │              │      │  └─ 쿼리 필터 (id = 1)
         │              │              │      └─ 테이블 path
         │              │              └─ Data API 경로
         └─ 호스트 (Supabase 프로젝트)
```

| 부분             | 예                                      | 역할                     |
| ---------------- | --------------------------------------- | ------------------------ |
| 스킴             | `https`                                 | 프로토콜 (암호화된 HTTP) |
| 호스트           | `<project-ref>.supabase.co`             | Supabase 프로젝트        |
| **경로 (path)**  | `/rest/v1/todos`                        | **어느 테이블(컬렉션)**  |
| **쿼리 (query)** | `?id=eq.1`, `?user_id=eq.1&select=*`    | **조건·필터·옵션**       |

### 경로 (path) — “무엇을”

REST에서 URL 경로는 대개 **자원(테이블)의 주소**다.

| URL (path)     | 의미                    |
| -------------- | ----------------------- |
| `/rest/v1/todos` | 할 일 **목록**(컬렉션)  |

PostgREST에서는 **id로 한 행**을 고를 때도 path에 `/1`을 붙이기보다 **쿼리**를 쓴다.

| URL (쿼리 포함)              | 의미                    |
| ---------------------------- | ----------------------- |
| `/rest/v1/todos?id=eq.1`     | id가 1인 할 일 **하나** |

`eq`는 “같다(equal)” 필터다. (`user_id=eq.1` → user_id가 1)

### 쿼리 (query) — “어떻게 걸러서”

`?` 뒤에 `이름=연산.값`을 붙이고, 여러 개면 `&`로 잇는다.

쿼리는 크게 두 가지 역할이 섞일 수 있다.

| 역할 | 예 | 의미 |
| ---- | -- | ---- |
| **필터** | `id=eq.1`, `user_id=eq.1` | **어느 행**을 가져올지 |
| **select** | `select=*`, `select=id,title` | 응답에 **어떤 컬럼**을 넣을지 |

`select=*` = SQL의 `SELECT *`처럼 **모든 컬럼**.  
`select=id,title`이면 `id`와 `title`만 응답에 온다.  
필터(`id=eq.1`)와는 별개다 — “어느 행”과 “그 행의 어떤 칸”을 나누는 옵션이다.

```
/rest/v1/todos?user_id=eq.1
/rest/v1/todos?user_id=eq.1&completed=eq.false
/rest/v1/todos?id=eq.1&select=*
```

|      | path / id 필터                         | user_id 등 필터                              |
| ---- | -------------------------------------- | -------------------------------------------- |
| 질문 | **어느 행?** (id 지정)                 | **그중에서 / 어떤 조건으로?**                |
| 예   | `?id=eq.1` → 1번 할 일                 | `?user_id=eq.1` → user_id가 1인 할 일들      |
| 비유 | 서가의 **몇 번 책**                    | “저자=홍길동”으로 **검색·필터**              |

같은 “todos”라도:

- `GET .../todos?id=eq.1&select=*` → **단건** + 컬럼 전체
- `GET .../todos?user_id=eq.1&select=*` → **목록 + 필터** + 컬럼 전체
- `GET .../todos?id=eq.1&select=id,title` → 단건이지만 **일부 컬럼만**

### 선택 실습

`fetch`로:

```text
GET https://<project-ref>.supabase.co/rest/v1/todos?user_id=eq.1&select=*
```

(헤더: `src/config/api.js`의 `supabaseHeaders`)

응답이 **배열**이고, 각 항목의 `user_id`가 `1`인지 확인해 본다.  
Network 탭에서 요청 URL 전체에 `?user_id=eq.1`이 붙어 있는지도 보면 좋다.

```js
const response = await fetch(
    `${API_BASE}/todos?user_id=eq.1&select=*`,
    { headers: supabaseHeaders },
);
const data = await response.json();
console.log(response.status, data);
```

---

## 4. 정리

| 볼 것       | 질문                                       |
| ----------- | ------------------------------------------ |
| **status**  | 성공인가? 내 요청 문제인가, 서버 문제인가? |
| **headers** | 본문이 JSON인가? (`Content-Type`)          |
| **path**    | 어느 자원을 가리키나?                      |
| **query**   | 행을 어떻게 필터링하나? 어떤 컬럼을 가져오나? (`select`) |

다음 단계(로드맵 3): 위 조각을  
`요청 = URL + method + headers + (body)` / `응답 = status + headers + (body)`  
한 바퀴로 묶고, CRUD를 **자원의 생애주기**로 본다.

관련: `docs/frontend/roadmap.md` §2 HTTP 심화 · §3 요청·응답·자원 모델
