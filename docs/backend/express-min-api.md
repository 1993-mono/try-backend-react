# Express 최소 API

명세(`docs/frontend/api-spec.yaml`)에 적었던 todos CRUD를 **Express 코드**로 구현하는 단계.

선행: `docs/backend/backend-basics.md` §1  
실습 코드: `server/index.js` · 참고 스냅샷 `server/examples/01-health.js`  
로드맵: `docs/backend/roadmap.md` §2

---

## 한눈에 정리

| 주제             | 한 줄                                                                       |
| ---------------- | --------------------------------------------------------------------------- |
| **라우트**       | `app.get` / `post` / `patch` / `delete` — URL + method에 맞는 처리 **등록** |
| **미들웨어**     | `app.use` — 요청이 라우트에 도달하기 **전**에 공통 처리                     |
| `express.json()` | 요청 body(JSON 문자열) → `req.body`(객체)                                   |
| `res.json()`     | 객체 → 응답 body(JSON 문자열)                                               |
| `listen`         | 포트를 열고 요청 **받기 시작** (가게 문 열기)                               |
| **메모리 DB**    | 배열 변수 — 서버 끄면 초기화 (DB 연결 전 연습용)                            |

파일 실행 순서 (위 → 아래):

```
미들웨어 등록 → 라우트 등록 → app.listen (맨 아래)
```

---

## 1. 미들웨어 — `app.use(express.json())`

```js
app.use(express.json());
```

|                  | 설명                                                     |
| ---------------- | -------------------------------------------------------- |
| `app.use`        | 들어오는 **모든** 요청마다 거쳐 갈 처리 등록             |
| `express.json()` | Express가 주는 **요청 JSON 파서** 미들웨어를 만들어 끼움 |

요청이 오면:

```text
요청 → [express.json()] → [해당 라우트 핸들러] → 응답
```

### `express.json()` vs `res.json()`

이름에 `json`이 같을 뿐, **다른 함수**다.

| API                         | 방향          | 구간                       |
| --------------------------- | ------------- | -------------------------- |
| `express.json()`            | 문자열 → 객체 | **요청** body → `req.body` |
| `res.json(객체)`            | 객체 → 문자열 | **응답** body              |
| `response.json()` (프론트)  | 문자열 → 객체 | fetch **응답**             |
| `JSON.stringify()` (프론트) | 객체 → 문자열 | fetch **요청** body        |

HTTP 위에는 JSON **문자열**만 오간다. 코드 안에서는 **객체**로 다루기 위해 경계에서 변환한다.

### 없으면 어떻게 되나?

|              | `app.use(express.json())` 없을 때     |
| ------------ | ------------------------------------- |
| `req.body`   | `undefined` — POST·PATCH body 못 읽음 |
| `res.json()` | **그대로 동작** (응답 보내기와 무관)  |
| GET `/todos` | body 없어서 보통 문제 없음            |

method / path / query / headers는 JSON body가 아니다. Express가 `req.method`, `req.params`, `req.query`, `req.headers`로 따로 나눠 준다.

---

## 2. 라우트 — `app.get` / `post` / `patch` / `delete`

URL + HTTP method에 맞으면 **등록해 둔 함수**가 실행된다.

```js
app.get('/todos', (req, res) => { ... })
app.get('/todos/:id', (req, res) => { ... })
app.post('/todos', (req, res) => { ... })
app.patch('/todos/:id', (req, res) => { ... })
app.delete('/todos/:id', (req, res) => { ... })
```

| 실습 API | method | URL          | 읽는 곳                   | 응답                      |
| -------- | ------ | ------------ | ------------------------- | ------------------------- |
| health   | GET    | `/health`    | —                         | `200` + `{ ok: true }`    |
| 목록     | GET    | `/todos`     | —                         | `200` + 배열              |
| 단건     | GET    | `/todos/:id` | `req.params.id`           | `200` + 객체 / `404`      |
| 생성     | POST   | `/todos`     | `req.body`                | `201` + 생성 객체         |
| 수정     | PATCH  | `/todos/:id` | `req.params` + `req.body` | `200` + 객체 / `404`      |
| 삭제     | DELETE | `/todos/:id` | `req.params.id`           | `204` (body 없음) / `404` |

Supabase 때는 `?id=eq.1` 쿼리였다. Express 학습용으로 **REST 스타일** `/todos/:id`를 쓴다.

### `req.params.id`와 `Number()`

URL의 `:id`는 **항상 문자열**로 온다.

```text
GET /todos/1  →  req.params.id === "1"
배열의 id     →  1 (숫자)
```

`"1" === 1`은 `false`이므로 비교 전에 맞춰 준다.

```js
const id = Number(req.params.id); // "1" → 1
```

정수만 필요할 때는 `parseInt(req.params.id, 10)`도 자주 쓴다.

---

