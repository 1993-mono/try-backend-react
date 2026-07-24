# 입력 검증 · 환경 설정

§4에서 status `400`을 보냈고, §7에서 `JWT_SECRET`을 `.env`로 읽었다.  
이번 단계는 그걸 **습관으로 고정**한다.

1. **검증** — `req.body`를 그대로 믿지 않기
2. **환경** — 서버 비밀과 프론트 `VITE_`\*를 구분하기

선행: `docs/backend/status-error.md` · `docs/backend/auth.md`  
실습 코드: `server/controllers/todosController.js` · `server/index.js` · `.env`  
로드맵: `docs/backend/roadmap.md` §8

---

## 한눈에 정리

| 주제          | 한 줄                                                       |
| ------------- | ----------------------------------------------------------- |
| **입력 검증** | 클라이언트가 보낸 body가 **기대 형태**인지 서버가 확인      |
| **400**       | “요청이 잘못됨” — 필드 누락 · 타입 오류                     |
| **DTO**       | Data Transfer Object — **옮길 데이터만** 담은 객체          |
| `.env`        | 포트·DB URL·비밀키 등 **환경마다 다른 값**                  |
| `VITE_*`      | 빌드 시 **브라우저로 노출**되는 값 — 서버 비밀과 섞지 말 것 |

```
요청 body (아무거나 올 수 있음)
        │
        ▼
   검증 (누락? 타입?) ──실패──▶ 400 { error: "..." }
        │ 성공
        ▼
   쓸 필드만 추린 객체 (DTO 느낌)
        │
        ▼
   DB / 서비스
```

---

## 1. 왜 검증이 필요한가

지금은 컨트롤러에 이런 코드가 있다.

```js
if (!req.body?.title) {
    return res.status(400).json({ error: "title is required" });
}
```

이건 **시작**이다. 아직 부족한 예:

| 요청 body                               | 문제                                     |
| --------------------------------------- | ---------------------------------------- |
| `{ "title": 123 }`                      | 숫자 — 문자열이어야 함                   |
| `{ "title": "" }`                       | 빈 문자열 — “있음”처럼 보이지만 쓸모없음 |
| `{ "title": "ok", "completed": "yes" }` | `completed`가 boolean이 아님             |
| `{ "title": "ok", "hack": "..." }`      | 모르는 필드까지 그대로 넘기면 위험       |

한 줄:

> **프론트가 잘 보낸다**고 가정하지 않는다.  
> 서버는 body를 **검사한 뒤**, 쓸 값만 고른다.

---

## 2. DTO 느낌 — `req.body`를 그대로 쓰지 않기

### DTO란?

**DTO** = **D**ata **T**ransfer **O**bject  
→ **데이터를 옮기기 위해 만든 객체**.

요청 body에는 클라이언트가 **아무 필드나** 넣을 수 있다.  
서버는 그중 **실제로 쓸 필드만** 골라 새 객체를 만들고, 그걸 DB·서비스에 넘긴다.  
그 새 객체가 이 단계에서의 **DTO 느낌**이다.

```js
// req.body — 클라이언트가 보낸 전부 (이상한 필드도 있을 수 있음)
{ title: "장보기", completed: false, hack: "..." }

// DTO 느낌 — 서버가 고른 것만
{ title: "장보기", completed: false, user_id: 1 }
```

|      | Express (이 프로젝트)                  | Spring (실무)                              |
| ---- | -------------------------------------- | ------------------------------------------ |
| 형태 | 수동으로 필드 추린 객체                | `@RequestBody TodoCreateRequest` 같은 타입 |
| 역할 | 같음 — **허용한 데이터만** 다음 층으로 |                                            |

한 줄:

> DTO는 “받은 JSON 전체”가 아니라, **계약에 맞는 값만 담은 상자**다.

### 코드로 보기

```js
// ❌ body 통째로 넘김 — 나중에 필드가 늘어나면 그대로 DB로 갈 수 있음
await todosDb.insert(req.body);

// ✅ 쓸 것만 명시 (DTO 느낌)
const data = {
    title: req.body.title,
    completed: req.body.completed ?? false,
    user_id: req.body.user_id ?? 1,
};
await todosDb.insert(data);
```

검증 + 추림을 한곳에 모으면 읽기 쉽다.

```js
function parseCreateTodoBody(body) {
    if (!body || typeof body !== "object") {
        return { error: "body is required" };
    }
    if (typeof body.title !== "string" || body.title.trim() === "") {
        return { error: "title must be a non-empty string" };
    }
    if (body.completed !== undefined && typeof body.completed !== "boolean") {
        return { error: "completed must be boolean" };
    }

    return {
        data: {
            title: body.title.trim(),
            completed: body.completed ?? false,
            user_id: body.user_id ?? 1,
        },
    };
}

// 컨트롤러에서
const parsed = parseCreateTodoBody(req.body);
if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
}
const result = await todosDb.insert(parsed.data);
```

