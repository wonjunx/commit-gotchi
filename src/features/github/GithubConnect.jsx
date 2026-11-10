// 온보딩 01/05 · GitHub 연결 카드 (Figma: 온보딩 · GitHub 연결 / 🆕 온보딩 · GitHub ID 오류)
//
// 사용법 (온보딩 흐름을 만드는 쪽에서):
//   <GithubConnect onConnected={(user) => { 저장(commitgotchi_user); 다음 단계로 }} />
//   user = { githubId, username, profileImage, createdAt }
//
// 이 컴포넌트는 저장·페이지 이동을 하지 않는다 → 저장은 이윤경, 흐름은 온보딩 담당 쪽 코드가 결정.
//
// 기본       빈 값이면 CONNECT 버튼 Disabled
// onFocus    Input Focus 상태 · Enter 키로도 연결
// onClick    getGithubUser() → 성공: onConnected(user) / 실패: 오류 표시 · 버튼 로딩 스피너
// ID 오류    404 → 입력칸 빨간 테두리 + 오류 문구 / 403 → "잠시 후 다시 시도해주세요"
// onChange   입력을 다시 시작하면 오류 상태 해제
import { useId, useRef, useState } from 'react';
import { getGithubUser, GithubApiError, ERROR_MESSAGES } from './githubApi.js';
import GithubPixel from './GithubPixel.jsx';
import { EGG } from './githubPixels.js';
import s from './GithubConnect.module.css';

// 입력칸을 빨갛게 표시할 오류 (ID 자체가 잘못된 경우)
const INPUT_ERRORS = new Set(['NOT_FOUND', 'EMPTY_ID']);

export default function GithubConnect({
  onConnected,
  initialId = '',
  stepLabel = '01 / 05 · CONNECT',
  className = '',
}) {
  const [value, setValue] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { code, message }
  const inputRef = useRef(null);
  const uid = useId();

  const disabled = !value.trim() || loading;

  async function connect(e) {
    e.preventDefault(); // form submit → Enter 키도 여기로
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const user = await getGithubUser(value);
      setLoading(false);
      onConnected?.(user);
    } catch (err) {
      const code = err instanceof GithubApiError ? err.code : 'UNKNOWN';
      setError({ code, message: err?.message || ERROR_MESSAGES.UNKNOWN });
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleChange(e) {
    setValue(e.target.value);
    if (error) setError(null); // 다시 입력 → 오류 해제
  }

  const inputInvalid = !!error && INPUT_ERRORS.has(error.code);

  return (
    <section className={`${s.card} ${className}`} aria-labelledby={`${uid}-title`} data-testid="github-connect">
      <p className={s.step}>{stepLabel}</p>
      <GithubPixel {...EGG} size={7} className={s.egg} title="알" />

      <h1 id={`${uid}-title`} className={s.title}>GitHub와 함께 성장해볼까요?</h1>
      <p className={s.desc}>GitHub 활동으로 나만의 펫을 성장시켜보세요.</p>

      <form onSubmit={connect} noValidate className={s.form}>
        <label htmlFor={`${uid}-input`} className={s.label}>GitHub ID</label>
        <input
          ref={inputRef}
          id={`${uid}-input`}
          className={`${s.input} ${inputInvalid ? s.invalid : ''}`}
          placeholder="GitHub 아이디를 입력해주세요."
          value={value}
          onChange={handleChange}
          autoComplete="username"
          autoCapitalize="off"
          spellCheck="false"
          aria-invalid={inputInvalid || undefined}
          aria-describedby={error ? `${uid}-error` : undefined}
          readOnly={loading}
          autoFocus
        />
        {error && (
          <p id={`${uid}-error`} className={s.error} role="alert">{error.message}</p>
        )}
        <button type="submit" className={`${s.connect} ${error ? s.afterError : ''}`} disabled={disabled} aria-busy={loading}>
          {loading ? (
            <>
              <span className={s.spinner} aria-hidden="true" />
              CONNECTING…
            </>
          ) : (
            'CONNECT GITHUB'
          )}
        </button>
      </form>

      <p className={s.note}>공개 GitHub 활동을 기반으로 오늘의 활동을 확인합니다.</p>
    </section>
  );
}
