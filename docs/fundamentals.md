# 기초 개념

프론트·백엔드 공통으로 알아두면 좋은 기초 정리.  
(JSON · API · REST · HTTP)

다음 단계(상태 코드·헤더·URL 심화): `docs/http-advanced.md`

---

## 한눈에 정리

| 개념 | 한 줄 |
|------|--------|
| **JSON** (형식) | 데이터 **형식** (XML 등도 있음) |
| **`JSON`** (JS 객체) | 문자열 ↔ 객체 변환용 **전역 내장 객체** (`stringify` / `parse`) |
| **`response`** | `fetch`가 돌려주는 **응답 객체** (그 요청 전용) |
| **API** | 프로그램끼리 상호작용하는 **창구·접점** (종류가 다양함) |
| **REST** | 그 창구를 만드는 **설계 방식(스타일)** 중 하나 (URL + method로 자원을 다룸) |
| **REST API** | REST 규칙으로 설계한 API (주고받는 데이터는 **주로** JSON) |

관계는 대략:

```
API (창구/접점)
 └─ REST 스타일로 설계한 경우가 많음  →  REST API
     └─ HTTP로 요청/응답
         └─ body는 주로 JSON (XML 등도 가능)
```

---

## 1. JSON이란?

**JSON** = **JavaScript Object Notation**  
서버와 프론트가 데이터를 주고받을 때 쓰는 **텍스트 형식**이다.

예시:

```json
{
  "user_id": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

| 문법 | 의미 |
|------|------|
| `{ }` | 객체 (키-값 묶음) |
| `"키": 값` | 필드 하나 |
| `[ ]` | 배열 (목록) |
| `"문자열"` | 글자 |
| `1`, `false`, `null` | 숫자, 참/거짓, 없음 |

포인트: JSON은 **프로그램이 아니라 데이터**이다.

JSON을 익히면 언어가 바뀌어도 개념은 그대로다.  
바뀌는 건 주로 **그 언어에서 파싱하는 문법**뿐이다.  
(웹·모바일 API에서는 JSON이 매우 흔하지만, **모든 경우 = JSON만**은 아니다.)

---

## 2. 이름에 담긴 뜻 (JavaScript Object Notation)

### JavaScript

문법이 **JavaScript 객체를 적는 방식과 닮아서** 붙었다.  
처음부터 “자바스크립트 전용”이라는 뜻은 아니고, 지금은 어떤 언어에서든 쓰는 공통 데이터 형식이 되었다.

### Object

여기의 **Object는 “객체”** — 여러 값을 **이름(키)과 값**으로 묶은 덩어리를 말한다.

```json
{
  "title": "delectus aut autem",
  "completed": false
}
```

`title`, `completed`처럼 **속성을 가진 하나의 데이터 묶음**을 object라고 본 것이다.  
(현실의 물건이라기보다, 프로그래밍에서 말하는 “속성 있는 데이터 단위”에 가깝다.)

### Notation

**Notation = 표기법 / 적는 방식**이다.

즉 JSON은  
**(자바스크립트식) 객체를 텍스트로 적는 표기법**이라는 뜻이다.

- 메모리 안의 실제 객체(실행 중인 값) ≠ JSON
- JSON = 그 구조를 **문자로 적은 표현**

그래서 파일·네트워크로 **보내고 받을 수 있는 글자**가 된다.

한 줄 요약:

> **JavaScript Object Notation** = (자바스크립트식) **객체를 텍스트로 적는 표기법**

---

## 3. API란? (창구 · 접점)

**API** = Application Programming Interface  
서로 다른 프로그램이 대화하는 **창구·접점·약속**이다.

프론트 입장에서는 대략:

> “이 주소로 부탁하면, 정해진 형태로 데이터를 준다.”

### 왜 “방식”보다 “창구/접점”인가?

| 표현 | 시선이 향하는 곳 |
|------|------------------|
| 방식 | 전체 동작 원리·백엔드 구현 |
| 창구/접점 | 내가 호출하는 주소와 오가는 데이터 |

프론트가 매일 만지는 건 프레임워크 내부가 아니라 **그 접점**이다.  
백엔드가 Laravel이든 Nest든, 프론트는 API라는 창구를 통해 백엔드와 상호작용한다.

비유:

| 누가 | 무엇으로 | 누구와 |
|------|----------|--------|
| 사용자 | UI | 서비스 |
| 프론트엔드 | API | 백엔드 |

### UI / GUI와의 대응

```
사람 ↔ 서비스 창구 = UI
그 창구를 graphic으로 설계 = GUI

