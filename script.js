(() => {
const factors = {
  uv: {
    label: 'UV Filters', initial: 20, tooltip: 'Sunscreen and skincare residues entering seawater.',
    fact: 'This is an educational exposure index, not a measurement of one product or one swim.',
    response: { low: 'At lower simulated exposure, coral colour and reef activity remain more visible.', high: 'Higher simulated UV-filter exposure gradually reduces coral colour and vitality.' },
    visual: { bleach: 1, particles: .08, haze: .16, biodiversity: .18, chemical: 0, tint: [51, 82, 91] },
    lesson: {
      science: 'UV filters help sunscreen absorb ultraviolet light. Laboratory and field research has linked some filters with coral stress. Reducing unnecessary exposure is a practical precaution.',
      diver: 'Chemical UV filters – including oxybenzone (BP-3), octinoxate (EHMC), homosalate, and avobenzone – are common ingredients in dive-specific sunscreens and everyday sunscreens used by divers.',
      impact: 'Oxybenzone, a common UV filter, causes coral bleaching and damage to coral larvae at concentrations as low as 62 parts per trillion. Many UV filters are also EDCs — they disrupt fish reproduction and hormone function. These chemicals have been found in fish, mussels, dolphins, and even human breast milk.',
      tips: ['Switch to mineral-based sunscreens (zinc oxide or titanium dioxide, non-nano).', 'Apply sunscreen at least 15 minutes before entering the water to allow absorption.', 'Consider wearing a rash guard or wetsuit with UPF protection to reduce sunscreen use.', 'Share this knowledge with fellow divers — collective action makes a real difference.'],
      image: 'assets/images/uv-filters-reef-reference.png', alt: 'Sunscreen residue dispersing above a stressed coral reef.',
    }
  },
  microplastics: {
    label: 'Microplastics', initial: 35, tooltip: 'Tiny plastic fragments and synthetic fibres in seawater.',
    fact: 'This is an educational exposure index; plastic pathways and impacts vary by place and material.',
    response: { low: 'At lower simulated exposure, the water column stays clearer and fish remain easier to see.', high: 'Higher simulated microplastic exposure adds visible fragments, haze, and reduces fish visibility.' },
    visual: { bleach: .28, particles: 1, haze: 1, biodiversity: .78, chemical: 0, tint: [78, 102, 87] },
    lesson: {
      science: 'Microplastics are small pieces of plastic, including fragments and synthetic fibres. Animals can ingest them, and the particles can carry other pollutants through food webs.',
      diver: 'Scuba fins, masks, snorkels, and neoprene suits shed microplastics through abrasion and wear. Single-use plastic items (e.g., water bottles, packaging) can also end up in the sea.',
      impact: 'Microplastics are consumed by marine organisms at the base of the food chain, affecting their growth and reproduction. They also adsorb heavy metals and other toxins, acting as carriers that introduce pollutants into marine life. In some areas, microplastic concentrations biomagnify — they become more concentrated at higher levels of the food web.',
      tips: ['Invest in durable, long-lasting gear.', 'Avoid single-use plastics during dives — bring a reusable water bottle.', 'Join or organize underwater clean-up activities.', 'Choose seafood from farms that use sustainable practices and eco-friendly equipment.'],
      image: 'assets/images/microplastics-reference.png', alt: 'A plastic bag resembling a jellyfish amid dispersed microplastic fragments underwater.',
    }
  },
  pfas: {
    label: 'PFAS', initial: 18, tooltip: 'Persistent chemicals sometimes used in water-resistant materials.',
    fact: 'This is an educational exposure index. PFAS are mostly invisible and require laboratory analysis to identify.',
    response: { low: 'At lower simulated exposure, no obvious visual signal is shown because PFAS pollution is often invisible.', high: 'Higher simulated PFAS exposure shows subtle coral stress and a restrained scientific warning, not visible litter.' },
    visual: { bleach: .56, particles: .02, haze: .08, biodiversity: .34, chemical: 1, tint: [58, 80, 81] },
    lesson: {
      science: 'PFAS are a large group of persistent chemicals. Some are used in water-resistant materials and coatings, and certain PFAS can build up in organisms over time.',
      diver: 'PFAS are widely used in waterproof coatings for dive suits, BCDs (buoyancy compensators), and dry bags, which gradually leach into the water with use and aging.',
      impact: 'PFAS accumulate in marine food chains. Concentrations increase as they move from smaller organisms to larger predators. They have been detected in fish, marine mammals, and coral tissues. Some PFAS are linked to liver damage, reproductive issues, and immune system disruption.',
      tips: ['Choose gear labeled "PFAS-free" or "PFC-free."', 'Maintain your equipment to extend its lifespan — less frequent replacement means less environmental input.', 'Ask your local dive shop about the chemical treatments used in their products.'],
      image: 'assets/images/pfas-diver-reference.png', alt: 'A diver gliding above a coral reef in clear water, illustrating an otherwise invisible chemical stressor.',
    }
  },
  care: {
    label: 'Endocrine Disrupting Chemicals', initial: 28, tooltip: 'Chemicals that can mimic, block, or alter hormone signals in aquatic animals.',
    fact: 'This is an educational exposure index. Effects vary by chemical, concentration, species, and life stage.',
    response: { low: 'At lower simulated exposure, fish activity and reef biodiversity remain more visible.', high: 'Higher simulated exposure represents hormonal stress that may affect growth, development, or reproduction in aquatic wildlife.' },
    visual: { bleach: .32, particles: .03, haze: .1, biodiversity: 1, chemical: .72, tint: [63, 88, 96] },
    lesson: {
      science: 'Endocrine disrupting chemicals interfere with hormone signals that control growth, development, and reproduction. Some pharmaceuticals, pesticides, and ingredients in consumer products can act this way. In water, effects depend on the chemical, concentration, species, and life stage.',
      diver: 'Many sunscreens, personal care products, and anti-fog treatments for dive masks contain EDCs such as parabens, phthalates, and oxybenzone. These wash off directly into the water during dives.',
      impact: 'EDCs can cause reproductive abnormalities, developmental disorders, and sex reversal in marine organisms. Coral larvae are particularly sensitive — EDC exposure can prevent them from settling and forming new colonies. These chemicals have been detected in seawater, sediments, and marine animals across the globe.',
      tips: ['Use reef-safe, paraben-free, and phthalate-free personal care products.', 'Choose mineral-based sunscreens (zinc oxide or titanium dioxide) over chemical ones.', 'Avoid chemical defoggers — simple spit or reef-safe alternatives work.', 'Rinse off on land, not in the ocean, and support better wastewater treatment in coastal communities.'],
      image: 'assets/images/personal-care-reference.png', alt: 'An ingredient label on a consumer product, illustrating one possible pathway for endocrine active chemicals.',
    }
  }
};

const sliderNotes = {
  uv: 'Watch coral colour fade as simulated UV-filter exposure rises.',
  microplastics: 'Watch the water cloud as simulated fragments become more common.',
  pfas: 'PFAS pressure is mostly invisible. Look for the reef’s gradual change.',
  care: 'Watch reef activity decline as simulated endocrine disrupting chemical exposure rises.'
};

let active = 'uv';
const sampled = new Set();
const explored = new Set(['uv']);
const labCompletionStorageKey = 'bluetrace-lab-complete';
const labSessionCompletionStorageKey = 'bluetrace-lab-complete-this-visit';
const passportAchievementStorageKey = 'bluetrace-earned-achievements';
const actTwoAchievementIds = ['water-reader', 'hidden-evidence'];
const values = Object.fromEntries(Object.entries(factors).map(([key, factor]) => [key, factor.initial]));
let targetReefProgress = 0;
let currentReefProgress = 0;
let reefAnimationFrame = null;
const lab = document.querySelector('.lab');
const reefVideos = [...document.querySelectorAll('.reef-video')];
const diveCtaVideo = document.querySelector('.dive-cta-video');
const tabs = [...document.querySelectorAll('.factor-tab')];
const range = document.querySelector('#factor-range');
const reading = document.querySelector('#reading');
const label = document.querySelector('#range-label');
const responseTitle = document.querySelector('#response-title');
const response = document.querySelector('#response-copy');
const sample = document.querySelector('#sample-button');
const status = document.querySelector('#status');
const panel = document.querySelector('#factor-panel');
const coralConditionLabel = document.querySelector('#coral-condition-label');
const coralConditionName = document.querySelector('#coral-condition-name');
const coralConditionCopy = document.querySelector('#coral-condition-copy');
const lessonImage = document.querySelector('#lesson-image');
const lessonTitle = document.querySelector('#lesson-title');
const lessonScience = document.querySelector('#lesson-science');
const lessonKicker = document.querySelector('#lesson-kicker');
const lessonCount = document.querySelector('#lesson-count');
const rangeNote = document.querySelector('#range-note');
const lessonEducation = document.querySelector('.lab-education');
const influenceToggle = document.querySelector('#influence-toggle');
const influenceModal = document.querySelector('#influence-modal');
const revealBackdrop = document.querySelector('#reveal-backdrop');
const revealClose = document.querySelector('#reveal-close');
const revealTitle = document.querySelector('#reveal-title');
const revealStatement = document.querySelector('#reveal-statement');
const revealSource = document.querySelector('#reveal-source');
const revealImpact = document.querySelector('#reveal-impact');
const revealTips = document.querySelector('#reveal-tips');
const completionNotebook = document.querySelector('#completion-notebook');
const completionNotebookBackdrop = document.querySelector('#completion-notebook-backdrop');
const completionNotebookClose = document.querySelector('#completion-notebook-close');
const labBeginDive = document.querySelector('[data-lab-begin-dive], .dive-cta-button');
const diveSoundToggle = document.querySelector('.dive-sound-toggle');
const diveSoundLabel = diveSoundToggle?.querySelector('.dive-sound-label');
const diveSoundSpectrumCanvas = document.querySelector('.dive-sound-spectrum-canvas');
const siteAudioTracks = [...document.querySelectorAll('.site-audio-track')];
const hudProgress = document.querySelector('#hud-progress');

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const interpolate = (start, end, amount) => start + ((end - start) * amount);
const easeReef = (progress) => progress * progress * (3 - (2 * progress));
let discoveryProgressFrame = null;
let displayedDiscoveryProgress = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function setDiscoveryProcess(value) {
  displayedDiscoveryProgress = Math.round(clamp(value, 0, 100));
  if (!hudProgress) return;
  hudProgress.textContent = `${displayedDiscoveryProgress}%`;
}

function animateDiscoveryProcess(target) {
  if (!hudProgress) return;
  if (discoveryProgressFrame !== null) window.cancelAnimationFrame(discoveryProgressFrame);

  const start = displayedDiscoveryProgress;
  const end = Math.round(clamp(target, 0, 100));
  const duration = reduceMotion.matches ? 0 : 900;
  const startedAt = window.performance.now();
  const readout = hudProgress.closest('.ocean-readout-progress');
  readout?.classList.remove('is-updating');
  void readout?.offsetWidth;
  readout?.classList.add('is-updating');

  if (duration === 0 || start === end) {
    setDiscoveryProcess(end);
    discoveryProgressFrame = null;
    return;
  }

  const tick = (timestamp) => {
    const progress = clamp((timestamp - startedAt) / duration);
    setDiscoveryProcess(interpolate(start, end, easeReef(progress)));
    if (progress < 1) {
      discoveryProgressFrame = window.requestAnimationFrame(tick);
    } else {
      discoveryProgressFrame = null;
    }
  };

  discoveryProgressFrame = window.requestAnimationFrame(tick);
}

function markLabComplete() {
  try {
    localStorage.setItem(labCompletionStorageKey, 'true');
    sessionStorage.setItem(labSessionCompletionStorageKey, 'true');
    const saved = JSON.parse(localStorage.getItem(passportAchievementStorageKey) || '[]');
    const earned = new Set(Array.isArray(saved) ? saved : []);
    actTwoAchievementIds.forEach((achievementId) => earned.add(achievementId));
    localStorage.setItem(passportAchievementStorageKey, JSON.stringify([...earned]));
  } catch {
    // The journey still works for this visit when browser storage is unavailable.
  }

  window.BlueTracePassport?.renderAchievementState?.();
  window.dispatchEvent(new Event('bluetrace:achievement-state-changed'));
}

function paintReef(progress) {
  const factor = factors[active];
  const visual = factor.visual;
  const eased = easeReef(progress);
  const set = (name, healthy, impact) => lab.style.setProperty(name, interpolate(healthy, impact, eased).toFixed(3));
  set('--reef-particles', 0, .8 * visual.particles); set('--reef-chemical-signal', 0, .72 * visual.chemical);
  set('--coral-healthy-opacity', 1, 0); set('--coral-bleached-opacity', 0, 1);
  set('--coral-healthy-saturation', 1.12, .76 - (.16 * visual.bleach)); set('--coral-healthy-brightness', 1.06, 1);
  set('--coral-bleached-saturation', .9, 1); set('--coral-bleached-brightness', .98, 1.03); set('--coral-cold-wash', 0, .06 + (.02 * visual.bleach));
  set('--coral-caption-shade', .72, .42);
}

function animateReef() {
  currentReefProgress += (targetReefProgress - currentReefProgress) * .08;
  if (Math.abs(targetReefProgress - currentReefProgress) < .001) currentReefProgress = targetReefProgress;
  paintReef(currentReefProgress);
  reefAnimationFrame = currentReefProgress === targetReefProgress ? null : window.requestAnimationFrame(animateReef);
}

function updateReefProgress(value) {
  targetReefProgress = clamp(value / 100);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { currentReefProgress = targetReefProgress; paintReef(currentReefProgress); return; }
  if (reefAnimationFrame === null) reefAnimationFrame = window.requestAnimationFrame(animateReef);
}

function updateCoralStatus(value) {
  const vitality = Math.round(100 - value);
  const healthyColor = [130, 214, 122];
  const warningColor = [241, 179, 107];
  const severeColor = [255, 107, 97];
  const fromColor = value <= 50 ? healthyColor : warningColor;
  const toColor = value <= 50 ? warningColor : severeColor;
  const colorProgress = value <= 50 ? value / 50 : (value - 50) / 50;
  const statusColor = fromColor.map((channel, index) => Math.round(interpolate(channel, toColor[index], colorProgress)));
  const riskLevel = value < 34 ? 'healthy' : value < 67 ? 'elevated' : 'severe';

  lab.style.setProperty('--vitality-color', `rgb(${statusColor.join(' ')})`);
  lab.style.setProperty('--condition-dot', `rgb(${statusColor.join(' ')})`);
  coralConditionLabel.textContent = `Vitality ${vitality}%`;
  coralConditionLabel.setAttribute('aria-label', `Vitality ${vitality} percent, ${riskLevel} risk`);
  coralConditionLabel.dataset.risk = riskLevel;
  coralConditionName.textContent = 'Reef vitality';
  coralConditionCopy.textContent = 'This educational simulation shows a gradual, pollutant-specific reef response.';
}

function updateLesson(factor) {
  const lesson = factor.lesson;
  lessonImage.src = lesson.image; lessonImage.alt = lesson.alt; lessonTitle.textContent = factor.label; lessonScience.textContent = lesson.science;
  lessonKicker.textContent = `${factor.label} observation`;
  lessonCount.textContent = `Explored ${explored.size} / 4`;
}

const revealStatements = {
  uv: 'Your sunscreen does not disappear when you enter the ocean.',
  microplastics: 'Small fragments can outlast the moment they were dropped.',
  pfas: 'Some of the most persistent reef pressures cannot be seen.',
  care: 'Invisible chemical exposure can interfere with the hormone signals aquatic animals use to grow and reproduce.'
};

function populateReveal() {
  const factor = factors[active]; const lesson = factor.lesson;
  revealTitle.textContent = factor.label; revealStatement.textContent = revealStatements[active];
  revealSource.textContent = lesson.diver; revealImpact.textContent = lesson.impact;
  revealTips.replaceChildren(...lesson.tips.map((tip) => { const item = document.createElement('li'); item.textContent = tip; return item; }));
}

let revealCloseTimer = null;

function closeReveal(restoreFocus = true) {
  if (influenceModal.hidden) return;
  influenceModal.classList.remove('is-open', 'is-settled'); influenceModal.setAttribute('aria-hidden', 'true'); influenceToggle.setAttribute('aria-expanded', 'false');
  window.clearTimeout(revealCloseTimer);
  revealCloseTimer = window.setTimeout(() => { influenceModal.hidden = true; if (restoreFocus) influenceToggle.focus(); }, 380);
}

function openReveal() {
  window.clearTimeout(revealCloseTimer);
  populateReveal();
  const rect = influenceToggle.getBoundingClientRect();
  influenceModal.style.setProperty('--reveal-x', `${rect.left + (rect.width / 2) - (window.innerWidth / 2)}px`);
  influenceModal.style.setProperty('--reveal-y', `${rect.top + (rect.height / 2) - (window.innerHeight / 2)}px`);
  influenceModal.hidden = false; influenceModal.setAttribute('aria-hidden', 'false'); influenceToggle.setAttribute('aria-expanded', 'true');
  window.requestAnimationFrame(() => influenceModal.classList.add('is-open'));
  window.setTimeout(() => influenceModal.classList.add('is-settled'), 560);
  revealClose.focus();
}

function keepFocusInReveal(event) {
  if (event.key !== 'Tab' || influenceModal.hidden) return;
  const focusable = [...influenceModal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
  const first = focusable[0]; const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

let completionNotebookHasAutoOpened = false;
let completionNotebookCloseTimer = null;
let completionNotebookTrigger = null;

function openCompletionNotebook() {
  if (!completionNotebook.hidden) return;
  const activeElement = document.activeElement;
  completionNotebookTrigger = activeElement instanceof HTMLElement && activeElement !== document.body && activeElement.tabIndex >= 0 && !activeElement.matches(':disabled')
    ? activeElement
    : tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
  window.clearTimeout(completionNotebookCloseTimer);
  completionNotebook.hidden = false;
  completionNotebook.setAttribute('aria-hidden', 'false');
  document.body.classList.add('notebook-open');
  window.requestAnimationFrame(() => {
    completionNotebook.classList.add('is-open');
    completionNotebookClose.focus();
  });
}

function closeCompletionNotebook() {
  if (completionNotebook.hidden) return;
  completionNotebook.classList.remove('is-open');
  completionNotebook.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('notebook-open');
  window.clearTimeout(completionNotebookCloseTimer);
  completionNotebookCloseTimer = window.setTimeout(() => {
    completionNotebook.hidden = true;
    completionNotebookTrigger?.focus();
  }, 320);
}

function keepFocusInCompletionNotebook(event) {
  if (event.key !== 'Tab' || completionNotebook.hidden) return;
  const focusable = [...completionNotebook.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.tabIndex >= 0 && !element.hidden && element.offsetParent !== null);
  const first = focusable[0]; const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function render(refreshLesson = true) {
  const factor = factors[active]; const value = values[active];
  const environmentalPressure = Math.round(Object.values(values).reduce((sum, exposure) => sum + exposure, 0) / Object.keys(values).length);
  label.textContent = factor.label; reading.value = `${value} / 100`; range.setAttribute('aria-valuetext', `Simulated ${factor.label} exposure ${value} of 100`); rangeNote.textContent = sliderNotes[active]; responseTitle.textContent = `Reef response · pressure ${environmentalPressure}/100`; response.textContent = value < 45 ? factor.response.low : factor.response.high; range.value = value;
  updateCoralStatus(value); updateReefProgress(value); if (refreshLesson) updateLesson(factor);
  tabs.forEach((tab) => { tab.setAttribute('aria-selected', tab.dataset.factor === active); tab.title = factors[tab.dataset.factor].tooltip; });
  panel.setAttribute('aria-labelledby', `${active}-tab`); sample.disabled = sampled.has(active); sample.textContent = sampled.has(active) ? 'Observation Logged' : 'Log Observation';
}

function selectFactor(key) { if (!influenceModal.hidden) closeReveal(false); active = key; explored.add(key); lessonEducation.classList.add('is-switching'); window.setTimeout(() => lessonEducation.classList.remove('is-switching'), 250); render(); }

tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectFactor(tab.dataset.factor)); tab.addEventListener('keydown', (event) => { if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return; event.preventDefault(); const next = (index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; tabs[next].focus(); selectFactor(tabs[next].dataset.factor); }); });
range.addEventListener('input', () => { values[active] = Number(range.value); render(false); });
influenceToggle.addEventListener('click', openReveal);
revealClose.addEventListener('click', () => closeReveal());
revealBackdrop.addEventListener('click', () => closeReveal());
completionNotebookClose.addEventListener('click', closeCompletionNotebook);
completionNotebookBackdrop.addEventListener('click', closeCompletionNotebook);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !completionNotebook.hidden) { closeCompletionNotebook(); return; }
  if (event.key === 'Escape' && !influenceModal.hidden) closeReveal();
  if (!completionNotebook.hidden) keepFocusInCompletionNotebook(event);
  else keepFocusInReveal(event);
});
sample.addEventListener('click', () => {
  const factor = factors[active];
  sampled.add(active);
  if (status) status.textContent = sampled.size === 4 ? 'All four observations logged. Pollution notes opened.' : `Observation logged. ${factor.fact}`;
  document.querySelector('#samples').textContent = `Observed ${sampled.size} / 4`;
  animateDiscoveryProcess(sampled.size * 25);
  render(false);
  if (sampled.size === 4 && !completionNotebookHasAutoOpened) {
    markLabComplete();
    completionNotebookHasAutoOpened = true;
    window.setTimeout(openCompletionNotebook, 180);
  }
});

