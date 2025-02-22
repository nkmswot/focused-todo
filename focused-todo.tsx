"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, GripVertical, ListTodo, Plus, Target, CheckCircle2, Trash2, X } from "lucide-react"
import { type Todo, loadTodos, saveTodos } from "./todo-store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion, AnimatePresence } from "framer-motion"

// Sortable Todo Item Component
function SortableTodoItem({
  todo,
  onComplete,
  onDelete,
}: {
  todo: Todo
  onComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-lg border bg-cream ${
        isDragging ? "shadow-lg opacity-75" : ""
      } ${todo.completed ? "bg-mint" : ""}`}
    >
      <div className="flex items-center gap-3">
        <button className="touch-none" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-sage" />
        </button>
        <span className={`flex-1 ${todo.completed ? "line-through text-sage" : ""}`}>{todo.text}</span>
        <div className="flex items-center gap-2">
          {!todo.completed && (
            <Button size="sm" onClick={() => onComplete(todo.id)} variant="ghost" className="hover:bg-sage/20">
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => onDelete(todo.id)}
            variant="ghost"
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function FocusedTodo() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [showList, setShowList] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    const loadedTodos = loadTodos()
    setTodos(loadedTodos)
  }, [])

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const currentTodo = todos.find((todo) => !todo.completed)
  const sortedTodos = [...todos].sort((a, b) => a.order - b.order)
  const progress = todos.length ? (todos.filter((t) => t.completed).length / todos.length) * 100 : 0

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const maxOrder = Math.max(0, ...todos.map((t) => t.order))
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
      order: maxOrder + 1,
    }

    setTodos((prev) => [...prev, todo])
    setNewTodo("")
  }

  const handleCompleteTodo = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: true } : todo)))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setTodos((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === active.id)
      const newIndex = prev.findIndex((t) => t.id === over.id)
      const reordered = arrayMove(prev, oldIndex, newIndex)

      return reordered.map((todo, index) => ({
        ...todo,
        order: index,
      }))
    })
  }

  const remainingCount = todos.filter((todo) => !todo.completed).length
  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-mint to-cream">
      {/* Banner */}
      <div className="bg-sage py-6 px-4 mb-8">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-8 w-8" />
            Focused Todo
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-cream">
              {todos.length} Tasks
            </Badge>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl mx-auto px-4 space-y-6">
        {/* Add Todo Form */}
        <Card className="border-none shadow-lg bg-cream">
          <CardContent className="pt-6">
            <form onSubmit={handleAddTodo} className="flex gap-2">
              <Input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 bg-white border-sage focus-visible:ring-sage"
              />
              <Button type="submit" className="bg-sage hover:bg-sage/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Progress and Stats */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-butter">
                Remaining: {remainingCount}
              </Badge>
              <Badge variant="secondary" className="bg-mint">
                Completed: {completedCount}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-sage">{Math.round(progress)}% complete</span>
              {completedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCompleted}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Completed
                </Button>
              )}
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-cream [&>div]:bg-sage" />
        </div>

        {/* Current Todo Card */}
        <AnimatePresence mode="wait">
          {currentTodo ? (
            <motion.div
              key={currentTodo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-none shadow-xl bg-gradient-to-br from-butter to-cream">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sage">
                    <Target className="h-5 w-5" />
                    Current Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-medium text-center py-8 text-sage">{currentTodo.text}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleCompleteTodo(currentTodo.id)}
                    className="flex-1 bg-sage hover:bg-sage/90 text-white"
                    size="lg"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Mark as Complete
                  </Button>
                  <Button
                    onClick={() => handleDeleteTodo(currentTodo.id)}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    size="lg"
                    variant="ghost"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Card className="border-2 border-dashed border-sage shadow-lg bg-cream">
                <CardHeader>
                  <CardTitle className="text-center text-sage">All Done! 🎉</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sage/70">Add a new todo to get started</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle List Button */}
        <Button
          variant="outline"
          onClick={() => setShowList(!showList)}
          className="w-full border-sage text-sage hover:bg-sage/10"
        >
          <ListTodo className="h-4 w-4 mr-2" />
          {showList ? "Hide" : "Show"} All Todos
        </Button>

        {/* Todo List */}
        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-cream border-sage">
                <CardHeader>
                  <CardTitle className="text-sage">All Todos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={sortedTodos} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {sortedTodos.map((todo) => (
                            <SortableTodoItem
                              key={todo.id}
                              todo={todo}
                              onComplete={handleCompleteTodo}
                              onDelete={handleDeleteTodo}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
         <p>Powered By <strong>SWOT</strong></p>
      </div>
    </div>
  )
}

