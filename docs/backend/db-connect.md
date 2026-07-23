# DB 연결 — Express → PostgreSQL

메모리 배열 대신 **진짜 DB**에 todos를 읽고 쓰게 한다.  
프론트가 보는 URL(`http://localhost:3000/todos`)은 같고, **서버 안쪽 저장소만** 바뀐다.

선행: `docs/backend/express-min-api.md` · `docs/backend/status-error.md`  
실습 코드: `server/index.js` (DB) · 참고 `server/examples/02-memory-todos.js` (메모리)  
로드맵: `docs/backend/roadmap.md` §5  
방식: **A. `pg` + Supabase PostgreSQL**

---

## 한눈에 정리

| 주제                | 한 줄                                                      |
| ------------------- | ---------------------------------------------------------- |
| **메모리 배열**     | 서버 프로세스 안의 변수 — 재시작하면 사라짐                |
| **DB (PostgreSQL)** | 서버 밖에 있는 저장소 — 재시작해도 남음                    |
| **`pg`**            | PostgreSQL에 SQL을 보내는 라이브러리                       |
| **`Pool`**          | DB 연결을 여러 개 준비해 두고 빌려 쓰는 방식               |
| **`DATABASE_URL`**  | DB 주소·계정 — 서버만 알고, 브라우저에 노출하면 안 됨      |
| **SQL**             | DB에게 하는 말 — `SELECT` / `INSERT` / `UPDATE` / `DELETE` |

```
[브라우저 React]
      │  fetch http://localhost:3000/todos
      ▼
[Express 서버]  ← 여기까지는 §2~§4와 동일
      │  pool.query('select ...')
      ▼
[PostgreSQL]    ← §5에서 새로 연결한 곳 (Supabase가 호스팅)
```

---

## 1. 이번에 한 일 — 큰 그림

실습을 “하란 대로” 따라가면 명령어·코드는 돌아가는데,  
**내가 지금 뭘 한 건지**가 흐릿할 수 있다. 그 부분을 여기서 먼저 짚는다.

### 1-1. 한 줄로

> React는 예전처럼 Express에 `fetch`하고,  
> Express는 예전처럼 JSON으로 답하는데,  
> **할 일 목록을 배열이 아니라 PostgreSQL에서 읽고 쓰게** 바꿨다.

프론트 코드를 거의 안 고친 이유가 이것이다.  
바뀐 것은 **서버가 데이터를 어디에 두느냐**뿐이다.

### 1-2. 로드맵에서 여기까지

| 단계   | 한 일                         | 데이터가 있던 곳                     |
| ------ | ----------------------------- | ------------------------------------ |
| 프론트 | React → **Supabase Data API** | PostgreSQL (Supabase가 API까지 제공) |
| §2     | Express + **메모리 배열**     | 서버 RAM                             |
| §3     | CORS로 React → Express        | 여전히 메모리                        |
| §4     | status · 에러 응답            | 여전히 메모리                        |
| **§5** | Express + **`pg` + SQL**      | **같은** PostgreSQL                  |

```
예전에 (프론트 실습)
  브라우저 ──fetch──▶ Supabase Data API ──▶ PostgreSQL

§2~§4
  브라우저 ──fetch──▶ 내 Express ──▶ 서버 안 배열(메모리)
                                      ↑ 재시작하면 사라짐

§5 (지금)
  브라우저 ──fetch──▶ 내 Express ──SQL──▶ 같은 PostgreSQL
                                      ↑ 재시작해도 남음
```

**DB는 하나**다. 할 일 데이터는 원래 DB에 있었고,  
바뀐 것은 **누가 DB 앞에 서 있느냐**뿐이다.

| 창구              | 누가 만들었나 | 브라우저가 말하는 방식            |
| ----------------- | ------------- | --------------------------------- |
| Supabase Data API | Supabase      | HTTP (`/rest/v1/todos` …)         |
| 내 Express + `pg` | 나            | HTTP (`/todos`) → 서버 안에서 SQL |

실무 백엔드에 가까운 쪽은 **Express + SQL** 쪽이다.

### 1-3. 메모리 vs DB

|              | 메모리 (`02-memory-todos.js`) | DB (`index.js`)                |
| ------------ | ----------------------------- | ------------------------------ |
| 저장         | `const todos = [...]`         | PostgreSQL `todos` 테이블      |
| 서버 재시작  | 데이터 **리셋**               | 데이터 **유지**                |
| 다른 PC/배포 | 각자 다른 배열                | **같은 DB**를 보면 같은 데이터 |
| 조회 코드    | `todos.find(...)`             | `pool.query('select ...')`     |

