/*할일 수정할 때 사용할 함수 */
// 새로 추가할 할일 + 수정할 할일 하나로 재사용 하기 위함

import { useState, useEffect } from "react";
 
export default function TodoEditorModal({
  isOpen,
  title,
  confirmLabel,
  initialValue,
  onConfirm,
  onCancel,
}) {
  const [text, setText] = useState(initialValue);
 
  // 모달이 열릴 때마다 입력창을 initialValue로 다시 채움
  useEffect(() => {
    if (isOpen) setText(initialValue);
  }, [isOpen, initialValue]);
 
  if (!isOpen) return null;
 
  const isEmpty = text.trim() === "";
 
  const handleConfirm = () => {
    if (isEmpty) return;
    onConfirm(text);
  };
 
  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return; // 한글 조합 중 Enter 중복 방지
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  };
 
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
 
        <input
          className="modal-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="할 일을 입력해주세요"
          autoFocus
        />
 
        <div className="modal-buttons">
          <button className="btn" onClick={handleConfirm} disabled={isEmpty}>
            {confirmLabel}
          </button>
          <button className="btn" onClick={onCancel}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}