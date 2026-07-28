# Roadmap — 백엔드

전체 목록: `docs/roadmap.md`  
선행: `docs/frontend/roadmap.md` (0~4 완료 권장)

## 방향

HTTP·자원 모델·명세를 **서버가 받아서 처리하는 쪽**으로 옮긴다.

지금까지는 **React → Supabase(Data API) → PostgreSQL** 이었다.  
이후에는 **React → 내 Express 서버 → (메모리 → DB)** 를 직접 만든다.

```
[프론트 완료]  fetch로 API 호출 · 명세 읽기
       │
       ▼
[백엔드]  요청 받기 → 처리 → JSON 응답
       │
       ├─ 기초 (1~6)  Express · CORS · DB · 구조
       └─ 고급 (7~10) 인증 · 검증 · 명세 · 배포 · Spring 연결
```

> **스택:** 이 프로젝트 학습용은 **Node.js + Express** (React와 같은 JS, yarn).  
> **실무:** 회사는 Spring 등이어도 HTTP·레이어·명세 개념은 같다. §10에서 대응한다.

선행 자료: `docs/frontend/fundamentals.md` · `docs/frontend/http-advanced.md` · `docs/frontend/http-resource-model.md` · `docs/frontend/api-spec.md`

---

## 1. 관점 전환 — 서버의 역할

자료: `docs/backend/backend-basics.md`

프론트에서 보던 HTTP 한 바퀴를 **서버 쪽**에서 본다.

- [x] 서버 = `listen` → 요청 **받기** → 처리 → `res.json()` **보내기**
- [x] Supabase Data API vs 자기 서버 — **역할 차이** (DB+API 합쳐짐 vs 로직을 내가 씀)
- [x] `req` / `res`가 3단계의 요청·응답과 **같은 규약**임을 이해

### 실습

- [x] `GET /health` → `{ "ok": true }` 서버 띄우기 (`server/index.js`)
- [x] 터미널·브라우저·curl로 응답 확인

---

## 2. Express 최소 API

자료: `docs/backend/express-min-api.md`

명세(`docs/frontend/api-spec.yaml`)에 적었던 것을 **코드로 구현**한다.  
§1에서 `express` 설치 · `app.listen` · `/health`는 이미 했다.

- [x] `express` 설치 · `app.listen` (§1에서 완료)
- [x] `app.get` / `app.post` / `app.patch` / `app.delete`
- [x] `req.query` · `req.params` · `req.body`
- [x] `express.json()` — POST body 파싱
- [x] `res.status(201).json(...)` — status + JSON 응답

### 실습

- [x] `todos` CRUD를 **메모리 배열**로 구현 (`server/index.js`)
- [x] React `fetch` URL을 `localhost` 서버로 바꿔 연동 (`src/pages/backend/cors/` — §3)

---

## 3. CORS

자료: `docs/backend/cors.md`

프론트(Vite `5173`)와 서버(다른 포트)가 다를 때 브라우저가 막는 문제.

- [x] CORS가 **브라우저 규칙**임을 이해 (서버끼리 통신과 다름)
- [x] `cors` 미들웨어로 개발 환경 연동

### 실습

- [x] React에서 자기 Express 서버 `todos` 호출 성공 (`src/pages/backend/cors/TodoList.jsx`)
- [x] Network 탭에서 요청·응답이 Supabase 때와 **같은 구조**인지 확인

---

## 4. status · 에러 응답

자료: `docs/backend/status-error.md`

2단계에서 **받던** status를 이번엔 **보내는** 쪽에서 직접 다룬다.

- [x] 성공: `200`, `201`
- [x] 클라이언트 오류: `400`, `404`
- [x] 서버 오류: `500` (개념 — 실습은 선택)
- [x] id 없음 · body 누락 등 **케이스별** 응답

### 실습

- [x] todos API에서 위 status를 상황에 맞게 반환 (`400` 추가, `404`/`201` 등 기존)
- [x] 프론트에서 `response.ok` / `response.status`로 분기 (`src/pages/backend/status/PostTodo.jsx`)

---

## 5. DB 연결

자료: `docs/backend/db-connect.md`

메모리 다음. Supabase(PostgreSQL)를 이미 쓰고 있으므로 둘 중 하나로 진행.

| 방식 | 설명 |
| ---- | ---- |
| **A. `pg` + Supabase PostgreSQL** | DB는 하나, “클라이언트 직접” vs “서버 경유” 비교에 좋음 ✅ 선택 |
| **B. SQLite (로컬)** | 설정 단순, SQL 연습용 |

