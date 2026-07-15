import { Link, Routes, Route } from 'react-router-dom'
import BeforeParse from './pages/BeforeParse.jsx'
import TodoGet from './pages/TodoGet.jsx'
import TodoList from './pages/TodoList.jsx'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">홈</Link>
        {' | '}
        <Link to="/before-parse">파싱 전</Link>
        {' | '}
        <Link to="/todo-get">JSON GET (단건)</Link>
        {' | '}
        <Link to="/todo-list">JSON GET (목록)</Link>
      </nav>

      <hr />

      <Routes>
        <Route
          path="/"
          element={<p>위에서 페이지를 선택하세요.</p>}
        />
        {/* /before-parse → 상태코드·헤더·본문 텍스트 (파싱 전) */}
        <Route path="/before-parse" element={<BeforeParse />} />
        {/* /todo-get → TodoGet 컴포넌트 (HTTP GET + JSON) */}
        <Route path="/todo-get" element={<TodoGet />} />
        {/* /todo-list → TodoList 컴포넌트 (HTTP GET + JSON) */}
        <Route path="/todo-list" element={<TodoList />} />
      </Routes>
    </div>
  )
}