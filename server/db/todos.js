import pool from './pool.js'

export function findAll() {
  return pool.query(
    'select id, title, completed, user_id from todos order by id',
  )
}

export function findById(id) {
  return pool.query(
    'select id, title, completed, user_id from todos where id = $1',
    [id],
  )
}

export function insert({ title, completed, user_id }) {
  return pool.query(
    `insert into todos (title, completed, user_id)
    values ($1, $2, $3)
    returning id, title, completed, user_id`,
    [title, completed, user_id]
  )
}

export function update(id, { title, completed }) {
  return pool.query(
    `update todos
    set title = $1, completed = $2
    where id = $3
    returning id, title, completed, user_id`,
    [title, completed, id],
  )
}

export function remove(id) {
  return pool.query(
    'delete from todos where id = $1 returning id',
    [id],
  )
}