- [x] SQL 기초 — SELECT / INSERT / UPDATE / DELETE
- [x] Express에서 DB 쿼리 후 JSON 응답
- [x] Supabase 직연동 vs 자기 서버 경유 — **역할 차이** 한 줄로 설명

### 실습

- [x] todos CRUD가 **DB에 반영**되게 (`server/index.js`, 참고: `server/examples/02-memory-todos.js`)
- [x] 프론트 Express 연동 페이지로 목록·POST 확인

---

## 6. 폴더 구조 (레이어)

자료: `docs/backend/folder-structure.md`

한 파일에 몰아넣지 않고 나눈다. 실무 Spring과 같은 **층** 개념.

```
routes/       → URL + method (명세 endpoint)
controllers/  → req 받아 res 보내기
services/     → 비즈니스 로직
(db/)         → 쿼리
```

- [x] 라우트 · 컨트롤러 역할 구분 · 분리
- [x] db 분리 (`pool` · SQL)
- [ ] **services 분리** — 이론만 봄. 실습에서 파일로 안 나눔  
  (지금: `controller` → `db` 직호출. 나중에 끼우기)

### 실습 결과

- [x] `server/db/` · `server/controllers/` · `server/routes/` · 얇은 `index.js`
- [ ] `server/services/` — **미완료** (보류)

---

## 7. 인증 (고급)

자료: `docs/backend/auth.md`

- [x] 왜 필요한가 — “누가” 요청했는지
- [x] JWT · Bearer 헤더 (`Authorization`)
- [x] 쿠키 · 세션 — 개념만 (회사 방식에 따라 다름)

### 실습

- [x] 로그인 API → 토큰 발급 → todos는 토큰 있을 때만
  - `middleware/auth.js` · `routes/auth.js` · todos에 `requireAuth`
  - 프론트: `src/pages/backend/auth/TodoList.jsx` (Bearer)
  - cors TodoList는 헤더 없음 버전으로 보존

---

## 8. 입력 검증 · 환경 설정

자료: `docs/backend/validation-env.md`

### 검증

- [x] body 필드 누락 · 잘못된 타입 → `400`
- [x] `req.body`를 그대로 쓰지 않기 (DTO 느낌)

### 환경

- [x] 서버용 `.env` — `PORT`, `DATABASE_URL` 등
- [x] 프론트 `VITE_*`와 **분리** (서버 비밀키는 브라우저에 노출 금지)

---

## 9. API 설계 · 문서

자료: `docs/backend/api-design.md` · `docs/backend/api-design.yaml`

- [x] REST URL 설계 — `/todos/:id` vs `?id=eq.1` 정리
- [x] 에러 응답 형식 통일 — 예: `{ "error": "..." }`
- [x] Express 기준 명세 작성 — `docs/backend/api-design.yaml`  
  (프론트 `api-spec.yaml`은 Supabase 학습용으로 유지)
- [ ] (선택) Swagger UI — 생략

---

## 10. 배포 · Spring 연결 — 생략

### 배포

- [x] 프로세스 실행 — `yarn server` (`node`)로 기동 (개발 중 계속 사용)
- [x] `/health` 헬스체크 — §1부터 존재 · 확인 완료
- [ ] PM2 맛보기 — **생략**

### 실무 Spring 대응 — 생략

참고용 대응표 (진행하지 않음):

| Express | Spring |
| -------------- | ------------- |
| `routes` | `@GetMapping` / `@PostMapping` Controller |
| `controllers` | Controller 메서드 |
| `services` | `@Service` |
| DB 쿼리 | Repository / Mapper |
| `req.body` | `@RequestBody` DTO |
| `req.params` | `@PathVariable` |
| 명세 한 행 | endpoint 정의 |

- [ ] (선택) 회사 API 명세 한 개를 위 표로 **대응**해 보기 — **생략**

---

## 마무리 목표 (기초 1~6)

- [x] React가 **자기 Express 서버**로 todos CRUD
- [x] status · JSON 응답을 서버에서 통제
- [x] DB에 반영 · 폴더 구조로 정리
- [x] Supabase 직연동 vs 자기 서버 — 차이 설명 가능

> **백엔드 본편 완료 · 이 저장소 로드맵 종료.**  
> 보류·생략: §6 `services/` · §9 Swagger · §10 PM2 · §10 Spring  
> 다음 단계(별도 repo): TypeScript 프론트 보강 → (추후) `try-backend-next`

---

## 지금은 미루는 것

- Docker · Kubernetes
- GraphQL · gRPC
- 마이크로서비스
- Spring Boot / Express↔Spring 대응 (§10 생략)
- ORM 전부 (Prisma 등) — raw SQL 먼저
- §6 `services/` 레이어 분리 (나중에 끼우기)