labBeginDive?.addEventListener('click', (event) => {
  markLabComplete();

  const href = labBeginDive.getAttribute('href') || '';
  if (!href.startsWith('#')) return;

  event.preventDefault();
  document.documentElement.classList.remove('is-passport-open');
  document.body.classList.remove('is-passport-open');
  window.location.hash = 'practice-dive';
  window.BlueTraceRouter?.setActiveAct?.();
  window.setTimeout(() => {
    const practiceEntry = document.querySelector('#practice-dive');
    practiceEntry?.scrollIntoView({ block: 'start', behavior: 'auto' });
    practiceEntry?.focus({ preventScroll: true });
  }, 0);
});

const reefMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const reefCrossfadeDuration = 1400;
let activeReefVideo = 0;
let reefCrossfadeInProgress = false;
let reefLoopFrame = null;
let reefCrossfadeTimer = null;

function playReefVideo(video) {
  video.defaultMuted = true;
  video.muted = true;
  return video.play().then(() => true).catch(() => false);
}

function monitorReefLoop() {
  const current = reefVideos[activeReefVideo];
  const fadeLead = Math.min(1.8, current.duration * .25);
  if (!reefCrossfadeInProgress && Number.isFinite(current.duration) && current.duration > 0 && current.currentTime >= current.duration - fadeLead) {
    reefCrossfadeInProgress = true;
    const nextIndex = (activeReefVideo + 1) % reefVideos.length;
    const next = reefVideos[nextIndex];
    next.currentTime = 0;
    playReefVideo(next).then((started) => {
      if (!started) {
        reefCrossfadeInProgress = false;
        return;
      }
      next.classList.add('is-visible');
      current.classList.remove('is-visible');
      reefCrossfadeTimer = window.setTimeout(() => {
        current.pause();
        current.currentTime = 0;
        activeReefVideo = nextIndex;
        reefCrossfadeInProgress = false;
      }, reefCrossfadeDuration);
    });
  }
  reefLoopFrame = window.requestAnimationFrame(monitorReefLoop);
}

