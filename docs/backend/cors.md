# CORS — 브라우저 연동

프론트(Vite `5173`)와 Express(`3000`)가 **포트가 다를 때** 브라우저가 막는 문제를 풀고, React에서 자기 서버 API를 호출한다.

선행: `docs/backend/express-min-api.md` §2  
실습 코드: `server/index.js` · `src/pages/backend/cors/TodoList.jsx` · `src/config/express-api.js`  
로드맵: `docs/backend/roadmap.md` §3

---

## 한눈에 정리

| 주제 | 한 줄 |
|------|--------|
| **Same-Origin Policy** | 브라우저가 **다른 origin**으로 가는 JS 요청을 기본적으로 막는 보안 규칙 |
| **origin** | `프로토콜 + 호스트 + 포트` 묶음 — 하나라도 다르면 cross-origin |
| **CORS** | 서버가 응답 헤더로 “이 origin에서 읽어도 된다”고 **허용**하는 방식 |
| **curl** | CORS와 **무관** — 터미널 도구라 브라우저 규칙이 적용되지 않음 |
| **`cors()`** | Express에서 CORS 허용 헤더를 자동으로 붙이는 **미들웨어** |

§2에서 `express.json()`을 **요청** 쪽에 썼다면, CORS는 **응답 헤더** 쪽이다.

```
요청 → [cors()] → [express.json()] → [라우트] → 응답
```

---

## 1. 왜 막혔나 — Same-Origin Policy

브라우저 안에서 돌아가는 JavaScript(`fetch`)에는 **추가 보안 규칙**이 있다.

> “`http://localhost:5173` 페이지의 JS가, 마음대로 `http://localhost:3000`에 요청해서 데이터를 읽지 못하게 하자.”

이게 **Same-Origin Policy(동일 출처 정책)** 다.  
악성 사이트가 로그인된 다른 사이트 API를 몰래 호출하는 것을 막기 위한 장치다.

§2까지는 **curl**로 API를 확인했다. curl은 이 규칙의 대상이 **아니다**.  
그래서 서버는 정상인데, React에서만 막히는 현상이 생긴다.

### CORS와의 관계 — 문을 여는 쪽

Same-Origin Policy가 **막는** 쪽이면, CORS는 서버가 “이 origin은 읽어도 된다”고 **열어 주는** 쪽이다.

`app.use(cors())` 기본값은 대략 이렇게 말한다.

> “브라우저라면, **어느 origin의 JS든** 이 응답을 읽어도 된다.”

즉 CORS(기본 설정)는 **브라우저 기준으로 문을 활짝 열어 주는 개념**이다.  
localhost라서 인터넷에서 안 닿을 뿐이고, **CORS 정책 자체는 넓게 열린 상태**다.

나중에 좁히려면 `cors({ origin: 'http://localhost:5173' })`처럼 **허용 origin만** 지정한다.  
(상세: 아래 §6)

---

## 2. origin이란

**origin** = 아래 세 가지가 **전부 같을 때** 같은 origin이다.

| 구성 | Vite (프론트) | Express (서버) |
|------|---------------|----------------|
| 프로토콜 | `http` | `http` |
| 호스트 | `localhost` | `localhost` |
| 포트 | `5173` | `3000` |

프로토콜·호스트가 같아도 **포트가 다르면 다른 origin** → **cross-origin** 요청이다.

```text
http://localhost:5173  ──fetch──▶  http://localhost:3000/todos
     (페이지 origin)                    (API origin — 다름!)
```

### Supabase는 왜 됐나

프론트 실습 때는 `https://xxx.supabase.co`로 요청했다. origin은 역시 다르다.  
다만 Supabase 서버가 응답에 CORS 허용 헤더를 **미리** 보내 주기 때문에 브라우저에서도 동작했다.

자기 Express는 처음에 그 헤더가 없었기 때문에 §3에서 `cors()`를 추가한다.

---

## 3. curl vs 브라우저 `fetch`

| | 브라우저 `fetch` | curl |
|--|------------------|------|
| 누가 요청? | 웹 페이지 안의 JS | 터미널 프로그램 |
| CORS 검사? | **함** | **안 함** |
| 서버가 JSON 응답 | JS가 **못 읽을 수 있음** | body 그대로 출력 |

Console에 보이는 전형적인 에러:

```text
Access to fetch at 'http://localhost:3000/todos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

의미:

- 서버가 **응답을 보냈을 수 있음** (Network에 기록이 남을 수 있음)
- 브라우저가 “cross-origin이라 **JS에 결과를 넘기지 않겠다**”고 막은 것
- **서버 고장**이 아니라 **브라우저 규칙**

| 오해 | 실제 |
|------|------|
| “서버 500이라서…” | CORS면 응답이 와도 JS가 못 읽음 |
| “fetch 문법이 틀려서…” | curl이 되면 URL·서버는 대체로 정상 |
| “localhost면 같은 origin” | **포트까지** 같아야 함 |

---

## 4. CORS가 하는 일

**CORS** = *Cross-Origin Resource Sharing* (교차 출처 리소스 공유)

서버가 **응답 헤더**로 브라우저에게 말한다.

> “`http://localhost:5173`에서 온 요청이면, 이 응답 body를 JS가 읽어도 된다.”

### 대표 헤더

| 헤더 | 의미 |
|------|------|
| `Access-Control-Allow-Origin` | 허용할 origin (`*` 또는 `http://localhost:5173`) |
| `Access-Control-Allow-Methods` | 허용 HTTP method (`GET`, `POST` …) |
| `Access-Control-Allow-Headers` | 허용 요청 헤더 (`Content-Type` 등) |

Network 탭 → 요청 클릭 → **Response Headers**에서 `access-control-allow-origin`을 확인한다.