실습에서 POST로 만든 할 일이 **서버를 껐다 켜도** 남아 있었던 이유가 DB다.  
그게 “배열 연습”과 “진짜 백엔드”의 가장 큰 체감 차이다.

### 1-4. 코드 한 줄이 의미하는 것

| 코드                       | 의미                                 |
| -------------------------- | ------------------------------------ |
| `DATABASE_URL`             | DB “전화번호 + 비밀번호” (서버만 앎) |
| `new pg.Pool(...)`         | DB와 통화할 회선을 준비함            |
| `pool.query('select ...')` | DB에게 “목록 읽어줘”라고 SQL로 말함  |
| `res.json(result.rows)`    | 읽은 행을 브라우저에 JSON으로 돌려줌 |

> **같은 todos DB**를, 예전엔 Supabase HTTP로 직접 만졌고,  
> 지금은 **내 Express가 SQL로** 만진다.  
> 브라우저 → 내 서버 → DB 가 백엔드의 기본 형태다.

---

## 2. 용어 · 개념

### 2-1. SQL이란?

**SQL** = **S**tructured **Q**uery **L**anguage

|                     | 설명                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| **뭔가**            | 데이터베이스에게 “읽어라 / 넣어라 / 고쳐라 / 지워라”라고 말하는 **언어(문법)** |
| **어디에 쓰나**     | PostgreSQL, MySQL 등 **관계형 DB**와 대화할 때                                 |
| **이 프로젝트에서** | Express가 `pool.query('select ...')` 안에 적은 문자열이 곧 SQL                 |

HTTP가 **브라우저 ↔ 서버**의 말이라면,  
SQL은 **서버 ↔ DB**의 말에 가깝다.

```
브라우저 ──HTTP──▶ Express ──SQL──▶ PostgreSQL
```

자주 쓰는 문장 네 가지:

| SQL      | 뜻     | 이 프로젝트 |
| -------- | ------ | ----------- |
| `SELECT` | 읽어라 | GET         |
| `INSERT` | 넣어라 | POST        |
| `UPDATE` | 고쳐라 | PATCH       |
| `DELETE` | 지워라 | DELETE      |

JS의 `todos.find(...)` / `todos.push(...)`가 하던 일을,  
DB한테는 위 SQL로 시킨다.

### 2-2. `pool.query()` — query는 pool의 명령어?

**맞게 이해한 쪽에 가깝다.**  
`query`는 `pool` 객체가 가진 **메서드(함수)** 다. “이 연결 풀로 SQL을 실행해 줘”라는 동작이다.

| 이름        | 뭔가                                                                             |
| ----------- | -------------------------------------------------------------------------------- |
| **`pool`**  | `new pg.Pool({ connectionString: ... })`로 만든 객체 — DB와 통화할 **회선 묶음** |
| **`query`** | 그 회선으로 SQL 문장을 **보내서 실행**하는 메서드                                |
| **인자**    | 보통 `(SQL 문자열, [파라미터])` — 예: `('select ... where id = $1', [id])`       |
| **반환**    | Promise → `await`하면 결과 객체. 행 목록은 **`result.rows`**                     |

```js
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// pool에게: 이 SQL을 실행해 줘
const result = await pool.query(
    "select id, title, completed, user_id from todos order by id",
);
res.json(result.rows);
```

`query`라는 이름 자체가 “질의(물어보기)”라는 뜻이라,  
SELECT뿐 아니라 INSERT/UPDATE/DELETE도 전부 `pool.query(...)`로 보낸다.

### 2-3. PostgreSQL이란? · 어떻게 읽나?

**PostgreSQL** = 오픈소스 **관계형 DB** 제품 이름이다.  
(줄여서 **Postgres**라고도 많이 씀. 한국어·영어 모두 보통 **포스트그레스** / **포스트그레스큐엘**이라고 읽음.)

|                     | 설명                                                              |
| ------------------- | ----------------------------------------------------------------- |
| **뭔가**            | 데이터를 **표(테이블)** 형태로 저장·조회하는 DB 소프트웨어        |
| **이 프로젝트에서** | Supabase가 클라우드에서 돌려 주는 DB — `todos` 테이블이 여기 있음 |
| **SQL과의 관계**    | PostgreSQL은 **엔진(저장소)**, SQL은 그 엔진에게 하는 **말**      |

```
SQL          → 언어 (SELECT, INSERT …)
PostgreSQL   → 그 말을 알아듣고 데이터를 다루는 프로그램
Supabase     → PostgreSQL을 호스팅 + (Data API 등) 부가 기능 제공
```

이름 유래만 참고: 예전 DB “Ingres”에서 이어졌다는 뜻의 **Post-gres** + SQL.  
외울 필요는 없고, “우리가 쓰는 DB 제품 이름”이면 충분하다.

