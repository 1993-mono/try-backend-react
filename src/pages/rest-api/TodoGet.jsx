import { useState, useEffect } from 'react'
import { API_BASE, supabaseObjectHeaders } from '@/config/api'

export default function TodoGet() {
  // todo: API에서 받은 JSON을 담아 두는 상태
  const [todo, setTodo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Supabase: /todos/1 대신 쿼리로 단건 지정 (?id=eq.1)
    // Accept object → 배열이 아니라 객체 1개로 받음
    fetch(`${API_BASE}/todos?id=eq.1&select=*`, {
      headers: supabaseObjectHeaders,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`요청 실패: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => setTodo(data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>JSON GET (단건)</h1>
      {error && <p>에러: {error}</p>}
      {todo ? (
        <div>
          <p>id: {todo.id}</p>
          <p>title: {todo.title}</p>
          <p>completed: {todo.completed ? '완료' : '미완료'}</p>
          <p>user_id: {todo.user_id}</p>
        </div>
      ) : (
        !error && <p>불러오는 중</p>
      )}
    </div>
  )
}