프론트 `docs/frontend/http-advanced.md`에서 본 **헤더** 개념과 연결된다.

- 요청 헤더: 클라이언트(`fetch`)가 붙임 — `Content-Type`, `apikey` …
- 응답 헤더: 서버가 붙임 — `content-type`, **`access-control-allow-origin`** …

---

## 5. 흐름 — 한 바퀴

```text
[React 5173]  fetch('http://localhost:3000/todos')
       │
       ▼
[브라우저]  origin이 다름 → CORS 검사
       │
       ▼
[Express 3000]  todos 처리 → res.json(...)
       │
       ▼
[응답]  body: JSON  +  Access-Control-Allow-Origin: ...
       │
       ▼
[브라우저]  허용 origin이면 → JS에 data 전달 ✅
```

`cors()` **없을 때**: 브라우저가 응답을 JS에 넘기지 않음.  
`app.use(cors())` **있을 때**: 서버가 허용 헤더를 붙여 통과.

---

## 6. `cors` 패키지 · `app.use(cors())`

### 설치

```bash
yarn add cors
```

### 서버 코드 (`server/index.js`)

```js
import cors from 'cors'
import express from 'express'

const app = express()

app.use(cors())           // CORS 허용 (express.json보다 위)
app.use(express.json())
```

| | 설명 |
|--|------|
| `app.use` | 들어오는 **모든** 요청에 공통 적용 (§2 `express.json()`과 같은 패턴) |
| `cors()` | `Access-Control-Allow-*` 헤더를 자동으로 붙임. OPTIONS preflight도 처리 |
| `cors()` 기본값 | 개발에 편한 설정 (모든 origin 허용 등) |

### 헤더를 직접 쓸 때 (참고)

```js
res.set('Access-Control-Allow-Origin', 'http://localhost:5173')
```

실습에서는 **`cors` 미들웨어**를 쓴다. 반복·preflight 처리를 맡긴다.

### 배포 때 (나중에)

개발용 `cors()`는 편하지만, 운영에서는 특정 origin만 허용하는 경우가 많다.

```js
cors({ origin: 'https://내-프론트-도메인.com' })
```

로컬 학습 단계에서는 `cors()`로 충분하다.

코드 수정 후에는 `Ctrl+C` → `yarn server`로 **재시작**해야 반영된다.

---

## 7. React 연동

프론트 Supabase 실습(`src/pages/frontend/`)과 **백엔드 실습**(`src/pages/backend/`)을 분리한다.

| | 프론트 실습 | 백엔드 §3 실습 |
|--|-------------|----------------|
| 폴더 | `src/pages/frontend/rest-api/` | `src/pages/backend/cors/` |
| URL | `/frontend/rest-api/todo-list` | `/backend/cors/todo-list` |
| API | Supabase `API_BASE` + `supabaseHeaders` | `EXPRESS_API_BASE` (`src/config/express-api.js`) |

### Express용 fetch

```js
import { EXPRESS_API_BASE } from '@/config/express-api'

fetch(`${EXPRESS_API_BASE}/todos`)
```

| | Supabase | 자기 Express |
|--|----------|--------------|
| URL | `.../todos?select=*` | `http://localhost:3000/todos` |
| headers | `apikey`, `Authorization` … | **없어도 됨** (지금 단계) |
| 데이터 | Supabase DB | `server/index.js` 메모리 배열 |

응답은 둘 다 **배열 JSON** — HTTP 한 바퀴 구조는 같고, URL·헤더만 다르다.

---

## 8. 실습 순서

터미널 2개: `yarn server` · `yarn dev`

### 8-1. CORS 에러 재현

브라우저 Console (`http://localhost:5173`):

```js
fetch('http://localhost:3000/todos')
  .then((r) => r.json())
  .then(console.log)
```

`cors()` 적용 **전**이면 CORS 에러.  
같은 URL을 **curl**로 치면 JSON이 나온다 — §3.3 참고.

### 8-2. `cors` 적용 후 Console 확인

`app.use(cors())` 추가 · 서버 재시작 → 같은 `fetch`가 배열을 출력.

### 8-3. 백엔드 페이지 연동

`http://localhost:5173/backend/cors/todo-list`

- 메모리 todos(**공부하기**, **운동하기**)가 보이면 성공
- Network: Request URL `http://localhost:3000/todos`, Status `200`

### 8-4. 프론트 페이지와 비교

| 페이지 | 경로 |
|--------|------|
| 프론트 (Supabase) | `/frontend/rest-api/todo-list` |
| 백엔드 (Express) | `/backend/cors/todo-list` |

Network 탭에서 요청·응답 구조를 나란히 본다.

### 8-5. (선택) `cors()` 끄고 다시 막혀 보기

`app.use(cors())` 주석 → 재시작 → 백엔드 페이지에서 CORS 에러 → 복구.

---

## 9. 테스트 방법 정리

| 방법 | CORS 영향 | 용도 |
|------|-----------|------|
| **curl** | 없음 | 서버·API 점검 (§2와 동일) |
| **브라우저 주소창** | GET만, 페이지 이동이라 §3 `fetch`와 다름 | `/health`, `/todos` 눈으로 확인 |
| **React `fetch`** | **있음** | 프론트 ↔ 자기 서버 연동 (§3 본편) |

§2 `express-min-api.md` §6에서 “React는 §3 CORS 이후”라고 한 이유가 여기 있다.

---

## 다음

- 로드맵 §4 **status · 에러 응답** — 서버에서 `400` · `404` · `500` 등 상황별 status 보내기
- 프론트에서 `response.ok` / `response.status`로 분기 (프론트 `http-advanced/status-code`와 연결)
