# 백엔드 기초 — 서버의 역할

프론트에서 보던 HTTP 한 바퀴를 **서버 쪽**에서 다시 본다.

선행: `docs/frontend/http-resource-model.md` · `docs/frontend/api-spec.md`  
로드맵: `docs/backend/roadmap.md` §1

---

## 한눈에 정리

| 주제 | 한 줄 |
|------|--------|
| **서버** | 포트를 **듣고(listen)** → 요청을 **받고** → 처리한 뒤 → 응답을 **보낸다** |
| **req** | **request** 줄임말 — 클라이언트가 보낸 요청 (프론트의 `fetch` 인자와 **같은 규약**) |
| **res** | **response** 줄임말 — 서버가 돌려주는 응답 (프론트의 `response`와 **같은 규약**) |
| **Supabase Data API** | DB + REST API가 **이미 합쳐진** 서버 (내가 로직을 안 짬) |
| **자기 서버** | 요청 처리·로직·응답을 **내가** 코드로 만든다 |

> **이름 관례:** Express 핸들러 인자 `(req, res)`는 예약어가 아니다.  
> `request` / `response`로 써도 동작은 같다. 다만 코드·문서에서 **짧게 쓰는 관례**가 `req` / `res`다.

관점만 바뀐다. HTTP 규약은 같다.

```
[프론트]  fetch(...)     ──HTTP──▶  [서버]  req 받기 → 처리 → res 보내기
              │                              │
              └─ URL, method, headers, body  └─ status, headers, body
```

---

## 1. 서버가 하는 일

프론트에서는 이렇게 했다.

```js
const response = await fetch(url, { method, headers, body })
const data = await response.json()
```

서버에서는 **반대편**이다.

```
1. listen   — 특정 포트에서 요청이 오길 기다린다
2. 받기     — 들어온 HTTP 요청을 req로 읽는다
3. 처리     — URL·method·body를 보고 할 일을 한다
4. 보내기   — status + JSON을 res로 돌려준다
```

Express로 최소 형태를 쓰면 대략 이렇다.

```js
import express from 'express'

const app = express()

// GET /health → { "ok": true }
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// 포트 3000에서 듣기 시작
app.listen(3000, () => {
  console.log('http://localhost:3000')
})
```

| 코드 | 역할 |
|------|------|
| `app.listen(3000)` | 서버 **켜기** (이 포트로 요청 받기) |
| `app.get('/health', ...)` | `GET /health` 요청이 오면 **이 함수** 실행 |
| `req` | 들어온 요청 정보 |
| `res.json({ ok: true })` | JSON body로 **응답 보내기** (기본 status `200`) |

포인트: 서버는 “페이지를 그리는” 쪽이 아니라, **HTTP 요청에 답하는 프로그램**이다.

---

## 2. Supabase Data API vs 자기 서버

지금까지의 흐름:

```
React  ──fetch──▶  Supabase Data API  ──SQL──▶  PostgreSQL
                      (이미 있는 서버)
```

앞으로의 흐름:

```
React  ──fetch──▶  내 Express 서버  ──(메모리/SQL)──▶  데이터
                      (내가 만든 서버)
```

| | Supabase Data API | 자기 Express 서버 |
|--|-------------------|-------------------|
| **누가 API인가** | Supabase가 제공 | **내가** 구현 |
| **DB** | PostgreSQL에 바로 연결됨 | 처음엔 메모리 → 나중에 DB 연결 |
| **로직** | RLS·필터 정도 (비즈니스 로직은 거의 없음) | 검증·권한·가공을 **코드로** 작성 |
| **프론트가 치는 URL** | `.../rest/v1/todos` | `http://localhost:3000/todos` 등 |
| **역할 한 줄** | DB+API가 **합쳐진** 창구 | API 창구를 **직접** 만듦 |

Supabase를 “쓰지 않는다”가 아니라, **같은 HTTP 창구를 내가 구현해 본다**는 뜻이다.  
프론트의 `fetch` 코드 형태는 거의 같고, **URL(과 가끔 headers)만** 바뀐다.

---

## 3. `req` / `res` = 예전에 보던 요청·응답

`docs/frontend/http-resource-model.md`에서 정리한 조각과 **1:1**이다.

### 요청 → `req`

