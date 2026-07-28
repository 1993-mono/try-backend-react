# API 설계 · 문서 — 자기 서버 기준으로 맞추기

프론트 §4에서 명세를 **Supabase Data API** 기준으로 적었다.  
백엔드 §2~8에서 **Express 서버**를 만들었으니, 이번엔 명세를 **지금 돌아가는 서버**와 맞춘다.

1. **URL 설계** — 쿼리 필터 vs 경로 파라미터
2. **에러 형식** — `{ "error": "..." }` 로 통일했는지 점검
3. **명세 수정** — `api-spec.yaml`을 Express 기준으로 고침
4. **(선택)** Swagger UI로 브라우저에서 호출

선행: `docs/frontend/api-spec.md` · `docs/backend/status-error.md` · `docs/backend/auth.md`  
실습 코드: `server/routes/todos.js` · `server/routes/auth.js` · `server/controllers/todosController.js`  
명세: `docs/frontend/api-spec.yaml`  
로드맵: `docs/backend/roadmap.md` §9

---

## 한눈에 정리

| 주제 | 한 줄 |
|------|--------|
| **API 설계** | URL · method · status · body 규칙을 **일관되게** 정하는 것 |
| **명세** | 그 규칙을 **문서로 고정**한 계약 (YAML / 표 / Swagger) |
| **경로 파라미터** | `/todos/:id` — id가 **URL 경로**에 있음 (이 서버) |
| **쿼리 필터** | `/todos?id=eq.1` — id가 **쿼리**에 있음 (Supabase PostgREST) |
| **에러 body** | 실패 시 이유 — 이 프로젝트는 `{ "error": "문자열" }` |
| **servers.url** | 명세가 가리키는 **베이스 URL** — 이제 `http://localhost:3000` |

```
[프론트 §4]  api-spec.yaml  ← Supabase REST
                    │
                    ▼  §9
[백엔드]     같은 파일     ← Express (자기 서버)
                    │
                    ▼
         프론트·백엔드가 같은 약속을 봄
```

---

## 1. 왜 다시 명세를 고치나

명세 ≠ 구현이다. 둘은 **맞춰 가야** 한다.

| | 프론트 §4 때 | 지금 |
|--|-------------|------|
| 실제 API | Supabase Data API | Express (`localhost:3000`) |
| 단건 조회 | `GET /todos?id=eq.1` | `GET /todos/1` |
| 인증 | `apikey` · `Authorization` (anon) | `Authorization: Bearer <JWT>` |
| 로그인 | 없음 (또는 Supabase Auth) | `POST /login` → `{ token }` |

코드는 이미 Express다.  
문서만 예전(Supabase)을 가리키면 **계약이 거짓말**이 된다.

한 줄:

> 서버를 바꿨으면 **명세의 servers · paths · 헤더**도 같이 바꾼다.

---

## 2. REST URL 설계 — `/todos/:id` vs `?id=eq.1`

### 같은 자원, 다른 표기

| 동작 | Supabase (PostgREST) | Express (이 프로젝트) |
|------|----------------------|------------------------|
| 목록 | `GET /todos` | `GET /todos` |
| 단건 | `GET /todos?id=eq.1` | `GET /todos/:id` |
| 생성 | `POST /todos` | `POST /todos` |
| 수정 | `PATCH /todos?id=eq.1` | `PATCH /todos/:id` |
| 삭제 | `DELETE /todos?id=eq.1` | `DELETE /todos/:id` |

### 왜 Express는 path를 쓰나

| 방식 | 예 | 특징 |
|------|-----|------|
| **경로 파라미터** | `/todos/1` | “**이 id의 자원**”이 URL에 드러남. REST에서 흔함 |
| **쿼리 필터** | `/todos?id=eq.1` | DB 필터 문법. PostgREST가 **테이블=엔드포인트**로 쓰는 방식 |

Express 라우트:

