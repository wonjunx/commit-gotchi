// features/github 공개 창구 (담당: 한주성)
// 다른 폴더에서는 이 파일로만 가져온다:  import { GithubConnect, useGithubActivity } from '../features/github';

// 화면 조각
export { default as GithubConnect } from './GithubConnect.jsx'; // O-01 온보딩 GitHub 연결 · ID 오류
export { default as GithubProfileBadge } from './GithubProfileBadge.jsx'; // BADGE Header 아바타 · @ID
export { default as GithubStatus } from './GithubStatus.jsx'; // H-01 TODAY'S / TOTAL COMMITS · 토스트
export { default as GithubCalendar } from './GithubCalendar.jsx'; // H-02 캘린더 · 스트릭 · 팝오버
export { default as GithubAccountSection } from './GithubAccountSection.jsx'; // S-01 설정 GitHub 계정 섹션
export { default as GithubIdModal } from './GithubIdModal.jsx'; // S-02 GitHub ID 변경 모달

// 훅 · API
export { useGithubActivity } from './useGithubActivity.js';
export { useGithubStatus, GITHUB_TOAST } from './useGithubStatus.js';
export { useGithubCalendar } from './useGithubCalendar.js';
export {
  getGithubUser,
  getTodayGithubActivity,
  getMonthlyGithubActivity,
  calcStreak,
  GithubApiError,
  ERROR_MESSAGES,
} from './githubApi.js';