### 2-4. 관계형 DB 제품에는 또 뭐가 있나?

**관계형 DB (RDB)** = 데이터를 **표(테이블)** 로 두고, 보통 **SQL**로 다루는 DB 종류.  
PostgreSQL은 그중 **제품 하나**다.

| 제품                     | 한 줄                                                            |
| ------------------------ | ---------------------------------------------------------------- |
| **PostgreSQL**           | 이 프로젝트(Supabase)가 쓰는 RDB. 현대 웹·클라우드에서 선호가 큼 |
| **MySQL**                | 웹·CMS 등에서 설치·사용 예가 매우 많음                           |
| **MariaDB**              | MySQL과 가까운 오픈소스 계열                                     |
| **SQLite**               | DB 서버 없이 **파일 하나**로 동작. 로컬·모바일·임베디드에 흔함   |
| **Microsoft SQL Server** | Windows·.NET·기업 환경에서 흔함                                  |
| **Oracle Database**      | 대기업·레거시 시스템에서 비중 큼                                 |

공통점: 표 + (대체로) SQL.  
차이점: 세부 문법·도구·라이선스·잘 쓰이는 생태계가 제품마다 다름.

Node에서 붙일 때 라이브러리도 제품에 맞게 고른다.

| DB              | 예                  |
| --------------- | ------------------- |
| PostgreSQL      | `pg` (지금 쓰는 것) |
| MySQL / MariaDB | `mysql2` 등         |
| SQLite          | `better-sqlite3` 등 |

“세계 절대 1등 제품”은 지표마다 다르다.  
지금은 **PostgreSQL = 우리가 고른 RDB**이고, 위 표는 “같은 종류의 다른 이름들” 정도로 보면 된다.

코드로 볼 때:

|               | 설명                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **비슷한 점** | 테이블 + `SELECT` / `INSERT` / `UPDATE` / `DELETE` 흐름은 통함              |
| **다른 점**   | SQL **방언**(함수·타입·`RETURNING` 유무 등), 접속 **라이브러리**, 일부 기능 |

그래서 MySQL로 바꾸면 URL만 갈아끼우면 끝나는 게 아니라,  
`pg` → `mysql2`처럼 라이브러리를 바꾸고 쿼리도 조금씩 손대는 경우가 많다.  
지금은 PostgreSQL + `pg`만 익히면 된다.

### 2-5. DB 제품을 혼용하기도 하나?

**한다.** 한 서비스가 DB를 **하나만** 쓰는 경우도 많고, **여러 종류를 같이** 쓰는 경우도 있다.

예:

| 조합 예                                     | 왜                                |
| ------------------------------------------- | --------------------------------- |
| PostgreSQL(주문·회원) + Redis(캐시·세션)    | 자주 읽는 값을 빠르게             |
| PostgreSQL(핵심 업무) + Elasticsearch(검색) | 전문 검색은 검색 엔진에           |
| PostgreSQL + 객체 스토리지(이미지)          | 큰 파일은 DB 밖에                 |
| 서비스 A는 MySQL, 서비스 B는 PostgreSQL     | 팀·레거시·마이크로서비스마다 다름 |

다만 **같은 일을 두 RDB에 아무 계획 없이 중복**하기보다는,  
역할이 다를 때 나누는 편이 일반적이다.  
초보 단계·이 프로젝트는 **PostgreSQL 하나**만으로 충분하다.

### 2-6. Supabase만 PostgreSQL을 쓰나?

**아니다.** PostgreSQL은 **독립된 DB 제품**이고, Supabase는 그중 **한 가지 호스팅·플랫폼**일 뿐이다.

PostgreSQL을 쓰는 예:

| 구분                     | 예                                                          |
| ------------------------ | ----------------------------------------------------------- |
| **직접 설치**            | 내 PC · 회사 서버에 PostgreSQL 설치                         |
| **클라우드 DB**          | AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL 등 |
| **개발용 호스팅**        | Neon, Railway, Render, ElephantSQL 등                       |
| **BaaS (DB + 부가기능)** | **Supabase** — PostgreSQL + Auth · Data API · Storage 등    |

이 프로젝트에서 Supabase를 쓰는 이유:  
이미 프론트 실습용 계정이 있고, **같은 DB**로 “직연동 vs Express 경유”를 비교하기 좋아서다.  
다른 곳의 PostgreSQL이어도 `pg` + `DATABASE_URL` 패턴은 같다.

---

## 3. 실행 환경 — 브라우저 안/밖 · Node

같은 **JavaScript**라도 **어디서 실행되느냐**가 다르다.

