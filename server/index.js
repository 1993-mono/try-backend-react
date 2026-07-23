import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import pg from 'pg'

const app = express()
const PORT = 3000

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

// 목록
app.get('/todos', async (req, res) => {
  try {
    const result = await pool.query(
      'select id, title, completed, user_id from todos order by id',
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// 단건
app.get('/todos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query(
      'select id, title, completed, user_id from todos where id = $1',
      [id],
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// 생성
app.post('/todos', async (req, res) => {
  if (!req.body?.title) {
    return res.status(400).json({ error: 'title is required' })
  }

  try {
    const result = await pool.query(
      `insert into todos (title, completed, user_id)
      values ($1, $2, $3)
      returning id, title, completed, user_id`,
      [
        req.body.title,
        req.body.completed ?? false,
        req.body.user_id ?? 1,
      ],
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// 일부 수정
app.patch('/todos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    const current = await pool.query(
      'select id, title, completed, user_id from todos where id = $1',
      [id],
    )
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }

    const todo = current.rows[0]
    const title = req.body.title !== undefined ? req.body.title : todo.title
    const completed =
      req.body.completed !== undefined ? req.body.completed : todo.completed

    const result = await pool.query(
      `update todos
      set title = $1, completed = $2
      where id = $3
      returning id, title, completed, user_id`,
      [title, completed, id],
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

// 삭제
app.delete('/todos/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const result = await pool.query(
      'delete from todos where id = $1 returning id',
      [id],
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})