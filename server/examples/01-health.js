import express from 'express'

// Express 앱 인스턴스 생성
const app = express()
const PORT = 3000

// GET /health 요청이 오면 이 함수 실행
// req = request(요청), res = response(응답) — 이름 관례
app.get('/health', (req, res) => {
  // JSON body로 응답 (기본 status 200)
  res.json({ ok: true })
})

// 지정한 포트에서 요청 대기 시작 (listen)
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})