|                 | 어디서 JS가 도나              | 예                                  |
| --------------- | ----------------------------- | ----------------------------------- |
| **브라우저 안** | Chrome / Edge / Safari **안** | React 화면, 클릭, `fetch`, DOM      |
| **브라우저 밖** | 터미널·내 PC·서버             | `yarn install`, Vite, Express, `pg` |

```
[브라우저 밖 — Node]
  yarn create / yarn add / yarn dev / yarn build / yarn server
  Express, Vite, ESLint, pg …
        │
        │  개발 서버·빌드 결과가 코드를 넘김
        ▼
[브라우저 안]
  사용자가 연 페이지의 React UI
  버튼, fetch, 화면 갱신 …
```

처음에는 “내가 하는 일이 전부 브라우저 안”처럼 느껴질 수 있다.  
**눈에 보이는 결과**가 브라우저이기 때문이다.  
실제로는 **설치·빌드·API 서버**가 대부분 **밖(Node)** 에서 돌아간다.

### 3-1. 순수 HTML/CSS/JS vs React · Next · RN

| 방식                                              | Node 필요?                                |
| ------------------------------------------------- | ----------------------------------------- |
| **HTML + CSS + JS** 파일을 브라우저로 바로 열기   | 실행 시 **브라우저만** (Node 필수 아님)   |
| **CDN** `<script src="...">` 로 라이브러리 로드   | 실행 시 브라우저만                        |
| **`import` + Vite/Webpack** 으로 묶기 (지금 방식) | **개발·빌드 때 Node**                     |
| **React / Next.js / RN**                          | 설치·dev·build·(Next 서버 등) **Node 위** |

**CDN** = **C**ontent **D**elivery **N**etwork (콘텐츠 전송 네트워크).  
인터넷 곳곳에 파일 복사본을 두고, 사용자에게 **가까운 서버**에서 JS·CSS·이미지 등을 받게 하는 방식이다.

바닐라 JS에서 흔한 패턴:

```html
<script src="https://cdn.jsdelivr.net/npm/.../react.min.js"></script>
```

브라우저가 그 URL에서 라이브러리를 **받아와서** 페이지 안에서 실행한다.  
`yarn add`로 `node_modules`에 넣는 대신, **이미 올라와 있는 파일 주소**를 쓰는 것.  
이 방식은 실행 시 **Node 없이 브라우저만** 있으면 된다.

순수 웹 페이지 = 브라우저가 끝.  
현대 JS 프레임워크 스택 = **Node가 개발의 기반(토지)**, 브라우저는 **결과를 보는 곳**.

비유:

```
토지 ≈ Node        — JS로 도구·서버를 돌리는 기반
농사 ≈ 개발        — Node 위에서 하는 설치·코딩·빌드·서버 실행
식탁 ≈ 브라우저    — 농사로 만든 결과(앱 화면)를 사용자가 보는 곳
```

최종 사용자는 Node를 설치하지 않아도 된다. **브라우저만** 있으면 된다.  
**만드는 쪽(개발자 PC)** 의 기반이 Node에 가깝다.

### 3-2. Node.js (Node) 란?

**Node.js** (줄여서 **Node**) = **브라우저 밖**에서 JavaScript를 실행하게 해 주는 **런타임(실행 환경)**.

|              | 설명                            |
| ------------ | ------------------------------- |
| **브라우저** | 웹페이지용 JS 실행              |
| **Node**     | 서버·빌드·패키지 도구용 JS 실행 |

Node 위에는 **npm 레지스트리**를 통해 패키지가 매우 많다 — 서버, 빌드 도구, CLI, 유틸 등.  
React를 쓸 때도 `yarn add`, `yarn dev`, `yarn build`가 전부 이 환경을 거친다.

### 3-3. npm · npx · yarn 과의 관계

| 이름     | 역할                                            |
| -------- | ----------------------------------------------- |
| **Node** | JS를 실행하는 **환경**                          |
| **npm**  | Node와 같이 오는 **패키지 관리자**              |
| **npx**  | npm 패키지를 **일시적으로 실행**                |
| **yarn** | npm과 비슷한 패키지 관리자 (이 프로젝트는 yarn) |

### 3-4. 이 프로젝트에서 안/밖

| 명령 / 동작                      | 안/밖                                           |
| -------------------------------- | ----------------------------------------------- |
| IDE에서 코드 작성                | 파일 저장만 (실행 아님)                         |
| `yarn add pg dotenv`             | **밖**                                          |
| `yarn server` (Express + `pg`)   | **밖**                                          |
| `yarn dev` (Vite 프로세스)       | **밖**                                          |
| `localhost:5173` React 화면·클릭 | **안**                                          |
| `fetch` → `localhost:3000/todos` | 요청은 **안**(브라우저), 처리는 **밖**(Express) |

