/*투두 토스트*/

import {useEffect} from "react";

const SHOW_MS = 1500;

export default function TodoToast({message, onDone}){
    useEffect(()=> {
        if (!message) return;

        const timer = setTimeout(onDone, SHOW_MS);

        //토스트 사라지기 전에 새로운 토스트가 오면 이전 타이머 취소
        return () => clearTimeout(timer);
    }, [message, onDone]);

    if (!message) return null;

    return <div className = "todo-toast"> {message}</div>
}