프로그램끼리 창구 = API
그 창구를 REST 규칙으로 설계 = REST API
```

- “사용한다” → 결과로 UX가 생긴다 (경험 관점)
- “소통한다” → UI/API가 접점이다 (상호작용 관점)

둘은 충돌하지 않는다. REST/API를 이해할 때는 **창구 + 설계 규칙** 시선이 잘 맞는다.

### API / JSON이라는 표현

슬래시(`/`)는 동의어가 아니라 **자주 함께 다니는 세트**라는 뜻에 가깝다.

> API로 통신하고, 그 안에 실어 나르는 데이터가 JSON이다.

- API = 배달 창구
- JSON = 그릇에 담긴 내용물

API 뒤의 데이터는 JSON만 있는 게 아니다 (XML, form, Protobuf 등).  
JSON도 API 전용이 아니다 (`package.json` 같은 설정 파일 등).

---

## 4. REST란? (창구를 설계하는 방식)

**REST** = **Representational State Transfer**  
웹 API를 만들 때 쓰는 **설계 스타일(규칙)** 이다.  
API 자체가 아니라, **API 창구를 어떻게 만들지**에 대한 규칙이다.

### Representational State Transfer 뜻

| 단어 | 의미 |
|------|------|
| **Representational** | 자원의 **표현**(지금 맥락에선 주로 JSON) |
| **State** | 자원의 현재 **상태** |
| **Transfer** | 그 표현을 클라이언트 ↔ 서버로 **전송** |

> 자원의 상태를 표현(예: JSON)으로 만들어 전송하는 방식 → **REST**

### 핵심: 자원(Resource) + HTTP 메서드

- **URL** = 다루는 대상 (예: `/todos/1` → 할 일 1번)
- **메서드** = 하려는 일

| 메서드 | 의미 |
|--------|------|
| `GET` | 조회 |
| `POST` | 생성 |
| `PUT` | 전체 수정(교체) |
| `PATCH` | 일부 수정 |
| `DELETE` | 삭제 |

같은 URL이라도 메서드가 다르면 하는 일이 다르다.

```
GET    /todos/1   → 읽기
DELETE /todos/1   → 삭제
```

### REST vs REST API (헷갈리기 쉬운 구분)

| 말 | 의미 |
|----|------|
| **REST** | 창구를 설계하는 **방식/규칙** |
| **REST API** | 그 규칙을 따라 만든 **창구** |

은행 비유:

- API = 은행 창구
- REST = “업무별로 나누고 신청서 양식을 통일하자”는 **운영 규칙**
- REST API = 그 규칙을 따라 만든 창구들

### JSON은 REST의 필수 조건이 아니다

REST는 “URL + method로 자원을 다룬다”는 설계이므로,  
표현이 JSON이든 XML이든 REST일 수 있다.  
다만 웹·모바일에서는 **JSON이 훨씬 흔하다.**

틀린 요약: ~~REST = URL + method로 JSON을 다루는 API~~  
맞는 요약: **REST = URL + method로 자원을 다루는 설계 방식** → 적용한 것이 **REST API** (데이터는 보통 JSON)

프론트에서 먼저 다루는 것은 보통 **GET + JSON 응답**이다.  
받이기만 있는 게 아니라 POST/PATCH처럼 **보내기**도 있다.

실습 API는 **[Supabase](https://supabase.com/) Data API** — PostgreSQL `todos` 테이블에 대한 **REST API**이고, 응답·요청 body는 JSON이다. (CRUD는 **실 DB에 반영**된다.)

---

## 5. HTTP

**HTTP** = HyperText Transfer Protocol  
브라우저·앱과 서버가 **요청과 응답을 주고받기 위한 규약**이다.

### 이름

| 단어 | 의미 |
|------|------|
| **HyperText** | 원래는 링크로 연결된 웹 문서. 지금은 JSON 같은 데이터도 실어 나른다 |
| **Transfer** | 전송 |
| **Protocol** | 규약 — “이렇게 보내자”는 약속 |

### 기본 흐름

```
클라이언트                    서버
     |                        |
     |  ----- Request ------> |
     |  <---- Response ------ |
