# 인증 — “누가” 요청했는지

지금까지의 todos API는 **누구나** `GET` / `POST` 할 수 있다.  
실무 API는 종종 “로그인한 **그 사람**만” 또는 “토큰 있는 요청만” 허용한다.

이 문서는 **왜 · 무엇이 · 어디에**를 정리한다.  
(쿠키·세션은 개념만. 실습은 JWT · Bearer 쪽을 우선한다.)

선행: `docs/backend/folder-structure.md` · `docs/backend/status-error.md`  
프론트에서 본 헤더: `docs/frontend/http-advanced.md` (Supabase `Authorization` 경험)  
실습 코드: `server/middleware/auth.js` · `server/routes/auth.js` · `server/routes/todos.js`  
로드맵: `docs/backend/roadmap.md` §7

---

## 한눈에 정리

| 주제 | 한 줄 |
|------|--------|
| **인증 (Authentication)** | “너는 **누구**냐?” — 신원을 확인 |
| **인가 (Authorization)** | “너는 **이걸 해도** 되냐?” — 권한 |
| **토큰** | 로그인 성공 후 서버가 주는 **증명서** (이후 요청에 붙임) |
| **JWT** | 토큰 형식의 한 종류 — 내용을 서버가 **검증**할 수 있음 |
| **Bearer** | `Authorization` 헤더에 토큰을 실는 **관례** |
| **401** | 인증 실패·없음 — “먼저 로그인(토큰) 해라” |
| **403** | 신원은 알지만 **권한 없음** (이 단계에서는 가볍게만) |

```
로그인 (한 번)
  브라우저 ──POST /login──▶ 서버 ──토큰 발급──▶ 브라우저가 보관

이후 요청마다
  브라우저 ──GET /todos──▶ 서버
              Authorization: Bearer <토큰>
                    │
                    ▼
              토큰 유효? → 통과 → 컨트롤러
                       → 아니면 401
```

---

## 1. 왜 필요한가

지금 서버:

> URL만 알면 todos를 읽고 쓸 수 있다.

로컬 연습에는 괜찮다.  
실무에서는 보통 막는다.

| 상황 | 인증 없으면 |
|------|-------------|
| 내 할 일만 보고 싶을 때 | 남의 목록까지 열릴 수 있음 |
| 관리자 API | 아무나 삭제·수정 가능 |
| 유료·개인 데이터 | 노출·조작 위험 |

한 줄:

> **요청만 받는 것**과 **누구의 요청인지 아는 것**은 다르다.  
> 인증은 후자를 서버에 알려 주는 장치다.

프론트에서 Supabase를 쓸 때 `apikey` · `Authorization` 헤더를 붙였던 것도  
“이 프로젝트 API를 써도 된다”는 **증명**에 가깝다.  
§7은 그걸 **내 Express**에서 “이 사용자다” 쪽으로 한 걸음 더 보는 단계다.

---

## 2. 인증 vs 인가 (이름만 구분)

| | 질문 | 실패 시 자주 쓰는 status |
|--|------|-------------------------|
| **인증** | 너는 누구냐? (토큰·로그인) | `401` |
| **인가** | 이 자원에 손대도 되나? | `403` |

이 프로젝트 §7 범위:

- **인증** — 토큰 있냐 / 유효하냐 → 없으면 `401`
- **인가** — “user_id=1만” 같은 세부는 깊이 안 감 (개념만 앎)

---

## 3. 토큰 방식의 큰 그림

서버가 매 요청마다 “아이디·비밀번호 다시”를 묻지 않는다.  
대신 **짧은 증명서(토큰)** 를 발급하고, 이후 요청에 그걸 붙이게 한다.

```
1. POST /login  { email, password }  (또는 연습용 고정 계정)
2. 서버가 맞으면 → { "token": "...." } 응답
3. 브라우저(또는 클라이언트)가 token 보관
4. GET /todos 할 때 헤더에 실어 보냄
5. 서버가 token 검사 → OK면 목록, 아니면 401
```