`pg` = **Node(서버) 쪽**에서 PostgreSQL과 대화하는 라이브러리.

---

## 4. 연결 인프라

### 4-1. Supabase는 뭔데? · 두 가지 접속 방식

**Supabase** = PostgreSQL을 클라우드에 올려 주고, 그 위에 **여러 창구**를 붙여 준 서비스.

같은 `todos` DB를 향해 가는 길이 **둘**이다.

```
① 프론트 실습 (예전)
  React ──HTTP──▶ Data API (Supabase가 만든 REST) ──▶ PostgreSQL

② §5 Express (지금)
  Express ──SQL──▶ PostgreSQL   (pg + DATABASE_URL)
```

|                      | ① Data API 길                                  | ② Express + SQL 길                |
| -------------------- | ---------------------------------------------- | --------------------------------- |
| **누가 DB를 만지나** | Supabase 서버                                  | **내** Express                    |
| **말이 뭔가**        | HTTP (`/rest/v1/todos`)                        | SQL (`SELECT ...`)                |
| **쓰는 설정**        | `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` | `DATABASE_URL`                    |
| **어디에 두나**      | 브라우저에 실려도 됨 (공개 키 쪽)              | **서버 `.env`만** (비밀번호 포함) |

### 4-2. `VITE_SUPABASE_*` 는 “DB 접속 정보”인가?

**반은 맞고, 반은 틀리다.**

- DB(PostgreSQL)에 **직접** 붙는 정보가 **아니다**.
- **Supabase Data API** 주소·열쇠다.  
  브라우저가 HTTP로 “todos 줘”라고 하면, Supabase가 뒤에서 DB를 조회한다.

| 변수                     | 한 줄                                                             |
| ------------------------ | ----------------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Data API 기본 주소 (예: `https://xxxx.supabase.co/rest/v1` 쪽)    |
| `VITE_SUPABASE_ANON_KEY` | 브라우저용 **공개(anon)** 키 — “이 프로젝트 API 써도 된다”는 증명 |

`VITE_` 접두사 = Vite가 **프론트 번들**에 넣을 변수.  
그래서 브라우저에 노출되는 전제다. (RLS 등 권한으로 막는 구조)

### 4-3. `DATABASE_URL` 은?

**맞다 — Express가 PostgreSQL에 직접 붙기 위한 정보**다.

```text
postgresql://유저:비밀번호@호스트:포트/데이터베이스이름
```

- Data API를 거치지 않고, `pg`가 SQL을 날릴 때 쓰는 **전화번호 + 비밀번호**.
- “Express로 DB를 관리한다”기보다: **Express가 DB에 SQL로 읽고 쓴다**는 뜻에 가깝다.
- DB 비밀번호가 들어가므로 `VITE_`를 붙이면 **안 된다**.

한 줄 비교:

> `VITE_SUPABASE_*` = **HTTP 창구(Data API)** 용  
> `DATABASE_URL` = **SQL 직통(PostgreSQL)** 용  
> 둘 다 결국 **같은** Supabase PostgreSQL을 향한다.

### 4-4. Supabase Connect 페이지는?

대시보드 **Connect** = “우리 프로젝트 DB·API에 **어떻게 붙을지** 안내하는 화면”이다.

탭이 여러 개 나오는 이유: **붙는 방식이 여러 가지**이기 때문이다.

| Connect에서 볼 수 있는 것       | 이 프로젝트에서              |
| ------------------------------- | ---------------------------- |
| **ORM** (Prisma 등)             | 안 씀 — 예시는 무시해도 됨   |
| **Direct / Session pooler** URI | §5 `DATABASE_URL` ← **여기** |
| Framework / Server 안내         | 참고만                       |

§5에서 필요한 건 **Connection string (URI)** 한 줄뿐이다.  
Prisma 설치 안내·`DIRECT_URL` 등은 따라가지 않아도 된다.

### 4-5. Direct vs Session pooler

Connect에서 URI를 고를 때:

| 방식                                          | 특징      | 이 프로젝트에서                     |
| --------------------------------------------- | --------- | ----------------------------------- |
| **Direct** (`db.xxx.supabase.co`)             | IPv6 위주 | WSL 등에서 `ENETUNREACH` 날 수 있음 |
| **Session pooler** (`...pooler.supabase.com`) | 풀러 경유 | 로컬에서 연결하기 쉬운 편 ✅        |

연결만 되면 이후 `pool.query` 쓰는 법은 같다.  
에러가 `password authentication failed`가 아니라 `ENETUNREACH`면 **비밀번호 문제가 아니라 네트워크(IPv6)** 문제다.