function syncReefVideoMotion() {
  window.clearTimeout(reefCrossfadeTimer);
  window.cancelAnimationFrame(reefLoopFrame);
  reefCrossfadeInProgress = false;

  const labIsActive = window.BlueTraceRouter?.getActiveAct?.() === 'lab';
  if (!labIsActive) {
    reefVideos.forEach((video, index) => {
      video.pause();
      video.classList.toggle('is-visible', index === activeReefVideo);
    });
    if (diveCtaVideo) diveCtaVideo.pause();
    return;
  }

  if (diveCtaVideo && !reefMotionPreference.matches) {
    diveCtaVideo.load();
    playReefVideo(diveCtaVideo);
  }

  if (reefMotionPreference.matches) {
    reefVideos.forEach((video, index) => {
      video.pause();
      video.classList.toggle('is-visible', index === activeReefVideo);
    });
    if (diveCtaVideo) diveCtaVideo.pause();
    return;
  }

  reefVideos.forEach((video, index) => {
    if (index !== activeReefVideo) {
      video.pause();
      video.currentTime = 0;
      video.classList.remove('is-visible');
    }
  });
  reefVideos[activeReefVideo].classList.add('is-visible');
  reefVideos[activeReefVideo].load();
  playReefVideo(reefVideos[activeReefVideo]);
  reefLoopFrame = window.requestAnimationFrame(monitorReefLoop);
}

