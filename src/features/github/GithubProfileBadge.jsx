// Header 에 넣는 GitHub 아바타 · @아이디 (Figma Header 'GitHub Avatar' + '@yunkyung')
// 정원준님 Header 안에서:  <GithubProfileBadge user={user} />
import GithubPixel from './GithubPixel.jsx';
import { FACE } from './githubPixels.js';
import s from './GithubProfileBadge.module.css';

export default function GithubProfileBadge({ user, emptyText = 'GitHub 미연결' }) {
  return (
    <span className={s.badge} data-testid="github-profile-badge">
      {user ? (
        <>
          <img className={s.avatar} src={user.profileImage} alt="" width="28" height="28" />
          <span className={s.handle}>@{user.githubId}</span>
        </>
      ) : (
        <>
          <span className={`${s.avatar} ${s.placeholder}`}><GithubPixel {...FACE} size={3} /></span>
          <span className={`${s.handle} ${s.muted}`}>{emptyText}</span>
        </>
      )}
    </span>
  );
}
