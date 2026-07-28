# Roadmap

프론트엔드(HTTP·REST 연동) → 백엔드(Express·API) 로드맵.  
**이 저장소 기준 로드맵은 완료·마무리**했다.

> **다음 (별도 repo):** TypeScript 프론트 보강.  
> 이후 예정 이름 예: `try-backend-next` (Next.js API · 추후).  
> 개명 후보(이 repo): `try-backend-react`.

## 목록

| 문서 | 내용 | 상태 |
| ---- | ---- | ---- |
| **[frontend/roadmap.md](frontend/roadmap.md)** | 기초 개념 · REST 연동 · HTTP 심화 · 자원 모델 · API 명세서 (0~4) | 0~4 완료 |
| **[backend/roadmap.md](backend/roadmap.md)** | Express 서버 · CORS · DB · 구조 · 인증 · 검증·환경 · 명세 · 배포 · Spring 연결 (1~10) | **완료** (§6 services · §10 PM2/Spring 생략) |

## 흐름 (한눈에)

```
[프론트]  docs/frontend/roadmap.md
  0 기초 → 1 REST 연동 → 2 HTTP 심화 → 3 자원 모델 → 4 API 명세서
                              │
                              ▼
[백엔드]  docs/backend/roadmap.md
  1 서버 역할 → 2 Express → 3 CORS → 4 status → 5 DB → 6 구조
            → 7 인증 → 8 검증·환경 → 9 명세 → 10 배포·Spring (생략)
                              │
                              ▼
[이 repo 종료]  →  (다음) TypeScript 전용 repo
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
    ├── express-min-api.md     ← §2 Express 최소 API
    ├── cors.md                ← §3 CORS
    ├── status-error.md        ← §4 status · 에러 응답
    ├── db-connect.md          ← §5 DB 연결
    ├── folder-structure.md    ← §6 폴더 구조 (레이어)
    ├── auth.md                ← §7 인증
    ├── validation-env.md      ← §8 입력 검증 · 환경 설정
    └── api-design.md          ← §9 API 설계 · 명세
```

### 프론트엔드 자료

- `docs/frontend/fundamentals.md` — JSON · API · REST · HTTP
- `docs/frontend/http-advanced.md` — status · headers · URL
- `docs/frontend/http-resource-model.md` — 요청·응답 · CRUD
- `docs/frontend/api-spec.md` · `api-spec.yaml` — API 명세서

### 백엔드 자료

- `docs/backend/backend-basics.md` — 서버 역할 · curl (§1)
- `docs/backend/express-min-api.md` — Express · 미들웨어 · 라우트 · res · CRUD (§2)
- `docs/backend/cors.md` — CORS · origin · cors 미들웨어 · React 연동 (§3)
- `docs/backend/status-error.md` — status · 에러 응답 · 프론트 분기 (§4)
- `docs/backend/db-connect.md` — pg · SQL · Express→PostgreSQL (§5)
- `docs/backend/folder-structure.md` — routes · controllers · db (§6, services 보류)
- `docs/backend/auth.md` — JWT · Bearer · 인증 미들웨어 (§7)
- `docs/backend/validation-env.md` — 입력 검증 · `.env` · `VITE_*` 분리 (§8)
- `docs/backend/api-design.md` — REST URL · 에러 형식 · 명세를 Express 기준으로 (§9)
