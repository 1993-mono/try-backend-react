# Roadmap

학습 로드맵 모음. 프론트엔드(HTTP·REST 연동)를 먼저 하고, 백엔드(서버·API 구현)로 이어간다.

## 목록

| 문서 | 내용 | 상태 |
| ---- | ---- | ---- |
| **[frontend/roadmap.md](frontend/roadmap.md)** | 기초 개념 · REST 연동 · HTTP 심화 · 자원 모델 · API 명세서 (0~4) | 0~4 완료 |
| **[backend/roadmap.md](backend/roadmap.md)** | Express 서버 · CORS · DB · 구조 · 인증 · 배포 · Spring 연결 (1~10) | §2 완료 · §3 ← 다음 |

## 흐름 (한눈에)

```
[프론트]  docs/frontend/roadmap.md
  0 기초 → 1 REST 연동 → 2 HTTP 심화 → 3 자원 모델 → 4 API 명세서
                              │
                              ▼
[백엔드]  docs/backend/roadmap.md
  1 서버 역할 → 2 Express → 3 CORS → 4 status → 5 DB → 6 구조
            → 7 인증 → 8 검증·환경 → 9 명세 → 10 배포·Spring
```

## 자료 구조

```
docs/
├── roadmap.md                 ← 이 파일 (전체 목록)
├── frontend/                  ← 프론트 학습 자료
│   ├── roadmap.md
│   ├── fundamentals.md
│   ├── http-advanced.md
│   ├── http-resource-model.md
│   ├── api-spec.md
│   └── api-spec.yaml
└── backend/                   ← 백엔드 학습 자료
    ├── roadmap.md
    ├── backend-basics.md      ← §1 서버 역할
    └── express-min-api.md     ← §2 Express 최소 API
```

### 프론트엔드 자료

- `docs/frontend/fundamentals.md` — JSON · API · REST · HTTP
- `docs/frontend/http-advanced.md` — status · headers · URL
- `docs/frontend/http-resource-model.md` — 요청·응답 · CRUD
- `docs/frontend/api-spec.md` · `api-spec.yaml` — API 명세서

### 백엔드 자료

- `docs/backend/backend-basics.md` — 서버 역할 · curl (§1)
- `docs/backend/express-min-api.md` — Express · 미들웨어 · 라우트 · res · CRUD (§2)
