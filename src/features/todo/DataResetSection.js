
 //TODO: 정원준 공통 <Modal> 나오면 모달 틀 교체

import { useState, useEffect } from "react";
import { loadData, clearAllData, STORAGE_KEYS } from "../../shared/lib/storage";
import { usePet } from "../pet";
import Input from "../../shared/components/Input";
import Button from "../../shared/components/Button";
import "./DataReset.css";

const CONFIRM_WORD = "RESET";

export default function DataResetSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const { pet } = usePet();

  // 지워질 기록 개수 (모달 안내 문구용)
  const todoCount = loadData(STORAGE_KEYS.TODOS, []).length;
  const activityDays = Object.keys(loadData(STORAGE_KEYS.ACTIVITY, {})).length;

  const canReset = typed === CONFIRM_WORD;

  const openModal = () => {
    setTyped("");          // 열 때마다 입력칸 비우기
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  // Esc로 닫기 
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const handleReset = () => {
    if (!canReset) return;
    clearAllData();
    window.location.reload();   // 새로고침 → 저장된 user 없음 → 온보딩부터
  };

  // "코딩이(Lv.7), " 부분: 펫이 없으면 생략
  const petText = pet ? `${pet.name}(Lv.${pet.level}), ` : "";

  return (
    <section className="reset-section">
      <h3 className="reset-heading">데이터</h3>

      <div className="reset-row">
        <div>
          <p className="reset-label">저장된 기록</p>
          <p className="reset-sub">
            To-do {todoCount}개 · 활동 기록 {activityDays}일
          </p>
        </div>
        <Button variant="danger" onClick={openModal}>
          모든 데이터 초기화
        </Button>
      </div>

      {isOpen && (
        <div className="reset-backdrop" onClick={closeModal}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="reset-title">RESET ALL DATA?</h2>
            <p className="reset-desc">
              {petText}To-do {todoCount}개, 활동 기록 {activityDays}일이 모두
              지워져요. 되돌릴 수 없어요.
            </p>

            <p className="reset-guide">
              확인하려면 <strong>{CONFIRM_WORD}</strong> 입력
            </p>
            <Input
              placeholder={CONFIRM_WORD}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />

            <div className="reset-buttons">
              <Button onClick={closeModal}>CANCEL</Button>
              <Button variant="danger" disabled={!canReset} onClick={handleReset}>
                모두 지우기
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}