```js
// server/routes/todos.js
router.get('/', ...)       // 목록
router.get('/:id', ...)    // 단건 — req.params.id
router.patch('/:id', ...)
router.delete('/:id', ...)
```

`req.params.id` ← 경로의 `:id`  
`req.query.id` ← `?id=...` (이 서버 단건 API에서는 안 씀)

한 줄:

> 이 프로젝트의 “단건·수정·삭제”는 **경로에 id**를 둔다.  
> Supabase 때 쓰던 `?id=eq.1` 은 **더 이상 이 서버의 계약이 아니다.**

### 로그인 URL

| | |
|--|--|
| method · path | `POST /login` |
| body | `{ "username", "password" }` |
| 성공 | `{ "token": "..." }` |
| 실패 | `400` / `401` + `{ "error": "..." }` |

todos와 달리 **컬렉션 REST**가 아니라 **인증 액션**에 가깝다.  
실무에서도 `/login`, `/auth/login`처럼 **동사·인증 전용 경로**를 자주 쓴다.

---

## 3. 에러 응답 형식 통일

§4에서 정한 패턴을 §9에서 **명세에도** 박아 둔다.

### 이 프로젝트 규칙

```json
{ "error": "사람이 읽을 수 있는 이유" }
```

| status | 언제 (예시) | error 예 |
|--------|-------------|----------|
| `400` | body 누락 · 타입 오류 | `title must be a non-empty string` |
| `401` | 토큰 없음 · 로그인 실패 | `unauthorized` / `invalid credentials` |
| `404` | 해당 id 없음 | `not found` |
| `500` | DB 등 서버 내부 | `db error` |

성공 시:

| status | body |
|--------|------|
| `200` | todo 객체 또는 배열 · 로그인 시 `{ token }` |
| `201` | 생성된 todo |
| `204` | **없음** (`DELETE` — `res.status(204).send()`) |

한 줄:

> 실패는 **항상** `{ "error": "..." }` 형태를 유지한다.  
> 프론트는 `response.ok`로 분기한 뒤 `data.error`만 보면 된다.

### 점검 포인트

컨트롤러·미들웨어를 훑어 볼 때:

- [ ] `res.status(4xx|5xx).json(...)` 안에 **다른 키**만 쓰인 곳이 없는지 (`message`, `msg` 혼용 금지)
- [ ] 성공 응답에 `error` 필드를 섞지 않는지
- [ ] `204`는 body를 안 보내는지

이미 §7·§8에서 대체로 맞춰 두었다면, 이번엔 **“맞다”고 확인**하고 명세에 적으면 된다.

---

## 4. `api-spec.yaml`을 Express 기준으로 수정

대상 파일: `docs/frontend/api-spec.yaml`  
(위치는 frontend 폴더에 있어도 된다. **내용**이 자기 서버를 가리키면 됨.)

### 바꿔야 할 핵심

#### (1) `servers`

```yaml
# 변경 전 (Supabase)
servers:
  - url: https://....supabase.co/rest/v1

# 변경 후 (Express)
servers:
  - url: http://localhost:3000
```

#### (2) paths — 단건을 `/todos/{id}` 로

OpenAPI에서 경로 파라미터는 `{id}` 표기.

```yaml
paths:
  /todos:
    get:    # 목록
    post:   # 생성
  /todos/{id}:
    get:    # 단건
    patch:  # 수정
    delete: # 삭제
  /login:
    post:   # 토큰 발급
```

`parameters`의 `id`는 `in: query`가 아니라:

```yaml
parameters:
  - name: id
    in: path
    required: true
    schema:
      type: integer
```

#### (3) 보안 — Bearer JWT

todos는 `requireAuth`가 있다. 명세에도 적는다.

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
    Todo:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        completed:
          type: boolean
        user_id:
          type: integer
```

`/todos` · `/todos/{id}` 에:

```yaml
security:
  - bearerAuth: []
```

`/login`에는 security를 두지 않는다 (로그인 전에 토큰이 없음).

#### (4) 에러 응답을 responses에 명시

예: `400` / `401` / `404` / `500`

```yaml
"400":
  description: 잘못된 요청
  content:
    application/json:
      schema:
        $ref: "#/components/schemas/Error"
