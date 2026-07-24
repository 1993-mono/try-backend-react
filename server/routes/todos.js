import { Router } from 'express'
import * as todosController from '../controllers/todosController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// /todos 로 오는 모든 요청을 먼저 requireAuth로 검사.
// 통과 시 next() → 아래 get/post/patch/delete 중 매칭된 핸들러 실행.
// 실패 시 401로 끝 (아래 핸들러까지 안 감).
router.use(requireAuth)

router.get('/', todosController.listTodos)
router.get('/:id', todosController.getTodo)
router.post('/', todosController.createTodo)
router.patch('/:id', todosController.updateTodo)
router.delete('/:id', todosController.deleteTodo)

export default router