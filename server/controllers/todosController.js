import * as todosDb from '../db/todos.js'

// POST /todos body → 검증 후 DTO (쓸 필드만)
function parseCreateTodoBody(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'body is required' }
  }
  // trim(): 문자열 앞·뒤 공백 제거 (문자열 메서드)
  if (typeof body.title !== 'string' || body.title.trim() === '') {
    return { error: 'title must be a non-empty string' }
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    return { error: 'completed must be boolean' }
  }

  return {
    data: {
      title: body.title.trim(),
      completed: body.completed ?? false,
      user_id: body.user_id ?? 1,
    }
  }
}

// PATCH /todos/:id body → 보낸 필드만 검증 후 DTO
function parseUpdateTodoBody(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'body is required' }
  }

  // title / completed 둘 다 없으면 바꿀 게 없음
  if (body.title === undefined && body.completed === undefined) {
    return { error: 'title or completed is required' }
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      return { error: 'title must be a non-empty string' }
    }
  }

  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    return { error: 'completed must be boolean' }
  }

  // 보낸 것만 data에 넣음 (나중에 기존 todo와 병합)
  const data = {}
  if (body.title !== undefined) data.title = body.title.trim()
  if (body.completed !== undefined) data.completed = body.completed
  return { data }
}

export async function listTodos(req, res) {
  try {
    const result = await todosDb.findAll()
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}

export async function getTodo(req, res) {
  try {
    const id = Number(req.params.id)
    const result = await todosDb.findById(id)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}

export async function createTodo(req, res) {
  const parsed = parseCreateTodoBody(req.body)
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error })
  }

  try {
    const result = await todosDb.insert(parsed.data) // DTO만 전달
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}

export async function updateTodo(req, res) {
  const parsed = parseUpdateTodoBody(req.body)
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error })
  }

  try {
    const id = Number(req.params.id)

    const current = await todosDb.findById(id)
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }

    const todo = current.rows[0]
    // DTO에 있는 것만 덮어씀, 없으면 기존 값 유지
    const title = parsed.data.title !== undefined ? parsed.data.title : todo.title
    const completed =
      parsed.data.completed !== undefined ? parsed.data.completed : todo.completed

    const result = await todosDb.update(id, { title, completed })
    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}

export async function deleteTodo(req, res) {
  try {
    const id = Number(req.params.id)
    const result = await todosDb.remove(id)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }
    res.status(204).send()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}