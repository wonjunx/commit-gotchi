import React, { useState, useEffect } from "react";
import { GithubAccountSection } from "../features/github";
import { DataResetSection } from "../features/todo";
import { PetSettingsSection, usePet } from "../features/pet";
import { setVolumes } from "../shared/lib/sound";
import "./Settings.css";

const SETTINGS_STORAGE_KEY = "commitgotchi_settings";

const DEFAULT_SETTINGS = {
  musicVolume: 70,
  effectVolume: 50,
  animation: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function withEulReul(name) {
  if (!name) return "코딩이를";
  const last = name.charCodeAt(name.length - 1);
  if (last >= 0xac00 && last <= 0xd7a3) {
    return name + ((last - 0xac00) % 28 !== 0 ? "을" : "를");
  }
  return `${name}를`;
}

function Settings() {
  const { pet } = usePet();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("commitgotchi_user") || "{}");
    } catch {
      return {};
    }
  });

  const [prefs, setPrefs] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs));
    document.documentElement.classList.toggle("cg-no-motion", !prefs.animation);
    setVolumes({ music: prefs.musicVolume, effect: prefs.effectVolume });
  }, [prefs]);

  const handleUserChange = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("commitgotchi_user", JSON.stringify(updatedUser));
  };

  const sliderBg = (value) =>
    `linear-gradient(to right, var(--cg-green, #3bff77) ${value}%, var(--cg-line, #1f2a23) ${value}%)`;

  const petDisplayName = withEulReul(pet?.name || "코딩이");

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">SETTINGS</h1>
        <p className="settings-sub">나와 {petDisplayName} 위한 작은 설정.</p>
      </header>

      <div className="settings-panel">
        <div className="settings-block settings-embed">
          <GithubAccountSection user={user} onUserChange={handleUserChange} />
        </div>

        <section className="settings-block">
          <h3 className="settings-kicker">오디오</h3>
          <div className="settings-rows">
            <div className="settings-row">
              <label htmlFor="music-volume" className="settings-label">
                배경음 볼륨
              </label>
              <div className="settings-slider-wrap">
                <input
                  id="music-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={prefs.musicVolume}
                  style={{ background: sliderBg(prefs.musicVolume) }}
                  className="settings-slider"
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      musicVolume: Number(e.target.value),
                    }))
                  }
                />
                <span className="settings-percent">{prefs.musicVolume}%</span>
              </div>
            </div>

            <div className="settings-row">
              <label htmlFor="effect-volume" className="settings-label">
                효과음 볼륨
              </label>
              <div className="settings-slider-wrap">
                <input
                  id="effect-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={prefs.effectVolume}
                  style={{ background: sliderBg(prefs.effectVolume) }}
                  className="settings-slider"
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...prev,
                      effectVolume: Number(e.target.value),
                    }))
                  }
                />
                <span className="settings-percent">{prefs.effectVolume}%</span>
              </div>
            </div>
          </div>
        </section>

        <div className="settings-block settings-embed settings-embed-pet">
          <PetSettingsSection />
        </div>

        <section className="settings-block">
          <h3 className="settings-kicker">시스템</h3>
          <div className="settings-rows">
            <div className="settings-row">
              <span className="settings-label">애니메이션</span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.animation}
                className={`settings-toggle-btn ${prefs.animation ? "on" : ""}`}
                onClick={() =>
                  setPrefs((prev) => ({
                    ...prev,
                    animation: !prev.animation,
                  }))
                }
              >
                <span className="settings-toggle-dot" aria-hidden="true" />
                {prefs.animation ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </section>

        <div className="settings-block settings-embed settings-embed-danger">
          <DataResetSection />
        </div>
      </div>
    </div>
  );
}

export default Settings;
