# Roadmap

## 방향

프론트엔드에서 JSON 통신(REST API 연동)을 먼저 다루고, 이후 필요에 따라 백엔드 기초까지 확장한다.

> **참고:** API / HTTP / REST / JSON은 `docs/fundamentals.md` 기준으로 **아직 이해도가 부족한 상태**에서 다음 단계로 넘어간다. 추후 실습 및 실무에서 더 이해해 나갈 예정이다.

---

## 0. 기초 개념

자료: `docs/fundamentals.md`

- [x] JSON — 데이터 형식
- [x] API — 창구·접점
- [x] REST — API 설계 방식 (URL + method)
- [x] HTTP — 요청·응답 규약
- [x] 위 개념은 이해도가 부족한 채로 연동 단계 진행 (추후 실습·실무에서 보완 예정)

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

- [ ] 일부 수정 요청 (`PATCH /todos/1`)
- [ ] 요청 body에 JSON 전송
- [ ] 응답 JSON 화면에 표시

### DELETE 연동

- [ ] 삭제 요청 (`DELETE /todos/1`)
- [ ] 응답 처리

---

## 2. (이후) 백엔드 기초

- [ ] (추후 작성)
