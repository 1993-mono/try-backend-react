# 폴더 구조 (레이어)

`server/index.js` 한 파일에 몰아 둔 코드를  
**역할별로 나눠** 두는 단계. 동작(URL·JSON·DB)은 같고, **어디에 무엇을 쓰느냐**만 정리한다.

선행: `docs/backend/db-connect.md`  
실습 코드: `server/index.js` (리팩터 대상) · 참고 `server/examples/02-memory-todos.js`  
로드맵: `docs/backend/roadmap.md` §6

---

## 한눈에 정리

| 층               | 한 줄                                      | 지금 `index.js`에서 |
| ---------------- | ------------------------------------------ | ------------------- |
| **routes**       | URL + method를 **어느 함수에** 넘길지 등록 | `app.get('/todos', …)` |
| **controllers**  | `req` 읽고 `res`로 응답 (status · JSON)    | 핸들러 안의 `res.json` · `400`/`404` |
| **services**     | “할 일” 규칙 · 흐름 (비즈니스 로직)        | title 없으면 거절, PATCH 병합 등 |
| **db**           | SQL · `pool.query`                         | `pool.query('select …')` |
| **app / index**  | 미들웨어 · 라우트 조립 · `listen`          | `cors` · `express.json` · `listen` |

```
요청
  → routes        (이 URL이면 이 컨트롤러)
  → controllers   (검증·status·JSON)
  → services      (무슨 일을 할지)
  → db            (SQL 실행)
  ← 다시 위로 올라가며 JSON 응답
```

---

## 1. 왜 나누나

지금은 한 파일에 **다** 있다.

- 포트·미들웨어
- `/todos` URL 등록
- status · 에러 body
- “title 없으면 400”
- `pool.query(...)`

동작에는 문제 없다.  
다만 파일이 커지면:

| 문제                         | 나누면                          |
| ---------------------------- | ------------------------------- |
| URL만 찾고 싶은데 SQL까지 섞임 | routes만 보면 endpoint 목록이 보임 |
| status 규칙을 바꾸려면 쿼리 근처를 뒤짐 | controllers만 고침              |
| DB만 바꾸고 싶은데 응답 코드와 붙음 | db / services만 손댐             |
| Spring 코드와 대응이 안 보임     | 층 이름이 실무와 비슷해짐       |

핵심:

> **기능은 그대로, 자리를 나눈다.**  
> 프론트가 보는 `localhost:3000/todos`는 바뀌지 않는다.

---

## 2. 각 층이 하는 일

### 2-1. routes — “어디로 들어오나”

명세의 endpoint에 가깝다.

```js
// 예: routes/todos.js
router.get('/', listTodos)
router.get('/:id', getTodo)
router.post('/', createTodo)
router.patch('/:id', updateTodo)
router.delete('/:id', deleteTodo)
```

| 하는 일                         | 안 하는 일                    |
| ------------------------------- | ----------------------------- |
| method + path ↔ 핸들러 연결     | SQL 쓰기                      |
| `app.use('/todos', todosRouter)` | `res.status` 세세히 정하기(보통) |

### 2-2. controllers — “요청·응답 창구”

Express의 `req` / `res`를 **직접** 만지는 층.

```js
// 예: controllers/todosController.js (개념)
export async function createTodo(req, res) {
  // body 확인 → service 호출 → status + json
}
```

| 하는 일                              | 안 하는 일           |
| ------------------------------------ | -------------------- |
| `req.params` · `req.body` 꺼내기     | SQL 문자열 직접 쓰기 |
| `400` / `404` / `201` 등 status 정하기 | DB 연결 풀 만들기    |
| `res.json(...)` / `res.status(204)`  | “업무 규칙” 길게 두기 |

### 2-3. services — “무슨 일을 할지”

HTTP를 몰라도 되는 **업무 흐름**.

예:

- title이 없으면 “만들 수 없음”이라고 알려 주기
- PATCH면 기존 값과 새 값을 합치기
- “없는 id면 없다”고 판단하기

| 하는 일                    | 안 하는 일        |
| -------------------------- | ----------------- |
| 규칙 · 흐름 결정           | `res.json` 호출   |
| db 함수를 호출해 데이터 얻기 | `app.get` 등록    |

컨트롤러는 service 결과를 보고 status만 고르면 된다.

### 2-4. db — “SQL만”

