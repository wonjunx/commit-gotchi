// features/github 공개 창구 (담당: 한주성)
// 다른 폴더에서는 이 파일로만 가져온다:  import { GithubConnect, useGithubActivity } from '../features/github';

// 화면 조각
export { default as GithubConnect } from './GithubConnect.jsx'; // O-01 온보딩 GitHub 연결 · ID 오류
export { default as GithubProfileBadge } from './GithubProfileBadge.jsx'; // BADGE Header 아바타 · @ID

// 훅 · API
export { useGithubActivity } from './useGithubActivity.js';
export {
  getGithubUser,
  getTodayGithubActivity,
  getMonthlyGithubActivity,
  calcStreak,
  GithubApiError,
  ERROR_MESSAGES,
} from './githubApi.js';
