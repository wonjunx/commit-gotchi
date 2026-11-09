/*투두 데이터 처리 순수 함수 모음*/

/* 오늘 날짜 가져오기*/
/* 날짜는 한주성의 todayKey 사용*/

// /* const getToday = () => {
//     const now = new Date(); /* 지금 이 순간 날짜 및 시간 담은 객체 생성*/ 
//     const year = now.getFullYear(); /*연도만 꺼내기*/
//     /* 자바 스크립트는 월을 0부터 세서 1더해주기 */
//     /* padStart 같은 경우 두자리가 될 때까지 앞에 0을 채움 */
//     /* 예를 들어 11월은 그대로 나오는데 1월은 01월로 표시 */
//     const month = String(now.getMonth() +1).padStart(2, "0");
//     const day = String(now.getDate()).padStart(2,"0");
//     return `${year}-${month}-${day}`;
// };*/

import {todayKey} from "../../shared/lib/date";

/*새로운 일 하나 만들어주는 함수 */
export const createTodo = (title) => ({
    todoId: Date.now(),
    title: title.trim(), /* 앞뒤 공백 지우기 */
    completed: false,
    date: todayKey(),
    rewarded: false,
});

/*addTodo */
export const addTodo = (todos, title) => {
    /*빈값 막기 */
    if (!title || title.trim() === "") return todos;
    return [...todos, createTodo(title)];
};

/*deleteTodo */
/* 지우려는 id 번호가 다르면 남겨두기 (삭제 xx) */
/* filter사용 조건이 true인 것만 남기고 새 배열로 반환 */
export const deleteTodo = (todos, todoId) =>
    todos.filter((todo) => todo.todoId !== todoId);

/* toggleTodo (할일 완료 여부 확인) */
export const toggleTodo = (todos, todoId) => 
    todos.map((todo) =>
        todo.todoId === todoId ? {...todo, completed: !todo.completed} : todo
    );

    /*updateTodo*/
    export const updateTodo = (todos, todoId, newTitle) => {
        if (!newTitle || newTitle.trim()==="") return todos;
        return todos.map((todo) =>
        todo.todoId === todoId ? {...todo, title: newTitle.trim()} : todo);
    };

    /*countCompleted*/
    export const countCompleted = (todos) => 
        todos.filter((todo) => todo.completed).length;

    /* exp 연동 이후 추가 */

    /*체크/해제 반복으로 exp 여러번 받는 행위 금지 */
    export const markRewarded = (todos, todoId) =>
        todos.map ((todo) =>
            todo.todoId === todoId ? {...todo, rewarede: true} :todo);

    /*오늘 날짜인 할일만 골라내기 */

    export const getTodayTodos = (todos, today) =>
        todos.filter ((todo)=> todo.date ===today);

    /*전부 완료했는지 확인 */
    export const isAllCompleted = (todos) =>
        todos.length > 0 &&countCompleted(todos) ===todos.length;