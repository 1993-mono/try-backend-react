# HTTP 요청·응답·자원 모델

`docs/frontend/http-advanced.md`의 상태 코드 · 헤더 · URL을 전제로,  
**한 번의 fetch**를 요청·응답 **한 바퀴**로 묶고, CRUD를 **자원의 생애주기**로 본다.

프론트·백엔드 공통으로 쓰인다.

선행: `docs/frontend/fundamentals.md` · `docs/frontend/http-advanced.md`  
실습 API: [Supabase](https://supabase.com/) Data API — `.env` · `src/config/api.js`  
실습 코드: `src/pages/http-model/` (또는 직접 추가하는 페이지)

---

## 한눈에 정리

| 주제                | 한 줄                                           |
| ------------------- | ----------------------------------------------- |
| **요청 (request)**  | `URL + method + (headers) + (body)`             |
| **응답 (response)** | `status + headers + body`                       |
| **자원 (resource)** | URL·쿼리가 가리키는 **대상** (예: `todos` 테이블의 id=1 행) |
| **CRUD**            | 같은 자원에 대한 **생성·조회·수정·삭제** 흐름   |

한 바퀴:

```
[프론트]  fetch(요청)  ──HTTP──▶  [서버]  처리  ──HTTP──▶  [프론트]  response
              │                                      │
              └─ URL, method, headers, body          └─ status, headers, body
```

---

## 1. 요청–응답 한 바퀴

HTTP 심화에서 status · headers · URL을 **각각** 봤다면,  
이번에는 **한 번 보낸 fetch** 안에서 네 조각을 **동시에** 본다.

### 요청 (request)

| 조각        | 필수 유무                        | 예 (GET)                              | 예 (POST)                            |
| ----------- | -------------------------------- | ------------------------------------- | ------------------------------------ |
| **URL**     | ✅                               | `.../rest/v1/todos?id=eq.1&select=*`  | `.../rest/v1/todos`                  |
| **method**  | ✅                               | `GET`                                 | `POST`                               |
| **headers** | Supabase에서는 **사실상 필수**   | `apikey`, `Authorization` 등          | 위 + `Content-Type`, `Prefer` 등     |
| **body**    | 선택                             | 없음                                  | `{"title":"...", "completed":false}` |

프론트 코드 (`API_BASE` · `supabaseHeaders` → `src/config/api.js`):

```js
// GET — body 없음, 인증 헤더 필요
await fetch(`${API_BASE}/todos?id=eq.1&select=*`, {
    method: "GET",
    headers: supabaseObjectHeaders,
});

// POST — headers + body
await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: supabaseHeaders,
    body: JSON.stringify({
        title: "공부하기",
        completed: false,
        user_id: 1,
    }),
});
```

`fetch`의 두 번째 인자 `{ method, headers, body }`가 **요청**을 채운다.  
URL은 첫 번째 인자다.

### 응답 (response)

| 조각        | 의미                       | `fetch`에서                            |
| ----------- | -------------------------- | -------------------------------------- |
| **status**  | 성공/실패·누구 책임 (숫자) | `response.status`, `response.ok`       |
| **headers** | body 밖 부가 정보          | `response.headers.get("content-type")` |
| **body**    | 실제 데이터 (JSON 등)      | `await response.json()`                |

```js
const response = await fetch(
    `${API_BASE}/todos?id=eq.1&select=*`,
    { headers: supabaseObjectHeaders },
);

// 1) status 먼저
console.log(response.status); // 200
console.log(response.ok); // true

// 2) headers
console.log(response.headers.get("content-type")); // application/json; charset=utf-8

// 3) body (ok일 때)
if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}
const data = await response.json();
console.log(data);
```

읽는 순서 습관: **status → headers → body**

### 프론트·서버가 같은 규약

| 역할       | 하는 일                                                                          |
| ---------- | -------------------------------------------------------------------------------- |
| **프론트** | `fetch`로 요청을 **만들어 보냄**                                                 |
| **서버**   | 요청을 **받아 처리**하고 응답을 **돌려줌**                                       |
| **HTTP**   | 양쪽이 맞추는 **공통 형식** (URL, method, headers, body / status, headers, body) |

지금은 **Supabase Data API**가 “서버 + DB” 역할을 한다.  
PostgreSQL `todos` 테이블에 **실제로** 읽기·쓰기가 일어난다.

나중에 Express 등 **자기 서버**를 만들어도 **요청·응답 구조는 동일**하다.  
바뀌는 것은 URL(호스트)과 서버 안의 처리 로직뿐이다.

### Network 탭으로 확인

1. 개발자 도구 → **Network**
2. `fetch` 요청 하나 클릭
3. 아래를 **한 요청** 안에서 대응해 본다

| Network 탭                  | 요청/응답      |
| --------------------------- | -------------- |
| Request URL                 | URL            |
| Request Method              | method         |
| Request Headers             | headers (요청) |
| Request Payload (또는 body) | body (요청)    |
| Status Code                 | status         |
| Response Headers            | headers (응답) |
| Response (Preview)          | body (응답)    |

화면에 띄운 “요청 스냅샷 / 응답 스냅샷”과 Network 탭이 **같은 그림**이면 이해가 고정된다.

---

## 2. 자원(resource)과 CRUD

### 자원이란?

**자원** = API가 다루는 **대상 하나** (또는 그 **집합**).

| URL (개념)              | 가리키는 것             |
| ----------------------- | ----------------------- |
| `.../todos`             | 할 일 **목록** (테이블) |
| `.../todos?id=eq.1`     | id가 1인 할 일 **하나** |

REST에서는 URL을 **동사가 아니라 명사(자원 이름)** 로 잡는다.  
“무엇을 할지”는 **HTTP method**가 맡는다.

PostgREST(Supabase)는 단건을 **path `/todos/1`** 보다 **쿼리 `?id=eq.1`** 로 지정하는 패턴이 흔하다.

### CRUD = 자원의 생애주기

메서드 네 개를 **외울 목록**이 아니라, **한 자원이 거치는 단계**로 본다.

```
생성(POST) → 조회(GET) → 수정(PATCH) → 삭제(DELETE)
     │            │              │                │
  /todos    ?id=eq.1       ?id=eq.1         ?id=eq.1
 (새로 만듦)   (읽기)        (바꿈)            (없앰)
```

| CRUD       | HTTP method | URL 예 (Supabase)     | body           | 기대 status (예) |
| ---------- | ----------- | --------------------- | -------------- | ---------------- |
| **C**reate | POST        | `/todos`              | 새 자원 JSON   | `201` Created    |
| **R**ead   | GET         | `/todos?id=eq.1`      | 없음           | `200` OK         |
| **U**pdate | PATCH       | `/todos?id=eq.1`      | 수정 내용 JSON | `200` OK         |
| **D**elete | DELETE      | `/todos?id=eq.1`      | 보통 없음      | `200` 또는 `204` |

같은 **자원 id** (`id=eq.1`)를 중심으로 GET → PATCH → DELETE 순으로 실습하면  
“메서드 = 그 자원에 대한 행동”이 한 줄로 이어진다. **DB에도 반영**된다.

### 1단계 실습과 연결

로드맵 1단계에서 이미 나눠 연습한 페이지:

| 페이지                 | method | 자원 관점                |
| ---------------------- | ------ | ------------------------ |
| `TodoPost`             | POST   | 목록에 **새** todo 추가  |
| `TodoGet` / `TodoList` | GET    | **하나** / **목록** 조회 |
| `TodoPatch`            | PATCH  | 1번 todo **일부** 수정   |
| `TodoPut`              | PATCH (전체 필드) | 1번 todo **전체** 교체에 가깝게 |
| `TodoDelete`           | DELETE | 1번 todo **삭제**        |

이번 단계에서는 이걸 **흩어진 버튼**이 아니라 **한 자원의 이야기**로 다시 읽는다.

---

## 3. PUT vs PATCH — 교체 vs 일부 수정

둘 다 **Update(U)** 이지만, body에 **얼마나** 실어 보내느냐가 다르다.

|          | PATCH                   | PUT                                                       |
| -------- | ----------------------- | --------------------------------------------------------- |
| **느낌** | **일부**만 고친다       | **통째로** 덮어쓴다 (교체)                                |
| **body** | 바꿀 **필드만**         | 자원 **전체** 필드                                        |
| **예**   | `{ "completed": true }` | `{ "title":"...", "completed":true, "user_id":1 }` (전체 필드) |

```js
// PATCH — completed만
await fetch(`${API_BASE}/todos?id=eq.1`, {
    method: "PATCH",
    headers: supabaseObjectHeaders,
    body: JSON.stringify({ completed: true }),
});

// 전체 교체에 가깝게 — 모든 필드를 보냄
// (Supabase PostgREST는 PUT 대신 PATCH + 전체 필드로 실습하는 경우가 많음)
await fetch(`${API_BASE}/todos?id=eq.1`, {
    method: "PATCH",
    headers: supabaseObjectHeaders,
    body: JSON.stringify({
        title: "수정된 제목",
        completed: true,
        user_id: 1,
    }),
});
```

실무에서:

- 화면에서 **체크박스 하나**만 바꿀 때 → **PATCH + 일부 필드**가 자연스럽다.
- “폼 전체 저장”처럼 **모든 필드를 항상 보내는** 경우 → **PUT** 또는 **PATCH + 전체 필드**로 표현하는 팀도 있다.

Supabase에서는 POST/PATCH/DELETE가 **PostgreSQL에 실제 반영**된다. Table Editor에서 행이 바뀌는지 함께 확인하면 “자원 생애주기”가 눈에 들어온다.

---

## 4. (선택) 한 화면에서 CRUD 묶기

목표: `id=eq.1` 하나를 잡고 **조회 → PATCH(일부) → PATCH(전체) → DELETE**를 같은 화면에서 순서대로 경험.

권장 UI 흐름:

1. **조회** — 현재 todo를 state에 저장
2. **PATCH** — `completed`만 토글
3. **PATCH (전체)** — title·completed·user_id 입력 후 전체 전송
4. **DELETE** — 삭제 요청 (응답 status 확인)

각 단계마다 **마지막 method**와 **보낸 body**를 화면에 남기면 PUT vs PATCH 차이가 바로 보인다.

---

## 5. 정리

| 볼 것            | 질문                                          |
| ---------------- | --------------------------------------------- |
| **요청**         | URL·method·headers·body가 각각 무엇인가?      |
| **응답**         | status·headers·body를 **그 순서**로 읽었는가? |
| **규약**         | Network 탭과 코드가 **같은 구조**인가?        |
| **자원**         | URL이 **무엇**을 가리키는가?                  |
| **CRUD**         | method가 **그 자원의 어떤 행동**인가?         |
| **PATCH vs PUT** | **일부**인가 **전체 교체**인가?               |

다음 단계(로드맵 4): 위 내용을 **API 명세서(계약)** 로 고정한다.  
endpoint · method · body · response · status가 **한 행(또는 Swagger 한 endpoint)** 에 들어가면,  
프론트는 명세만 보고 `fetch`를 짤 수 있다.

관련: `docs/frontend/roadmap.md` §3 요청·응답·자원 모델 · §4 API 명세서
