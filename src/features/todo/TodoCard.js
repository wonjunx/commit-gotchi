/*데이터 보관하고 처리 */
// 할일 보관, 저장, 처리, 모달 상태 관리 및 조립

import {useStae, useEffect } from "react";
import {saveData, loadData, STORAGE_KEYS } from "../../shared/lib/storage";
import {
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    countCompleted,
} from "./todoUtlis";
import TodoItem from ",/TodoItem";
import TodoEditorModal from "./TodoEditorModal";
import ProgressBar from "./ProgressBar";
import "./Todo.css";

export default function TodoCard(){
    /* 처음 렌더링 할 때 local storage에서 불러오기 */
    const [todos, setTodos] = useState(()=>loadData(STORAGE_KEYS.TODOS), []);

    /* 모달 상태는 closed/edit/add + 수정대상 */
    const [modal, setModal] = useState({ mode:"closed", target: null});

    /* todos가 바뀔 때마다 스토리지에 저장 */
    useEffect(()=>{
        saveData(STORAGE_KEYS>TODOS, todos);
    }, [todos]);
}

const completedCount = countCompleted(todos);
const handleToggle = (todoId) => setTodos((prev) => toggleTodo(prev, todoId));
const handleDelete = (todoId) => setTodos((prev) => deleteTodo(prev, todoId));

const openAddModel = () => setModal({ mode: "add", target: null});
const openEditModel = () => setModal({ mode: "edit", target: todo});
const closeModel = () => setModal({ mode: "closed", target: null});

const handleConfirm = (text) => {
    if (modal.mode === "add") {
      setTodos((prev) => addTodo(prev, text));
    } else if (modal.mode === "edit") {
      setTodos((prev) => updateTodo(prev, modal.target.todoId, text));
    }
    closeModal();
  };
 
  const isEdit = modal.mode === "edit";
 
  return (
    <section className="todo-card">
      <header className="todo-header">
        <h3 className="todo-heading">TODAY'S TO-DO</h3>
        <button className="btn add-btn" onClick={openAddModal}>+ ADD</button>
      </header>
 
      {todos.length === 0 ? (
        <p className="todo-empty">오늘의 할 일을 추가해보세요</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <TodoItem
              key={todo.todoId}
              todo={todo}
              onToggle={handleToggle}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
 
      <footer className="todo-footer">
        <span className="todo-count">
          {completedCount} / {todos.length} COMPLETE
        </span>
        <ProgressBar value={completedCount} max={todos.length} />
      </footer>
 
      <TodoEditorModal
        isOpen={modal.mode !== "closed"}
        title={isEdit ? "할 일 수정" : "새로운 할 일"}
        confirmLabel={isEdit ? "SAVE" : "ADD"}
        initialValue={isEdit ? modal.target.title : ""}
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </section>
  );