```

한 번 요청하고, 한 번 응답받는 형태가 기본이다.

### 요청 (Request)

**1. 메서드 (Method)** — 무슨 일인지

- `GET` — 가져와
- `POST` — 만들어
- `PUT` / `PATCH` — 수정해
- `DELETE` — 지워

**2. URL** — 어디에 / 무엇에 대해

예: `https://<project-ref>.supabase.co/rest/v1/todos?id=eq.1`

| 부분 | 예 | 의미 |
|------|-----|------|
| 스킴 | `https` | 암호화된 HTTP (HTTPS) |
| 호스트 | `<project-ref>.supabase.co` | Supabase 프로젝트 서버 |
| 경로 | `/rest/v1/todos` | Data API · `todos` 테이블 |
| 쿼리 | `?id=eq.1` | id가 1인 행 (PostgREST 필터) |

Supabase는 **인증 헤더**(`apikey`, `Authorization`)가 필요하다. 자세한 예시는 `src/config/api.js` · `docs/http-advanced.md` 참고.

**3. 헤더 (Header)** — 부가 정보  
예: 본문 타입이 JSON이다, JSON으로 답해 달라는 식.

**4. 본문 (Body)** — 있을 수도 / 없을 수도  
`POST`·`PATCH`처럼 데이터를 보낼 때 JSON 등을 넣는다.  
`GET`은 보통 body가 없다.

### 응답 (Response)

**1. 상태 코드 (Status Code)**

| 코드 | 대략 의미 |
|------|-----------|
| `200` | 성공 |
| `201` | 생성 성공 |
| `400` | 요청이 잘못됨 |
| `401` / `403` | 인증·권한 문제 |
| `404` | 없음 |
| `500` | 서버 오류 |

본문만 보지 않고, **상태 코드로 성공/실패**도 판단한다.

**2. 헤더** — 응답 쪽 부가 정보  
예: `Content-Type: application/json`

**3. 본문 (Body)** — 실제 내용  
지금 다루는 API에서는 주로 **JSON 텍스트**이다.

### HTTPS

**HTTPS** = HTTP + 암호화(TLS).  
말하는 규칙은 HTTP와 같고, 중간에서 내용을 훔쳐보기 어렵게 한 버전이다.  
웹 서비스는 거의 HTTPS를 쓴다.

### 브라우저와의 관계

주소창에 URL을 입력하는 것도 사실상 **HTTP GET 요청**이다.  
React의 `fetch`는 같은 HTTP 요청을 **코드로** 보내는 것이다.

상태 코드·헤더·경로/쿼리를 더 깊게 보려면 → `docs/http-advanced.md`

---

## 6. JSON “다루기”란?

받은 텍스트를 객체로 바꾼 뒤, 필드를 꺼내는 일이다.

예: 위 JSON에서 `title` → `"delectus aut autem"`  
목록이면 배열을 하나씩 순회한다.

프론트(React)에서는 보통:

1. `fetch(url)`로 요청
2. `response.json()`으로 객체 변환
3. 상태에 넣고 화면에 표시

보낼 때(`POST` 등)는 반대로, 객체를 문자열로 만들어 body에 넣는다.

---

## 6-1. 데이터 형식 JSON vs JS의 `JSON` 객체

이름이 같아서 헷갈리기 쉽다. **둘은 다르다.**

| 말 | 무엇인가 |
|----|----------|
| **json** (형식) | 네트워크·파일로 오가는 **텍스트 데이터 형식** (1절에서 말한 것) |
| **`JSON`** (대문자) | 자바스크립트가 미리 만들어 둔 **전역 내장 객체** (변수로 내가 만든 게 아님) |

`JSON`은 어디서든 쓸 수 있는 **도구 상자**이고, 자주 쓰는 기능은 두 가지다.

| 메서드 | 역할 | 방향 |
|--------|------|------|
| `JSON.stringify(...)` | 객체 → JSON **문자열** | 보낼 때 |
| `JSON.parse(...)` | JSON **문자열** → 객체 | 받을 때 (문자열이 이미 있을 때) |

이름 풀이: **stringify** = string + -ify → “문자열화한다”.

```js
JSON.stringify({ a: 1 })  // '{"a":1}'  ← 문자열
JSON.parse('{"a":1}')     // { a: 1 }   ← 객체
```

포인트:

- 소문자 **json** = 데이터 형식
- 대문자 **`JSON`** = 그걸 다루기 위한 JS **전역 객체**
- `JSON`은 변수가 아니다

---

## 6-2. `response`란? (`fetch`가 주는 객체)

`fetch(url)`가 성공하면 **Response 객체**를 돌려준다.  
보통 그걸 `response`라는 이름으로 받는다.

```js
// API_BASE · supabaseHeaders → src/config/api.js
fetch(`${API_BASE}/todos?id=eq.1&select=*`, {
  headers: supabaseHeaders,
})
  .then((response) => { /* ... */ })
```

| | `response` | `JSON` |
|--|------------|--------|
| 어디서 오나 | **그번 `fetch` 요청**의 결과 | JS 환경에 **처음부터** 있음 |
| 범위 | 그 응답 **하나**에만 해당 | **전역**에서 언제든 사용 |
| 하는 일 | 상태 코드, 헤더, 본문 등 **응답 정보** 제공 | 문자열 ↔ 객체 **변환** |

`response`에 자주 쓰는 것:

- `response.status` — 상태 코드 (예: `200`)
- `response.json()` — 본문을 읽어 JSON으로 파싱 (Promise 반환)
- `response.text()` — 본문을 그냥 문자열로 읽기

한 줄:

> **`response`** = `fetch`가 지원해 주는 **이번 응답 객체**  
> **`JSON`** = 전역에서 쓰는 **변환 도구**

---

## 6-3. `response.json()` vs `JSON.parse(...)`

둘 다 “JSON → 객체” 쪽이지만, **입력이 다르다.**

### `response.json()`

`fetch`의 Response 객체 **메서드**다.

1. 응답 **본문(body)을 읽고**
2. 그 문자열을 JSON으로 **파싱**하고
3. 결과를 **Promise**로 돌려준다

```js
fetch('/todos/1')
  .then((response) => response.json())  // Promise → 객체
  .then((data) => console.log(data))
```

### `JSON.parse(...)`

**이미 준비된 문자열**만 받는다.  
`response`(Response 객체)를 그대로 넣으면 안 된다.

```js
JSON.parse(response)  // ❌ Response 객체라서 안 됨
```

비슷하게 쓰려면:

```js
const text = await response.text()  // 본문 → 문자열
const data = JSON.parse(text)       // 문자열 → 객체
```

### 비교

| | `response.json()` | `JSON.parse(...)` |
|--|-------------------|-------------------|
| 입력 | Response 객체 | JSON **문자열** |
| 하는 일 | body 읽기 + 파싱 | 파싱만 |
| 반환 | Promise | 바로 객체 |