```

### 최소로 넣을 endpoint 목록

| method | path | 인증 | 성공 status |
|--------|------|------|-------------|
| `GET` | `/health` | 없음 | `200` `{ ok: true }` |
| `POST` | `/login` | 없음 | `200` `{ token }` |
| `GET` | `/todos` | Bearer | `200` Todo[] |
| `GET` | `/todos/{id}` | Bearer | `200` Todo |
| `POST` | `/todos` | Bearer | `201` Todo |
| `PATCH` | `/todos/{id}` | Bearer | `200` Todo |
| `DELETE` | `/todos/{id}` | Bearer | `204` |

프론트 §4 YAML이 짧다면, 위 표만큼 **채워 넣는** 것이 이번 실습이다.  
완벽보다 **자기 서버와 어긋나지 않는 것**이 목표다.

### 수정 순서 (추천)

1. `servers.url` → `http://localhost:3000`
2. `/todos/{id}` path 분리 · query `id=eq.` 삭제
3. `components.schemas` · `Error` · `Todo` · `securitySchemes`
4. `/login` · `/health` 추가
5. 각 연산에 `401` / `400` / `404` 등 실제 보내는 status 반영
6. (선택) Swagger Editor / Swagger UI로 YAML 문법 검증

---

## 5. (선택) Swagger UI

YAML을 브라우저에서 보고 **Try it out**으로 호출하려면:

```bash
yarn add swagger-ui-express yaml
```

개념만:

```js
// 예시 — 그대로 복붙 전에 패키지·경로 맞출 것
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import YAML from 'yaml'

const spec = YAML.parse(fs.readFileSync('./docs/frontend/api-spec.yaml', 'utf8'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec))
```

- 서버 띄운 뒤 `http://localhost:3000/api-docs`
- Authorize에 Bearer 토큰 넣고 todos 호출

필수는 아니다. YAML만 맞춰도 §9 핵심은 달성이다.

---

## 6. 실습 체크

### URL · 에러

- [x] Supabase `?id=eq.` 와 Express `/todos/:id` 차이를 한 줄로 설명 가능
- [ ] 컨트롤러·미들웨어 에러 body가 모두 `{ error: "..." }` 인지 확인
- [ ] curl로 `400` / `401` / `404` body 형태 확인

### 명세

- [ ] `servers.url`이 `http://localhost:3000`
- [ ] `/todos/{id}` · `/login` · (선택) `/health` 반영
- [ ] Bearer security 명시 (todos)
- [ ] `Error` 스키마로 4xx/5xx 응답 연결
- [ ] YAML이 서버 실제 동작과 **어긋나지 않는지** 눈으로 대조

### curl 예시

```bash
# 로그인
curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'

# 목록 (토큰 필요)
curl -s http://localhost:3000/todos \
  -H "Authorization: Bearer <토큰>"

# 단건 — path id (쿼리 id=eq. 아님)
curl -s http://localhost:3000/todos/1 \
  -H "Authorization: Bearer <토큰>"
```

---

## 7. Spring과 대응 (미리 보기)

| Express · OpenAPI (이 단계) | Spring (실무) |
|-----------------------------|---------------|
| `paths` · method | `@GetMapping` / `@PostMapping` 등 |
| `/todos/{id}` | `@PathVariable` |
| `components.schemas` | DTO / 응답 타입 |
| `securitySchemes` bearer | Security config · JWT 필터 |
| `api-spec.yaml` | springdoc · Swagger 등 |

명세 한 행 = endpoint 정의. §10에서 다시 본다.

---

## 다음에

명세가 자기 서버와 맞으면 §10 — 배포 맛보기 · Express ↔ Spring 대응표로 실무와 연결한다.  
(§9 실습: `docs/backend/api-design.yaml` 작성 완료 · Swagger UI는 선택·생략 가능)