| 프론트에서 보낸 것 | 서버에서 읽는 곳 | 예 |
|--------------------|------------------|-----|
| URL path | `req.path` / 라우트 매칭 | `/health`, `/todos` |
| method | `req.method` (또는 `app.get` 등으로 이미 구분) | `GET`, `POST` |
| query (`?id=1`) | `req.query` | `{ id: '1' }` |
| path 변수 (`/todos/:id`) | `req.params` | `{ id: '1' }` |
| headers | `req.headers` | `content-type`, `authorization` |
| body (JSON) | `req.body` (미들웨어로 파싱 후) | `{ title: '...' }` |

### 응답 → `res`

| 프론트에서 읽던 것 | 서버에서 채우는 곳 | 예 |
|--------------------|--------------------|-----|
| `response.status` | `res.status(200)` | `200`, `201`, `404` |
| `response.headers` | `res.set(...)` 등 | `Content-Type` |
| `response.json()` 결과 | `res.json({ ... })` | `{ ok: true }` |

같은 규약의 **양쪽 끝**이다.

```
프론트:  fetch로 요청을 "채워서 보냄"  →  response로 "읽음"
서버:    req로 요청을 "읽음"           →  res로 응답을 "채워서 보냄"
```

그래서 명세(`docs/frontend/api-spec.yaml`)의 한 행은  
프론트에게는 “이렇게 **호출**하라”, 백엔드에게는 “이렇게 **응답**하라”는 **같은 계약**이다.

---

## 4. 실습 전에 확인할 것

§1 실습 목표: `GET /health` → `{ "ok": true }`

확인 방법 (셋 다 **같은 응답**을 보면 된다):

| 방법 | 예 |
|------|-----|
| 브라우저 | 주소창에 `http://localhost:3000/health` |
| 터미널 | `curl http://localhost:3000/health` |
| (나중에) React | `fetch('http://localhost:3000/health')` |

서버가 켜져 있어야 한다. `listen` 없이 URL만 치면 연결 자체가 안 된다.

### curl이란?

**curl** = *Client URL*. 터미널에서 **HTTP 요청을 보내는 도구**다.  
브라우저 주소창에 URL을 치는 것과 **같은 GET 요청**을, 응답 본문만 터미널에 출력한다.

```bash
curl http://localhost:3000/health
# → {"ok":true}
```

| | 브라우저 | curl | 프론트 `fetch` |
|--|----------|------|----------------|
| **역할** | 눈으로 확인 | 서버만 있을 때 빠르게 확인 | 앱에서 요청·응답 처리 |
| **학습 비중** | 보조 | **도구** (전용 장은 없음) | 프론트 본편 |

프론트 학습의 본편은 `fetch`다. curl은 서버·API가 살아 있는지 **점검할 때**만 쓰면 된다.

### curl 옵션 (§2 todos CRUD 테스트)

서버는 `yarn server`로 켜 둔 상태에서, **다른 터미널**에서 실행한다.

| 옵션 | 의미 |
|------|------|
| (없음) | **GET** 기본. `curl URL` |
| `-i` | 응답 **헤더** 포함 출력 (status 코드 확인 — `404`, `204` 등) |
| `-X METHOD` | HTTP method 지정 (`POST`, `PATCH`, `DELETE` …) |
| `-H "키: 값"` | 요청 **헤더** (JSON body 보낼 때 `Content-Type: application/json`) |
| `-d '...'` | 요청 **body** (JSON **문자열**) |

`fetch`와 대응:

| curl | fetch |
|------|-------|
| `curl URL` | `fetch(url)` (GET) |
| `-X POST` | `method: 'POST'` |
| `-H "Content-Type: application/json"` | `headers: { 'Content-Type': 'application/json' }` |
| `-d '{"title":"..."}'` | `body: JSON.stringify({ title: '...' })` |

예시 (`server/index.js` 기준):

```bash
# GET — 목록 · 단건
curl http://localhost:3000/todos
curl http://localhost:3000/todos/1

# GET — 없는 id (404, -i로 status 확인)
curl -i http://localhost:3000/todos/999

# POST — 생성 (201)
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"새 할 일","completed":false}'

# PATCH — 일부 수정
curl -X PATCH http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# DELETE — 삭제 (204 No Content, -i로 status 확인)
curl -i -X DELETE http://localhost:3000/todos/2
```

코드 수정 후에는 서버 터미널에서 `Ctrl+C` → `yarn server`로 **재시작**해야 반영된다.

---

## 다음

- 로드맵 §2 이론: `docs/backend/express-min-api.md`
- 다음 단계: 로드맵 §3 CORS
