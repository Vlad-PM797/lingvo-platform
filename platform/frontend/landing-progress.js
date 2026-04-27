import { clampProgressPercent, els, logError } from "./landing-shared.js";

const authClient = window.LingvoAuthClient;

function applyLandingProgressDemo() {
  try {
    if (els.landingMascotCard) {
      els.landingMascotCard.style.setProperty("--landing-progress-pct", "62%");
      els.landingMascotCard.setAttribute("aria-label", "Приклад прогресу");
    }
    if (els.landingCardSub) {
      els.landingCardSub.textContent = "Сьогодні: урок 3 · Привітання";
    }
    if (els.landingProgressLabel) {
      els.landingProgressLabel.textContent = "Прогрес уроку";
    }
    if (els.landingStreak) {
      els.landingStreak.textContent = "🔥 7 днів поспіль";
    }
    if (els.cheerSquadLive) {
      els.cheerSquadLive.textContent = "";
      els.cheerSquadLive.hidden = true;
    }
  } catch (error) {
    logError("landing.progress.demo.apply.failed", error, {});
  }
}

function applyLandingProgressFromApi(progressBody) {
  try {
    const totals = progressBody.totals || {};
    const spotlight = progressBody.spotlightLesson || null;
    const streakDays = Number(progressBody.streakDays) || 0;
    const attempts = Number(totals.attemptsCount) || 0;
    const completed = Number(totals.completedLessonsCount) || 0;
    const accuracyTotal = clampProgressPercent(totals.accuracyPercent);
    const barSource = spotlight ? spotlight.accuracyPercent : totals.accuracyPercent;
    const barPct = attempts === 0 ? 12 : Math.max(10, clampProgressPercent(barSource));

    if (els.landingMascotCard) {
      els.landingMascotCard.style.setProperty("--landing-progress-pct", `${barPct}%`);
      els.landingMascotCard.setAttribute("aria-label", "Твій прогрес з бекенду");
    }
    if (els.landingProgressLabel) {
      els.landingProgressLabel.textContent =
        attempts === 0 ? "Почни перші спроби" : spotlight ? "Точність останнього уроку" : "Загальна точність";
    }
    if (els.landingCardSub) {
      if (spotlight) {
        const coursePart = spotlight.courseTitle ? `${spotlight.courseTitle} · ` : "";
        const doneSuffix = spotlight.completed ? " ✓" : "";
        els.landingCardSub.textContent = `Остання активність: ${coursePart}урок ${spotlight.ordinal} · ${spotlight.title}${doneSuffix}`;
      } else if (attempts > 0) {
        els.landingCardSub.textContent = `Усього спроб: ${attempts} · точність ${accuracyTotal}% · завершено уроків: ${completed}`;
      } else {
        els.landingCardSub.textContent = "Ще немає спроб — зайди в тренажер або портал і почни урок.";
      }
    }
    if (els.landingStreak) {
      if (streakDays > 0) {
        els.landingStreak.textContent = `🔥 ${streakDays} дн. поспіль за завершеннями уроків`;
      } else if (attempts > 0) {
        els.landingStreak.textContent = `📚 ${completed} ур. · ${attempts} спроб`;
      } else {
        els.landingStreak.textContent = "🌱 Почни сьогодні — streak підвищиться";
      }
    }
    if (els.cheerSquadLive) {
      els.cheerSquadLive.textContent =
        attempts === 0
          ? "Після перших відповідей у тренажері ми підтягнемо твої цифри сюди автоматично."
          : `Звірята кажуть: уже ${attempts} спроб, точність ${accuracyTotal}% — так тримати!`;
      els.cheerSquadLive.hidden = false;
    }
  } catch (error) {
    logError("landing.progress.api.apply.failed", error, {});
    applyLandingProgressDemo();
  }
}

export async function syncLandingProgressWithBackend() {
  const baseUrl = authClient.resolveBackendUrl();
  if (!baseUrl) {
    applyLandingProgressDemo();
    return;
  }

  try {
    const accessToken = await authClient.restoreSession({ baseUrl });
    if (!accessToken) {
      applyLandingProgressDemo();
      return;
    }

    const responseBody = await authClient.request("/learning/progress/me", {
      baseUrl,
      auth: true,
    });
    applyLandingProgressFromApi(responseBody);
  } catch (error) {
    logError("landing.progress.sync.failed", error, {});
    applyLandingProgressDemo();
  }
}

export function initLandingProgressSync() {
  window.addEventListener("storage", (event) => {
    if (event.key === authClient.STORAGE_KEYS.backendUrl) {
      void syncLandingProgressWithBackend();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void syncLandingProgressWithBackend();
    }
  });
  void syncLandingProgressWithBackend();
}
