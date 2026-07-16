# Roadmap

## 방향

프론트엔드에서 JSON 통신(REST API 연동)을 먼저 다루고, 이후 백엔드 기초 → 고급까지 확장한다.

흐름 (한눈에):

```
HTTP·REST·JSON·method (0~1, 완료)
  → HTTP 심화 (status / headers / query)     ← 다음
  → 요청·응답·자원 모델 정리
  → 백엔드 기초 (서버가 그걸 어떻게 받는지)
  → 백엔드 고급
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

자료: [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

### 공통

- [x] Vite + React 프로젝트 구성 (yarn, node-modules)
- [x] JSONPlaceholder 응답 구조 확인
- [x] 페이지별 라우팅 구성 (react-router-dom)

### GET 연동

- [x] 파싱 전 응답 확인 (`response.text()`)
- [x] 단건 조회 (`GET /todos/1`)
- [x] JSON 파싱 후 화면에 표시
- [x] 목록 조회 (`GET /todos`)
- [x] 로딩/에러 처리

### POST 연동

- [x] 생성 요청 (`POST /todos`)
- [x] 요청 body에 JSON 전송
- [x] 응답 JSON 화면에 표시

### PATCH 연동

- [x] 일부 수정 요청 (`PATCH /todos/1`)
- [x] 요청 body에 JSON 전송
- [x] 응답 JSON 화면에 표시

### PUT 연동

- [x] 전체 수정 요청 (`PUT /todos/1`)
- [x] 요청 body에 JSON 전송 (자원 교체에 가깝게)
- [x] 응답 JSON 화면에 표시

### DELETE 연동

- [x] 삭제 요청 (`DELETE /todos/1`)
- [x] 응답 처리

---

## 2. HTTP 심화 ← 다음

자료: `docs/http-advanced.md`

메서드까지 익힌 뒤, 요청·응답을 더 정확히 읽는 단계.  
프론트·백엔드 공통으로 쓰인다.

### 상태 코드

- [ ] 2xx — 성공 (`200`, `201` 등)
- [ ] 4xx — 클라이언트 쪽 문제 (`400`, `404` 등)
- [ ] 5xx — 서버 쪽 문제 (`500` 등)
- [ ] `response.ok`와 status를 함께 보는 습관

### 헤더

- [ ] 헤더 = body 밖의 부가 정보
- [ ] `Content-Type` (요청/응답에서 JSON임을 알리는 역할)
- [ ] DevTools Network에서 요청·응답 헤더 확인

### URL 구조

- [ ] 경로(path) — `/todos/1` (어떤 자원인지)
- [ ] 쿼리(query) — `?userId=1` (필터·검색 등)
- [ ] 경로 vs 쿼리 역할 구분
- [ ] 예: `GET /todos?userId=1` 실습 (선택)

---

## 3. 요청·응답·자원 모델

HTTP 심화 다음. “한 번 보낸 fetch”를 그림으로 고정하고, CRUD를 자원의 생애주기로 본다.

### 요청–응답 한 바퀴

- [ ] 요청: `URL + method + (headers) + (body)`
- [ ] 응답: `status + headers + body`
- [ ] 위 구조가 프론트·서버에서 같은 규약임을 이해

### 자원(resource)과 CRUD

- [ ] 메서드를 개별이 아니라 한 자원의 흐름으로 보기  
      (목록 → 생성 → 조회 → 수정 → 삭제)
- [ ] PUT vs PATCH 역할 정리 (교체 vs 일부 수정)
- [ ] (선택) 한 화면에서 CRUD를 묶는 미니 실습  
      ※ JSONPlaceholder는 변경이 가짜라, “요청은 성공해도 목록에 안 남을 수 있음”을 알고 진행

---

## 4. (이후) 백엔드 기초

방향만 유지. HTTP·자원 모델을 “서버가 받아서 처리하는 쪽”으로 옮기는 단계.

- [ ] (추후 작성) 서버의 역할 — 요청 받기 → 처리 → JSON 응답
- [ ] (추후 작성) 간단한 API 서버 (예: Express)
- [ ] (추후 작성) 프론트 URL을 자기 서버로 연결

이 단계에서 자연스럽게 붙을 수 있는 것: CORS, 인증(쿠키·토큰) 맛보기 등.

---

## 5. (이후) 백엔드 고급

방향만 유지. 기초 이후에 확장.

- [ ] (추후 작성)

---

## 지금은 미루는 것

HTTP 심화·자원 모델 전에 깊게 들어가지 않아도 되는 것:

- Express / DB / 라우터 구현 세부
- JWT·쿠키·CORS (HTTP 심화 다음에 붙이기)
- GraphQL, gRPC 등 REST 외 방식
