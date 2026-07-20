# API 명세서

`docs/http-resource-model.md`의 요청·응답·자원 모델을 전제로,  
HTTP 통신 내용을 **문서(계약)** 로 고정하는 단계다.

프론트·백엔드가 **같은 약속**을 보고 일한다. 형식은 스프레드시트든 Swagger든 **내용은 같다**.

선행: `docs/fundamentals.md` · `docs/http-advanced.md` · `docs/http-resource-model.md`  
실습 API: [Supabase](https://supabase.com/) Data API — `.env` · `src/config/api.js`  
실습: `docs/roadmap.md` §4 API 명세서 (표 읽기·쓰기 → Swagger)

---

## 한눈에 정리

| 주제                  | 한 줄                                                                      |
| --------------------- | -------------------------------------------------------------------------- |
| **API 명세서**        | URL · method · 파라미터 · 응답을 **미리 적어 둔 계약**                     |
| **스프레드시트**      | 실무에서 흔한 형식 — **한 행 = API 하나**                                  |
| **Swagger (OpenAPI)** | 같은 내용을 **YAML + UI**로 표현 — Try it out으로 호출 가능                |
| **YAML**              | 사람이 읽기 쉬운 **텍스트 설정 형식** — Swagger 명세 **원본**을 적을 때 씀 |
| **프론트 역할**       | 명세를 읽고 **fetch 요청을 설계**한다                                      |
| **백엔드 역할**       | 명세대로 **요청을 받고 응답을 만든다**                                     |

관계:

```
HTTP 통신 (요청·응답·자원)
        │
        ▼
  API 명세서 (문서로 고정)
        │
   ┌────┴────┐
   ▼         ▼
스프레드시트   Swagger
 (표)      (YAML + UI)
```

---

## 1. API 명세서란?

**API 명세서** = 프론트와 백엔드 사이의 **약속을 글로 적어 둔 문서**다.

코드를 보기 전에, “이 URL에 이 method로 이렇게 보내면, 이런 JSON이 돌아온다”를 **한곳에** 모아 둔다.

### 왜 필요한가?

| 없을 때                                 | 있을 때                                    |
| --------------------------------------- | ------------------------------------------ |
| 백엔드에게 “어떻게 보내요?” 매번 물어봄 | 문서 한 줄로 **fetch 설계** 가능           |
| 응답 필드 이름을 추측                   | `resultMap.template`처럼 **필드명이 고정** |
| 수정 시 양쪽이 따로 놀 수 있음          | **계약**이 바뀌었는지 비교 가능            |

3단계에서 본 **요청·응답 한 바퀴**가 “실제 통신”이었다면,  
4단계는 그 내용을 **문서 한 줄(또는 Swagger endpoint 하나)** 로 옮기는 것이다.

```
[3단계]  fetch로 직접 보내 봄  →  URL·method·body·response를 경험
[4단계]  그걸 명세로 적음      →  다른 사람도 같은 방식으로 연동
```

### 명세 ≠ 구현

|          | 명세서                                          | 서버 코드                   |
| -------- | ----------------------------------------------- | --------------------------- |
| **역할** | **무엇을** 주고받을지 적음                      | **어떻게** 처리할지 구현    |
| **예**   | `GET /api/builder/info/{sysId}` → template JSON | DB 조회 후 JSON 만들어 응답 |

지금은 Supabase Data API를 쓰므로 “서버 코드” 대신 **Supabase(PostgREST)가 명세 역할을 일부 대신**한다.  
회사 프로젝트처럼 Spring 등 **자기 서버**가 있으면, 명세와 구현을 **따로** 맞춰 가는 경우가 많다.

---

## 2. 명세에 들어가는 항목

프론트가 `fetch`를 짤 때 **최소한** 알아야 하는 것들이다.  
3단계의 요청·응답·자원과 1:1로 대응한다.

### 필수 (연동에 꼭 필요)

| 항목            | 의미                          | 3단계 대응                  |
| --------------- | ----------------------------- | --------------------------- |
| **URL (path)**  | 어디로 보낼지                 | 요청 URL                    |
| **HTTP method** | 무슨 행동인지                 | GET / POST / PATCH / DELETE |
| **파라미터**    | path · query · body에 실을 값 | URL 쿼리, body JSON         |
| **응답 형식**   | 돌아오는 JSON 구조·필드       | response body               |

### 있으면 좋은 것 (실무에서 자주 포함)

| 항목            | 의미                                                            |
| --------------- | --------------------------------------------------------------- |
| **status 코드** | 성공 `200`/`201`, 실패 `400`/`404` 등                           |
| **headers**     | `Content-Type`, 인증 헤더 등                                    |
| **권한**        | 관리자 / 비회원 등 **누가** 호출 가능한지                       |
| **비고**        | `wbldData`는 JSON 문자열로 보낸다, 히스토리 테이블 별도 저장 등 |

### 프론트가 명세에서 읽는 순서 (습관)

1. **method + URL** — 무슨 행동인지, 어디로 가는지
2. **필수 파라미터** — 빠지면 안 되는 값
3. **선택 파라미터** — 페이지네이션·필터 등
4. **응답 필드** — 화면에 무엇을 그릴지
5. **(있으면) status · 권한 · 비고**

전체 표를 외울 필요는 없다. **지금 연동할 API 한 줄**만 위 순서로 읽으면 된다.

---

## 3. 스프레드시트 형식 (실무)

회사에서 받는 API 목록은 **엑셀·구글 시트**인 경우가 많다.  
열 이름은 팀마다 다르지만, **한 행 = endpoint 하나**라는 구조는 같다.

### 흔한 열 (회사 웹빌더 예)

| 열 (예)           | 내용                                      |
| ----------------- | ----------------------------------------- |
| **전환 기본URL**  | `/api/builder`                            |
| **전환 URL**      | `/save`, `/info/{sysId}`                  |
| **내용**          | API 설명 (템플릿 저장, 조회 등)           |
| **메서드**        | GetMapping / PostMapping → `GET` / `POST` |
| **필수 파라미터** | `sysId`, `wbldId`, `wbldData` …           |
| **선택 파라미터** | `currPage`, `count` …                     |
| **리턴 데이터**   | `resultMap`, `template`, `menuList` …     |
| **권한**          | 관리자 / 비회원                           |
| **비고**          | 테스트용 sysId, 저장 시 히스토리 별도 등  |

`gne-sch 전환 URL`처럼 **예전 `.do` URL**이 같이 적혀 있으면,  
REST로 바꾼 **새 path**와 **레거시 path**를 대응해 보는 용도다.  
프론트 연동에는 보통 **전환 URL(REST)** 만 보면 된다.

### 한 행을 fetch 관점으로 읽기

**예: 템플릿 조회**

| 명세   | 값                                                           |
| ------ | ------------------------------------------------------------ |
| method | `GET`                                                        |
| URL    | `/api/builder/info/{sysId}`                                  |
| 필수   | path의 `sysId`                                               |
| 응답   | `resultMap` — `template`, `utilBgColor`, `menuActiveColor` … |
| 권한   | 비회원                                                       |

프론트가 그리는 그림:

```js
// sysId는 path에 넣음
const sysId = "builder";
const response = await fetch(`/api/builder/info/${sysId}`, {
    method: "GET",
});
const data = await response.json();
// data.resultMap.template 등 사용
```

**예: 템플릿 저장**

| 명세   | 값                                                            |
| ------ | ------------------------------------------------------------- |
| method | `POST`                                                        |
| URL    | `/api/builder/save`                                           |
| 필수   | `sysId`, `wbldId`, `wbldData`(JSON **문자열**), 색상 hex 값들 |
| 응답   | `resultAt` 등 성공 여부                                       |
| 비고   | 저장 시 히스토리 테이블에도 기록                              |

명세 **비고**에 “JSON.stringify()로 보낸다”처럼 적혀 있으면,  
body 타입이 **객체가 아니라 문자열**일 수 있다는 뜻이다. 그대로 따른다.

### path · query · body 구분

| 파라미터 위치 | 표기 예                     | fetch에서                        |
| ------------- | --------------------------- | -------------------------------- |
| **path**      | `{sysId}`, `{bbsId}`        | URL 경로에 삽입 `/info/${sysId}` |
| **query**     | `?count=5`, `?date=2026/07` | URL 뒤 `?key=value`              |
| **body**      | POST 필수 파라미터          | `body: JSON.stringify({ ... })`  |

명세에 “필수 파라미터”만 적혀 있고 위치가 안 나와 있으면,  
**method**로 추론한다: GET은 보통 path/query, POST는 body가 많다.  
애매하면 백엔드·명세 비고를 확인한다.

---

## 4. Supabase todos — 같은 내용을 표로

이미 1~3단계에서 쓴 API를 **명세 한 행** 형식으로 옮겨 보면,  
회사 표와 **같은 종류의 문서**라는 걸 확인할 수 있다.

기본 URL: `{VITE_SUPABASE_URL}/rest/v1` (`src/config/api.js`의 `API_BASE`)

| 내용           | URL                       | method | 필수                  | 선택           | 리턴                    | status (예) |
| -------------- | ------------------------- | ------ | --------------------- | -------------- | ----------------------- | ----------- |
| todo 단건 조회 | `/todos?id=eq.1&select=*` | GET    | `id` (query)          | `select`       | todo 객체               | `200`       |
| todo 목록      | `/todos?select=*`         | GET    | —                     | `select`, 필터 | todo 배열               | `200`       |
| todo 생성      | `/todos`                  | POST   | body: `title` 등      | —              | 생성된 row              | `201`       |
| todo 일부 수정 | `/todos?id=eq.1`          | PATCH  | `id`, body: 수정 필드 | —              | 수정된 row              | `200`       |
| todo 삭제      | `/todos?id=eq.1`          | DELETE | `id`                  | —              | 삭제된 row 또는 빈 body | `200`/`204` |

Supabase는 **헤더**(`apikey`, `Authorization` 등)가 사실상 필수다.  
회사 명세에 headers 열이 없어도, PostgREST 연동에서는 `src/config/api.js`를 함께 본다.

**단건 조회** 명세 → 코드 대응:

```js
await fetch(`${API_BASE}/todos?id=eq.1&select=*`, {
    method: "GET",
    headers: supabaseObjectHeaders,
});
```

표 한 줄과 `fetch` 한 번이 **같은 정보**를 담고 있으면, 명세 읽기에 성공한 것이다.

---

## 5. Swagger (OpenAPI) 형식

**Swagger** = API 명세를 **표준 YAML(JSON) + 웹 UI**로 보여 주는 도구다.  
OpenAPI Specification(OAS)이라는 **표준 형식**을 따른다.

### YAML이란?

**YAML** = **Y**AML **A**in't **M**arkup **L**anguage (재귀 약어)  
설정·명세처럼 **구조화된 데이터**를 **글자로 적는 텍스트 형식**이다.

JSON과 같은 종류의 것 — **프로그램이 아니라 데이터(문서)** 를 담는 그릇이다.

|             | JSON                             | YAML                                 |
| ----------- | -------------------------------- | ------------------------------------ |
| **느낌**    | `{ "키": "값" }` — 중괄호·따옴표 | `키: 값` — **들여쓰기**로 계층 표현  |
| **쓰는 곳** | API **응답 body**, `fetch` body  | **설정 파일**, Swagger **명세 원본** |
| **읽기**    | 기계·코드에 친숙                 | 사람이 **눈으로 읽기** 편함          |

JSON 예:

```json
{
    "title": "Todos API",
    "version": "1.0.0",
    "paths": {
        "/todos": {
            "get": { "summary": "조회" }
        }
    }
}
```

같은 내용을 YAML로:

```yaml
title: Todos API
version: 1.0.0
paths:
    /todos:
        get:
            summary: 조회
```

YAML 기본 규칙 (이 정도만 알면 Swagger 읽기에 충분):

| 규칙                  | 예                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------- |
| **`키: 값`**          | `title: Todos API`                                                                  |
| **들여쓰기 = 계층**   | `paths:` 아래에 `/todos:` — **스페이스 개수**가 구조를 만듦 (탭 대신 스페이스 권장) |
| **목록**              | `- name: id` 처럼 `-` 로 항목 나열                                                  |
| **문자열에 특수문자** | `'200'` 처럼 따옴표로 감쌀 수 있음                                                  |

Swagger Editor **왼쪽**이 이 YAML이고, **오른쪽 UI**는 YAML을 읽어서 만든 **미리보기**다.  
프론트는 보통 YAML을 직접 안 짜도 되고, **UI에서 endpoint · Parameters · Responses**만 보면 된다.  
(명세 **한 개**를 YAML로 적어 보는 연습은 “표 한 행이 파일에서는 어떻게 생기는지” 감 잡기용이다.)

### 스프레드시트와의 관계

|            | 스프레드시트                | Swagger                      |
| ---------- | --------------------------- | ---------------------------- |
| **형식**   | 표 (행·열)                  | YAML + 미리보기 UI           |
| **한 API** | 한 **행**                   | paths 아래 **endpoint 하나** |
| **내용**   | URL, method, 파라미터, 응답 | **동일**                     |
| **호출**   | Postman 등 별도             | **Try it out** 내장          |

**형식만 다를 뿐, 적는 내용은 같다.**

### UI에서 보는 것

[Swagger Editor](https://editor.swagger.io/)를 열면:

- **왼쪽** — YAML 소스 (명세 원본)
- **오른쪽** — UI (그룹별 API 목록, 파라미터 입력, Execute)

실무에서 “명세서 홈페이지로 전달”이라고 하면, 보통 **Swagger UI가 붙은 문서**를 말한다.  
백엔드가 YAML을 올려 두면, 프론트는 브라우저에서 **Try it out**으로 바로 호출해 볼 수 있다.

### 표 한 행 ↔ Swagger 한 endpoint

**todo 단건 GET**을 Swagger로 옮기면 개념적으로 이렇게 대응한다:

| 스프레드시트   | Swagger (개념)                                  |
| -------------- | ----------------------------------------------- |
| URL `/todos`   | `paths./todos`                                  |
| method GET     | `get:`                                          |
| query `id`     | `parameters` (in: query)                        |
| 응답 todo 객체 | `responses.200.content.application/json.schema` |

YAML 예 (학습용 — Supabase 전체가 아닌 **한 endpoint**만):

```yaml
openapi: 3.0.3
info:
    title: Todos API (학습용)
    version: 1.0.0
paths:
    /todos:
        get:
            summary: todo 단건 또는 목록 조회
            parameters:
                - name: id
                  in: query
                  description: "PostgREST 필터 예: eq.1"
                  schema:
                      type: string
                - name: select
                  in: query
                  schema:
                      type: string
            responses:
                "200":
                    description: 성공
                    content:
                        application/json:
                            schema:
                                type: array
                                items:
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

처음에는 YAML 문법 전체를 외울 필요 없다.  
**오른쪽 UI**에서 method · URL · Parameters · Responses가 **표와 같은 칸**인지만 보면 된다.

### Try it out

1. Swagger UI에서 API 하나 펼침
2. **Try it out** 클릭
3. 파라미터 입력 (예: `id` = `eq.1`)
4. **Execute** → 실제 HTTP 요청 + 응답 body 확인

Network 탭·1단계 fetch 실습과 **같은 한 바퀴**다.  
차이는 요청을 **직접 코드로 짜지 않고 UI에서** 보낼 수 있다는 점뿐이다.

---

## 6. 명세 읽기 vs 명세 쓰기

|               | 읽기                               | 쓰기                                 |
| ------------- | ---------------------------------- | ------------------------------------ |
| **누가**      | 프론트 (연동) · 백엔드 (구현 확인) | 주로 백엔드 · 기획/PM                |
| **목표**      | fetch 설계, 화면 필드 매핑         | 팀 전체 **계약** 고정                |
| **이번 학습** | 회사 표 1~2행, Swagger UI          | todos API **한 개**를 표·YAML로 직접 |

프론트는 **읽기**가 일상이다.  
다만 todo 한 개를 **직접 한 행 적어 보는** 연습을 하면,  
나중에 회사 명세에서 **빠진 항목·애매한 표현**을 스스로 짚기 쉽다.

### 쓸 때 체크 (todo 한 개 기준)

프론트 동료가 명세만 보고 연동할 수 있는지:

- [ ] URL이 **전체 path**인가 (base URL 포함 여부는 팀 규칙에 따름)
- [ ] method가 **하나**로 명확한가
- [ ] 필수/선택 파라미터와 **위치**(path/query/body)가 드러나는가
- [ ] 응답 **필드 이름·타입** 예시가 있는가
- [ ] (가능하면) 성공 status · 에러 경우 · 권한

---

## 7. 3단계 개념 ↔ 명세 항목 대응

| 3단계              | 명세서 항목                     |
| ------------------ | ------------------------------- |
| URL (path + query) | 전환 URL, 필수/선택 query       |
| method             | GetMapping / PostMapping …      |
| headers            | (열이 없으면 팀 공통·별도 문서) |
| request body       | 필수/선택 body 파라미터         |
| status             | (있으면) 응답 코드              |
| response body      | 리턴 데이터, DTO, resultMap     |
| 자원·CRUD          | “내용” 열 + method 조합         |
| 권한               | 권한 열                         |

명세는 **요청·응답·자원 모델을 문장·표·YAML로 고정**한 것이다.  
3단계를 이해한 뒤 4단계로 오면, 표의 각 열이 **익숙한 이름**으로 보인다.

---

## 8. 정리

| 볼 것           | 질문                                                            |
| --------------- | --------------------------------------------------------------- |
| **명세의 역할** | 코드 없이도 **무엇을 주고받을지** 알 수 있는가?                 |
| **필수 항목**   | URL · method · 파라미터 · 응답을 **한 API**에서 찾을 수 있는가? |
| **표 읽기**     | 회사 명세 **한 행**을 fetch 설계로 옮길 수 있는가?              |
| **형식**        | 스프레드시트와 Swagger가 **같은 내용**임을 아는가?              |
| **3단계 연결**  | 요청·응답·자원이 **명세 열**과 대응되는가?                      |

다음 단계(로드맵 5): 명세를 **서버가 받아 처리**하는 쪽(Express 등)으로 옮긴다.  
그때 명세와 구현을 **맞춰 가는** 경험이 붙는다.

관련: `docs/roadmap.md` §4 API 명세서 · `docs/http-resource-model.md`