## 3. 응답 — `res` 메서드

`res` = **response** 줄임말. 응답을 채워 보낼 때 쓴다.

### 지금 단계에서 쓰는 것

| 메서드                        | 역할                                |
| ----------------------------- | ----------------------------------- |
| `res.status(404)`             | status 코드 설정 (기본 `200`)       |
| `res.json(객체)`              | 객체 → JSON 응답 body               |
| `res.send()`                  | 범용 전송. body 없이 끝낼 때도 사용 |
| `res.status(코드).json(객체)` | status + JSON body 한 번에          |
| `res.status(204).send()`      | 성공, **body 없음** (DELETE 등)     |

```js
// 404 — status + JSON body
return res.status(404).json({ error: "not found" });

// 201 — 생성 성공
res.status(201).json(todo);

// 204 — 삭제 성공, body 없음
res.status(204).send();
```

`return`은 핸들러를 **여기서 끝**내서, 아래 `res.json(todo)`가 또 실행되지 않게 한다.

### `/health` 예시

```js
app.get("/health", (req, res) => {
    res.json({ ok: true });
});
```

- `{ ok: true }` — 코드에 적은 **JS 객체** (DB에서 꺼낸 JSON이 아님)
- `res.json(객체)` — 객체를 JSON 문자열로 바꿔 **응답 body**에 실음
- 응답 전체 = status `200` + headers + body `{ "ok": true }`

### 나중에 볼 것

| 메서드                  | 용도                                     |
| ----------------------- | ---------------------------------------- |
| `res.sendStatus(404)`   | status + 기본 문구 (body 커스텀 없을 때) |
| `res.set('키', '값')`   | 응답 헤더                                |
| `res.redirect(url)`     | 다른 URL로 보내기                        |
| `res.sendFile(path)`    | 파일 응답                                |
| `res.cookie(name, val)` | 쿠키                                     |

---

## 4. CRUD 처리 흐름 (`server/index.js`)

### 메모리 DB

```js
let nextId = 3
const todos = [ ... ]
```

- 서버 프로세스 **안**의 배열 — DB 파일이 아님
- `yarn server` 끄면 **초기화**
- 나중 §5에서 DB 연결로 교체

### POST — 생성

```js
const todo = {
    id: nextId++,
    title: req.body.title,
    completed: req.body.completed ?? false,
    user_id: req.body.user_id ?? 1,
};
todos.push(todo);
res.status(201).json(todo);
```

`express.json()`이 있어야 `req.body.title` 등을 읽을 수 있다.

### PATCH — 일부 수정

```js
if (req.body.title !== undefined) todo.title = req.body.title;
if (req.body.completed !== undefined) todo.completed = req.body.completed;
```

보낸 필드만 갱신한다.

### DELETE — 삭제

```js
todos.splice(index, 1); // 배열에서 1개 제거
res.status(204).send(); // No Content — 성공, body 없음
```

---

## 5. `app.listen` — 맨 아래에 두는 이유

```js
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
```

|                        | 설명                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `listen`               | 지정 포트에서 요청 **대기 시작** (가게 문 열기)               |
| **콜백** `console.log` | listen **성공 시 한 번만** — “준비 완료” 로그 (요청마다 아님) |
| **맨 아래**            | 위에서 라우트 **등록(준비)** 을 끝낸 뒤 **개점**              |

```
위쪽 get/post … = 진열·메뉴 준비 (등록만, 아직 손님 안 받음)
listen           = 문 열고 손님 받기 시작
```

`listen`이 없으면 `yarn server`해도 포트가 안 열려 curl/브라우저 **연결 거부**다.  
라우트만 있고 `listen`이 없으면 “메뉴판은 있는데 문은 안 연” 상태다.

Vite와 달리 포트가 막혀 있으면 **자동으로 다음 포트로 안 옮기고** 보통 에러(`EADDRINUSE`)로 실패한다.

코드 수정 후에는 `Ctrl+C` → `yarn server`로 **재시작**해야 반영된다.

---

## 6. 테스트

상세 curl 옵션·명령어: `docs/backend/backend-basics.md` §4 curl 절  
치트시트: `server/index.js` 하단 주석

| 방법         | 언제                                            |
| ------------ | ----------------------------------------------- |
| **curl**     | 기본 — 터미널에서 API 점검                      |
| **브라우저** | GET만 (`/health`, `/todos`)                     |
| **React**    | §3 CORS 이후 — `src/pages/backend/cors/` |

터미널 2개:

1. `yarn server` — 서버 켜 둠
2. 다른 터미널에서 `curl ...` — 복붙·`↑` 히스토리 활용

---

## 다음

- `docs/backend/cors.md` (로드맵 §3) — React(`5173`) ↔ Express(`3000`) 브라우저 연동
- §4 status · 에러 응답 — 이미 일부 사용 중 (`201`, `404`, `204`)
