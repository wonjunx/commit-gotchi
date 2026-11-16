/*뭐가 눌렸는지 알려줌 */
// 체크박스 눌림 여부, 수정 버튼 눌림 여부, 삭제 버튼 눌림 여부 판단
export default function TodoItem({ todo, onToggle, onEdit, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? "checked" : ""}`}>
      <label className="todo-check">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.todoId)}
        />
        <span className="todo-title">{todo.title}</span>
      </label>
 
      <div className="todo-actions">
        <button className="icon-btn edit" onClick={() => onEdit(todo)} aria-label="수정">✎</button>
        <button className="icon-btn delete" onClick={() => onDelete(todo.todoId)} aria-label="삭제">×</button>
      </div>
    </li>
  );
}