//D-Day 추가\

import { useState, useEffect } from "react";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import { ddayLabel } from "./achievementRules";

export default function DdayModal({
  isOpen,
  isEdit,
  initialTitle,
  initialDate,
  today,
  onSave,
  onDelete,
  onCancel,
}) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);

  // 열릴 때마다 입력칸을 처음 값으로 다시 채움
  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDate(initialDate);
    }
  }, [isOpen, initialTitle, initialDate]);

  // Esc로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const canSave = title.trim() !== "" && date !== "";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(title, date);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onCancel();
  };

  const handleDelete = (e) => {
    e.preventDefault();
    onDelete();
  };

  return (
    <div className="ach-backdrop" onClick={onCancel}>
      <form className="ach-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="ach-modal-title">{isEdit ? "EDIT D-DAY" : "ADD D-DAY"}</h2>

        <label className="ach-field-label">제목</label>
        <Input
          placeholder="정보처리기사 필기"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="ach-field-label">날짜</label>
        <input
          type="date"
          className="ach-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* 날짜 고르면 바로 D-day 미리보기 */}
        <p className="ach-preview">{date ? `→ ${ddayLabel(date, today)}` : " "}</p>

        <div className="ach-modal-buttons">
          {isEdit && (
            <Button variant="danger" onClick={handleDelete}>
              DELETE
            </Button>
          )}
          <Button onClick={handleCancel}>CANCEL</Button>
          <Button variant="primary" disabled={!canSave}>
            SAVE
          </Button>
        </div>
      </form>
    </div>
  );
}