채팅·스크린샷에 비밀번호·완성 URI를 붙이지 않는 것이 좋다.  
형식만 확인할 때는 `postgresql://postgres:***@호스트:포트/postgres`처럼 가리면 된다.

### 4-6. `dotenv` · `pg`

```js
import "dotenv/config"; // .env → process.env
import pg from "pg";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
```

- `dotenv` — `.env` 파일 내용을 `process.env`로 읽음
- `Pool` — 요청마다 새 TCP 연결을 열기보다, 연결을 재사용

### 4-7. `process.env` 와 `import.meta.env` — 둘 다 “설정 주머니”

둘 다 **코드에 비밀번호·URL을 직접 쓰지 않고**, `.env`에서 설정을 읽어 오는 방법이다.  
다만 **누가·어디서** 쓰는지가 다르다.

|                       | `process.env`                                | `import.meta.env`                       |
| --------------------- | -------------------------------------------- | --------------------------------------- |
| **쓰는 쪽**           | Express 등 **서버** (`server/index.js`)      | React 등 **프론트** (`src/...`)         |
| **누가 채워 주나**    | Node + **dotenv** (`import 'dotenv/config'`) | **Vite** (`yarn dev` / `yarn build` 때) |
| **이 프로젝트 예**    | `process.env.DATABASE_URL`                   | `import.meta.env.VITE_SUPABASE_URL`     |
| **브라우저에 실리나** | 안 실림 (서버만)                             | `VITE_`로 시작하는 것만 **번들에 포함** |

같은 `.env` 파일을 써도:

```
.env
  VITE_SUPABASE_URL=...        ← Vite가 프론트용으로 읽음
  VITE_SUPABASE_ANON_KEY=...
  DATABASE_URL=...             ← dotenv가 서버용으로 읽음
```

```
[서버]  dotenv → process.env.DATABASE_URL → pg.Pool
[프론트] Vite → import.meta.env.VITE_* → fetch(Data API)
```

#### `process.env` (서버)

**`process`** = 지금 돌아가는 Node 프로세스.  
**`env`** = 그 프로세스에 붙은 **환경 변수** 객체.

```js
import "dotenv/config"; // .env → process.env 에 넣기
process.env.DATABASE_URL; // → "postgresql://..."
```

dotenv가 없으면 `.env` 파일만으로는 자동으로 안 들어간다.  
(터미널에서 `export DATABASE_URL=...`처럼 직접 넣는 방법도 있지만, 보통은 dotenv를 씀.)

#### `import.meta.env` (Vite 프론트)

**`import.meta`** = 그 모듈(파일)에 대한 **메타 정보**.  
Vite가 여기에 **`env`** 를 붙여 준다.

```js
// src/config/api.js
import.meta.env.VITE_SUPABASE_URL;
import.meta.env.VITE_SUPABASE_ANON_KEY;
```

중요한 규칙:

1. 프론트에 넣을 변수 이름은 **`VITE_`로 시작**해야 한다.  
   (`DATABASE_URL`은 `VITE_`가 없어서 **브라우저 코드에서 안 보임** — 의도된 동작)
2. `yarn dev` / `yarn build` 때 Vite가 `.env`를 읽고,  
   코드 안의 `import.meta.env.VITE_...`를 **실제 문자열로 바꿔 넣는다.**  
   (빌드 결과물에 값이 박힘)
3. 그래서 anon 키처럼 **공개해도 되는 것**만 `VITE_`로 둔다.  
   DB 비밀번호는 절대 `VITE_`로 두지 않는다.

한 줄 요약:

> **같은 목적**(설정 읽기) · **다른 주머니**  
> 서버 = `process.env` · 프론트(Vite) = `import.meta.env`  
> `VITE_` = “브라우저에 실어 보내도 된다”는 표시

#### (참고) Next.js는?

프레임워크마다 **“브라우저에 실을 변수” 접두사**가 다르다. Vite의 `VITE_`만 있는 게 아니다.

|                        | Vite (이 프로젝트)                  | Next.js                                             |
| ---------------------- | ----------------------------------- | --------------------------------------------------- |
| **서버에서 읽기**      | (Express면) `process.env` + dotenv  | `process.env.SECRET` 등 — **접두사 없이** 서버 전용 |
| **브라우저에 실을 때** | `VITE_` + `import.meta.env.VITE_*`  | **`NEXT_PUBLIC_`** + `process.env.NEXT_PUBLIC_*`    |
| **읽는 코드 모양**     | `import.meta.env.VITE_SUPABASE_URL` | `process.env.NEXT_PUBLIC_SUPABASE_URL`              |

Next.js 예:

