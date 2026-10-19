(() => {
const pledgeInput = document.querySelector('#pledge-input');
const characterCount = document.querySelector('#character-count');
const noteButton = document.querySelector('#new-note');
const fieldNote = document.querySelector('#field-note-title');
const noteSource = document.querySelector('#note-source');
const printButton = document.querySelector('#print-passport');
const diveDateDay = document.querySelector('#dive-date-day');
const diveDateMonthYear = document.querySelector('#dive-date-month-year');

function getDateParts(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const monthYear = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
  return { day, monthYear, full: `${day} ${monthYear}` };
}

const pageDate = getDateParts();
diveDateDay.firstChild.nodeValue = `${pageDate.day} `;
diveDateMonthYear.textContent = pageDate.monthYear;

const notes = [
  { source: 'DIVE INSTRUCTOR', text: '“Pause before you approach. A calm animal is not an invitation to get closer.”' },
  { source: 'MARINE BIOLOGIST', text: '“Distance lets an animal choose its own route. That choice is part of a healthy reef.”' },
  { source: 'CONSERVATION DIVER', text: '“Good buoyancy is quiet. When the seabed stays still, more of the reef can keep doing its work.”' },
  { source: 'PUBLISHED GUIDANCE', text: '“If you cannot identify an object safely, leave it where it is and seek local guidance.”' }
];

function showNote(note) {
  fieldNote.textContent = note.text;
  noteSource.textContent = note.source;
}

// Start each visit with a fresh instructor note rather than always showing the same message.
showNote(notes[Math.floor(Math.random() * notes.length)]);

function updatePledge() {
  const value = pledgeInput.value.trim();
  characterCount.textContent = pledgeInput.value.length;
  pledgeInput.setAttribute('aria-label', value ? `Your personal ocean pledge: ${value}` : 'Your personal ocean pledge');
}

function rotateNote() {
  const current = notes.findIndex((note) => note.text === fieldNote.textContent);
  const next = notes[(current + 1) % notes.length];
  fieldNote.style.opacity = '0';
  window.setTimeout(() => {
    showNote(next);
    fieldNote.style.opacity = '1';
  }, 180);
}

localStorage.removeItem('bluetrace-ocean-pledge');
pledgeInput.value = '';
updatePledge();
pledgeInput.addEventListener('input', updatePledge);
noteButton.addEventListener('click', rotateNote);
const saveDialog = document.querySelector('#save-dialog');
const saveDialogClose = document.querySelector('.save-dialog__close');
const returnToPassport = document.querySelector('#return-to-passport');
const downloadRecord = document.querySelector('#download-record');

function closeSaveDialog() {
  saveDialog.hidden = true;
  printButton.focus();
}

printButton.addEventListener('click', () => {
  saveDialog.hidden = false;
  saveDialogClose.focus();
});

saveDialogClose.addEventListener('click', closeSaveDialog);
returnToPassport.addEventListener('click', closeSaveDialog);
saveDialog.addEventListener('click', (event) => {
  if (event.target === saveDialog) closeSaveDialog();
});

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  let currentY = y;
  for (const character of text) {
    const candidate = line + character;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, currentY);
      line = character;
      currentY += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function drawSealArcText(context, text, centerX, centerY, radius) {
  const characters = [...text];
  const span = Math.PI * 1.48;
  const start = (-Math.PI / 2) - (span / 2);
  context.save();
  context.textAlign = 'center'; context.textBaseline = 'middle';
  characters.forEach((character, index) => {
    const angle = start + (span * (index / Math.max(characters.length - 1, 1)));
    context.save(); context.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius); context.rotate(angle + Math.PI / 2); context.fillText(character, 0, 0); context.restore();
  });
  context.restore();
}

function buildOnePagePdf(jpegBytes, width, height) {
  const encoder = new TextEncoder();
  const pieces = [];
  const offsets = [0];
  let offset = 0;
  const addText = (value) => { const bytes = encoder.encode(value); pieces.push(bytes); offset += bytes.length; };
  const addBytes = (bytes) => { pieces.push(bytes); offset += bytes.length; };
  addText('%PDF-1.4\n%PDF\n');
  offsets[1] = offset; addText('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets[2] = offset; addText('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets[3] = offset; addText('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n');
  offsets[4] = offset; addText(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`); addBytes(jpegBytes); addText('\nendstream\nendobj\n');
  const content = 'q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n';
  offsets[5] = offset; addText(`5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  const xrefOffset = offset;
  addText('xref\n0 6\n0000000000 65535 f \n');
  for (let index = 1; index <= 5; index += 1) addText(`${String(offsets[index]).padStart(10, '0')} 00000 n \n`);
  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(pieces, { type: 'application/pdf' });
}

function drawPdfBadge(context, centerX, centerY, type) {
  const blue = '#0a4a88';
  const red = '#a93a32';
  const paleBlue = '#87b9cf';
  context.save();
  context.translate(centerX, centerY); context.scale(1.16, 1.16); context.translate(-centerX, -centerY);
  context.lineCap = 'round'; context.lineJoin = 'round';
  context.strokeStyle = blue; context.fillStyle = '#faf8f0'; context.lineWidth = 4.5;
  context.beginPath(); context.arc(centerX, centerY, 53, 0, Math.PI * 2); context.fill(); context.stroke();
  context.lineWidth = 1.3; context.globalAlpha = 0.72;
  context.beginPath(); context.arc(centerX, centerY, 48, 0, Math.PI * 2); context.stroke();
  for (let angle = 0; angle < Math.PI * 2; angle += 0.24) { const r = 50 + ((Math.sin(angle * 9) + 1) * 0.7); context.beginPath(); context.moveTo(centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r); context.lineTo(centerX + Math.cos(angle) * (r + 2.5), centerY + Math.sin(angle) * (r + 2.5)); context.stroke(); }
  context.save(); context.beginPath(); context.arc(centerX, centerY, 46, 0, Math.PI * 2); context.clip();
  context.strokeStyle = paleBlue; context.lineWidth = 1.7; context.globalAlpha = 0.72;
  [-30, -22, 23, 31].forEach((offset) => { context.beginPath(); context.moveTo(centerX - 47, centerY + offset); context.bezierCurveTo(centerX - 21, centerY + offset - 8, centerX + 15, centerY + offset + 8, centerX + 49, centerY + offset - 2); context.stroke(); });
  context.globalAlpha = 1; context.strokeStyle = blue; context.fillStyle = blue; context.lineWidth = 2.2;
  const coral = (x, y, scale = 1) => { context.strokeStyle = red; context.lineWidth = 2 * scale; context.beginPath(); context.moveTo(x, y); context.lineTo(x, y - 14 * scale); context.moveTo(x, y - 8 * scale); context.lineTo(x - 7 * scale, y - 15 * scale); context.moveTo(x, y - 4 * scale); context.lineTo(x + 7 * scale, y - 11 * scale); context.stroke(); context.strokeStyle = blue; context.lineWidth = 2.2; };
  const bubbles = (x, y) => { [0, 8, 15].forEach((offset, index) => { context.beginPath(); context.arc(x + (index % 2 ? 3 : -2), y - offset, 1.7 + index * 0.55, 0, Math.PI * 2); context.stroke(); }); };
  const sparkle = (x, y, size = 3) => { context.beginPath(); context.moveTo(x, y - size); context.lineTo(x + size * 0.55, y); context.lineTo(x, y + size); context.lineTo(x - size * 0.55, y); context.closePath(); context.stroke(); };
  if (type === 0) {
    context.lineWidth = 2.6; context.strokeRect(centerX - 12, centerY - 27, 24, 48); context.strokeRect(centerX - 15, centerY - 33, 30, 7); context.beginPath(); context.moveTo(centerX - 9, centerY + 5); context.quadraticCurveTo(centerX, centerY + 9, centerX + 9, centerY + 5); context.stroke();
    context.globalAlpha = 0.34; context.fillStyle = paleBlue; context.fillRect(centerX - 10, centerY + 6, 20, 13); context.globalAlpha = 1; coral(centerX, centerY + 17, 0.45); bubbles(centerX + 22, centerY + 3); sparkle(centerX - 30, centerY - 19, 3);
  } else if (type === 1) {
    context.lineWidth = 3; context.beginPath(); context.arc(centerX - 8, centerY - 7, 18, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.arc(centerX - 8, centerY - 7, 13, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.moveTo(centerX + 5, centerY + 7); context.lineTo(centerX + 29, centerY + 30); context.stroke();
    context.fillStyle = paleBlue; context.globalAlpha = 0.36; context.beginPath(); context.arc(centerX - 8, centerY - 7, 12, 0, Math.PI * 2); context.fill(); context.globalAlpha = 1; [-13, -3, 6].forEach((x, index) => { context.fillStyle = index === 1 ? red : blue; context.fillRect(centerX + x, centerY - 11 + (index * 7), 4, 4); });
    context.strokeStyle = red; context.lineWidth = 1.6; context.beginPath(); context.moveTo(centerX + 21, centerY - 34); context.quadraticCurveTo(centerX + 38, centerY - 24, centerX + 39, centerY - 8); context.stroke(); context.strokeStyle = blue; sparkle(centerX - 34, centerY + 20, 2.5);
  } else if (type === 2) {
    context.lineWidth = 3.2; context.beginPath(); context.moveTo(centerX - 46, centerY + 19); context.bezierCurveTo(centerX - 27, centerY - 8, centerX - 7, centerY + 8, centerX + 4, centerY - 13); context.bezierCurveTo(centerX + 18, centerY - 33, centerX + 27, centerY - 16, centerX + 46, centerY - 25); context.stroke();
    context.lineWidth = 1.8; context.beginPath(); context.moveTo(centerX - 45, centerY + 27); context.bezierCurveTo(centerX - 24, centerY + 3, centerX - 3, centerY + 17, centerX + 12, centerY - 2); context.bezierCurveTo(centerX + 27, centerY - 19, centerX + 34, centerY - 5, centerX + 47, centerY - 13); context.stroke(); coral(centerX - 28, centerY + 37, 0.85); coral(centerX + 22, centerY + 37, 0.75);
    context.strokeStyle = red; context.lineWidth = 1.6; context.beginPath(); context.moveTo(centerX - 43, centerY + 32); context.bezierCurveTo(centerX - 17, centerY + 20, centerX + 14, centerY + 38, centerX + 43, centerY + 26); context.stroke(); context.strokeStyle = blue; sparkle(centerX + 31, centerY - 32, 2.6);
  } else if (type === 3) {
    context.lineWidth = 2.3; context.beginPath(); context.ellipse(centerX + 14, centerY + 4, 21, 11, 0, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.moveTo(centerX - 7, centerY + 4); context.lineTo(centerX - 24, centerY - 9); context.lineTo(centerX - 24, centerY + 17); context.closePath(); context.stroke(); context.beginPath(); context.arc(centerX + 21, centerY + 1, 1.5, 0, Math.PI * 2); context.fill();
    context.lineWidth = 2.8; context.beginPath(); context.arc(centerX - 27, centerY - 22, 5, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.moveTo(centerX - 27, centerY - 17); context.lineTo(centerX - 17, centerY + 4); context.lineTo(centerX - 3, centerY + 10); context.moveTo(centerX - 17, centerY - 2); context.lineTo(centerX - 34, centerY + 11); context.stroke(); bubbles(centerX - 31, centerY - 32); coral(centerX + 35, centerY + 38, 0.68); sparkle(centerX + 31, centerY - 29, 2.6);
  } else if (type === 4) {
    context.lineWidth = 2.5; context.beginPath(); context.moveTo(centerX - 27, centerY - 22); context.quadraticCurveTo(centerX, centerY - 28, centerX + 27, centerY - 22); context.lineTo(centerX + 18, centerY + 29); context.quadraticCurveTo(centerX, centerY + 35, centerX - 18, centerY + 29); context.closePath(); context.stroke();
    context.lineWidth = 1.25; for (let offset = -18; offset <= 18; offset += 9) { context.beginPath(); context.moveTo(centerX + offset, centerY - 23); context.lineTo(centerX + (offset * 0.68), centerY + 30); context.stroke(); context.beginPath(); context.moveTo(centerX - 22, centerY + offset); context.lineTo(centerX + 22, centerY + offset); context.stroke(); }
    context.strokeStyle = red; context.lineWidth = 2; context.beginPath(); context.arc(centerX + 3, centerY + 6, 7, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.moveTo(centerX - 26, centerY - 27); context.quadraticCurveTo(centerX - 36, centerY - 13, centerX - 28, centerY - 2); context.stroke(); context.strokeStyle = blue; coral(centerX + 33, centerY + 38, 0.58); sparkle(centerX + 29, centerY - 30, 2.7);
  } else {
    context.lineWidth = 2.5; context.beginPath(); context.arc(centerX - 8, centerY - 19, 6, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.moveTo(centerX - 8, centerY - 12); context.lineTo(centerX - 2, centerY + 14); context.lineTo(centerX + 18, centerY + 25); context.moveTo(centerX - 4, centerY - 1); context.lineTo(centerX - 28, centerY + 12); context.moveTo(centerX - 1, centerY + 13); context.lineTo(centerX - 17, centerY + 29); context.stroke();
    context.lineWidth = 1.8; context.strokeStyle = paleBlue; context.beginPath(); context.arc(centerX - 8, centerY - 19, 10, Math.PI * 1.1, Math.PI * 1.9); context.stroke(); context.strokeStyle = blue; bubbles(centerX - 9, centerY - 33); coral(centerX - 31, centerY + 38, 0.75); coral(centerX + 30, centerY + 38, 0.7);
    context.strokeStyle = red; context.lineWidth = 1.8; context.beginPath(); context.moveTo(centerX + 22, centerY - 29); context.quadraticCurveTo(centerX + 39, centerY - 14, centerX + 25, centerY + 1); context.stroke(); context.strokeStyle = blue; sparkle(centerX - 35, centerY - 7, 2.5);
  }
  context.restore();
  context.restore();
}

function loadEmbeddedBadge(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function downloadPassportPdf() {
  const originalBadgeSources = Array.isArray(window.PDF_BADGE_IMAGES) ? window.PDF_BADGE_IMAGES : [];
  const badgeOverrides = window.PDF_BADGE_OVERRIDES || {};
  const embeddedSources = [
    badgeOverrides.waterReader || originalBadgeSources[0],
    badgeOverrides.hiddenEvidence || originalBadgeSources[1],
    badgeOverrides.sandSteward || originalBadgeSources[2],
    badgeOverrides.patientObserver || originalBadgeSources[3],
    badgeOverrides.seabedKeeper || originalBadgeSources[4],
    badgeOverrides.turtlesPace || originalBadgeSources[5],
    badgeOverrides.responsibleDiver || originalBadgeSources[5]
  ];
  const pdfAchievementIds = [
    'water-reader',
    'hidden-evidence',
    'sand-steward',
    'patient-observer',
    'seabed-keeper',
    'turtles-pace',
    'responsible-diver'
  ];
  const earnedAchievementsForPdf = readEarnedAchievements();
  const badgeImages = await Promise.all(embeddedSources.map((source) => loadEmbeddedBadge(source)));
  const logoImage = window.PDF_LOGO_IMAGE ? await loadEmbeddedBadge(window.PDF_LOGO_IMAGE) : null;
  const pdfDate = getDateParts();
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const context = canvas.getContext('2d');
  const pledge = pledgeInput.value.trim() || 'No personal pledge recorded.';
  context.fillStyle = '#f4f1e8'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.save(); context.strokeStyle = '#0a4a88'; context.lineCap = 'square'; context.lineJoin = 'miter';
  context.lineWidth = 6; context.beginPath(); context.moveTo(62, 1692); context.lineTo(62, 62); context.lineTo(505, 62); context.moveTo(735, 62); context.lineTo(1178, 62); context.lineTo(1178, 1692); context.lineTo(735, 1692); context.moveTo(505, 1692); context.lineTo(62, 1692); context.stroke();
  context.globalAlpha = 0.72; context.lineWidth = 1.8; context.beginPath(); context.moveTo(84, 1670); context.lineTo(84, 84); context.lineTo(505, 84); context.moveTo(735, 84); context.lineTo(1156, 84); context.lineTo(1156, 1670); context.lineTo(735, 1670); context.moveTo(505, 1670); context.lineTo(84, 1670); context.stroke();
  const cornerOrnament = (x, y, flipX, flipY) => { context.save(); context.translate(x, y); context.scale(flipX, flipY); context.globalAlpha = 1; context.lineWidth = 3; context.beginPath(); context.moveTo(0, 58); context.lineTo(0, 22); context.quadraticCurveTo(0, 0, 22, 0); context.lineTo(58, 0); context.stroke(); context.restore(); };
  cornerOrnament(62, 62, 1, 1); cornerOrnament(1178, 62, -1, 1); cornerOrnament(62, 1692, 1, -1); cornerOrnament(1178, 1692, -1, -1);
  context.restore();
  if (logoImage) { context.drawImage(logoImage, 545, 36, 150, 50); context.drawImage(logoImage, 545, 1667, 150, 50); }
  context.fillStyle = '#0c2935'; context.font = '600 27px Arial, sans-serif'; context.fillText('BLUETRACE / FIELD EDITION', 112, 140);
  context.fillStyle = '#a93a32'; context.font = '600 20px Arial, sans-serif'; context.fillText('RESPONSIBLE DIVER', 112, 196);
  context.fillStyle = '#0c2935'; context.font = '600 76px Arial, sans-serif'; context.fillText('PASSPORT', 112, 278);
  context.strokeStyle = 'rgba(12,41,53,.42)'; context.lineWidth = 2; context.beginPath(); context.moveTo(112, 318); context.lineTo(1128, 318); context.stroke();
  [366, 620, 874].forEach((x) => { context.beginPath(); context.moveTo(x, 318); context.lineTo(x, 440); context.stroke(); }); context.beginPath(); context.moveTo(112, 440); context.lineTo(1128, 440); context.stroke();
  const recordFields = [['DEPTH REACHED', '16', 'METRES'], ['SAMPLES OBSERVED', '04', 'OF 04'], ['SKILLS PRACTISED', '04', 'OF 04'], ['DIVE DATE', pdfDate.day, pdfDate.monthYear]];
  recordFields.forEach(([label, value, unit], index) => { const x = 132 + (index * 254); context.fillStyle = '#0c2935'; context.font = '600 13px Arial, sans-serif'; context.fillText(label, x, 352); context.font = '500 34px Arial, sans-serif'; context.fillText(value, x, 404); context.fillStyle = '#526a70'; context.font = '500 12px Arial, sans-serif'; context.fillText(unit, x + 48, 404); });
  context.fillStyle = '#0c2935'; context.font = '600 21px Arial, sans-serif'; context.fillText('ACHIEVEMENTS RECORDED', 112, 482);
  const recordedAchievements = [
    ['WATER READER', 'Sample observed'], ['HIDDEN EVIDENCE', 'Pollution identified'], ['SAND STEWARD', 'Anchor set clear of reef'],
    ['PATIENT OBSERVER', 'Debris assessed with care'], ['SEABED KEEPER', 'Coral fragment left in place'],
    ["TURTLE'S PACE", 'Travelled alongside with space'], ['RESPONSIBLE DIVER', 'Journey complete']
  ];
  // Keep each row centred on the passport's 620px vertical axis.
  const achievementPositions = [[239, 570], [493, 570], [747, 570], [1001, 570], [366, 755], [620, 755], [874, 755]];
  recordedAchievements.forEach(([title, note], index) => {
    const [centerX, centerY] = achievementPositions[index];
    const earned = earnedAchievementsForPdf.has(pdfAchievementIds[index]);
    context.save();
    if (!earned) {
      context.globalAlpha = 0.34;
      context.filter = 'grayscale(1) saturate(0.05) contrast(0.78) brightness(1.13)';
    }
    if (badgeImages[index]) context.drawImage(badgeImages[index], centerX - 70, centerY - 70, 140, 140);
    else drawPdfBadge(context, centerX, centerY, index);
    context.restore();
    context.fillStyle = '#0c2935'; context.font = '600 17px Arial, sans-serif'; context.textAlign = 'center'; context.fillText(title, centerX, centerY + 94);
  });
  context.textAlign = 'left';
  context.fillStyle = '#a93a32'; context.font = '600 19px Arial, sans-serif'; context.fillText('PERSONAL OCEAN PLEDGE', 112, 910);
  context.fillStyle = '#0c2935'; context.font = '500 29px Arial, sans-serif'; const pledgeEnd = wrapCanvasText(context, pledge, 112, 964, 1000, 41);
  const detailTop = Math.min(pledgeEnd + 28, 1260);
  context.strokeStyle = 'rgba(12,41,53,.42)'; context.beginPath(); context.moveTo(112, detailTop); context.lineTo(1128, detailTop); context.stroke();
  context.fillStyle = '#0c2935'; context.font = '600 21px Arial, sans-serif'; context.fillText('FIELD NOTE', 112, detailTop + 58);
  context.font = '500 30px Arial, sans-serif'; wrapCanvasText(context, 'Observe with care. Leave enough space for life to choose its own path.', 112, detailTop + 112, 1000, 46);
  context.save(); context.textAlign = 'center'; context.fillStyle = '#0a4a88'; context.font = '500 64px Arial, Helvetica, sans-serif'; context.fillText('TAKE ONLY MEMORIES.', 600, 1366); context.fillText('LEAVE ONLY BUBBLES.', 600, 1440); context.restore();
  context.save();
  context.translate(840, 1462); context.rotate(-0.045); context.strokeStyle = '#0a4a88'; context.fillStyle = '#0a4a88'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.lineCap = 'round'; context.lineJoin = 'round'; context.globalAlpha = 0.78;
  context.lineWidth = 6; context.beginPath(); context.ellipse(0, 0, 198, 80, 0, 0, Math.PI * 2); context.stroke();
  context.lineWidth = 3; context.beginPath(); context.ellipse(0, 0, 178, 61, 0, 0, Math.PI * 2); context.stroke();
  context.lineWidth = 3.2; context.beginPath(); context.moveTo(-172, -24); context.lineTo(172, -24); context.moveTo(-172, 24); context.lineTo(172, 24); context.stroke();
  context.font = '700 19px Arial, Helvetica, sans-serif'; context.fillText('BLUETRACE', 0, -42);
  context.font = '700 27px Arial, Helvetica, sans-serif'; context.fillText(`— ${pdfDate.full} —`, 0, 9);
  context.font = '700 16px Arial, Helvetica, sans-serif'; context.fillText('RESPONSIBLE DIVER', 0, 50);
  context.globalAlpha = 0.35; for (let index = 0; index < 42; index += 1) { const angle = index * 2.18; const radiusX = 182 + (index % 4); const radiusY = 69 + (index % 3); context.fillRect(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 2 + (index % 2), 1.2); }
  context.restore(); context.textAlign = 'left';
  context.fillStyle = '#526a70'; context.font = '500 18px Arial, sans-serif'; context.fillText('EDUCATIONAL SIMULATION — THIS RECORD DOES NOT CERTIFY DIVING COMPETENCE', 112, 1608); context.fillText(`SAVED ${new Date().toLocaleDateString('en-GB').toUpperCase()}`, 112, 1644);
  const binary = atob(canvas.toDataURL('image/jpeg', 0.94).split(',')[1]);
  const jpegBytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) jpegBytes[index] = binary.charCodeAt(index);
  return buildOnePagePdf(jpegBytes, canvas.width, canvas.height);
}

downloadRecord.addEventListener('click', async () => {
  const record = {
    title: 'BlueTrace Responsible Diver Passport',
    type: 'Educational record — not a diving qualification',
    practices: ['Water Reader', 'Hidden Evidence', 'Quiet Buoyancy', 'Respectful Witness', 'Reef Keeper'],
    pledge: pledgeInput.value.trim() || 'No personal pledge recorded.',
    savedAt: new Date().toISOString()
  };
  let file;
  try {
    file = await downloadPassportPdf();
  } catch (error) {
    console.error('Passport download could not be prepared.', error);
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'bluetrace-dive-record.pdf';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});

const achievementDetails = {
  'water-reader': {
    title: 'Water Reader',
    copy: 'You learned to notice what a water sample can hold: small traces, living signals, and evidence that deserves a closer look.',
    how: 'Observe the sample carefully, record what you can identify, and recognise that clean-looking water can still carry invisible change.'
  },
  'hidden-evidence': {
    title: 'Hidden Evidence',
    copy: 'You traced the small fragments that can move through a marine environment long after they have been discarded.',
    how: 'Use the magnified sample to identify likely pollution, then connect the evidence to choices that prevent plastic entering the sea.'
  },
  'sand-steward': {
    title: 'Sand Steward',
    copy: 'You chose open sand for anchoring, leaving the reef clear of anchor weight, chain drag, and accidental contact.',
    how: 'Steer toward a clear sandy patch before setting anchor. Reef structure is living habitat, not stable ground for a vessel.'
  },
  'patient-observer': {
    title: 'Patient Observer',
    copy: 'You noticed movement inside marine debris and paused to understand the situation before taking action.',
    how: 'Observe first. A discarded object can shelter or entangle marine life, so identify what is happening before intervening.'
  },
  'seabed-keeper': {
    title: 'Seabed Keeper',
    copy: 'You left a coral fragment where it lay, respecting the small shelter and future reef material already present on the seabed.',
    how: 'Do not collect coral fragments as souvenirs. Leave reef material in place unless trained local restoration teams direct otherwise.'
  },
  'turtles-pace': {
    title: "Turtle's Pace",
    copy: 'You adjusted your route to travel alongside the turtle while keeping its natural path open and undisturbed.',
    how: 'Keep a respectful distance, travel parallel rather than chasing from behind, and let the turtle choose the length of the encounter.'
  },
  'responsible-diver': {
    title: 'Responsible Diver',
    copy: 'This completion mark records the habits you explored across the journey. It is a learning record, not a diving qualification.',
    how: 'Carry the four practices forward: read the evidence, reduce pollution, protect reef space, and allow marine life to choose its own path.'
  }
};

const achievementDialog = document.querySelector('#achievement-dialog');
const dialogTitle = document.querySelector('#achievement-dialog-title');
const dialogCopy = document.querySelector('#achievement-dialog-copy');
const dialogHow = document.querySelector('#achievement-dialog-how');
const dialogClose = document.querySelector('.achievement-dialog__close');
const achievementButtons = document.querySelectorAll('.achievement-button');
const earnedAchievementStorageKey = 'bluetrace-earned-achievements';
const practiceChoiceResultStorageKey = 'bluetrace-practice-choice-results';
const labCompletionStorageKey = 'bluetrace-lab-complete';
const actTwoAchievementIds = ['water-reader', 'hidden-evidence'];
const practiceAchievementByTask = {
  anchor: 'sand-steward',
  bag: 'patient-observer',
  coral: 'seabed-keeper',
  turtle: 'turtles-pace'
};
const achievementTaskByPractice = Object.fromEntries(
  Object.entries(practiceAchievementByTask).map(([taskId, achievementId]) => [achievementId, taskId])
);
const finalPassportAchievementId = 'responsible-diver';
let lastAchievementButton = null;
let achievementDialogCloseTimer = null;

function isLabComplete() {
  try {
    return localStorage.getItem(labCompletionStorageKey) === 'true';
  } catch {
    return false;
  }
}

function readEarnedAchievements() {
  try {
    const saved = JSON.parse(localStorage.getItem(earnedAchievementStorageKey) || '[]');
    const earnedAchievements = new Set(Array.isArray(saved) ? saved : []);
    if (isLabComplete()) {
      actTwoAchievementIds.forEach((achievementId) => earnedAchievements.add(achievementId));
    }
    return earnedAchievements;
  } catch {
    return isLabComplete() ? new Set(actTwoAchievementIds) : new Set();
  }
}

function readPracticeChoiceResults() {
  try {
    const saved = JSON.parse(localStorage.getItem(practiceChoiceResultStorageKey) || '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.keys(practiceAchievementByTask).reduce((results, taskId) => {
      if (saved[taskId] === 'correct' || saved[taskId] === 'wrong') results[taskId] = saved[taskId];
      return results;
    }, {});
  } catch {
    return {};
  }
}

function writeEarnedAchievements(earnedAchievements) {
  try {
    localStorage.setItem(earnedAchievementStorageKey, JSON.stringify([...earnedAchievements]));
  } catch {
    // The passport still updates for this visit if browser storage is unavailable.
  }
}

function renderAchievementState() {
  const earnedAchievements = readEarnedAchievements();
  const practiceChoiceResults = readPracticeChoiceResults();
  const allPracticeTasksCorrect = Object.keys(practiceAchievementByTask).every((taskId) => practiceChoiceResults[taskId] === 'correct');
  const labComplete = isLabComplete();
  achievementButtons.forEach((button) => {
    const achievementId = button.dataset.achievement;
    const achievement = button.closest('.achievement');
    const status = achievement?.querySelector('figcaption span');
    if (status && !status.dataset.defaultText) status.dataset.defaultText = status.textContent;
    const taskId = achievementTaskByPractice[achievementId];
    const practiceResult = taskId ? practiceChoiceResults[taskId] : null;
    const isActTwoAchievement = actTwoAchievementIds.includes(achievementId);
    const isFinalAchievement = achievementId === finalPassportAchievementId;
    const earned = (isActTwoAchievement && labComplete) || practiceResult === 'correct' || (isFinalAchievement && labComplete && allPracticeTasksCorrect && earnedAchievements.has(achievementId));
    const attempted = practiceResult === 'correct' || practiceResult === 'wrong';
    const visible = isActTwoAchievement || attempted || earned;

    achievement.hidden = !visible;
    achievement.classList.toggle('is-earned', earned);
    achievement.classList.toggle('is-attempted', attempted);
    achievement.classList.toggle('is-wrong', practiceResult === 'wrong');
    button.dataset.earned = String(earned);
    button.dataset.attempted = String(attempted);
    button.dataset.practiceResult = practiceResult || '';
    if (status) {
      if (practiceResult === 'wrong') {
        status.textContent = 'Attempted - try again';
      } else if (status.dataset.defaultText) {
        status.textContent = status.dataset.defaultText;
      }
    }
    const labelState = earned ? 'Earned' : attempted ? 'Attempted' : 'Locked';
    button.setAttribute('aria-label', `${labelState} achievement: ${achievementId.replaceAll('-', ' ')}`);
  });
}

function earnAchievement(id) {
  if (!achievementDetails[id]) return;
  const earnedAchievements = readEarnedAchievements();
  earnedAchievements.add(id);
  writeEarnedAchievements(earnedAchievements);
  renderAchievementState();
}

window.BlueTracePassport = window.BlueTracePassport || {};
window.BlueTracePassport.unlockAchievement = earnAchievement;
window.BlueTracePassport.renderAchievementState = renderAchievementState;
window.addEventListener('bluetrace:achievement-earned', (event) => earnAchievement(event.detail?.id));
window.addEventListener('bluetrace:achievement-state-changed', renderAchievementState);
window.addEventListener('storage', (event) => {
  if ([earnedAchievementStorageKey, practiceChoiceResultStorageKey, labCompletionStorageKey].includes(event.key)) renderAchievementState();
});
renderAchievementState();

function closeAchievementDialog() {
  if (achievementDialog.hidden) return;
  achievementDialog.classList.remove('is-open');
  window.clearTimeout(achievementDialogCloseTimer);
  achievementDialogCloseTimer = window.setTimeout(() => {
    achievementDialog.hidden = true;
    if (lastAchievementButton) lastAchievementButton.focus();
  }, 240);
}

achievementButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const detail = achievementDetails[button.dataset.achievement];
    if (!detail) return;
    const isAttemptedWrong = button.dataset.practiceResult === 'wrong' && button.dataset.earned !== 'true';
    lastAchievementButton = button;
    dialogTitle.textContent = detail.title;
    dialogCopy.textContent = isAttemptedWrong
      ? 'You tried this dive skill and recorded the result. Repeat the task with the lower-impact choice to turn this grey badge into a full patch.'
      : detail.copy;
    dialogHow.textContent = isAttemptedWrong
      ? detail.how
      : detail.how;
    window.clearTimeout(achievementDialogCloseTimer);
    achievementDialog.hidden = false;
    window.requestAnimationFrame(() => achievementDialog.classList.add('is-open'));
    dialogClose.focus();
  });
});

dialogClose.addEventListener('click', closeAchievementDialog);
achievementDialog.addEventListener('click', (event) => {
  if (event.target === achievementDialog) closeAchievementDialog();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!achievementDialog.hidden) closeAchievementDialog();
  if (!saveDialog.hidden) closeSaveDialog();
});
})();
