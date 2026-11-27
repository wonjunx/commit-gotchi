// 펫 픽셀아트 격자. 글자 하나 = 한 칸. A 몸통 · B 그림자 · D 알 무늬 · K 눈/입 · C 왕관, 그 외 투명
// 피그마 이미지로 바꿀 때는 PetSprite만 고치면 된다.

export const SHAPES = {
  // 부화 전 알 (O-02 · O-05)
  shell: [
    '....AAAA....',
    '...AAAAAA...',
    '..AAAAAAAA..',
    '..ADDAAAAA..',
    '.AADAAAAAAA.',
    '.AAAAAAADAA.',
    '.AAAAAAAAAA.',
    '.BBBBBBBBBB.',
    '..BBBBBBBB..',
    '...BBBBBB...',
  ],
  // Lv.1~2 막 깨어난 꼬마
  egg: [
    '............',
    '............',
    '....AAAA....',
    '...AAAAAA...',
    '..AAAAAAAA..',
    '..AKAAAAKA..',
    '..AAAAAAAA..',
    '..AAAKKAAA..',
    '...BBBBBB...',
    '............',
  ],
  // Lv.3~5 아기
  baby: [
    '............',
    '....AAAA....',
    '..AAAAAAAA..',
    '.AAAAAAAAAA.',
    '.AAKKAAKKAA.',
    'AAAKKAAKKAAA',
    'AAAAAAAAAAAA',
    'AAAAAKKAAAAA',
    '.AAAAAAAAAA.',
    '..BB....BB..',
  ],
  // Lv.6~9 성장기
  growth: [
    '............',
    '..A......A..',
    '...A....A...',
    '..AAAAAAAA..',
    '.AAKAAAAKAA.',
    'AAAAAAAAAAAA',
    'A.AAAAAAAA.A',
    'A.A......A.A',
    '...BB..BB...',
    '............',
  ],
  // Lv.10 최종 진화
  legend: [
    '..C..CC..C..',
    '..CCCCCCCC..',
    '..AAAAAAAA..',
    '.AAKAAAAKAA.',
    'AAAAAAAAAAAA',
    'AAAAKKKKAAAA',
    'A.AAAAAAAA.A',
    'A.A......A.A',
    '...BB..BB...',
    '............',
  ],
}

// 종류별 색 (A 몸통, B 그림자, D 알 무늬)
export const TYPE_COLORS = {
  c: { A: '#39ff72', B: '#26c959', D: '#b6ffc9' },
  cpp: { A: '#b07bff', B: '#8656d6', D: '#e2ccff' },
  java: { A: '#ff9a3b', B: '#d9741c', D: '#ffd6ad' },
  python: { A: '#4d9bff', B: '#2f74d1', D: '#bcd8ff' },
  html: { A: '#ff6b8a', B: '#d94a69', D: '#ffc4d1' },
}
export const EYE = '#0b0f0d'
export const CROWN = '#ffd23b'

// 종류별 이름 · 팁 (O-02 카드 · 도감 · 펫 카드)
export const TYPE_INFO = {
  c: { label: 'C', tip: '포인터는 주소를 담는 변수예요.' },
  cpp: { label: 'C++', tip: '클래스는 데이터와 함수를 한데 묶어요.' },
  java: { label: 'JAVA', tip: '객체는 new로 만들어요.' },
  python: { label: 'PYTHON', tip: '파이썬은 들여쓰기로 블록을 나눠요.' },
  html: { label: 'HTML', tip: '여는 태그가 있으면 닫는 태그도!' },
}
