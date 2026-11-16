/*To-do 데이터를 로컬 저장소에 저장/불러옴
#저장키 파일. 관련 키가 필요할 경우 해당 스크립트에서 호출
*/
export const STORAGE_KEYS = {
    USER: "commitgotchi_user",
    PET: "commitgotchi_pet",
    TODOS: "commitgotchi_todos",
    ACTIVITY:"commitgotchi_activity",
    GITHUB_CACHE:"commitgotchi_github_cache",
    ACHIEVEMENTS:"commitgotchi_achievements",
    DDAY:"commitgotchi_dday",
};

/*local storage는 문자열만 가능해서 JSON.stringfy로 변환 */
export const saveData = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch(err) {
        console.error(`[saveData] "${key}" 저장실패`, err);
    }
};

export const loadData = (key,defaultValue)=> {
    try {
        const saved = localStorage.getItem(key);
        if(saved === null) return defaultValue;
        return JSON.parse(saved);
    } catch (err) {
        console.error (`[loadData] "${key}" 불러오기 실패, 기본값으로 사용`, err);
        return defaultValue;
    }
};

/* 데이터 초기화 모듈 */
export const removeData = (key) => {
    localStorage.removeItem(key);
};