관계:

> `response.json()` ≈ `JSON.parse(await response.text())`

실무에서는 `fetch` 응답을 받을 때 **`response.json()`** 을 쓰고,  
이미 문자열로 가지고 있을 때만 **`JSON.parse`** 를 쓴다.  
보낼 때는 **`JSON.stringify`** 로 body를 만든다.

---

## 7. 웹/앱에서의 상관 관계 (실제)

비유가 아니라, 서비스에서 실제로 일어나는 흐름이다.

### 한 번의 동작 예: 할 일 1번 불러오기

1. 사용자가 앱에서 “할 일 보기”를 누른다.
2. 프론트가 서버 요청을 준비한다.
3. 그 요청은 **HTTP** 규약으로 만들어져 전송된다.
   - 메서드: `GET`
   - URL: `https://example.com/todos/1`
4. 서버가 **HTTP 응답**을 돌려준다.
   - 상태 코드: `200`
   - 본문: 텍스트 (보통 JSON)
5. 프론트가 본문이 JSON이면 파싱해 화면에 그린다.

실제로 네트워크를 타고 오가는 단위는 **HTTP 요청 / HTTP 응답**이다.

### 각 개념이 그 장면에서 하는 일

| 개념 | 실제 역할 |
|------|-----------|
| **HTTP** | 요청·응답의 **실제 통신 규약** (메서드, URL, 상태 코드, 헤더, 바디) |
| **API** | 프론트가 백엔드를 쓰려고 호출하는 **정해진 입구** (예: `GET /todos/1`) |
| **REST** | 그 입구를 **URL=자원, method=행동**으로 맞추는 **설계** |
| **JSON** | HTTP **바디에 실리는 데이터 형식** |

한 요청 안에서 겹친다.

```
[ API 창구: GET /todos/1 ]     ← 무엇을 호출할지 (REST로 설계된 경우 이런 형태)
         │
         ▼
[ HTTP 요청으로 전송 ]         ← 실제로 어떻게 보내는지
         │
         ▼
[ HTTP 응답, body = JSON ]     ← 응답 내용의 형식
         │
         ▼
[ 프론트가 JSON 파싱 후 UI 표시 ]
```

### 레이어로 본 관계

아래가 바탕이다.

1. **HTTP** — 통신 자체. 없으면 요청/응답이 성립하지 않는다.
2. **API** — HTTP 위에서 열어 둔 호출 지점들.
3. **REST** — 그 호출 지점을 잡는 **설계 규칙** (필수는 아님, 웹 API에 흔함).
4. **JSON** — 주고받는 **내용물 형식** (필수는 아님, 웹/앱 API에 흔함).

문장으로:

> 앱이 **API**를 호출한다 → 그 호출은 **HTTP**로 오간다 → 창구가 REST로 설계됐으면 **REST API**라고 부른다 → 바디가 JSON이면 프론트가 **JSON**으로 읽는다.

웹(브라우저)과 모바일 앱 모두, 서버와 말할 때 이 층은 같다. 차이는 UI 기술뿐이다.

### HTTP만 있는 것은 아님 (참고)

- **WebSocket**: 처음엔 HTTP로 연결을 연 뒤, 이후 **양방향·지속** 메시지로 전환. 채팅·실시간 알림 등.
- WebSocket에도 “이렇게 주고받는다”는 **API(약속)** 는 있지만, URL+method 자원 모델인 **REST와는 다른 설계**(메시지/이벤트 규약)인 경우가 많다.
- 지금 로드맵의 실습은 **HTTP + REST API + JSON** 이 대상이다.

### 기억용 한 줄

> 실제로 선을 타고 가는 건 **HTTP**이고, **API**는 그 위의 호출 지점, **REST**는 그 지점 설계, **JSON**은 바디 형식이다.
