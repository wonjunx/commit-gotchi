//dday 추가 수정 삭제 함수 모음
export const sortDdays = (ddays) =>
  [...ddays].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

/* 추가: 제목이나 날짜가 비어 있으면 그대로 반환 */
export const addDday = (ddays, title, date) => {
  if (!title || title.trim() === "" || !date) return ddays;
  return sortDdays([...ddays, { ddayId: Date.now(), title: title.trim(), date }]);
};

/* 수정: 해당 D-day의 제목·날짜만 바꾼 새 배열 */
export const updateDday = (ddays, ddayId, title, date) => {
  if (!title || title.trim() === "" || !date) return ddays;
  return sortDdays(
    ddays.map((d) => (d.ddayId === ddayId ? { ...d, title: title.trim(), date } : d))
  );
};

/* 삭제 */
export const deleteDday = (ddays, ddayId) =>
  ddays.filter((d) => d.ddayId !== ddayId);