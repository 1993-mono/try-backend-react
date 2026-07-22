import { useState } from 'react'
import {
  API_BASE,
  supabaseHeaders,
  supabaseObjectHeaders,
} from '@/config/api'

export default function ResourceCrud() {
  const [todoId, setTodoId] = useState('1')
  const [todo, setTodo] = useState(null)
  const [title, setTitle] = useState('')
  const [completed, setCompleted] = useState(false)

  // 마지막에 쓴 method / body — PUT vs PATCH 비교용
  const [lastAction, setLastAction] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const resourceUrl = `${API_BASE}/todos?id=eq.${todoId}`

  async function readTodo() {
    setLoading(true)
    setError(null)
    setLastAction({ method: 'GET', body: null, url: `${resourceUrl}&select=*` })

    try {
      const response = await fetch(`${resourceUrl}&select=*`, {
        method: 'GET',
        headers: supabaseObjectHeaders,
      })
      // fetch 완료 = HTTP 한 바퀴 끝. 아래는 response 읽기

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setTodo(data)
      setTitle(data.title ?? '')
      setCompleted(Boolean(data.completed))
    } catch (err) {
      setError(err.message)
      setTodo(null)
    } finally {
      setLoading(false)
    }
  }

  // PATCH — 바꿀 필드만 (일부 수정)
  async function patchPartial() {
    setLoading(true)
    setError(null)

    const body = { completed }

    setLastAction({ method: 'PATCH (일부)', body, url: resourceUrl })

    try {
      const response = await fetch(resourceUrl, {
        method: 'PATCH',
        headers: supabaseObjectHeaders,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setTodo(data)
      setCompleted(Boolean(data.completed))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // PATCH — 필드 전부 보냄 (전부 교체에 가깝게)
  async function patchFull() {
    setLoading(true)
    setError(null)

    const body = {
      title,
      completed,
      user_id: todo?.user_id ?? 1,
    }

    setLastAction({ method: 'PATCH (전체 필드)', body, url: resourceUrl })

    try {
      const response = await fetch(resourceUrl, {
        method: 'PATCH',
        headers: supabaseObjectHeaders,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setTodo(data)
      setTitle(data.title ?? '')
      setCompleted(Boolean(data.completed))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTodo() {
    setLoading(true)
    setError(null)
    setLastAction({ method: 'DELETE', body: null, url: resourceUrl })

    try {
      const response = await fetch(resourceUrl, {
        method: 'DELETE',
        headers: supabaseHeaders,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setTodo(null)
      setTitle('')
      setCompleted(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>자원 CRUD</h1>
      <p>
        같은 자원(id)에 대해 GET → PATCH(일부) → PATCH(전체) → DELETE
      </p>

      <p>
        <label>
          todo id:{' '}
          <input
            value={todoId}
            onChange={(e) => setTodoId(e.target.value)}
            disabled={loading}
          />
        </label>
        {' '}
        <button type="button" onClick={readTodo} disabled={loading}>
          1. 조회 (GET)
        </button>
      </p>

      {todo && (
        <div>
          <h2>현재 자원</h2>
          <pre>{JSON.stringify(todo, null, 2)}</pre>

          <p>
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                disabled={loading}
              />
              {' '}completed
            </label>
            {' '}
            <button type="button" onClick={patchPartial} disabled={loading}>
              2. PATCH (일부)
            </button>
          </p>

          <p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="title"
              disabled={loading}
            />
            {' '}
            <button type="button" onClick={patchFull} disabled={loading}>
              3. PATCH (전체 필드)
            </button>
          </p>

          <p>
            <button type="button" onClick={deleteTodo} disabled={loading}>
              4. DELETE
            </button>
          </p>
          <p>
            <small>DELETE는 실제 DB에서 지웁니다. 필요하면 POST로 다시 만드세요.</small>
          </p>
        </div>
      )}

      {error && <p>에러: {error}</p>}

      {lastAction && (
        <div>
          <h2>마지막 요청</h2>
          <pre>{JSON.stringify(lastAction, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}