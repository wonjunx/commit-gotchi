/*할일 수정할 때 사용할 함수 */
// 새로 추가할 할일 + 수정할 할일 하나로 재사용 하기 위함

import { useState, useEffect } from "react";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";

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
 
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;
 
  const isEmpty = text.trim() === "";
 
  const handleSubmit = (e) => {
    e.preventDefault();          // 페이지 새로고침 막기
    if (isEmpty) return;         // 빈 값이면 추가/수정 막기
    onConfirm(text);
  };

  // CANCEL: form 제출(=ADD)로 처리되지 않게 막고 닫기
  const handleCancelClick = (e) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className="modal-title">{title}</h2>

        <div className="modal-field">
          <Input
            placeholder="할 일을 입력해주세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="modal-buttons">
          <Button variant="primary" disabled={isEmpty}>
            {confirmLabel}
          </Button>
          <Button onClick={handleCancelClick}>CANCEL</Button>
        </div>
      </form>
    </div>
  );
}