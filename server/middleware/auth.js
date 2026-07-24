import jwt from 'jsonwebtoken'

// 문지기 미들웨어.
// 토큰 검사 후 통과하면 next() → 이 미들웨어를 쓰는 라우터의 다음 핸들러로.
// 실패하면 next()를 안 부르고 401만 보내고 끝.
export function requireAuth(req, res, next) {
  // 예: "Bearer eyJhbGciOi..."
  const header = req.headers.authorization

  // 헤더가 없거나 Bearer 형식이 아니면 거절
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  // "Bearer " 글자 수만큼 잘라 토큰만 남김
  const token = header.slice('Bearer '.length)

  try {
    // 서명·만료 검증. 실패하면 catch로
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload // 뒤 핸들러에서 누가 요청했는지 쓸 수 있게
    next() // 다음 미들웨어/라우트로
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}