//온보딩용 투두
import { useState, useEffect } from "react";
import { saveData, loadData, STORAGE_KEYS } from "../../shared/lib/storage";
import { todayKey } from "../../shared/lib/date";
import { addTodo, deleteTodo, getTodayTodos } from "./todoUtils";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import "./FirstTodo.css";

// 추천 칩 (화면설계 O-04)
const SUGGESTIONS = ["알고리즘 1문제", "강의 1개 듣기", "커밋 1번 하기", "README 정리"];

export default function FirstTodoStep({ onNext, onBack }) {
  const today = todayKey();
  const [todos, setTodos] = useState(() => loadData(STORAGE_KEYS.TODOS, []));
  const [text, setText] = useState("");

  // 바뀔 때마다 저장 (TodoCard와 같은 방식)
  useEffect(() => {
    saveData(STORAGE_KEYS.TODOS, todos);
  }, [todos]);

  // 오늘 추가된 할 일 = "ADDED" 목록
  const added = getTodayTodos(todos, today);
  const addedTitles = added.map((t) => t.title);

  // 입력칸 ADD (form 안이라 Enter로도 추가)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === "") return;
    setTodos((prev) => addTodo(prev, text));
    setText("");
  };

  // 추천 칩: 누르면 바로 추가 (이미 추가된 건 안 눌림)
  const addSuggestion = (title) => {
    if (addedTitles.includes(title)) return;
    setTodos((prev) => addTodo(prev, title));
  };

  const removeTodo = (todoId) => setTodos((prev) => deleteTodo(prev, todoId));

  return (
    <div className="first-todo">
      <p className="first-todo-step">04 / 05</p>
      <h2 className="first-todo-title">오늘 할 일 하나만 정해볼까요?</h2>
      <p className="first-todo-sub">To-do를 완료하면 코딩이가 +10 EXP를 받아요.</p>

      {/* 입력칸 + ADD */}
      <form className="first-todo-form" onSubmit={handleSubmit}>
        <div className="first-todo-input">
          <Input
            placeholder="예) 알고리즘 1문제 풀기"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button variant="primary" disabled={text.trim() === ""}>
          ADD
        </Button>
      </form>

      {/* 추천 칩 */}
      <div className="first-todo-chips">
        {SUGGESTIONS.map((title) => (
          <button
            key={title}
            type="button"
            className="first-todo-chip"
            disabled={addedTitles.includes(title)}
            onClick={() => addSuggestion(title)}
          >
            + {title}
          </button>
        ))}
      </div>

      {/* 추가한 목록 */}
      <p className="first-todo-added-label">ADDED · {added.length}</p>
      {added.length === 0 ? (
        <p className="first-todo-empty">아직 없어요. 하나만 정해도 충분해요!</p>
      ) : (
        <ul className="first-todo-list">
          {added.map((t) => (
            <li key={t.todoId} className="first-todo-item">
              <span>{t.title}</span>
              <button
                type="button"
                className="first-todo-remove"
                onClick={() => removeTodo(t.todoId)}
                aria-label="삭제"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 아래: SKIP / NEXT */}
      <div className="first-todo-actions">
        {onBack ? (
          <button type="button" className="first-todo-skip" onClick={onBack}>
            ← BACK
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="first-todo-skip push-right" onClick={onNext}>
          SKIP
        </button>
        <Button variant="primary" disabled={added.length === 0} onClick={onNext}>
          NEXT
        </Button>
      </div>
    </div>
  );
}