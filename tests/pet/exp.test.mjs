// node --test tests/pet/exp.test.mjs  — Node 내장 테스트 러너, 추가 라이브러리 없음
import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  addDays,
  applyExp,
  applyNeglectPenalty,
  calculateExp,
  calculateMood,
  canFeed,
  checkEvolution,
  checkLevelUp,
  createPet,
  diffDays,
  feedPet,
  getStage,
  nextEvolutionLevel,
  validateName,
} from '../../src/features/pet/exp.js'

const TODAY = '2026-11-10'
const base = (over = {}) => ({ ...createPet({ type: 'c', name: '코딩이', today: '2026-11-01' }), ...over })

describe('날짜', () => {
  test('diffDays · addDays (월·연 경계)', () => {
    assert.equal(diffDays('2026-10-31', '2026-11-01'), 1)
    assert.equal(diffDays('2026-12-31', '2027-01-01'), 1)
    assert.equal(diffDays(TODAY, TODAY), 0)
    assert.equal(addDays('2026-11-01', -1), '2026-10-31')
  })
})

describe('createPet', () => {
  test('문서 초기값 { level:1, exp:0, hp:100, stage:"egg" }', () => {
    const pet = createPet({ type: 'html', name: '코딩이', today: TODAY })
    assert.equal(pet.level, 1)
    assert.equal(pet.exp, 0)
    assert.equal(pet.hp, 100)
    assert.equal(pet.stage, 'egg')
    assert.deepEqual(pet.stageDates, { egg: TODAY })
  })
  test('펫 5종 모두 생성, 그 외는 오류', () => {
    for (const type of ['c', 'cpp', 'java', 'python', 'html']) createPet({ type, name: 'ab', today: TODAY })
    assert.throws(() => createPet({ type: 'rust', name: 'ab', today: TODAY }))
  })
})

describe('EXP · 레벨업', () => {
  test('0 이하 · NaN은 무시', () => {
    const pet = base()
    assert.equal(calculateExp(pet, 0), pet)
    assert.equal(calculateExp(pet, -5), pet)
    assert.equal(calculateExp(pet, NaN), pet)
  })
  test('100 도달 시 레벨업 · 넘친 EXP 이월 (H-05: 72+40 → 12/100)', () => {
    const r = checkLevelUp(calculateExp(base({ level: 7, exp: 72 }), 40))
    assert.equal(r.leveledUp, true)
    assert.equal(r.pet.level, 8)
    assert.equal(r.pet.exp, 12)
  })
  test('딱 100이면 레벨업 후 0', () => {
    const r = checkLevelUp(calculateExp(base({ exp: 80 }), 20))
    assert.equal(r.pet.level, 2)
    assert.equal(r.pet.exp, 0)
  })
  test('한 번에 여러 레벨', () => {
    const r = checkLevelUp(calculateExp(base(), 250))
    assert.equal(r.pet.level, 3)
    assert.equal(r.pet.exp, 50)
  })
  test('최대 레벨 10에서 멈추고 바는 꽉 참', () => {
    const r = checkLevelUp(calculateExp(base({ level: 10, exp: 90 }), 50))
    assert.equal(r.pet.level, 10)
    assert.equal(r.pet.exp, 100)
    assert.equal(r.leveledUp, false)
  })
})

describe('진화', () => {
  test('단계: Lv1 알 · Lv3 아기 · Lv6 성장기 · Lv10 최종', () => {
    assert.equal(getStage(1), 'egg')
    assert.equal(getStage(2), 'egg')
    assert.equal(getStage(3), 'baby')
    assert.equal(getStage(5), 'baby')
    assert.equal(getStage(6), 'growth')
    assert.equal(getStage(10), 'legend')
  })
  test('다음 진화 레벨', () => {
    assert.equal(nextEvolutionLevel(7), 10)
    assert.equal(nextEvolutionLevel(2), 3)
    assert.equal(nextEvolutionLevel(10), null)
  })
  test('단계를 건너뛰어도 날짜가 모두 기록됨', () => {
    const r = checkEvolution(base({ level: 6 }), TODAY)
    assert.equal(r.evolved, true)
    assert.equal(r.toStage, 'growth')
    assert.equal(r.pet.stageDates.baby, TODAY)
    assert.equal(r.pet.stageDates.growth, TODAY)
  })
})

