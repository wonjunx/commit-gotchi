/*dday가 업적이랑 묶여있어서 따로 빼서 사용할 수 있게 하는 파일 */

import { useState, useEffect, useCallback } from "react";
import { loadData, saveData, STORAGE_KEYS } from "../../shared/lib/storage";
import { todayKey } from "../../shared/lib/date";
import { ddayLabel } from "./achievementRules";
import { addDday, updateDday, deleteDday } from "./ddayUtils";
import DdayModal from "./DdayModal";
import Button from "../../shared/components/Button";
import "./Achievement.css";

export default function DdaySection() {
  const today = todayKey();

  // D-day 목록 + 모달 상태 ("closed" / "add" / "edit" + 수정 대상)
  const [ddays, setDdays] = useState(() => loadData(STORAGE_KEYS.DDAY, []));
  const [modal, setModal] = useState({ mode: "closed", target: null });

  // D-day 바뀔 때마다 저장 (TodoCard와 같은 방식)
  useEffect(() => {
    saveData(STORAGE_KEYS.DDAY, ddays);
  }, [ddays]);

  const openAdd = () => setModal({ mode: "add", target: null });
  const openEdit = (dday) => setModal({ mode: "edit", target: dday });
  const closeModal = useCallback(() => setModal({ mode: "closed", target: null }), []);
  const isEdit = modal.mode === "edit";

  const handleSave = (title, date) => {
    if (isEdit) {
      setDdays((prev) => updateDday(prev, modal.target.ddayId, title, date));
    } else {
      setDdays((prev) => addDday(prev, title, date));
    }
    closeModal();
  };

  const handleDelete = () => {
    setDdays((prev) => deleteDday(prev, modal.target.ddayId));
    closeModal();
  };

  return (
    <>
      <section className="dday-card">
        {/* 위: 제목 + 추가 버튼 (TodoCard 헤더와 같은 모양) */}
        <header className="dday-header">
          <h3 className="dday-heading">D-DAY</h3>
          <div className="dday-add">
            <Button onClick={openAdd}>+ ADD</Button>
          </div>
        </header>

        {/* 아래: D-day 목록 (가까운 날짜 순) */}
        {ddays.length === 0 ? (
          <p className="dday-empty">시험 · 과제 · 코테 일정을 추가해보세요.</p>
        ) : (
          <div className="dday-list">
            {ddays.map((d) => (
              <button key={d.ddayId} className="dday-chip" onClick={() => openEdit(d)}>
                {d.title} <strong>{ddayLabel(d.date, today)}</strong>
              </button>
            ))}
          </div>
        )}
      </section>

      <DdayModal
        isOpen={modal.mode !== "closed"}
        isEdit={isEdit}
        initialTitle={isEdit ? modal.target.title : ""}
        initialDate={isEdit ? modal.target.date : today}
        today={today}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={closeModal}
      />
    </>
  );
}