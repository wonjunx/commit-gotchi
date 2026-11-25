//구독 창 (subscribe)
import { useState, useEffect } from "react";
import "./Subscribe.css";

// 요금제 
const PLANS = [
  {
    id: "lite",
    name: "LITE",
    price: "₩7,000",
    features: ["Premium Pet 사용 가능", "Kotlin · C# · Rust", "특별 펫 선택 가능"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "₩10,000",
    best: true,
    features: ["모든 Premium Pet", "Experience Bonus +5%", "펫 이름 변경 가능", "특별 Pixel Effect"],
  },
];

export default function SubscribeModal({ isOpen, onClose }) {

  const [showPreview, setShowPreview] = useState(false);

  // 열릴 때마다 요금제 화면부터
  useEffect(() => {
    if (isOpen) setShowPreview(false);
  }, [isOpen]);

  // Esc로 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="sub-backdrop" onClick={onClose}>
      {showPreview ? (
        /* ---------- 22 · Premium plan demo ---------- */
        <div className="sub-preview" onClick={(e) => e.stopPropagation()}>
          <h2 className="sub-preview-title">PREMIUM PREVIEW</h2>
          <p className="sub-preview-desc">
            선택한 요금제를 확인했어요!
            <br />
            이 버전에서는 결제가 진행되지 않아요.
          </p>
          <button type="button" className="sub-btn" onClick={onClose} autoFocus>
            확인
          </button>
        </div>
      ) : (
        /* ---------- 09 · Subscription Modal ---------- */
        <div className="sub-modal" onClick={(e) => e.stopPropagation()}>
          <h2 className="sub-title">COMMITGOTCHI / SUBSCRIBE</h2>
          <p className="sub-sub">더 특별한 펫을 성장시켜보세요.</p>

          <div className="sub-plans">
            {PLANS.map((plan) => (
              <section key={plan.id} className={`sub-plan ${plan.best ? "best" : ""}`}>
                <div className="sub-plan-head">
                  <span className="sub-plan-name">{plan.name}</span>
                  {plan.best && <span className="sub-plan-badge">BEST</span>}
                </div>
                <p className="sub-plan-price">{plan.price}</p>
                <ul className="sub-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button type="button" className="sub-btn" onClick={() => setShowPreview(true)}>
                  GET {plan.name}
                </button>
              </section>
            ))}
          </div>

          <p className="sub-note"></p>
          <button type="button" className="sub-later" onClick={onClose}>
            나중에 할게요
          </button>
        </div>
      )}
    </div>
  );
}
