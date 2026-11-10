/*데이터 보관하고 처리 */
// 할일 보관, 저장, 처리, 모달 상태 관리 및 조립

import {useState, useEffect, useCallback } from "react";
import {saveData, loadData, STORAGE_KEYS } from "../../shared/lib/storage";
import {todayKey} from "../../shared/lib/date";
import {usePet, EXP_REWARD} from "../pet";
import {
    addTodo,
    deleteTodo,
    toggleTodo,
    updateTodo,
    countCompleted,
    markRewarded,
    getTodayTodos,
    isAllCompleted,
} from "./todoUtils";
import {getActivity, recordActivity} from "./activity";
import TodoItem from "./TodoItem";
import TodoEditorModal from "./TodoEditorModal";
import ProgressBar from "./ProgressBar";
import TodoToast from "./TodoToast";
import "./Todo.css";

export default function TodoCard(){
    /* 처음 렌더링 할 때 local storage에서 불러오기 */
    const [todos, setTodos] = useState(()=> loadData(STORAGE_KEYS.TODOS, []));

    /* 모달 상태는 closed/edit/add + 수정대상 */
    const [modal, setModal] = useState({ mode:"closed", target: null});
    // 3) 투두 토스트에 띄울 글자
  const [toast, setToast] = useState("");
 
  // 4) 펫 EXP 함수 
  const { addExp } = usePet();

    /* todos가 바뀔 때마다 스토리지에 저장 */
    useEffect(()=>{
        saveData(STORAGE_KEYS.TODOS, todos);

        const today = todayKey();
        const todayTodos = getTodayTodos(todos, today);
        recordActivity(today, {
          todoCount: todayTodos.length,
          completedTodoCount: countCompleted(todayTodos),
        });
    }, [todos]);

const completedCount = countCompleted(todos);

/* 체크 처ㄹ.ㅣ */
const handleToggle = (todoId) => {
    const target = todos.filter((todo) => todo.todoId === todoId)[0];
    if (!target) return;
 
    const willComplete = !target.completed;   // 이번 클릭으로 "완료"가 되는지
    let next = toggleTodo(todos, todoId);
    let gainedTotal = 0;
 
    // 하나 완료 +10 : 완료로 바뀌고, 아직 EXP 안 받은 할 일만
    if (willComplete && !target.rewarded) {
      const result = addExp(EXP_REWARD.todo, "todo");
      // 펫이 없으면(온보딩 전) gained가 0 → rewarded 표시 안 함 (나중에 받을 수 있게)
      if (result.gained > 0) {
        next = markRewarded(next, todoId);
        gainedTotal += result.gained;
      }
    }
 
    // 오늘 전부 완료 보너스 +10 : 하루 한 번
    const today = todayKey();
    if (willComplete && isAllCompleted(getTodayTodos(next, today))) {
      if (!getActivity(today).bonusGiven) {
        const bonus = addExp(EXP_REWARD.allTodoBonus, "allTodoBonus");
        if (bonus.gained > 0) {
          recordActivity(today, { bonusGiven: true });
          gainedTotal += bonus.gained;
        }
      }
    }
 
    // 받은 EXP가 있으면 오늘 기록에 더하고 토스트 표시
    if (gainedTotal > 0) {
      const earned = getActivity(today).earnedExp;
      recordActivity(today, { earnedExp: earned + gainedTotal });
      setToast(`+${gainedTotal} EXP · 해냈어요!`);
    }
 
    setTodos(next);
  };
 
  // 삭제, 일단은 완료한 할 일을 지워도 EXP는 회수하지 않음
  const handleDelete = (todoId) => setTodos((prev) => deleteTodo(prev, todoId));
 
  const openAddModal = () => setModal({ mode: "add", target: null });
  const openEditModal = (todo) => setModal({ mode: "edit", target: todo });
  const closeModal = () => setModal({ mode: "closed", target: null });
 
  const handleConfirm = (text) => {
    if (modal.mode === "add") {
      setTodos((prev) => addTodo(prev, text));
    } else if (modal.mode === "edit") {
      setTodos((prev) => updateTodo(prev, modal.target.todoId, text));
    }
    closeModal();
  };
 //토스트 사라질 때
 const clearToast = useCallback(() => setToast(""), []);
 
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

      <TodoToast message = {toast} onDone = {clearToast} />
    </section>
  );
}