reefMotionPreference.addEventListener('change', syncReefVideoMotion);
reefVideos[0].addEventListener('canplay', syncReefVideoMotion, { once: true });
document.addEventListener('pointerdown', syncReefVideoMotion, { once: true });
document.addEventListener('keydown', syncReefVideoMotion, { once: true });
document.addEventListener('visibilitychange', () => { if (!document.hidden) syncReefVideoMotion(); });
window.addEventListener('hashchange', syncReefVideoMotion);
syncReefVideoMotion();

let siteSoundRequested = false;
let activeSiteAudioTrack = 0;
let siteAudioFrame = null;
let siteCrossfade = null;
let siteFadeInStartedAt = null;
const siteAudioVolume = 1;
const siteAudioOutputGain = 2.4;
const siteCrossfadeDuration = 2.6;
const siteEntryFadeDuration = .8;
let siteAudioContext = null;
let siteAudioAnalyser = null;
let siteAudioGainNode = null;
let siteAudioSources = [];
let siteSpectrumData = null;
let siteWaveformData = null;
let siteSpectrumFrame = null;
const siteSpectrumBarCount = 13;
const siteSpectrumBarLevels = new Float32Array(siteSpectrumBarCount);
let siteSpectrumLastTimestamp = 0;
const siteAudioSourceByAct = {
  hidden: 'assets/audio/hidden-ecosystem-underwater-soundtrack.m4a',
  lab: 'assets/video/blue-dive-background.mp4'
};
let currentSiteAudioSource = '';
const interfaceHoverSound = new Audio('assets/audio/ui-coin-hover-first.wav');
const interfaceHoverSelector = [
  'button',
  '[role="button"]',
  'a.dive-cta-button',
  'a.witness__lab-link',
  'a.practice-entry__task-button',
  'a.descent-link',
  'a.action-button',
  'a.science-page__home',
  'a.science-page__back',
  'a.science-page__live-map-link',
  'a.science-page__pollutant-card',
  'a.field-notes-page__home',
  'a.about-page__home',
  '.witness__nav a',
  '.about-page__nav a',
  '.science-page__nav a',
  '.field-notes-page__nav a'
].join(',');
let activeInterfaceHoverTarget = null;
let interfaceHoverLastPlayedAt = 0;