```js
// 서버 컴포넌트·API Route — 브라우저에 안 나감
process.env.DATABASE_URL;

// 클라이언트 컴포넌트에도 쓰고 싶을 때 — 반드시 NEXT_PUBLIC_
process.env.NEXT_PUBLIC_SUPABASE_URL;
```

정리:

- Vite → 공개용 접두사 **`VITE_`**, 프론트는 **`import.meta.env`**
- Next → 공개용 접두사 **`NEXT_PUBLIC_`**, 코드에선 보통 **`process.env`** (Next가 빌드 때 치환)
- 비밀번호·`DATABASE_URL`급은 **공개 접두사를 붙이지 않는다** — 규칙은 같다

이 프로젝트는 Vite라서 `VITE_`만 쓰면 된다. Next로 가면 접두사·API 이름만 바꾸면 된다.

### 4-8. 연결만 먼저 확인하기

파일 없이 Node로 짧게 실행:

```bash
node --input-type=module -e "
import 'dotenv/config'
import pg from 'pg'
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const r = await pool.query('select 1 as ok')
console.log(r.rows)
await pool.end()
"
```

줄별 뜻:

| 부분                                     | 뜻                                                            |
| ---------------------------------------- | ------------------------------------------------------------- |
| `node`                                   | Node로 JS 실행                                                |
| `--input-type=module`                    | 안의 코드를 **ESM**으로 취급 → `import` 사용 가능             |
| `-e "..."`                               | 파일을 만들지 않고, 따옴표 안 코드를 **바로 실행** (evaluate) |
| `import 'dotenv/config'`                 | `.env` → `process.env`                                        |
| `import pg from 'pg'`                    | PostgreSQL용 라이브러리                                       |
| `new pg.Pool({ connectionString: ... })` | `DATABASE_URL`로 연결 풀 준비                                 |
| `pool.query('select 1 as ok')`           | 테이블 없이도 되는 **연결 테스트** SQL                        |
| `console.log(r.rows)`                    | 결과 행 출력                                                  |
| `pool.end()`                             | 연결 닫기 (안 닫으면 프로세스가 안 끝날 수 있음)              |

성공 시 보통:

```js
[{ ok: 1 }];
```

이건 Supabase **Data API(HTTP)** 가 아니라,  
`pg`로 **PostgreSQL에 SQL을 직접** 보낸 것이다. Express를 띄우기 전에 “DB 통화가 되나?”만 확인하는 용도다.

---

## 5. SQL 네 가지 = CRUD

HTTP 메서드와 SQL은 **같은 일을 다른 언어로** 말하는 것에 가깝다.

| HTTP                | SQL                                   | 하는 일   |
| ------------------- | ------------------------------------- | --------- |
| `GET /todos`        | `SELECT ... FROM todos`               | 읽기      |
| `GET /todos/:id`    | `SELECT ... WHERE id = $1`            | 단건 읽기 |
| `POST /todos`       | `INSERT INTO todos ... RETURNING ...` | 만들기    |
| `PATCH /todos/:id`  | `UPDATE todos SET ...`                | 고치기    |
| `DELETE /todos/:id` | `DELETE FROM todos WHERE id = $1`     | 지우기    |

### 5-1. `$1`, `$2` 는?

값을 SQL 문자열에 직접 붙이지 않고 **자리만** 비워 둔 것.

```js
await pool.query(
    "select ... from todos where id = $1",
    [id], // $1 자리에 id가 들어감
);
```

이렇게 해야 입력값이 SQL 문법을 깨뜨리는 공격(SQL 인젝션)을 막기 쉽다.  
`'... where id = ' + id`처럼 문자열을 이어 붙이지 않는다.

### 5-2. `RETURNING` 은? · `result.rows` 는 응답 body인가?

**비슷한 비유는 맞지만, HTTP `response`와 같은 층은 아니다.**

|                      | HTTP (브라우저 ↔ Express)    | SQL / `pg` (Express ↔ DB)                                    |
| -------------------- | ---------------------------- | ------------------------------------------------------------ |
| **요청**             | `POST /todos` + body         | `INSERT ...`                                                 |
| **“결과 좀 돌려줘”** | (항상 응답이 옴)             | **`RETURNING`** — INSERT 후에도 행을 돌려달라는 **SQL 옵션** |
| **받은 데이터**      | `response`의 **body** (JSON) | **`result.rows`** — DB가 돌려준 **행 배열**                  |

```
브라우저 ──HTTP──▶ Express ──SQL──▶ PostgreSQL
         ◀─ JSON ─  ◀─ result.rows ─
```

