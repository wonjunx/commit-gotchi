import { useState } from 'react'
import { saveData, STORAGE_KEYS } from '../../../shared/lib/storage'
import { todayKey } from '../../../shared/lib/date'
import { createPet } from '../exp.js'
import ChooseEgg from './ChooseEgg.jsx'
import NamePet from './NamePet.jsx'
import HatchPet from './HatchPet.jsx'
import { FirstTodoStep } from '../../todo'

// 온보딩 02 알 고르기 → 03 이름 짓기 → 05 부화 (04 첫 To-do는 이윤경 담당, 생기면 사이에 끼우기)
// 이름을 정하는 순간 펫을 저장한다 → 부화 화면에서 새로고침해도 펫이 남음
//   <PetOnboarding onBack={() => GitHub 연결로} onComplete={(pet) => HOME으로} />
export default function PetOnboarding({ onBack, onComplete }) {
  const [step, setStep] = useState('choose')
  const [type, setType] = useState(null)
  const [pet, setPet] = useState(null)

  if (step === 'choose') {
    return <ChooseEgg selected={type} onSelect={setType} onBack={onBack} onNext={() => setStep('name')} />
  }
  if (step === 'name') {
    return (
      <NamePet
        type={type}
        initialName={pet?.name}
        onBack={() => setStep('choose')}
        onNext={(name) => {
          const next = createPet({ type, name, today: todayKey() })
          saveData(STORAGE_KEYS.PET, next)
          setPet(next)
          setStep('todo')
        }}
      />
    )
  }
   if (step === 'todo') {
    return <FirstTodoStep onBack={() => setStep('name')} onNext={() => setStep('hatch')} />
  }
  return <HatchPet pet={pet} onStart={() => onComplete?.(pet)} />
}
