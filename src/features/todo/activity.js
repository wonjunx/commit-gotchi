/* 하루 단위 활동 기록 */

import {saveData, loadData, STORAGE_KEYS} from "../../shared/lib/storage";

//하루 기록 기본값

const EMPTY_DAY = {
    todoCount: 0,
    completedTodoCound: 0,
    earnedExp: 0,
    bonusGiven: false,
};

const loadAll = () => loadData(STORAGE_KEYS.ACTIVITY, {});

 //헤당 날짜 기록 반환
export const getActivity = (date) => {
    const all = loadAll();
    return {...EMPTY_DAY, ...all[date]};
};

export const recordActivity = (date, patch) => {
    const all = loadAll();
    const updated = {...getActivity(date), ...patch};
    saveData(STORAGE_KEYS.ACTIVITY, {...all, [date]: updated});
    return updated;
};