- **`RETURNING`** ≈ “저장만 하지 말고, **방금 그 행을 응답으로도 줘**”  
  HTTP의 `response` 전체와 같다기보다, INSERT에 붙이는 **“결과를 돌려달라” 옵션**에 가깝다.  
  (`RETURNING` 없이 INSERT만 하면 성공해도 행 내용이 안 올 수 있음.)

- **`result.rows`** ≈ DB 쪽에서의 **본문(데이터)**  
  Express가 이걸 받아 `res.json(result.rows)` / `res.json(result.rows[0])` 하면,  
  그게 브라우저가 보는 **HTTP 응답 body**가 된다.

한 줄:

> `RETURNING` = DB에게 “결과 행도 줘”  
> `result.rows` = DB가 준 그 행들  
> HTTP `response` / body = Express가 브라우저에게 다시 포장해서 보낸 것

### 5-3. `async` / `await` 는 왜?

DB 응답은 시간이 걸린다.  
`await pool.query(...)` = “결과 올 때까지 기다렸다가 다음 줄”  
`await`를 쓰려면 그 함수가 `async (req, res) => { ... }` 여야 한다.  
`async` 없이 `await`만 쓰면 `Unexpected reserved word` 문법 에러가 난다.

---

## 6. Express 라우트가 하는 일 (안 바뀐 뼈대)

요청이 오면 하는 일은 §2·§4와 같다. **가운데(3번)만** DB로 바뀌었다.

```
1. HTTP 요청 도착 (method + URL + body)
2. (필요하면) 검증 — title 없으면 400
3. ★ 데이터 처리 — 예전: 배열 조작 / 지금: SQL
4. status + JSON (또는 204) 응답
```

그래서 프론트는 URL·JSON 형태만 같으면 그대로 동작한다.  
§3 CORS, §4 status 분기도 **그대로 유효**하다.

---

## 7. 파일 역할

| 파일                                    | 역할                                             |
| --------------------------------------- | ------------------------------------------------ |
| `server/index.js`                       | **지금 실행**하는 서버 (DB) — `yarn server` 대상 |
| `server/examples/02-memory-todos.js`    | §2~§4 메모리 CRUD 참고용 (실행 안 함)            |
| `src/pages/backend/cors/TodoList.jsx`   | Express `GET /todos` 호출                        |
| `src/pages/backend/status/PostTodo.jsx` | Express `POST` + status 분기                     |
| `src/pages/frontend/rest-api/...`       | (참고) 예전처럼 Supabase Data API 직연동         |

같은 DB를 **두 길**로 볼 수 있다.

| 페이지    | 경로                                                            |
| --------- | --------------------------------------------------------------- |
| 서버 경유 | `/backend/cors/todo-list` → Express → PostgreSQL                |
| 직연동    | `/frontend/rest-api/todo-list` → Supabase Data API → PostgreSQL |

둘 다 데이터가 보이면 “DB는 하나, 창구만 둘”이 체감된다.

---

## 8. 실습 순서 (복습)

1. `DATABASE_URL` 설정 (`yarn add pg dotenv`)
2. `select 1` 로 연결 확인 (Direct 실패 시 Session pooler)
3. 메모리본을 `examples/02-memory-todos.js`에 두고 `index.js`는 DB용으로
4. CRUD 전 구간을 SQL로 (`async` · `$1` · `returning`)
5. POST 후 **서버 재시작**해도 데이터 유지되는지 확인
6. 프론트 목록·POST 페이지로 동일 API 확인

---

## 9. 스스로 확인해 보는 질문

다음을 말로 설명할 수 있으면 §5는 이해한 것이다.

1. 프론트 `fetch` URL이 안 바뀌었는데도 DB 데이터가 보이는 이유는?
2. 서버를 재시작해도 POST한 할 일이 남는 이유는?
3. Supabase Data API 길과 Express+`pg` 길의 **공통점**과 **차이**는?
4. `DATABASE_URL`을 `VITE_`로 시작하면 안 되는 이유는?

답 (짧게):

1. Express가 그 URL에서 SQL로 DB를 읽어 JSON으로 주기 때문
2. 데이터가 프로세스 메모리가 아니라 DB에 있기 때문
3. 공통 = 같은 PostgreSQL / 차이 = HTTP 창구를 누가 제공하고, DB에 SQL을 누가 날리는지
4. Vite가 브라우저 번들에 실어 비밀번호가 노출되기 때문

---

## 다음에 연결

- §6 폴더 구조 — `index.js` 한 파일을 routes / controllers / services / db 로 나누기
- §8 `.env` · 검증 — 비밀키·입력 검사를 더 체계적으로
- §10 Spring — Repository가 SQL(또는 ORM)을 담당하는 자리에 `pool.query`가 대응
