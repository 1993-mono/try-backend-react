import * as todosDb from '../db/todos.js'

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
  if (!req.body?.title) {
    return res.status(400).json({ error: 'title is required' })
  }

  try {
    const result = await todosDb.insert({
      title: req.body.title,
      completed: req.body.completed ?? false,
      user_id: req.body.user_id ?? 1,
    })
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'db error' })
  }
}

export async function updateTodo(req, res) {
  try {
    const id = Number(req.params.id)

    const current = await todosDb.findById(id)
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'not found' })
    }

    const todo = current.rows[0]
    const title = req.body.title !== undefined ? req.body.title : todo.title
    const completed =
      req.body.completed !== undefined ? req.body.completed : todo.completed

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