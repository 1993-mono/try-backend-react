import { Link, Routes, Route } from 'react-router-dom'

import BeforeParse from './pages/rest-api/BeforeParse.jsx'
import TodoGet from './pages/rest-api/TodoGet.jsx'
import TodoList from './pages/rest-api/TodoList.jsx'
import TodoPost from './pages/rest-api/TodoPost.jsx'
import TodoPatch from './pages/rest-api/TodoPatch.jsx'
import TodoPut from './pages/rest-api/TodoPut.jsx'
import TodoDelete from './pages/rest-api/TodoDelete.jsx'
import StatusCode from './pages/http-advanced/StatusCode.jsx'

export default function App() {
  return (
    <div>
      <nav>
        <p>
          <Link to="/">홈</Link>
        </p>

        {/* 로드맵 1단계 — 폴더: pages/rest-api */}
        <p>
          <strong>REST API 연동</strong>
          <br />
          <Link to="/rest-api/before-parse">파싱 전</Link>
          {' | '}
          <Link to="/rest-api/todo-get">JSON GET (단건)</Link>
          {' | '}
          <Link to="/rest-api/todo-list">JSON GET (목록)</Link>
          {' | '}
          <Link to="/rest-api/todo-post">JSON POST (생성)</Link>
          {' | '}
          <Link to="/rest-api/todo-patch">JSON PATCH (수정)</Link>
          {' | '}
          <Link to="/rest-api/todo-put">JSON PUT (교체)</Link>
          {' | '}
          <Link to="/rest-api/todo-delete">JSON DELETE (삭제)</Link>
        </p>

        {/* 로드맵 2단계 — 폴더: pages/http-advanced */}
        <p>
          <strong>HTTP 심화</strong>
          <br />
          <Link to="/http-advanced/status-code">상태 코드</Link>
        </p>
      </nav>

      <hr />

      <Routes>
        <Route path="/" element={<p>위에서 페이지를 선택하세요.</p>} />

        <Route path="/rest-api/before-parse" element={<BeforeParse />} />
        <Route path="/rest-api/todo-get" element={<TodoGet />} />
        <Route path="/rest-api/todo-list" element={<TodoList />} />
        <Route path="/rest-api/todo-post" element={<TodoPost />} />
        <Route path="/rest-api/todo-patch" element={<TodoPatch />} />
        <Route path="/rest-api/todo-put" element={<TodoPut />} />
        <Route path="/rest-api/todo-delete" element={<TodoDelete />} />

        <Route path="/http-advanced/status-code" element={<StatusCode />} />
      </Routes>
    </div>
  )
}