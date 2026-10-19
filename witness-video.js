(() => {
  "use strict";

  const root = document.querySelector("[data-witness]");
  const video = root?.querySelector("[data-witness-video]");
  const beginButton = root?.querySelector("[data-witness-begin]");
  const cover = root?.querySelector("[data-witness-cover]");
  const coverVideos = root ? [...root.querySelectorAll("[data-witness-cover-video]")] : [];
  const routeProgress = root?.querySelector("[data-witness-route-progress]");
  const routeCursor = root?.querySelector("[data-witness-route-cursor]");
  const routeStops = root ? [...root.querySelectorAll("[data-witness-route-stop]")] : [];
  const discoveryValue = root?.querySelector("[data-witness-discovery]");
  const cueElements = root ? [...root.querySelectorAll("[data-witness-cue]")] : [];
  const languageMenus = [...document.querySelectorAll("[data-language-menu]")];

  if (!root || !video) return;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const holdAmount = clamp(Number.parseFloat(root.dataset.endHold || "0.22"), 0, 0.45);
  const activeRange = 1 - holdAmount;
  const playRate = 0.82;
  const endPadding = 0.035;
  const holdSensitivity = 1 / 7800;
  const cueMinimumHold = 950;
  const cueExitDistance = 520;
  const entryTransitionDuration = 1050;
  const cues = cueElements
    .map((element) => ({
      element,
      progress: clamp(Number.parseFloat(element.dataset.progress || "0"), 0, 1),
      dwell: 0,
      completed: false,
      activatedAt: 0,
    }))
    .sort((a, b) => a.progress - b.progress);

  let duration = Number.isFinite(video.duration) ? video.duration : 0;
  let holdProgress = 0;
  let lastInteractionAt = 0;
  let rafId = 0;
  let pauseTimer = 0;
  let hasStarted = false;
  let activeCue = null;
  let lastTouchY = null;
  let routeLength = 0;
  let activeCoverIndex = 0;
  let coverSwitching = false;
  let coverOffsetStep = 0;
  let entryReleaseAt = 0;
  let entryTimer = 0;

  const closeLanguageMenus = (except = null) => {
    languageMenus.forEach((menu) => {
      if (menu === except) return;
      menu.classList.remove("is-open");
      menu.querySelector("[data-language-toggle]")?.setAttribute("aria-expanded", "false");
    });
  };

  const toggleLanguageMenu = (menu) => {
    const willOpen = !menu.classList.contains("is-open");
    closeLanguageMenus(menu);
    menu.classList.toggle("is-open", willOpen);
    menu.querySelector("[data-language-toggle]")?.setAttribute("aria-expanded", String(willOpen));
  };

  const isAboutOpen = () => window.location.hash === "#about";
  const isWitnessRouteActive = () => !window.BlueTraceRouter || window.BlueTraceRouter.getActiveAct?.() === "witness";
  const isInsideAbout = (event) => Boolean(event.target?.closest?.(".about-page"));

  const readDuration = () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      duration = video.duration;
    }
    return duration;
  };

  const playableEnd = () => Math.max(readDuration() - endPadding, 0);

  const mediaProgress = () => {
    const end = playableEnd();
    if (!end) return 0;
    return clamp(video.currentTime / end, 0, 1);
  };

  const totalProgress = () => clamp((mediaProgress() * activeRange) + holdProgress, 0, 1);

  const setTotalProgress = (progress) => {
    const target = clamp(progress, 0, 1);
    const end = playableEnd();
    if (!end) return;

    if (target <= activeRange) {
      holdProgress = 0;
      video.currentTime = end * (target / Math.max(activeRange, 0.001));
    } else {
      video.currentTime = end;
      holdProgress = target - activeRange;
    }
  };

  const coverClip = (videoElement = null) => {
    const sourceDuration = Number.isFinite(videoElement?.duration) ? videoElement.duration : 10;
    const start = clamp(Number.parseFloat(cover?.dataset.coverStart || "0.55"), 0, Math.max(sourceDuration - 0.6, 0));
    const end = clamp(Number.parseFloat(cover?.dataset.coverEnd || "9.35"), start + 0.6, sourceDuration - 0.08);
    const overlap = clamp(Number.parseFloat(cover?.dataset.coverOverlap || "2.15"), 0.8, Math.max((end - start) * 0.45, 0.8));
    return { start, end, overlap };
  };

  const prepCoverVideo = (videoElement, preload = "auto") => {
    videoElement.muted = true;
    videoElement.defaultMuted = true;
    videoElement.playsInline = true;
    videoElement.preload = preload;
    videoElement.loop = false;
    videoElement.playbackRate = 0.72;
  };

  const playCoverVideo = (videoElement, offset = 0) => {
    const { start, end } = coverClip(videoElement);
    const targetTime = clamp(start + offset, start, Math.max(end - 2.4, start));

    try {
      videoElement.currentTime = targetTime;
    } catch (_error) {
      // Some browsers reject currentTime before metadata; loadedmetadata retries below.
    }

    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  const switchCoverVideo = () => {
    if (hasStarted || coverSwitching || coverVideos.length < 2) return;
    coverSwitching = true;

    const currentVideo = coverVideos[activeCoverIndex];
    const nextCoverIndex = (activeCoverIndex + 1) % coverVideos.length;
    const nextVideo = coverVideos[nextCoverIndex];
    const nextOffset = (coverOffsetStep % 3) * 0.28;

    prepCoverVideo(nextVideo);
    if (nextVideo.readyState < 1) nextVideo.load();
    playCoverVideo(nextVideo, nextOffset);
    nextVideo.classList.add("is-active");
    currentVideo.classList.remove("is-active");

    window.setTimeout(() => {
      currentVideo.pause();
      const { start } = coverClip(currentVideo);
      try {
        currentVideo.currentTime = start;
      } catch (_error) {}
      activeCoverIndex = nextCoverIndex;
      coverOffsetStep += 1;
      coverSwitching = false;
    }, 2050);
  };

  const syncCoverLoop = (event) => {
    if (hasStarted || coverVideos.length < 2) return;
    const videoElement = event.currentTarget;
    if (videoElement !== coverVideos[activeCoverIndex]) return;

    const { end, overlap } = coverClip(videoElement);
    if (videoElement.currentTime >= end - overlap) {
      switchCoverVideo();
    }
  };

  const startCover = () => {
    if (!coverVideos.length) return;
    coverVideos.forEach((coverVideo, index) => {
      const isActiveCover = index === activeCoverIndex;
      prepCoverVideo(coverVideo, isActiveCover ? "auto" : "none");
      coverVideo.classList.toggle("is-active", index === activeCoverIndex);
      coverVideo.addEventListener("timeupdate", syncCoverLoop);
      coverVideo.addEventListener("loadedmetadata", () => {
        if (index === activeCoverIndex && !hasStarted) playCoverVideo(coverVideo);
      }, { once: true });
    });

    if (coverVideos[activeCoverIndex].readyState >= 1) {
      playCoverVideo(coverVideos[activeCoverIndex]);
    } else {
      coverVideos[activeCoverIndex].load();
    }
  };

  const stopCover = () => {
    if (!coverVideos.length) return;
    window.setTimeout(() => {
      coverVideos.forEach((coverVideo) => coverVideo.pause());
    }, 1300);
  };

  const paint = () => {
    const progress = totalProgress();
    const endOpacity = clamp((progress - activeRange) / Math.max(holdAmount, 0.001), 0, 1);
    const scale = 1.018 + (progress * 0.045) + (endOpacity * 0.035);

    root.style.setProperty("--witness-progress", progress.toFixed(4));
    root.style.setProperty(
      "--witness-prompt-opacity",
      hasStarted && progress < 0.999 ? "1" : "0"
    );
    root.style.setProperty("--witness-end-opacity", (endOpacity * 0.85).toFixed(3));
    root.style.setProperty("--witness-video-scale", scale.toFixed(4));
    root.style.setProperty("--witness-video-x", `${(-18 * progress).toFixed(2)}px`);
    root.style.setProperty("--witness-video-y", `${(-12 * progress).toFixed(2)}px`);

    if (routeProgress) {
      routeLength ||= routeProgress.getTotalLength();
      routeProgress.style.strokeDasharray = "1";
      routeProgress.style.strokeDashoffset = (1 - progress).toFixed(4);

      if (routeCursor && routeLength) {
        const point = routeProgress.getPointAtLength(routeLength * progress);
        routeCursor.setAttribute("transform", `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
      }
    }

    routeStops.forEach((stop) => {
      const stopProgress = clamp(Number.parseFloat(stop.dataset.progress || "0"), 0, 1);
      stop.classList.toggle("is-passed", progress >= stopProgress - 0.001);
    });

    if (discoveryValue) {
      discoveryValue.textContent = `${Math.round(progress * 100)}%`;
    }

    root.classList.toggle("witness--lab-ready", hasStarted && progress >= 0.985 && !isAboutOpen());
  };

  const pauseVideo = () => {
    if (!video.paused) video.pause();
    paint();
  };

  const setCueOpacity = (cue, opacity) => {
    cue.element.style.setProperty("--witness-cue-opacity", clamp(opacity, 0, 1).toFixed(3));
  };

  const hideCue = (cue) => {
    cue.element.classList.remove("is-active");
    cue.element.setAttribute("aria-hidden", "true");
    cue.element.style.removeProperty("--witness-cue-opacity");
  };

  const hideAllCues = () => {
    cues.forEach(hideCue);
    root.classList.remove("witness--cue-active");
    activeCue = null;
  };

  const activateCue = (cue) => {
    clearTimeout(pauseTimer);
    hideAllCues();
    setTotalProgress(cue.progress);
    pauseVideo();

    activeCue = cue;
    cue.dwell = 0;
    cue.activatedAt = performance.now();
    setCueOpacity(cue, 0);
    cue.element.classList.add("is-active");
    cue.element.setAttribute("aria-hidden", "false");
    root.classList.add("witness--cue-active");
    paint();
    cue.element.getBoundingClientRect();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (activeCue === cue) setCueOpacity(cue, 1);
      });
    });
  };

  const detectCueCrossing = () => {
    if (!hasStarted || activeCue) return false;
    const progress = totalProgress();
    const cue = cues.find((item) => !item.completed && progress >= item.progress - 0.001);
    if (!cue) return false;
    activateCue(cue);
    return true;
  };

  const tick = () => {
    const end = playableEnd();
    if (end && video.currentTime >= end) {
      video.currentTime = end;
      pauseVideo();
    } else {
      paint();
    }

    if (detectCueCrossing()) {
      rafId = 0;
      return;
    }

    if (!video.paused || performance.now() - lastInteractionAt < 160) {
      rafId = requestAnimationFrame(tick);
      return;
    }

    rafId = 0;
  };

  const requestTick = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const schedulePause = (delta) => {
    clearTimeout(pauseTimer);
    const pauseDelay = clamp(Math.abs(delta) * 0.55, 120, 920);
    pauseTimer = window.setTimeout(() => {
      if (!activeCue && performance.now() - lastInteractionAt >= pauseDelay - 24) {
        pauseVideo();
      }
    }, pauseDelay);
  };

  const startVideo = () => {
    if (activeCue || !video.paused) return;
    video.playbackRate = playRate;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(pauseVideo);
    }
  };

  const resetCuesAfterReverse = () => {
    const progress = totalProgress();
    cues.forEach((cue) => {
      if (progress < cue.progress - 0.004) {
        cue.completed = false;
        cue.dwell = 0;
      }
    });
  };

  const nudgeBackward = (delta) => {
    if (holdProgress > 0) {
      holdProgress = clamp(holdProgress + (delta * holdSensitivity), 0, holdAmount);
    } else {
      const end = playableEnd();
      if (end) {
        video.currentTime = clamp(video.currentTime + (delta * 0.00065), 0, end);
      }
    }
    resetCuesAfterReverse();
  };

  const continueForward = (delta) => {
    const end = playableEnd();
    if (end && video.currentTime >= end - 0.01) {
      video.currentTime = end;
      holdProgress = clamp(holdProgress + (delta * holdSensitivity), 0, holdAmount);
      pauseVideo();
      detectCueCrossing();
      requestTick();
      return;
    }

    startVideo();
    schedulePause(delta);
    requestTick();
  };

  const finishCueForward = (cue, delta) => {
    cue.completed = true;
    cue.dwell = 1;
    setCueOpacity(cue, 0);
    cue.element.setAttribute("aria-hidden", "true");
    activeCue = null;
    root.classList.remove("witness--cue-active");

    window.setTimeout(() => {
      if (cue.element.getAttribute("aria-hidden") !== "true") return;
      cue.element.classList.remove("is-active");
      cue.element.style.removeProperty("--witness-cue-opacity");
    }, 2350);

    setTotalProgress(Math.min(cue.progress + 0.0025, 1));
    paint();
    continueForward(Math.max(delta * 0.35, 24));
  };

  const handleActiveCue = (delta) => {
    const cue = activeCue;
    if (!cue) return false;
    pauseVideo();

    if (delta < 0) {
      cue.dwell = clamp(cue.dwell - (clamp(Math.abs(delta), 12, 120) / cueExitDistance), 0, 1);
      const opacity = cue.dwell <= 0.36 ? 1 : 1 - ((cue.dwell - 0.36) / 0.64);
      setCueOpacity(cue, opacity);

      if (cue.dwell <= 0) {
        hideCue(cue);
        activeCue = null;
        root.classList.remove("witness--cue-active");
        setTotalProgress(Math.max(cue.progress - 0.003, 0));
        cue.completed = false;
        nudgeBackward(delta);
        paint();
      }
      return true;
    }

    if (performance.now() - cue.activatedAt < cueMinimumHold) return true;

    cue.dwell = clamp(cue.dwell + (clamp(Math.abs(delta), 12, 120) / cueExitDistance), 0, 1);
    const opacity = cue.dwell <= 0.34 ? 1 : 1 - ((cue.dwell - 0.34) / 0.66);
    setCueOpacity(cue, opacity);

    if (cue.dwell >= 1) finishCueForward(cue, delta);
    return true;
  };

  const handleDelta = (delta) => {
    if (!hasStarted || !Number.isFinite(delta) || delta === 0) return;
    if (performance.now() < entryReleaseAt) return;
    readDuration();
    lastInteractionAt = performance.now();

    if (handleActiveCue(delta)) {
      requestTick();
      return;
    }

    if (delta < 0) {
      pauseVideo();
      nudgeBackward(delta);
      paint();
      requestTick();
      return;
    }

    continueForward(delta);
  };

  const onWheel = (event) => {
    if (!isWitnessRouteActive()) return;
    if (isAboutOpen() || isInsideAbout(event)) return;
    if (!hasStarted) return;
    event.preventDefault();
    event.stopPropagation();
    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    handleDelta(delta);
  };

  const onKeyDown = (event) => {
    if (!isWitnessRouteActive()) return;
    if (event.key === "Escape" && languageMenus.some((menu) => menu.classList.contains("is-open"))) {
      event.preventDefault();
      closeLanguageMenus();
      return;
    }

    if (isAboutOpen()) {
      if (event.key === "Escape") {
        event.preventDefault();
        window.location.hash = "section1";
      }
      return;
    }

    if (!hasStarted) return;

    if (event.key === "Home") {
      event.preventDefault();
      pauseVideo();
      hideAllCues();
      cues.forEach((cue) => {
        cue.completed = false;
        cue.dwell = 0;
      });
      setTotalProgress(0);
      paint();
      return;
    }

    const forwardKeys = new Set([" ", "ArrowDown", "PageDown", "End"]);
    const backwardKeys = new Set(["ArrowUp", "PageUp"]);
    if (forwardKeys.has(event.key)) {
      event.preventDefault();
      handleDelta(event.key === "PageDown" ? 150 : 90);
    } else if (backwardKeys.has(event.key)) {
      event.preventDefault();
      handleDelta(event.key === "PageUp" ? -150 : -90);
    }
  };

  const onTouchStart = (event) => {
    if (!isWitnessRouteActive()) return;
    if (isAboutOpen() || isInsideAbout(event)) return;
    if (!hasStarted || !event.touches.length) return;
    lastTouchY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    if (!isWitnessRouteActive()) return;
    if (isAboutOpen() || isInsideAbout(event)) return;
    if (!hasStarted || lastTouchY === null || !event.touches.length) return;
    event.preventDefault();
    const nextY = event.touches[0].clientY;
    handleDelta((lastTouchY - nextY) * 1.25);
    lastTouchY = nextY;
  };

  const beginDive = () => {
    if (hasStarted) return;
    hasStarted = true;
    entryReleaseAt = performance.now() + entryTransitionDuration;
    holdProgress = 0;
    clearTimeout(entryTimer);
    hideAllCues();
    cues.forEach((cue) => {
      cue.completed = false;
      cue.dwell = 0;
    });
    video.currentTime = 0;
    root.classList.add("witness--started");
    root.classList.add("witness--entering");
    root.focus({ preventScroll: true });
    paint();
    entryTimer = window.setTimeout(() => {
      root.classList.remove("witness--entering");
      paint();
    }, entryTransitionDuration);
    stopCover();
  };

  video.pause();
  video.currentTime = 0;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.playbackRate = playRate;
  startCover();

  video.addEventListener("loadedmetadata", () => {
    readDuration();
    if (!hasStarted) {
      video.currentTime = 0;
      holdProgress = 0;
    }
    paint();
  }, { once: true });

  video.addEventListener("ended", () => {
    const end = playableEnd();
    if (end) video.currentTime = end;
    pauseVideo();
    detectCueCrossing();
  });

  beginButton?.addEventListener("click", beginDive);
  languageMenus.forEach((menu) => {
    menu.querySelector("[data-language-toggle]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleLanguageMenu(menu);
    });

    menu.querySelectorAll("[data-language-option]").forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        closeLanguageMenus();
      });
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-language-menu]")) return;
    closeLanguageMenus();
  });
  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("keydown", onKeyDown, { passive: false, capture: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", () => {
    lastTouchY = null;
  }, { passive: true });
  window.addEventListener("touchcancel", () => {
    lastTouchY = null;
  }, { passive: true });
  window.addEventListener("resize", paint, { passive: true });
  window.addEventListener("hashchange", () => {
    closeLanguageMenus();
    if (isAboutOpen()) {
      pauseVideo();
      document.querySelector("#about")?.focus({ preventScroll: true });
    }
  }, { passive: true });

  paint();
})();