파일로 나누는 건 선택이다.  
예: `server/validators/todos.js` — 컨트롤러는 “검증 결과만” 본다.

로그인(`POST /login`)도 같다.

```js
if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password required" });
}
```

(틀린 비번은 계속 `401` — **형식** 문제는 `400`, **인증** 실패는 `401`.)

---

## 3. PATCH도 검증

`updateTodo`는 필드가 **선택**이다.  
보낸 것만 타입을 본다.

| 상황                                  | 응답                                                                |
| ------------------------------------- | ------------------------------------------------------------------- |
| body 없음 / 빈 객체                   | `400` (바꿀 게 없음) 또는 “그대로 유지” — **팀 규칙**으로 정하면 됨 |
| `title`을 보냈는데 문자열이 아님      | `400`                                                               |
| `completed`를 보냈는데 boolean이 아님 | `400`                                                               |
| 유효한 필드만                         | 기존처럼 병합 후 DB                                                 |

이 프로젝트 권장:

- PATCH: **최소 한 필드**는 있어야 함
- 보낸 필드의 **타입만** 검사

---

## 4. 환경 설정 — `.env`와 `VITE_*`

### 이미 있는 것

| 변수                     | 쓰는 곳      | 브라우저 노출? |
| ------------------------ | ------------ | -------------- |
| `VITE_SUPABASE_URL`      | React (Vite) | ✅ 노출됨      |
| `VITE_SUPABASE_ANON_KEY` | React        | ✅ 노출됨      |
| `DATABASE_URL`           | Express `pg` | ❌ 서버만      |
| `JWT_SECRET`             | Express JWT  | ❌ 서버만      |

Vite는 `VITE_`**로 시작하는 변수만** 클라이언트 번들에 넣는다.  
그래서 서버 비밀에 `VITE_`를 붙이면 **안 된다**.

### 아직 할 일

`server/index.js`에 `PORT`가 **하드코딩**되어 있다.

```js
const PORT = 3000;
```

환경으로 빼기:

```js
const PORT = Number(process.env.PORT) || 3000;
```

`.env` 예시:

```env
# 프론트 (브라우저에 노출)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# 서버만 (절대 VITE_ 붙이지 않음)
PORT=3000
DATABASE_URL=...
JWT_SECRET=...
```

한 파일에 같이 둬도 된다.  
중요한 건 **이름 규칙**과 **누가 읽는지**다.

|        | 프론트                 | 서버                            |
| ------ | ---------------------- | ------------------------------- |
| 로드   | Vite `import.meta.env` | `dotenv` → `process.env`        |
| 접두사 | `VITE_*`               | 접두사 없음 (또는 `SERVER_` 등) |
| 비밀키 | 넣지 않음              | `JWT_SECRET`, DB 비밀번호 등    |

`.gitignore`에 `.env`가 있고 `.env.example`만 올리는 패턴이 일반적이다.  
(키가 없는 자리표시자만 적어 두면 팀원이 “뭘 채워야 하는지” 안다.)

---

## 5. 실습 체크

### 검증

- [ ] `POST /todos` — `title` 누락 · 빈 문자열 · 숫자 → `400`
- [ ] `completed`가 boolean이 아니면 → `400`
- [ ] DB/insert에는 **추린 객체만** 전달
- [ ] (선택) `PATCH` · `POST /login`에도 같은 패턴
- [ ] curl / Postman / Network로 `400` body 확인

### 환경

- [ ] `.env`에 `PORT` 추가 · `index.js`에서 `process.env.PORT` 사용
- [ ] `DATABASE_URL` · `JWT_SECRET`에 `VITE_`가 **없는지** 확인
- [ ] (선택) `.env.example`에 키 이름만 적어 두기

### curl 예시

```bash
# title 누락 → 400
curl -s -X POST http://localhost:3000/todos \
  -H "Authorization: Bearer <토큰>" \
  -H "Content-Type: application/json" \
  -d '{}'

# title 타입 오류 → 400
curl -s -X POST http://localhost:3000/todos \
  -H "Authorization: Bearer <토큰>" \
  -H "Content-Type: application/json" \
  -d '{"title":123}'
```

---

## 6. Spring과 대응 (미리 보기)

| Express (이 단계)                 | Spring                           |
| --------------------------------- | -------------------------------- |
| `parseCreateTodoBody` / validator | `@Valid` + DTO                   |
| `typeof` · 수동 검사              | Bean Validation (`@NotBlank` 등) |
| `process.env.*`                   | `application.yml` · 환경변수     |
| `VITE_*` vs 서버 `.env`           | 프론트 env vs 서버 secrets       |

개념만 알아 두면 §10에서 다시 본다.

---

## 다음에

검증·환경이 갖춰지면 §9 — API 설계 · 명세를 **자기 서버 기준**으로 맞춘다.
