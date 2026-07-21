import express from 'express'

const app = express()
const PORT = 3000

// app.use = 들어오는 요청마다 거쳐 갈 미들웨어 등록
// express.json() = 요청 body(JSON 문자열) → req.body(객체)로 파싱해 줌
// res.json()과는 다른 함수. JSON 변환이 필요한 구간은 사실상:
//   - 요청 body → req.body (express.json)
//   - 객체 → 응답 body (res.json)
// 이게 없으면: req.body를 못 씀 (POST·PATCH). res.json()으로 응답 보내는 건 가능.
app.use(express.json())

// 메모리 DB (서버 끄면 초기화됨)
let nextId = 3
const todos = [
  { id: 1, title: '공부하기', completed: false, user_id: 1 },
  { id: 2, title: '운동하기', completed: true, user_id: 1 },
]

// GET /health — 요청 body 없음 → express.json()과 무관
// { ok: true } 는 코드에 적은 JS 객체
// res.json(객체) = 객체를 JSON 문자열로 바꿔 응답 body에 실어 보냄
//
// .json 이름 정리 (같은 단어, 다른 함수)
// - express.json()     : 문자열 → 객체 (백엔드, 요청 body → req.body)
// - res.json()         : 객체 → 문자열 (백엔드, 응답 body)
// - response.json()    : 문자열 → 객체 (프론트, fetch 응답)
// - JSON.stringify()   : 객체 → 문자열 (주로 프론트, 요청 body 만들 때)
app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// 목록 — GET /todos
app.get('/todos', (req, res) => {
  res.json(todos)
})

// 단건 — GET /todos/:id → req.params.id
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id) // "1" → 1
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    // res (response) — 응답 보낼 때 쓰는 메서드
    //
    // [status]
    // - res.status(404) : status 코드 설정 (기본 200). 뒤에 .json() / .send() 등과 연결
    // - res.sendStatus(404) : status + 기본 문구 한 번에 (body 커스텀 없을 때)
    //
    // [body 보내기]
    // - res.json(객체) : 객체 → JSON 문자열로 응답 body (지금 가장 많이 씀)
    // - res.send(내용) : 문자열·객체 등 범용 (DELETE 204처럼 body 없이 끝낼 때도 .send())
    // - res.end() : body 없이 응답 종료
    //
    // [headers]
    // - res.set('키', '값') : 응답 헤더 설정 (예: Content-Type). res.json은 JSON 헤더를 알아서 잡음
    //
    // [나중에 볼 것 — 지금 파일에서는 안 씀]
    // - res.redirect(url) : 다른 URL로 보내기 (302 등)
    // - res.sendFile(path) : 파일 내용을 응답으로
    // - res.cookie(name, val) : Set-Cookie 헤더
    //
    // 패턴: res.status(코드).json(객체) 또는 res.status(코드).send()
    return res.status(404).json({ error: 'not found' })
  }
  res.json(todo)
})

// 생성 — POST /todos → req.body
app.post('/todos', (req, res) => {
  const todo = {
    id: nextId++,
    title: req.body.title,
    completed: req.body.completed ?? false,
    user_id: req.body.user_id ?? 1,
  }
  todos.push(todo)
  res.status(201).json(todo)
})

// 일부 수정 — PATCH /todos/:id
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const todo = todos.find((t) => t.id === id)
  if (!todo) {
    return res.status(404).json({ error: 'not found' })
  }
  if (req.body.title !== undefined) todo.title = req.body.title
  if (req.body.completed !== undefined) todo.completed = req.body.completed
  res.json(todo)
})

// 삭제 — DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = todos.findIndex((t) => t.id === id)
  if (index === -1) {
    return res.status(404).json({ error: 'not found' })
  }
  // 메모리 배열에서 해당 위치 항목 1개 제거 (index부터 1개)
  todos.splice(index, 1)
  // 204 No Content — 삭제 성공, 응답 body 없음 (res.json 대신 status + send)
  res.status(204).send()
})

// === curl 테스트 (다른 터미널에서, 서버는 yarn server로 켜 둔 상태) ===
//
// 공통 옵션
// - (없음)     GET 기본. URL만 치면 됨
// - -i         응답 헤더까지 출력 (status 확인 — DELETE 204, 404 등)
// - -X METHOD  HTTP method 지정 (POST, PATCH, DELETE)
// - -H "..."   요청 헤더 (JSON body 보낼 때 Content-Type: application/json)
// - -d '...'   요청 body (JSON 문자열)
//
// curl http://localhost:3000/todos
// curl http://localhost:3000/todos/1
// curl -i http://localhost:3000/todos/999
// curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"title":"새 할 일","completed":false}'
// curl -X PATCH http://localhost:3000/todos/1 -H "Content-Type: application/json" -d '{"completed":true}'
// curl -i -X DELETE http://localhost:3000/todos/2

// PORT에서 요청 대기 시작 ("가게 문 열기")
// - 위쪽 get/post 등 = 진열·메뉴 준비(등록)
// - 아래쪽 listen = 문을 열고 손님 받기 시작
// - listen이 맨 아래인 이유: 준비(라우트 등록)을 끝낸 뒤 개점하려고 (문 먼저 열면 메뉴 준비 안 됐는데 손님이 주문할 수 있음)
// - listen이 없으면? yarn server해도 포트가 안 열려 curl/브라우저 연결 거부
// - 해당 포트(ex. 3000)가 막혀 있으면 Vite와 달리 3001로 안 옮기고, 보통 에러로 실패함
// - 라우트는 이 포트로 들어온 요청만 처리함
app.listen(PORT, () => {
  // listen 성공 시 한 번만 실행 — "요청 받을 준비 완료" 로그 (요청마다 아님)
  console.log(`http://localhost:${PORT}`)
})