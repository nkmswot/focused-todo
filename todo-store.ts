"use client"

import Cookies from "js-cookie"

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  order: number // Added order field
}

const TODOS_COOKIE_KEY = "focused_todos"

export function saveTodos(todos: Todo[]) {
  // Sort by order before saving
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order)
  Cookies.set(TODOS_COOKIE_KEY, JSON.stringify(sortedTodos), { expires: 365 * 10 })
}

export function loadTodos(): Todo[] {
  const todosString = Cookies.get(TODOS_COOKIE_KEY)
  if (!todosString) return []
  try {
    return JSON.parse(todosString)
  } catch {
    return []
  }
}