const setSiteTrackVolume = (track, volume) => {
  track.volume = clamp(volume);
};

interfaceHoverSound.preload = 'auto';
interfaceHoverSound.volume = .42;

function isPlayableInterfaceTarget(element) {
  if (!element) return false;
  if (element.disabled || element.getAttribute('aria-disabled') === 'true') return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[hidden], [aria-hidden="true"]')) return false;
  return true;
}

function playInterfaceHoverSound(target) {
  if (!siteSoundRequested || document.hidden || !isPlayableInterfaceTarget(target)) return;

  const now = window.performance.now();
  if (now - interfaceHoverLastPlayedAt < 90) return;
  interfaceHoverLastPlayedAt = now;

  interfaceHoverSound.currentTime = 0;
  interfaceHoverSound.play().catch(() => {});
}

function primeInterfaceHoverSound() {
  interfaceHoverSound.load();
}

document.addEventListener('pointerover', (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest(interfaceHoverSelector);
  if (!target || target === activeInterfaceHoverTarget) return;
  activeInterfaceHoverTarget = target;
  playInterfaceHoverSound(target);
});

document.addEventListener('pointerout', (event) => {
  if (event.pointerType && event.pointerType !== 'mouse') return;
  if (!activeInterfaceHoverTarget) return;
  const nextTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null;
  if (nextTarget && activeInterfaceHoverTarget.contains(nextTarget)) return;
  activeInterfaceHoverTarget = null;
});

