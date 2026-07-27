import { Link, Routes, Route, useLocation } from 'react-router-dom'
import { HiHome } from 'react-icons/hi2'

import BeforeParse from '@/pages/frontend/rest-api/BeforeParse.jsx'
import TodoGet from '@/pages/frontend/rest-api/TodoGet.jsx'
import TodoList from '@/pages/frontend/rest-api/TodoList.jsx'
import TodoPost from '@/pages/frontend/rest-api/TodoPost.jsx'
import TodoPatch from '@/pages/frontend/rest-api/TodoPatch.jsx'
import TodoPut from '@/pages/frontend/rest-api/TodoPut.jsx'
import TodoDelete from '@/pages/frontend/rest-api/TodoDelete.jsx'

import StatusCode from '@/pages/frontend/http-advanced/StatusCode.jsx'
import Header from '@/pages/frontend/http-advanced/Header.jsx'
import UrlQuery from '@/pages/frontend/http-advanced/UrlQuery.jsx'

import RequestResponse from '@/pages/frontend/http-model/RequestResponse.jsx'
import ResourceCrud from '@/pages/frontend/http-model/ResourceCrud.jsx'

import BackendTodoList from '@/pages/backend/cors/TodoList.jsx'
import PostTodo from '@/pages/backend/status/PostTodo.jsx'
import AuthTodoList from '@/pages/backend/auth/TodoList.jsx'
import CrudTodoList from '@/pages/backend/crud/TodoList.jsx'

export default function App() {
  const { pathname } = useLocation()
  const isFrontend = pathname.startsWith('/frontend')
  const isBackend = pathname.startsWith('/backend')

  return (
    <div>
      <nav>
        <p>
          <Link to="/" className="nav-home">
            <HiHome aria-hidden="true" />
          </Link>
          {' | '}
          <Link to="/backend">백엔드</Link>
          {' | '}
          <Link to="/frontend">프론트엔드</Link>
        </p>

        {isBackend && (
          <>
            <p>
              <strong>CORS</strong>
              <br />
              <Link to="/backend/cors/todo-list">GET 목록 (Express 연동)</Link>
            </p>

            <p>
              <strong>status</strong>
              <br />
              <Link to="/backend/status/post-todo">POST 생성 (201·400)</Link>
            </p>

            <p>
              <strong>인증</strong>
              <br />
              <Link to="/backend/auth/todo-list">GET 목록 (Bearer)</Link>
            </p>

            <p>
              <strong>CRUD</strong>
              <br />
              <Link to="/backend/crud/todo-list">CRUD — 인증 기반 todos</Link>
            </p>
          </>
        )}

        {isFrontend && (
          <>
            <p>
              <strong>REST API 연동</strong>
              <br />
              <Link to="/frontend/rest-api/before-parse">파싱 전</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-get">JSON GET (단건)</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-list">JSON GET (목록)</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-post">JSON POST (생성)</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-patch">JSON PATCH (수정)</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-put">JSON PUT (교체)</Link>
              {' | '}
              <Link to="/frontend/rest-api/todo-delete">JSON DELETE (삭제)</Link>
            </p>

            <p>
              <strong>HTTP 심화</strong>
              <br />
              <Link to="/frontend/http-advanced/status-code">상태 코드</Link>
              {' | '}
              <Link to="/frontend/http-advanced/header">헤더</Link>
              {' | '}
              <Link to="/frontend/http-advanced/url-query">URL 구조</Link>
            </p>

            <p>
              <strong>HTTP 모델</strong>
              <br />
              <Link to="/frontend/http-model/request-response">요청-응답 한 바퀴</Link>
              {' | '}
              <Link to="/frontend/http-model/resource-crud">자원 CRUD</Link>
            </p>
          </>
        )}
      </nav>

      <hr />

      <Routes>
        <Route path="/" element={<p>위에서 프론트엔드 또는 백엔드를 선택하세요.</p>} />
        <Route path="/frontend" element={<p>위에서 페이지를 선택하세요.</p>} />
        <Route path="/backend" element={<p>위에서 페이지를 선택하세요.</p>} />

        <Route path="/frontend/rest-api/before-parse" element={<BeforeParse />} />
        <Route path="/frontend/rest-api/todo-get" element={<TodoGet />} />
        <Route path="/frontend/rest-api/todo-list" element={<TodoList />} />
        <Route path="/frontend/rest-api/todo-post" element={<TodoPost />} />
        <Route path="/frontend/rest-api/todo-patch" element={<TodoPatch />} />
        <Route path="/frontend/rest-api/todo-put" element={<TodoPut />} />
        <Route path="/frontend/rest-api/todo-delete" element={<TodoDelete />} />

        <Route path="/frontend/http-advanced/status-code" element={<StatusCode />} />
        <Route path="/frontend/http-advanced/header" element={<Header />} />
        <Route path="/frontend/http-advanced/url-query" element={<UrlQuery />} />

        <Route path="/frontend/http-model/request-response" element={<RequestResponse />} />
        <Route path="/frontend/http-model/resource-crud" element={<ResourceCrud />} />

        <Route path="/backend/cors/todo-list" element={<BackendTodoList />} />
        <Route path="/backend/status/post-todo" element={<PostTodo />} />
        <Route path="/backend/auth/todo-list" element={<AuthTodoList />} />
        <Route path="/backend/crud/todo-list" element={<CrudTodoList />} />
      </Routes>
    </div>
  )
}
