import { Router } from 'express'
import * as todosController from '../controllers/todosController.js'

const router = Router()

router.get('/', todosController.listTodos)
router.get('/:id', todosController.getTodo)
router.post('/', todosController.createTodo)
router.patch('/:id', todosController.updateTodo)
router.delete('/:id', todosController.deleteTodo)

export default router