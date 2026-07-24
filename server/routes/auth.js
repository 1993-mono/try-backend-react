import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

// 연습용 — 실무에선 DB 조회 + 비밀번호 해시 비교
const DEMO_USER = { username: 'demo', password: 'demo123', userId: 1 }

// 로그인은 POST — 아이디·비밀번호를 요청 body에 실어 보내야 해서
// 백엔드도 POST /login 으로 열어 두고, 프론트도 POST 로 보냄 (인증 미들웨어 없이)
// body(JSON) → express.json() → req.body 로 읽음 / GET 쿼리에 비밀번호 넣지 않음
// todos INSERT가 아니라, 맞는지 확인 후 토큰을 돌려주는 요청
router.post('/login', (req, res) => {
  // body 없으면 빈 객체로 (undefined 방지)
  const { username, password } = req.body ?? {}

  // 1) 형식 검사 — 문자열인지 (없으면/타입 틀리면 400)
  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    username.trim() === '' ||
    password.trim() === ''
  ) {
    return res.status(400).json({ error: 'username and password required' })
  }

  // 2) 인증 — 형식은 OK, 값만 틀린 경우 401
  if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
    return res.status(401).json({ error: 'invalid credentials' })
  }

  // JWT 발급: payload + 비밀키 + 옵션(만료) → 토큰 문자열 한 줄
  const token = jwt.sign(
    { userId: DEMO_USER.userId, username: DEMO_USER.username }, // payload (실어 둘 내용)
    process.env.JWT_SECRET, // 서명용 비밀키 (서버 .env만)
    { expiresIn: '2h' }, // 2시간 후 만료
  )

  // 응답 body에 JSON으로 실어 보냄 — 클라이언트가 Authorization: Bearer 에 붙임
  res.json({ token })
})

export default router