document.addEventListener('focusin', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest(interfaceHoverSelector);
  playInterfaceHoverSound(target);
});

function getSiteAudioSourceForRoute() {
  const hash = window.location.hash || '#section1';
  if (hash === '#lab-title' || hash === '#trace-lab') return siteAudioSourceByAct.lab;
  if (hash === '#diver-passport' || hash === '#passport') return siteAudioSourceByAct.lab;
  if (hash === '#practice-dive') return siteAudioSourceByAct.hidden;
  if (hash === '#section1' || hash.startsWith('#section')) return siteAudioSourceByAct.hidden;
  return siteAudioSourceByAct.lab;
}

function getSiteAudioMimeType(sourcePath) {
  return sourcePath.endsWith('.m4a') ? 'audio/mp4' : 'video/mp4';
}

function setSiteAudioElementSource(track, sourcePath) {
  const source = track.querySelector('source');
  const mimeType = getSiteAudioMimeType(sourcePath);
  track.pause();
  track.currentTime = 0;
  track.muted = true;
  setSiteTrackVolume(track, 0);
  if (source) {
    source.setAttribute('src', sourcePath);
    source.setAttribute('type', mimeType);
    track.removeAttribute('src');
  } else {
    track.setAttribute('src', sourcePath);
  }
  track.dataset.siteAudioSource = sourcePath;
}

function syncSiteAudioSource(options = {}) {
  const nextSource = getSiteAudioSourceForRoute();
  if (nextSource === currentSiteAudioSource) return false;
  const shouldResume = Boolean(options.resume) && siteSoundRequested && !document.hidden;
  suspendSiteAudio();
  activeSiteAudioTrack = 0;
  currentSiteAudioSource = nextSource;
  siteAudioTracks.forEach((track) => {
    setSiteAudioElementSource(track, nextSource);
  });
  if (shouldResume) {
    window.setTimeout(syncSiteAudio, 0);
  }
  return true;
}

function updateSiteSoundControl(audible) {
  diveSoundToggle.classList.toggle('is-audible', audible);
  diveSoundToggle.setAttribute('aria-pressed', String(siteSoundRequested));
  diveSoundToggle.setAttribute('aria-label', siteSoundRequested ? 'Mute sound' : 'Enable sound');
  if (diveSoundLabel) diveSoundLabel.textContent = audible ? 'Sound' : 'No sound';
  if (audible) startSiteSpectrum();
  else stopSiteSpectrum();
}

function sizeSiteSpectrumCanvas() {
  const ratio = Math.min(3, window.devicePixelRatio || 1);
  const bounds = diveSoundSpectrumCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width * ratio));
  const height = Math.max(1, Math.round(bounds.height * ratio));
  if (diveSoundSpectrumCanvas.width !== width) diveSoundSpectrumCanvas.width = width;
  if (diveSoundSpectrumCanvas.height !== height) diveSoundSpectrumCanvas.height = height;
  return { ratio, width, height };
}

function initializeSiteAudioAnalysis() {
  if (siteAudioAnalyser) return true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;

  try {
    siteAudioContext = new AudioContextClass();
    siteAudioAnalyser = siteAudioContext.createAnalyser();
    siteAudioAnalyser.fftSize = 512;
    siteAudioAnalyser.smoothingTimeConstant = .06;
    siteAudioAnalyser.minDecibels = -96;
    siteAudioAnalyser.maxDecibels = -24;
    siteAudioGainNode = siteAudioContext.createGain();
    siteAudioGainNode.gain.value = siteAudioOutputGain;
    siteSpectrumData = new Uint8Array(siteAudioAnalyser.frequencyBinCount);
    siteWaveformData = new Uint8Array(siteAudioAnalyser.fftSize);
    siteAudioSources = siteAudioTracks.map((track) => {
      const source = siteAudioContext.createMediaElementSource(track);
      source.connect(siteAudioAnalyser);
      return source;
    });
    siteAudioAnalyser.connect(siteAudioGainNode);
    siteAudioGainNode.connect(siteAudioContext.destination);
    diveSoundToggle.classList.add('has-live-spectrum');
    return true;
  } catch {
    siteAudioAnalyser = null;
    siteAudioGainNode = null;
    siteAudioSources = [];
    siteWaveformData = null;
    diveSoundToggle.classList.remove('has-live-spectrum');
    return false;
  }
}

async function resumeSiteAudioAnalysis() {
  if (!initializeSiteAudioAnalysis()) return false;
  if (siteAudioContext.state === 'suspended') await siteAudioContext.resume().catch(() => {});
  return siteAudioContext.state === 'running';
}

function readSiteEnvelopeLevel(track, barIndex) {
  const envelope = window.BlueTraceAudioEnvelope;
  if (!envelope?.levels?.length || !track) return 0;
  const duration = envelope.duration || track.duration || 1;
  const fps = envelope.fps || 30;
  const time = ((track.currentTime || 0) % duration) * fps;
  const index = Math.floor(time) % envelope.levels.length;
  const nextIndex = (index + 1) % envelope.levels.length;
  const blend = time - Math.floor(time);
  const base = envelope.levels[index] + ((envelope.levels[nextIndex] - envelope.levels[index]) * blend);
  const pulse = .58 + (.42 * Math.sin((track.currentTime * 4.9) + (barIndex * .78)));
  return clamp(base * pulse);
}

