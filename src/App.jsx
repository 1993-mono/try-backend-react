import { Link, Routes, Route } from 'react-router-dom'
import BeforeParse from './pages/BeforeParse.jsx'
import TodoGet from './pages/TodoGet.jsx'
import TodoList from './pages/TodoList.jsx'
import TodoPost from './pages/TodoPost.jsx'
import TodoPatch from './pages/TodoPatch.jsx'
import TodoDelete from './pages/TodoDelete.jsx'

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
        {' | '}
        <Link to="/todo-post">JSON POST (생성)</Link>
        {' | '}
        <Link to="/todo-patch">JSON PATCH (수정)</Link>
        {' | '}
        <Link to="/todo-delete">JSON DELETE (삭제)</Link>
      </nav>

      <hr />

      <Routes>
        <Route
          path="/"
          element={<p>위에서 페이지를 선택하세요.</p>}
        />
        <Route path="/before-parse" element={<BeforeParse />} />
        <Route path="/todo-get" element={<TodoGet />} />
        <Route path="/todo-list" element={<TodoList />} />
        <Route path="/todo-post" element={<TodoPost />} />
        <Route path="/todo-patch" element={<TodoPatch />} />
        <Route path="/todo-delete" element={<TodoDelete />} />
      </Routes>
    </div>
  )
}
