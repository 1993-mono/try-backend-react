import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import todosRouter from './routes/todos.js'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use('/todos', todosRouter)

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})