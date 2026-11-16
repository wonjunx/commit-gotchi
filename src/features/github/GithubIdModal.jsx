// S-02 GitHub ID 변경 모달 (담당: 한주성)
//
//   <GithubIdModal open={open} currentId={user.githubId} onSave={(user) => ...} onCancel={() => setOpen(false)} />
//
// SAVE   → getGithubUser() 검증 → 성공: GitHub 캐시 초기화 후 onSave(user)
//          (user 저장 = 이윤경 commitgotchi_user, HOME 재조회 = <Home key={githubId}/> 로 다시 마운트)
// 실패   → 모달 안 오류 문구, 입력칸 빨간 테두리 · 저장 안 됨
// CANCEL → 변경 없이 닫기 (Esc · 바깥 클릭도 동일)
// 같은 ID 로 SAVE → API 호출 없이 닫기
//
// ※ 공통 <Modal>(정원준)이 생기면 바깥 틀(.overlay)만 그걸로 바꾸면 된다.
import { useEffect, useId, useRef, useState } from 'react';
import { getGithubUser, GithubApiError, ERROR_MESSAGES } from './githubApi.js';
import { clearGithubCache } from './githubCache.js';
import s from './GithubIdModal.module.css';

const INPUT_ERRORS = new Set(['NOT_FOUND', 'EMPTY_ID']);
const clean = (v) => String(v ?? '').trim().replace(/^@/, '');

export default function GithubIdModal({ open, currentId = '', onSave, onCancel }) {
  if (!open) return null;
  // 열 때마다 새로 마운트 → 입력값 · 오류 상태가 항상 초기화된다
  return <ModalBody currentId={currentId} onSave={onSave} onCancel={onCancel} />;
}

function ModalBody({ currentId, onSave, onCancel }) {
  const [value, setValue] = useState(currentId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { code, message }
  const inputRef = useRef(null);
  const uid = useId();

  // 처음 열릴 때만 현재 ID 전체 선택 → 바로 덮어쓰기
  useEffect(() => { inputRef.current?.select(); }, []);

  // Esc 로 닫기 (최신 loading · onCancel 은 ref 로 참조)
  const latest = useRef({});
  useEffect(() => { latest.current = { loading, onCancel }; });
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !latest.current.loading) latest.current.onCancel?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function save(e) {
    e.preventDefault();
    if (loading) return;
    const next = clean(value);
    if (next.toLowerCase() === clean(currentId).toLowerCase()) {
      onCancel?.(); // 바뀐 게 없으면 그냥 닫기
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await getGithubUser(next);
      clearGithubCache(); // 이전 ID 캐시 정리 → 새 ID 로 HOME 재조회
      onSave?.(user);
    } catch (err) {
      const code = err instanceof GithubApiError ? err.code : 'UNKNOWN';
      setError({ code, message: err?.message || ERROR_MESSAGES.UNKNOWN });
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const invalid = !!error && INPUT_ERRORS.has(error.code);

  return (
    <div className={s.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onCancel?.(); }}>
      <form
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        onSubmit={save}
        noValidate
        data-testid="github-id-modal"
      >
        <h2 id={`${uid}-title`} className={s.title}>EDIT GITHUB ID</h2>
        <label className={`${s.field} ${invalid ? s.invalid : ''}`}>
          <span className={s.at} aria-hidden="true">@</span>
          <input
            ref={inputRef}
            className={s.input}
            value={value}
            onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
            aria-label="새 GitHub ID"
            aria-invalid={invalid || undefined}
            aria-describedby={error ? `${uid}-err` : undefined}
            autoComplete="username"
            autoCapitalize="off"
            spellCheck="false"
            readOnly={loading}
          />
        </label>
        {error && <p id={`${uid}-err`} className={s.error} role="alert">{error.message}</p>}
        <div className={s.btns}>
          <button type="button" className={s.cancel} onClick={onCancel} disabled={loading}>CANCEL</button>
          <button type="submit" className={s.save} disabled={!clean(value) || loading} aria-busy={loading || undefined}>
            {loading ? <><span className={s.spinner} aria-hidden="true" />CHECKING…</> : 'SAVE'}
          </button>
        </div>
      </form>
    </div>
  );
}
