import { useState, useEffect } from 'react'

export default function TodoGet() {
  // todo: API에서 받은 JSON을 담아 두는 상태
  const [todo, setTodo] = useState(null)

  useEffect(() => {
    // HTTP GET 요청 → REST API 창구(/todos/1) 호출
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      // JSON 문자열 → JS 객체로 변환
      .then((response) => response.json())
      // 파싱된 객체를 상태에 저장 → 화면이 다시 그려짐
      .then((data) => setTodo(data))
  }, [])

  return (
    <div>
      <h1>JSON GET (단건)</h1>
      {todo ? (
        <div>
          <p>id: {todo.id}</p>
          <p>title: {todo.title}</p>
          <p>completed: {todo.completed ? '완료' : '미완료'}</p>
        </div>
      ) : (
        <p>불러오는 중</p>
      )}
    </div>
  )
}