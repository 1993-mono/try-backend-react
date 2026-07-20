# Roadmap

## 방향

프론트엔드에서 JSON 통신(REST API 연동)을 먼저 다루고, 이후 백엔드 기초 → 고급까지 확장한다.

흐름 (한눈에):

```
HTTP·REST·JSON·method (0~1, 완료)
  → HTTP 심화 (status / headers / query) (2, 완료)
  → 요청·응답·자원 모델 정리 (3, 완료)
  → API 명세서 (4, 완료)
  → 백엔드 기초 (5)                        ← 다음
  → 백엔드 고급 (6)
```

> **참고:** API / HTTP / REST / JSON은 `docs/fundamentals.md` 기준으로 **아직 이해도가 부족한 상태**에서 연동 단계를 진행했다. HTTP 심화·실습·실무에서 보완한다.

---

## 0. 기초 개념

자료: `docs/fundamentals.md`

- [x] JSON — 데이터 형식
- [x] API — 창구·접점
- [x] REST — API 설계 방식 (URL + method)
- [x] HTTP — 요청·응답 규약
- [x] 위 개념은 이해도가 부족한 채로 연동 단계 진행 (추후 보완)

---

## 1. JSON 통신 방식 검토: REST API 연동

자료: [Supabase](https://supabase.com/) — Data API (PostgreSQL + REST)

> 처음에는 연습용 [JSONPlaceholder](https://jsonplaceholder.typicode.com/)로 진행했고, 이후 **Supabase `todos` 테이블**로 전환했다. CRUD는 **실 DB에 반영**된다.

### 공통

- [x] Vite + React 프로젝트 구성 (yarn, node-modules)
- [x] Supabase 프로젝트 · `todos` 테이블 · RLS(학습용) 설정
- [x] `.env` — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- [x] Supabase 응답 구조 확인
- [x] 페이지별 라우팅 구성 (react-router-dom)

### GET 연동

- [x] 파싱 전 응답 확인 (`response.text()`)
- [x] 단건 조회 (`GET /todos?id=eq.1`)
- [x] JSON 파싱 후 화면에 표시
- [x] 목록 조회 (`GET /todos?select=*`)
- [x] 로딩/에러 처리

### POST 연동

- [x] 생성 요청 (`POST /todos`)
- [x] 요청 body에 JSON 전송
- [x] 응답 JSON 화면에 표시

### PATCH 연동

- [x] 일부 수정 요청 (`PATCH /todos?id=eq.1`)
- [x] 요청 body에 JSON 전송
- [x] 응답 JSON 화면에 표시

### PUT 연동

- [x] 전체 수정 요청 (Supabase: `PATCH` + 전체 필드 — 교체에 가깝게)
- [x] 요청 body에 JSON 전송
- [x] 응답 JSON 화면에 표시

### DELETE 연동

- [x] 삭제 요청 (`DELETE /todos?id=eq.1`)
- [x] 응답 처리

---

## 2. HTTP 심화

자료: `docs/http-advanced.md`

메서드까지 익힌 뒤, 요청·응답을 더 정확히 읽는 단계.  
프론트·백엔드 공통으로 쓰인다.

### 상태 코드

- [x] 2xx — 성공 (`200`, `201` 등)
- [x] 4xx — 클라이언트 쪽 문제 (`400`, `404` 등)
- [x] 5xx — 서버 쪽 문제 (`500` 등)
- [x] `response.ok`와 status를 함께 보는 습관

### 헤더

- [x] 헤더 = body 밖의 부가 정보
- [x] `Content-Type` (요청/응답에서 JSON임을 알리는 역할)
- [x] DevTools Network에서 요청·응답 헤더 확인

### URL 구조

- [x] 경로(path) — `/todos` (테이블·컬렉션)
- [x] 쿼리(query) — `?id=eq.1`, `?user_id=eq.1` (필터·단건 지정)
- [x] 경로 vs 쿼리 역할 구분
- [x] 예: `GET /todos?user_id=eq.1` 실습 (선택)

---

## 3. HTTP 요청·응답·자원 모델

자료: `docs/http-resource-model.md`  
실습: `src/pages/http-model/` (`RequestResponse`, `ResourceCrud`)

HTTP 심화 다음. “한 번 보낸 fetch”를 그림으로 고정하고, CRUD를 자원의 생애주기로 본다.

### 요청–응답 한 바퀴

- [x] 요청: `URL + method + (headers) + (body)`
- [x] 응답: `status + headers + body`
- [x] 위 구조가 프론트·서버에서 같은 규약임을 이해

### 자원(resource)과 CRUD

- [x] 메서드를 개별이 아니라 한 자원의 흐름으로 보기
- [x] PUT vs PATCH 역할 정리 (교체 vs 일부 수정 — Supabase는 PATCH + 전체 필드로 교체 실습)
- [x] (선택) 한 화면에서 CRUD를 묶는 미니 실습

---

## 4. API 명세서

자료: `docs/api-spec.md`  
실습 YAML: `docs/api-spec.yaml`

요청·응답·자원 모델을 **문서(계약)** 로 고정하는 단계.  
**스프레드시트 → Swagger** 순으로. 형식만 다를 뿐 내용은 같다.

### 1) 스프레드시트 읽기 (생략)

- [ ] endpoint / method / query·body / response / status가 한 행에서 보이는지
- [ ] (실무) 회사 명세에서 프론트 연동에 필요한 열만 골라 읽기 — URL, 메소드, 파라미터, 리턴 타입
- [ ] Supabase `todos` API 연습 내용을 같은 표 형식으로 다시 읽어 보기

> 이론은 `api-spec.md` §3·§4에서 정리. 표 실습은 생략.

### 2) 스프레드시트 쓰기 (생략)

- [ ] todo API 한 개를 표 한 행으로 직접 정리해 보기
- [ ] 프론트가 바로 fetch 짤 수 있을 정도로 URL·method·파라미터·응답 예시 포함

### 3) Swagger 읽기

- [x] [Swagger Editor](https://editor.swagger.io/) 열어 오른쪽 UI(미리보기)부터 보기
- [x] 스프레드시트 한 행 ↔ Swagger 한 endpoint가 같은 정보임을 대응해 보기
- [x] Try it out으로 호출해 보기 (부장님이 말씀하신 “홈페이지로 전달” 방식)

### 4) Swagger 쓰기

- [x] 왼쪽 YAML로 todo API 한 개 명세 작성해 보기 (`docs/api-spec.yaml`)
- [ ] (선택) 5번(백엔드 기초)에서 서버 만들 때 명세와 함께 정리

---

## 5. (이후) 백엔드 기초 ← 다음

방향만 유지. HTTP·자원 모델·명세를 “서버가 받아서 처리하는 쪽”으로 옮기는 단계.

> **참고:** Supabase로 **DB + Data API**는 이미 쓰는 중이다. 5단계는 **Express 등 자기 서버 코드**에서 요청을 받·처리하는 경험을 추가하는 쪽이다.

- [ ] (추후 작성) 서버의 역할 — 요청 받기 → 처리 → JSON 응답
- [ ] (추후 작성) 간단한 API 서버 (예: Express)
- [ ] (추후 작성) 프론트 URL을 자기 서버로 연결 (또는 Supabase와 역할 비교)

이 단계에서 자연스럽게 붙을 수 있는 것: CORS, 인증(쿠키·토큰) 맛보기, 명세서 실제 작성 등.

---

## 6. (이후) 백엔드 고급

방향만 유지. 기초 이후에 확장.

- [ ] (추후 작성)

---

## 지금은 미루는 것

백엔드 기초 전에 깊게 들어가지 않아도 되는 것:

- Express 라우터 구현 세부 (Supabase Data API로 REST는 이미 사용 중)
- JWT·쿠키·CORS (명세·서버 단계에서 붙이기)
- GraphQL, gRPC 등 REST 외 방식
