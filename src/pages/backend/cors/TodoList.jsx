import { useState, useEffect } from 'react'
import { EXPRESS_API_BASE } from '@/config/express-api'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // GET /todos → 할 일 목록(배열) JSON
    fetch(`${EXPRESS_API_BASE}/todos`)
      .then((response) => {
        // HTTP 상태 코드가 실패면 에러로 처리
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        // 목록이 너무 길면 앞부분만
        setTodos(data.slice(0, 10))
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
      <h1>CORS — JSON GET (목록)</h1>
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