비밀번호를 **매 요청 body에 넣는 방식**은 쓰지 않는다.

---

## 4. `Authorization` · Bearer

HTTP 헤더로 인증 정보를 보내는 흔한 자리:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

| 부분 | 뜻 |
|------|-----|
| `Authorization` | 헤더 이름 — “인증 정보 여기 있음” |
| `Bearer` | 토큰을 이 방식으로 보낸다는 **스킴(관례)** |
| (그 뒤 문자열) | 실제 토큰 |

프론트에서 본 Supabase 헤더도 `Authorization: Bearer <키>` 형태였다.  
그때는 “anon 키”, §7 실습에서는 “로그인으로 받은 JWT”를 같은 **칸**에 넣는 그림이다.

Express에서는 대략:

```js
const header = req.headers.authorization
// "Bearer xxxxx" → 앞의 Bearer 떼고 토큰만 검사
```

없으면 / 형식이 이상하면 → `401`.

---

## 5. JWT란? (개념)

**JWT** = **J**son **W**eb **T**oken

토큰 문자열 안에 (보통) 이런 정보가 **인코딩**되어 있다.

- 누구인지 (`sub` / `userId` 등)
- 언제 만료인지 (`exp`)
- 서명 — 서버 비밀키로 “위조되지 않음”을 확인

```
aaaaa.bbbbb.ccccc
  │      │      │
헤더   내용(payload)  서명
```

#### 용어: payload

**payload** (영) ≈ *적재물 · 운반하는 내용물*.  
여기서는 JWT 세 칸 중 **가운데 — 토큰에 실어 둔 정보(JSON)** 를 말한다.

| JWT 칸 | 역할 |
| ------ | ---- |
| 헤더 | 토큰 종류·알고리즘 등 |
| **payload** | `userId`, `username`, 만료(`exp`) 같은 **내용** |
| 서명 | 비밀키로 “위조되지 않음” 확인 |

이 프로젝트 `jwt.sign({ userId, username }, ...)` 의 첫 인자가 곧 payload다.

같은 단어가 HTTP에서는 **요청 body**를 가리키기도 한다 (Network의 Request Payload).  
층이 다르다. → `docs/frontend/http-resource-model.md` (Network 표 아래)

서버는 DB에 “이 토큰 목록”을 매번 안 쌓아도,  
**서명 + 만료**만 보고 통과시킬 수 있다. (장점이자, 탈취·만료 설계가 중요해지는 이유)

이 단계에서는:

> “로그인 성공 증명서를 **문자열로** 주고,  
> 다음 요청 헤더에 실어 서버가 **검증**한다”  
> 그 증명서 형식이 자주 JWT다.

라이브러리 이름·옵션은 실습에서 다룬다.

---

## 6. 쿠키 · 세션 (개념만)

같은 “로그인 유지”라도 방식이 다르다.

| 방식 | 한 줄 | 특징 |
|------|--------|------|
| **토큰 (JWT 등) + Bearer** | 클라이언트가 토큰을 들고 헤더에 붙임 | API·모바일·SPA에 흔함 |
| **세션 + 쿠키** | 서버가 세션 저장, 브라우저는 세션 id 쿠키 | 전통 웹 폼·같은 사이트에 흔함 |

```
세션 방식 (대략)
  로그인 → 서버가 세션 저장 → Set-Cookie: sessionId=...
  다음 요청 → 쿠키 자동 전송 → 서버가 세션 조회
```

회사마다 다르다. Spring Security도 세션·JWT·둘 다 쓰는 경우가 있다.  
§7 실습은 **Bearer 토큰**만 따라가면 충분하다.  
“쿠키로도 할 수 있다” 정도만 알면 된다.

---

## 7. 레이어 어디에 붙나

§6에서 나눈 구조 위에 **문지기**가 붙는다.

