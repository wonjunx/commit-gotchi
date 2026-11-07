# 게임 규칙표 (RULE) — 문세연

숫자는 전부 `rules.js` 한 곳에 있다. 회의에서 바뀌면 그 파일의 상수만 고치고, 이 표도 같이 고친다.
판정 함수는 `exp.js`, 테스트는 `tests/pet/exp.test.mjs` (`node --test tests/pet/exp.test.mjs`).

## 1. 펫 종류 (5종)

| id | 언어 | 비고 |
|---|---|---|
| `c` | C | 기본 (Figma 코딩이) |
| `cpp` | C++ | |
| `java` | Java | |
| `python` | Python | |
| `html` | HTML | |

성장 규칙은 모두 같고 색 · 스프라이트 · HOME 팁 말풍선만 다르다.
※ 화면설계 PDF는 3종(C/JAVA/PYTHON) 기준 → 5종으로 변경 (2026-11-07 문세연)

## 2. EXP

| 활동 | EXP | `addExp` reason |
|---|---|---|
| 오늘 GitHub 커밋 (하루 1번) | +20 | `'github'` |
| To-do 하나 완료 | +10 | `'todo'` |
| 오늘 To-do 전부 완료 보너스 | +10 | `'allTodoBonus'` |

- "하루 1번" · "이미 받았는지(rewarded)" 판정은 부르는 쪽(한주성 H-01, 이윤경 LINK)이 한다. `addExp`는 받은 만큼 더한다.
- 0 이하 · 숫자가 아닌 값은 무시한다.

## 3. 레벨

- 레벨당 **100 EXP**. 넘친 EXP는 다음 레벨로 **이월** (예: Lv.7 72 + 40 → Lv.8 12/100)
- 한 번에 여러 레벨이 오를 수 있다.
- **최대 Lv.10**. 그 뒤로는 EXP 바가 100/100에서 멈추고 `totalExp`만 계속 쌓인다.

## 4. 진화 단계

| 단계 id | 이름 | 레벨 |
|---|---|---|
| `egg` | 알 | Lv.1 |
| `baby` | 아기 | Lv.3 |
| `growth` | 성장기 | Lv.6 |
| `legend` | 최종 진화 | Lv.10 |

- 단계에 도달한 날짜는 `pet.stageDates`에 남는다 (도감 · 성장 기록용).
- 화면 순서: 토스트(+EXP) → 레벨업 모달 → (모달 닫힌 뒤) 진화 연출.

## 5. Mood (상태 4종)

`calculateMood({ lastActivityDate, today, hp })`. 활동 = 커밋 또는 To-do 완료.
**쉰 날** = 마지막 활동 다음 날부터 어제까지, 활동 없이 통째로 지나간 날 수.

| 상태 | 조건 |
|---|---|
| HAPPY | 오늘 활동함 |
| NORMAL | 어제 활동했고 오늘은 아직 (또는 활동 기록 없음) |
| HUNGRY | 쉰 날 1~2일 |
| SICK | 쉰 날 3일 이상, 또는 HP 0 |

> 해석 확인 필요: PDF의 "하루 활동 없음 = HUNGRY"를 "하루가 통째로 비었음"으로 읽었다.
> 오늘 아직 활동을 안 한 것만으로는 HUNGRY가 아니다.

## 6. HP

- 최대 **100**, 시작 100.
- **방치 패널티**: 쉰 날 하루마다 **HP -10**. 오늘은 안 끝났으니 어제까지만 센다.
  `penaltyCheckedUntil`로 이미 깎은 날은 다시 안 깎는다 (새로고침해도 한 번).
- HP는 0 아래로 내려가지 않고, 0이어도 펫은 사라지지 않는다 (SICK 유지).
- 활동하면 Mood는 바로 HAPPY로 돌아오지만 HP는 FEED로만 회복한다.

## 7. FEED (회의 확정 전 제안값)

- 한 번에 **HP +10**, **하루 1회**. HP 100을 넘지 않는다.

## 8. 펫 이름

- 한글 · 영문 · 숫자 **2~8자**, 공백 · 특수문자 불가 (앞뒤 공백은 잘라냄).

## 9. 저장되는 pet 모양 (`commitgotchi_pet`)

```js
{
  type: 'c',            // 1번 표의 id
  name: '코딩이',
  level: 1,
  exp: 0,               // 현재 레벨 안에서 0~100
  totalExp: 0,          // 누적
  hp: 100,
  stage: 'egg',
  stageDates: { egg: '2026-11-08' },
  createdAt: '2026-11-08',
  lastFedDate: null,
  fedCount: 0,
  penaltyCheckedUntil: '2026-11-08',
  lastExpDate: null,    // 마지막으로 활동 EXP를 받은 날 (Mood가 바로 HAPPY가 되도록)
}
```