function drawSiteSpectrum(timestamp) {
  siteSpectrumFrame = null;
  if (!diveSoundToggle.classList.contains('is-audible') || !siteAudioAnalyser || siteAudioContext?.state !== 'running') return;

  const { ratio, width, height } = sizeSiteSpectrumCanvas();
  const context = diveSoundSpectrumCanvas.getContext('2d');
  siteAudioAnalyser.getByteFrequencyData(siteSpectrumData);
  siteAudioAnalyser.getByteTimeDomainData(siteWaveformData);
  context.clearRect(0, 0, width, height);
  context.fillStyle = '#73e8ff';

  const referenceWidth = 56;
  const barWidth = Math.max(1, (2 / referenceWidth) * width);
  const sampleRate = siteAudioContext.sampleRate || 48000;
  const binWidth = sampleRate / siteAudioAnalyser.fftSize;
  const minimumFrequency = 45;
  const maximumFrequency = Math.min(9000, sampleRate * .45);
  const elapsed = siteSpectrumLastTimestamp
    ? Math.min(.08, Math.max(.001, (timestamp - siteSpectrumLastTimestamp) / 1000))
    : 1 / 60;
  siteSpectrumLastTimestamp = timestamp;

  let globalWaveformPower = 0;
  for (let sampleIndex = 0; sampleIndex < siteWaveformData.length; sampleIndex += 1) {
    const displacement = (siteWaveformData[sampleIndex] - 128) / 128;
    globalWaveformPower += displacement * displacement;
  }
  const globalWaveformLevel = Math.sqrt(globalWaveformPower / siteWaveformData.length);
  const visibleBarHeights = [];
  let totalLevel = 0;

  for (let index = 0; index < siteSpectrumBarCount; index += 1) {
    const lowerFrequency = minimumFrequency * Math.pow(maximumFrequency / minimumFrequency, index / siteSpectrumBarCount);
    const upperFrequency = minimumFrequency * Math.pow(maximumFrequency / minimumFrequency, (index + 1) / siteSpectrumBarCount);
    const firstBin = Math.max(1, Math.floor(lowerFrequency / binWidth));
    const lastBin = Math.min(siteSpectrumData.length - 1, Math.ceil(upperFrequency / binWidth));
    let frequencyPower = 0;
    let frequencySamples = 0;

    for (let bin = firstBin; bin <= lastBin; bin += 1) {
      const level = siteSpectrumData[bin] / 255;
      frequencyPower += level * level;
      frequencySamples += 1;
    }

    const frequencyLevel = frequencySamples ? Math.sqrt(frequencyPower / frequencySamples) : 0;
    const waveformCenter = Math.floor(((index + .5) / siteSpectrumBarCount) * siteWaveformData.length);
    const waveformRadius = 1;
    let waveformPower = 0;
    let waveformSamples = 0;

    for (let offset = -waveformRadius; offset <= waveformRadius; offset += 1) {
      const waveformIndex = Math.min(siteWaveformData.length - 1, Math.max(0, waveformCenter + offset));
      const displacement = (siteWaveformData[waveformIndex] - 128) / 128;
      waveformPower += displacement * displacement;
      waveformSamples += 1;
    }

    const waveformLevel = Math.sqrt(waveformPower / waveformSamples);
    const spectralResponse = Math.pow(clamp(frequencyLevel), .76);
    const waveformResponse = Math.pow(clamp(waveformLevel * 6.5), .68);
    const sharedResponse = Math.pow(clamp(globalWaveformLevel * 3.4), .76);
    const envelopeResponse = Math.pow(readSiteEnvelopeLevel(siteAudioTracks[activeSiteAudioTrack], index), .82);
    const targetLevel = clamp(.035 + (spectralResponse * .14) + (waveformResponse * .52) + (sharedResponse * .08) + (envelopeResponse * .58));
    const currentLevel = siteSpectrumBarLevels[index];
    const timeConstant = targetLevel > currentLevel ? .02 + ((index % 3) * .004) : .075 + ((index % 4) * .009);
    const smoothing = 1 - Math.exp(-elapsed / timeConstant);
    const smoothedLevel = currentLevel + ((targetLevel - currentLevel) * smoothing);
    siteSpectrumBarLevels[index] = smoothedLevel;

    const minimumBarHeight = 1.4 * ratio;
    const barHeight = minimumBarHeight + (Math.pow(smoothedLevel, .86) * ((height * .94) - minimumBarHeight));
    const x = ((2 + (index * 4)) / referenceWidth) * width;
    const y = (height - barHeight) * .5;
    context.fillRect(x, y, barWidth, barHeight);
    visibleBarHeights.push((barHeight / ratio).toFixed(2));
    totalLevel += smoothedLevel;
  }

  diveSoundSpectrumCanvas.dataset.level = (totalLevel / siteSpectrumBarCount).toFixed(3);
  diveSoundSpectrumCanvas.dataset.bars = visibleBarHeights.join(',');
  siteSpectrumFrame = window.requestAnimationFrame(drawSiteSpectrum);
}

function startSiteSpectrum() {
  if (!siteAudioAnalyser || siteSpectrumFrame !== null) return;
  sizeSiteSpectrumCanvas();
  siteSpectrumFrame = window.requestAnimationFrame(drawSiteSpectrum);
}