```
요청
  → routes
  → ★ 인증 미들웨어 (토큰 검사)   ← 여기서 막히면 컨트롤러까지 안 감
  → controllers
  → (services)
  → db
```

| 위치 | 하는 일 |
|------|---------|
| **미들웨어** | `Authorization` 읽고 검증. 실패 시 `401` |
| **controllers** | 이미 “통과한 요청”만 처리 (또는 `req.user` 사용) |
| **login 라우트** | 토큰 검사 **없이** 열어 둠 (로그인 자체) |

`/health` · `/login` 은 보통 인증 제외.  
`/todos` CRUD는 인증 필요로 막는 식이다.

Spring으로 치면 Filter / Security 설정이 이 미들웨어 자리에 가깝다.

---

## 8. 헷갈리기 쉬운 점

| 오해 | 실제 |
|------|------|
| “CORS가 인증이다” | **아님.** CORS는 브라우저·origin 규칙. 인증은 **누구인지**. |
| “프론트에 비밀키를 넣으면 안전” | JWT **서명용 비밀키**는 서버만. 브라우저에 두면 안 됨. |
| “Bearer = JWT” | Bearer는 **헤더 쓰는 방식**. 그 안에 JWT를 넣는 경우가 많을 뿐. |
| “401이랑 403 같음” | 401 ≈ 인증 문제, 403 ≈ 권한 문제. |
| “Supabase anon 키 = 내 로그인 JWT” | 역할이 다름. anon은 프로젝트 API 열쇠, JWT는 **사용자** 증명에 가깝다. |

---

## 9. 실습

목표:

> 토큰 없이 todos → `401`  
> 토큰 있으면 → 지금과 같이 CRUD

순서:

1. `jsonwebtoken` · `JWT_SECRET`
2. 미들웨어 · `POST /login`
3. `/todos`에 `requireAuth` 연결
4. curl로 확인

실습 코드: `server/middleware/auth.js` · `server/routes/auth.js` · `server/routes/todos.js` · `server/index.js`

`/todos`에 문지기를 붙이면, 헤더 없는 프론트 TodoList는 **401**이 난다. 서버 동작이 맞다는 뜻이다.

### curl로 확인

기본 curl 옵션은 `docs/backend/backend-basics.md`에도 있다.  
인증 확인에서 **추가로** 쓰는 것:

| 옵션 | 어디 | 뜻 |
|------|------|-----|
| **`-s`** | curl | 조용히 — 진행률 없이 응답만 (`--silent`) |
| **`-o`파일** | curl | 응답 body를 파일로 저장. `/dev/null`이면 body는 버림 |
| **`-w`형식** | curl | 끝난 뒤 추가 출력. `%{http_code}`면 **status 숫자만** |
| **`-H "..."`** | curl | 요청 헤더 (`Authorization: Bearer ...`) |
| **`-X POST`** · **`-d`** | curl | 메서드 · body (basics와 동일) |
| **`-c '...'`** | **python3** (curl 아님) | 파일 없이 코드를 바로 실행 — token만 뽑을 때 |

status만 보고 싶을 때:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/todos
# → 401 (토큰 없음)
```

전체 흐름:

```bash
# 1) 토큰 없이 → 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/todos

# 2) 로그인 → token 받기
curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo123"}'

# 3) token을 변수에 넣기 (python3 -c 로 JSON에서 추출)
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"demo123"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 4) Bearer로 목록 → 200 + JSON
curl -s http://localhost:3000/todos \
  -H "Authorization: Bearer $TOKEN"
```

기대:

1. → `401`
2. → `{ "token": "...." }`
4. → todos 배열

---

## 다음에 연결

- (선택) 프론트 TodoList에 `Authorization` 헤더 붙이기
- §8 입력 검증 · `.env` — 비밀키(`JWT_SECRET` 등)는 서버 env만
- §10 Spring — Security Filter · JWT 설정이 이 미들웨어·토큰 검증에 대응
