//할일 수정 삭제 및 완료 했을 떄는 못하게 막기
export default function TodoItem({ todo, onToggle, onEdit, onDelete, locked, dateLabel }) {
  return (
    <li className={`todo-item ${todo.completed ? "checked" : ""} ${locked ? "locked" : ""}`}>
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.completed}
          disabled={locked || todo.completed}
          onChange={() => onToggle(todo.todoId)}
        />
        {dateLabel && <span className="todo-date-label">{dateLabel}</span>}
        <span className="todo-title">{todo.title}</span>
      </label>

      {/* 완료한 할 일은 연필·× 버튼을 아예 안 그림 */}
      {!todo.completed && (
        <div className="todo-actions">
          <button className="icon-btn edit" onClick={() => onEdit(todo)} aria-label="수정">✎</button>
          <button className="icon-btn delete" onClick={() => onDelete(todo.todoId)} aria-label="삭제">×</button>
        </div>
      )}
    </li>
  );
}