describe('applyExp (addExp 묶음)', () => {
  test('레벨업 없이 EXP만', () => {
    const r = applyExp(base(), 20, TODAY)
    assert.equal(r.pet.exp, 20)
    assert.equal(r.levelUp, null)
    assert.equal(r.evolution, null)
  })
  test('Lv2 98 + 10 → Lv3 레벨업 + 아기 진화', () => {
    const r = applyExp(base({ level: 2, exp: 98 }), 10, TODAY)
    assert.deepEqual(r.levelUp, { fromLevel: 2, toLevel: 3 })
    assert.deepEqual(r.evolution, { fromStage: 'egg', toStage: 'baby' })
    assert.equal(r.pet.exp, 8)
    assert.equal(r.gained, 10)
  })
  test('원래 pet은 바뀌지 않음', () => {
    const pet = base()
    applyExp(pet, 500, TODAY)
    assert.equal(pet.level, 1)
    assert.equal(pet.exp, 0)
  })
})

describe('Mood', () => {
  const mood = (last, hp) => calculateMood({ lastActivityDate: last, today: TODAY, hp })
  test('오늘 활동 → HAPPY', () => assert.equal(mood(TODAY), 'HAPPY'))
  test('어제 활동, 오늘 아직 → NORMAL', () => assert.equal(mood('2026-11-09'), 'NORMAL'))
  test('하루 통째로 없음 → HUNGRY', () => assert.equal(mood('2026-11-08'), 'HUNGRY'))
  test('이틀 없음 → HUNGRY', () => assert.equal(mood('2026-11-07'), 'HUNGRY'))
  test('3일 이상 없음 → SICK', () => assert.equal(mood('2026-11-06'), 'SICK'))
  test('활동 기록 없음 → NORMAL', () => assert.equal(mood(null), 'NORMAL'))
  test('HP 0 → 오늘 활동해도 SICK', () => assert.equal(mood(TODAY, 0), 'SICK'))
})

describe('방치 패널티', () => {
  test('3일 방치 → HP -30, 다시 불러도 또 깎이지 않음', () => {
    const pet = base({ penaltyCheckedUntil: '2026-11-06' })
    const r1 = applyNeglectPenalty(pet, { lastActivityDate: '2026-11-06', today: TODAY })
    assert.equal(r1.idleDays, 3) // 7, 8, 9일
    assert.equal(r1.pet.hp, 70)
    assert.equal(r1.pet.penaltyCheckedUntil, '2026-11-09')
    const r2 = applyNeglectPenalty(r1.pet, { lastActivityDate: '2026-11-06', today: TODAY })
    assert.equal(r2.hpLost, 0)
    assert.equal(r2.pet.hp, 70)
  })
  test('어제 활동했으면 패널티 없음', () => {
    const r = applyNeglectPenalty(base({ penaltyCheckedUntil: '2026-11-05' }), { lastActivityDate: '2026-11-09', today: TODAY })
    assert.equal(r.idleDays, 0)
    assert.equal(r.pet.hp, 100)
  })
  test('활동 기록이 없으면 생성일 다음 날부터 계산', () => {
    const r = applyNeglectPenalty(base(), { lastActivityDate: null, today: '2026-11-04' })
    assert.equal(r.idleDays, 2) // 2, 3일
    assert.equal(r.pet.hp, 80)
  })
  test('만든 당일엔 패널티 없음', () => {
    const pet = createPet({ type: 'c', name: 'ab', today: TODAY })
    assert.equal(applyNeglectPenalty(pet, { lastActivityDate: null, today: TODAY }).pet, pet)
  })
  test('HP는 0 아래로 안 내려감', () => {
    const r = applyNeglectPenalty(base({ hp: 20 }), { lastActivityDate: null, today: '2026-11-20' })
    assert.equal(r.pet.hp, 0)
    assert.equal(r.hpLost, 20)
  })
})

describe('FEED', () => {
  test('HP +10, 하루 1회', () => {
    const r1 = feedPet(base({ hp: 60 }), TODAY)
    assert.equal(r1.fed, true)
    assert.equal(r1.pet.hp, 70)
    assert.equal(canFeed(r1.pet, TODAY), false)
    const r2 = feedPet(r1.pet, TODAY)
    assert.equal(r2.fed, false)
    assert.equal(r2.pet.hp, 70)
    assert.equal(canFeed(r1.pet, addDays(TODAY, 1)), true)
  })
  test('최대 100을 넘지 않음', () => {
    const r = feedPet(base({ hp: 95 }), TODAY)
    assert.equal(r.pet.hp, 100)
    assert.equal(r.hpGained, 5)
  })
})

describe('이름 (O-03 · S-03)', () => {
  test('2~8자 한글·영문·숫자', () => {
    assert.equal(validateName('코딩이').ok, true)
    assert.equal(validateName('  Codey7 ').name, 'Codey7')
    assert.equal(validateName('코').ok, false)
    assert.equal(validateName('가나다라마바사아자').ok, false)
    assert.equal(validateName('코딩 이').ok, false)
    assert.equal(validateName('코딩이!').ok, false)
    assert.equal(validateName(undefined).ok, false)
  })
})
