import { useEffect, useState } from 'react'
import { EXPRESS_API_BASE } from '@/config/express-api'

export default function TodoList() {
  const [token, setToken] = useState('')
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // 로그인 → JWT 발급
  const login = async () => {
    const response = await fetch(`${EXPRESS_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo123' })
    })
    if (!response.ok) {
      throw new Error(`로그인 실패: ${response.status}`)
    }
    const data = await response.json()
    return data.token
  }

  // 목록 조회 (Bearer 필수)
  const fetchTodos = async (accessToken) => {
    const response = await fetch(`${EXPRESS_API_BASE}/todos`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    setStatus(response.status)

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error ?? `목록 조회 실패: ${response.status}`)
    }
    setTodos(data)
  }

  // 마운트 시 1회: 로그인 → 토큰 저장 → 목록 조회
  // useEffect 콜백은 async로 두지 않는 게 일반적 → 안에서 async 함수를 만들어 즉시 실행
  useEffect(() => {
    // ; (async () => { ... })() — IIFE(즉시 실행 함수)
    // 앞의 ; 는 이전 줄과 붙는 걸 막는 안전장치 (없어도 보통 동작함)
    ; (async () => {
      try {
        setLoading(true)
        setError(null)
        const accessToken = await login()
        setToken(accessToken)
        await fetchTodos(accessToken)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // CREATE — POST /todos
  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${EXPRESS_API_BASE}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })
      setStatus(response.status)

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? `생성 실패: ${response.status}`)
      }

      setTitle('')
      await fetchTodos(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // UPDATE — PATCH /todos/:id (완료 토글)
  const handleToggle = async (todo) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${EXPRESS_API_BASE}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !todo.completed }),
      })
      setStatus(response.status)

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? `수정 실패: ${response.status}`)
      }

      await fetchTodos(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // DELETE — DELETE /todos/:id (204는 body 없음)
  const handleDelete = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${EXPRESS_API_BASE}/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setStatus(response.status)

      if (!response.ok) {
        let message = `삭제 실패: ${response.status}`
        try {
          const data = await response.json()
          message = data.error ?? message
        } catch {
          // body가 없으면 기본 메시지 유지
        }
        throw new Error(message)
      }

      await fetchTodos(token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && todos.length === 0) return <p>불러오는 중...</p>

  return (
    <div>
      <h1>CRUD — 인증 기반 todos</h1>
      <p>마지막 status: {status ?? '-'}</p>
      {error && <p>에러: {error}</p>}

      <form onSubmit={handleCreate}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 할 일 제목"
        />
        <button type="submit" disabled={loading}>
          추가
        </button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            #{todo.id} {todo.title} ({todo.completed ? '완료' : '미완료'}){' '}
            <button type="button" onClick={() => handleToggle(todo)} disabled={loading}>
              완료 토글
            </button>{' '}
            <button type="button" onClick={() => handleDelete(todo.id)} disabled={loading}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}