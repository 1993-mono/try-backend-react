# status · 에러 응답 — 서버가 보내는 쪽

프론트에서 `response.status` / `response.ok`로 **받던** 상태 코드를,  
이번엔 Express에서 **상황에 맞게 보내는** 쪽을 정리한다.

선행: `docs/frontend/http-advanced.md` §1 · `docs/backend/express-min-api.md`  
실습 코드: `server/index.js` · `src/pages/backend/status/PostTodo.jsx`  
로드맵: `docs/backend/roadmap.md` §4

---

## 한눈에 정리

| 주제 | 한 줄 |
|------|--------|
| **status** | 응답이 성공인지·누구 잘못인지 **숫자로** 알리는 신호 |
| **2xx** | 요청을 잘 처리함 (`200` 조회, `201` 생성, `204` 삭제·body 없음) |
| **4xx** | **클라이언트** 문제 — 잘못된 요청·없는 자원 |
| **5xx** | **서버** 문제 — 처리 중 예기치 못한 오류 |
| **에러 body** | status만으로 부족할 때 `{ "error": "..." }` 로 이유 전달 |
| **`response.ok`** | 프론트: status가 200~299면 `true` (그 외는 실패로 분기) |

```
요청 → 라우트에서 판단 → res.status(코드).json(...) 또는 .send()
                              ↑
                         서버가 status를 정함
```

---

## 1. 받는 쪽 → 보내는 쪽

프론트 HTTP 심화에서는:

> “응답이 오면 **먼저 status를 보고**, body를 해석한다.”

백엔드에서는 같은 규약의 **반대편**이다.

> “이 요청의 성공인지·클라이언트가 잘못했는지·서버가 고장인지 **내가 status를 고른다.**”

| 역할 | 하는 일 |
|------|---------|
| 서버 | `res.status(400).json({ error: '...' })` |
| 프론트 | `if (!response.ok) { ... }` / `response.status` 표시 |

둘 다 같은 HTTP 응답을 다룬다. 자리만 다르다.

---

## 2. 이 프로젝트에서 쓰는 코드

| status | 의미 | todos에서 언제 |
|--------|------|----------------|
| `200` | OK | GET 목록·단건·PATCH 성공 (기본값) |
| `201` | Created | POST로 새 todo 생성 |
| `204` | No Content | DELETE 성공 — body 없음 (`res.status(204).send()`) |
| `400` | Bad Request | POST인데 `title` 없음·빈 문자열 |
| `404` | Not Found | `:id`에 해당하는 todo 없음 |
| `500` | Internal Server Error | (선택) try/catch로 잡지 못한 서버 내부 오류 |

### Express 패턴

```js
// 성공 — status 생략 시 200
res.json(todo)

// 생성
res.status(201).json(todo)

// 클라이언트 잘못
return res.status(400).json({ error: 'title is required' })

// 자원 없음
return res.status(404).json({ error: 'not found' })

// 성공·body 없음
res.status(204).send()
```

`return`을 쓰는 이유: 에러 응답을 보낸 뒤 **아래 성공 로직이 이어서 실행되지 않게** 하기 위함이다.

---

## 3. 케이스별 분기 — 왜 나누나

같은 “실패”라도 status가 다르면 **고치는 쪽**이 다르다.

| 상황 | status | 누가 고치나 |
|------|--------|-------------|
| `title` 없이 POST | `400` | 프론트·호출자가 body를 맞춤 |
| 없는 id로 GET/PATCH/DELETE | `404` | URL·id를 맞춤 |
| DB 연결 끊김·예상 밖 예외 | `500` | 서버·인프라 |

에러 body 예:

```json
{ "error": "title is required" }
```

프론트는 status로 실패를 알고, message는 body의 `error`로 보여줄 수 있다.  
형식은 프로젝트마다 다르지만, **한 형태로 통일**해 두는 편이 좋다 (이후 §9에서 더 다룸).

---

## 4. 프론트 연동 포인트

`fetch`는 **4xx/5xx여도 Promise를 reject하지 않는다.**  
네트워크만 되면 `then`으로 들어오므로, 반드시 `response.ok` / `status`로 나눈다.

실습 페이지(`PostTodo.jsx`) 흐름:

1. `setStatus(response.status)` — 화면에 숫자 확인  
2. `response.json()` — body 파싱  
3. `!response.ok`이면 `data.error`로 에러 메시지  
4. 성공이면 `201` + 생성된 todo 표시

```js
.then(async (response) => {
  setStatus(response.status)
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? `요청 실패: ${response.status}`)
  }
  return data
})
```

**주의:** `204`처럼 body가 없는 응답은 `response.json()`을 호출하면 실패할 수 있다.  
DELETE 성공(`204`)을 다룰 때는 status만 보고 json 파싱을 건너뛴다.

---

## 5. curl로 확인하는 법

```bash
# 400
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{}'

# 201
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트"}'

# 404
curl -i http://localhost:3000/todos/9999
```

`-i`는 응답 **헤더(status 줄 포함)** 를 같이 보여 준다.

---

## 6. 실습 순서 (복습)

1. `POST /todos`에 `title` 없으면 `400` + `{ error: '...' }`
2. curl로 `400` / `201` 확인
3. `src/pages/backend/status/PostTodo.jsx`에서 status·에러 분기
4. 제목 비움 → `400`, 채움 → `201`

---

## 다음에 연결

- §5 DB — 쿼리 실패·제약 위반 때도 status·에러 body로 표현
- §8 입력 검증 — `400`을 더 체계적으로 (타입·필수 필드)
- §9 에러 응답 형식 통일 — `{ "error": "..." }` 등 계약으로 고정
