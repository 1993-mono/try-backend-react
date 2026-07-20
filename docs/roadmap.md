# Roadmap

학습 로드맵 모음. 프론트엔드(HTTP·REST 연동)를 먼저 하고, 백엔드(서버·API 구현)로 이어간다.

## 목록

| 문서 | 내용 | 상태 |
| ---- | ---- | ---- |
| **[roadmap-frontend.md](roadmap-frontend.md)** | 기초 개념 · REST 연동 · HTTP 심화 · 자원 모델 · API 명세서 (0~4) | 0~4 완료 |
| **[roadmap-backend.md](roadmap-backend.md)** | Express 서버 · CORS · DB · 구조 · 인증 · 배포 · Spring 연결 (1~10) | §1 ← 다음 |

## 흐름 (한눈에)

```
[프론트]  roadmap-frontend.md
  0 기초 → 1 REST 연동 → 2 HTTP 심화 → 3 자원 모델 → 4 API 명세서
                              │
                              ▼
[백엔드]  roadmap-backend.md
  1 서버 역할 → 2 Express → 3 CORS → 4 status → 5 DB → 6 구조
            → 7 인증 → 8 검증·환경 → 9 명세 → 10 배포·Spring
```

## 공통 자료

- `docs/fundamentals.md` — JSON · API · REST · HTTP
- `docs/http-advanced.md` — status · headers · URL
- `docs/http-resource-model.md` — 요청·응답 · CRUD
- `docs/api-spec.md` · `docs/api-spec.yaml` — API 명세서
