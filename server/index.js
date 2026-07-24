import 'dotenv/config' // .env → process.env (JWT_SECRET, DATABASE_URL 등)
import cors from 'cors'
import express from 'express'
import todosRouter from './routes/todos.js' // export default router → 이름만 todosRouter
import authRouter from './routes/auth.js' // export default router → 이름만 authRouter

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json()) // 요청 JSON body → req.body (로그인 body 포함)

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// POST /login
app.use(authRouter)
// /todos/*
app.use('/todos', todosRouter)

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})