function stopSiteSpectrum() {
  window.cancelAnimationFrame(siteSpectrumFrame);
  siteSpectrumFrame = null;
  const context = diveSoundSpectrumCanvas.getContext('2d');
  context.clearRect(0, 0, diveSoundSpectrumCanvas.width, diveSoundSpectrumCanvas.height);
  siteSpectrumBarLevels.fill(0);
  siteSpectrumLastTimestamp = 0;
  diveSoundSpectrumCanvas.dataset.level = '0.000';
  diveSoundSpectrumCanvas.dataset.bars = '';
}

function stopSiteAudioFrame() {
  window.cancelAnimationFrame(siteAudioFrame);
  siteAudioFrame = null;
}

function resetSiteTrack(track) {
  track.pause();
  track.currentTime = 0;
  setSiteTrackVolume(track, 0);
}

function suspendSiteAudio() {
  stopSiteAudioFrame();

  if (siteCrossfade) {
    const incomingTrack = siteAudioTracks[siteCrossfade.toIndex];
    const outgoingTrack = siteAudioTracks[siteCrossfade.fromIndex];
    activeSiteAudioTrack = siteCrossfade.toIndex;
    outgoingTrack.pause();
    outgoingTrack.currentTime = 0;
    setSiteTrackVolume(outgoingTrack, 0);
    incomingTrack.pause();
    siteCrossfade = null;
  }

  siteAudioTracks.forEach((track) => {
    track.pause();
    setSiteTrackVolume(track, 0);
  });
  siteFadeInStartedAt = null;
}

async function beginSiteCrossfade() {
  if (siteCrossfade || !siteSoundRequested || document.hidden) return;

  const fromIndex = activeSiteAudioTrack;
  const toIndex = (fromIndex + 1) % siteAudioTracks.length;
  const incomingTrack = siteAudioTracks[toIndex];
  siteCrossfade = { fromIndex, toIndex, startedAt: null };
  resetSiteTrack(incomingTrack);
  incomingTrack.muted = false;

  const started = await incomingTrack.play().then(() => true).catch(() => false);
  if (!started || !siteSoundRequested || document.hidden) {
    resetSiteTrack(incomingTrack);
    siteCrossfade = null;
    return;
  }

  siteCrossfade.startedAt = window.performance.now();
}

function monitorSiteAudio(timestamp) {
  siteAudioFrame = null;
  if (!siteSoundRequested || document.hidden) return;

  const currentTrack = siteAudioTracks[activeSiteAudioTrack];

  if (siteCrossfade?.startedAt !== null && siteCrossfade?.startedAt !== undefined) {
    const outgoingTrack = siteAudioTracks[siteCrossfade.fromIndex];
    const incomingTrack = siteAudioTracks[siteCrossfade.toIndex];
    const progress = clamp((timestamp - siteCrossfade.startedAt) / (siteCrossfadeDuration * 1000));
    const angle = progress * Math.PI * .5;

    setSiteTrackVolume(outgoingTrack, siteAudioVolume * Math.cos(angle));
    setSiteTrackVolume(incomingTrack, siteAudioVolume * Math.sin(angle));

    if (progress >= 1) {
      resetSiteTrack(outgoingTrack);
      activeSiteAudioTrack = siteCrossfade.toIndex;
      setSiteTrackVolume(incomingTrack, siteAudioVolume);
      siteCrossfade = null;
    }
  } else if (!siteCrossfade) {
    if (siteFadeInStartedAt !== null) {
      const fadeProgress = clamp((timestamp - siteFadeInStartedAt) / (siteEntryFadeDuration * 1000));
      setSiteTrackVolume(currentTrack, siteAudioVolume * Math.sin(fadeProgress * Math.PI * .5));
      if (fadeProgress >= 1) siteFadeInStartedAt = null;
    } else {
      setSiteTrackVolume(currentTrack, siteAudioVolume);
    }

    const remaining = currentTrack.duration - currentTrack.currentTime;
    if (siteFadeInStartedAt === null && Number.isFinite(remaining) && remaining <= siteCrossfadeDuration) {
      beginSiteCrossfade();
    }
  }

  siteAudioFrame = window.requestAnimationFrame(monitorSiteAudio);
}

async function startSiteAudio() {
  syncSiteAudioSource();
  const currentTrack = siteAudioTracks[activeSiteAudioTrack];
  const remaining = currentTrack.duration - currentTrack.currentTime;
  if (currentTrack.ended || (Number.isFinite(remaining) && remaining <= siteCrossfadeDuration)) currentTrack.currentTime = 0;

  currentTrack.muted = false;
  setSiteTrackVolume(currentTrack, 0);
  const started = await currentTrack.play().then(() => true).catch(() => false);
  if (!started) return false;

  siteFadeInStartedAt = window.performance.now();
  stopSiteAudioFrame();
  siteAudioFrame = window.requestAnimationFrame(monitorSiteAudio);
  return true;
}

async function syncSiteAudio() {
  const shouldPlay = siteSoundRequested && !document.hidden;
  if (!shouldPlay) {
    suspendSiteAudio();
    updateSiteSoundControl(false);
    return;
  }

  const started = await startSiteAudio();
  if (!started) siteSoundRequested = false;
  updateSiteSoundControl(started);
}

diveSoundToggle.addEventListener('click', async () => {
  siteSoundRequested = !siteSoundRequested;
  if (siteSoundRequested) {
    primeInterfaceHoverSound();
    await resumeSiteAudioAnalysis();
  }
  await syncSiteAudio();
});

document.addEventListener('visibilitychange', syncSiteAudio);
window.addEventListener('hashchange', () => {
  syncSiteAudioSource({ resume: true });
});
syncSiteAudioSource();
syncSiteAudio();

setDiscoveryProcess(sampled.size * 25);
render();
})();