```js
// 예: db/todos.js (개념)
export function findAll() {
  return pool.query('select ... from todos order by id')
}
```

| 하는 일                | 안 하는 일          |
| ---------------------- | ------------------- |
| `pool` · `query` · SQL | status 코드         |
| `$1` 파라미터 넘기기   | “title 필수” 같은 규칙 |

### 2-5. index (또는 app) — “조립”

```
dotenv · cors · express.json
  → /todos 라우트 붙이기
  → /health
  → listen
```

서버를 **켜는 자리**. CRUD 상세는 여기 두지 않는다.

---

## 3. 요청 한 방의 흐름 (예: POST /todos)

```
브라우저  POST /todos  { "title": "장보기" }
        │
        ▼
[routes]     post '/'  →  createTodo 컨트롤러
        │
        ▼
[controller] title 없으면 400
             있으면 service.create(...)
        │
        ▼
[service]    user_id 기본값 등 정리 후 db.insert(...)
        │
        ▼
[db]         insert ... returning ...
        │
        ▼
[controller] 201 + JSON
        │
        ▼
브라우저
```

지금 `index.js`의 `app.post('/todos', async (req, res) => { ... })` 안에는  
위 화살표가 **한 함수 안에 전부** 들어 있다.  
§6은 그걸 **파일(층)으로 쪼개는** 일이다.

---

## 4. 지금 `index.js`를 층에 대응하면

| `index.js`에 있는 것              | 옮길 층        |
| --------------------------------- | -------------- |
| `new pg.Pool(...)`                | db             |
| `select` / `insert` / `update` / `delete` | db    |
| title 없으면 `400`                | controller (또는 service가 던지고 controller가 status) |
| 없는 id → `404`                   | 同上           |
| `res.status(201).json(...)`       | controller     |
| `app.get('/todos', ...)`          | routes         |
| `app.use(cors())` · `listen`      | index          |

완벽한 경계는 팀마다 조금 다르다.  
이 프로젝트에서는 위를 **기본 규칙**으로 쓴다.

---

## 5. Spring과의 대응 (미리 보기)

회사 코드 읽을 때 같은 **층**이다.

| 이 프로젝트 (Express) | Spring (실무)              |
| --------------------- | -------------------------- |
| routes                | `@GetMapping` / `@PostMapping` 등 URL 매핑 |
| controllers           | Controller 메서드          |
| services              | `@Service`                 |
| db (쿼리)             | Repository / Mapper        |
| `req.body`            | `@RequestBody` DTO         |
| `req.params.id`       | `@PathVariable`            |

이름은 달라도 **“URL → 창구 → 업무 → DB”** 순서는 같다.

---

## 6. 헷갈리기 쉬운 점

| 오해 | 실제 |
| ---- | ---- |
| “폴더를 나누면 API가 바뀐다” | **URL·응답은 그대로.** 서버 안 정리만. |
| “service 없이 controller에 SQL 둬도 되지 않나?” | 작은 예제는 가능. 다만 층 연습을 위해 **db는 분리**한다. |
| “routes와 controllers를 꼭 파일로 나눠야 하나?” | 이 단계에서는 **나눈다.** 역할이 다르다는 걸 체감하기 위해서. |
| “한 번에 완벽한 구조” | 목표 아님. todos CRUD만 위 네 층으로 옮기면 충분. |

---

## 7. 실습에서 만들 목표 구조

이론은 여기까지. 실습에서는 대략 이런 모양을 만든다.

```
server/
  index.js                 ← 조립 · listen
  db/
    pool.js                ← Pool 한 곳
    todos.js               ← SQL 함수들
  services/
    todosService.js
  controllers/
    todosController.js
  routes/
    todos.js
    health.js              ← (선택) /health
  examples/
    02-memory-todos.js     ← 예전 참고 (그대로)
```

실습 순서 (예정):

1. `db/pool.js` · `db/todos.js` 분리
2. `services/todosService.js`
3. `controllers/todosController.js`
4. `routes/todos.js` 연결
5. `index.js`는 조립만
6. 프론트·curl로 CRUD 동일 확인

---

## 다음에 연결

- §7 인증 — “누가” 요청했는지 (레이어 위에 미들웨어가 붙는 그림)
- §8 검증 · `.env` — controller/service 경계에서 입력 검사 강화
- §10 Spring — 이 문서 §5 표를 회사 코드에 대조
