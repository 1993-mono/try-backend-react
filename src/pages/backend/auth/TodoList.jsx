import { useState, useEffect } from 'react'
import { EXPRESS_API_BASE } from '@/config/express-api'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // 1) POST /login — body에 계정 정보 → 응답의 token 받기 (연습용 고정 계정)
    fetch(`${EXPRESS_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo123' }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`로그인 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // 2) GET /todos — Authorization: Bearer <token> (없으면 서버가 401)
        return fetch(`${EXPRESS_API_BASE}/todos`, {
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        })
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json() // todos 배열
      })
      .then((data) => {
        setTodos(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>불러오는 중...</p>

  if (error) return <p>에러: {error}</p>

  return (
    <div>
      <h1>인증 — JSON GET (Bearer)</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            #{todo.id} {todo.title} ({todo.completed ? '완료' : '미완료'})
          </li>
        ))}
      </ul>
    </div>
  )
}