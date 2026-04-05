// ELEMENT REFERENCES
const form = document.getElementById("worksheet-form");
const sceneList = document.getElementById("scene-list");
const sceneTemplate = document.getElementById("scene-row-template");
const addSceneButton = document.getElementById("add-scene");
const guidanceToggleButton = document.getElementById("guidance-toggle");
const printButton = document.getElementById("print-button");
const downloadButton = document.getElementById("download-button");
const clearButton = document.getElementById("clear-button");
const printSummary = document.getElementById("print-summary");
const tonePills = Array.from(document.querySelectorAll(".tone-pill"));
const formatRadios = Array.from(document.querySelectorAll('input[name="formatChoice"]'));
const formatReasonWrapper = document.getElementById("format-reason-wrapper");
const formatReasonInput = document.getElementById("format-reason");

const minimumSceneRows = 2;

// COPY STRINGS
const worksheetTitle = "SHORT FILM – WEEK 1: STORY & INTENT";
const guidanceToggleLabels = {
  show: "Show Guidance",
  hide: "Hide Guidance"
};

const exportHeadings = {
  coreIdea: "CORE IDEA",
  storyMatters: "WHY THIS STORY MATTERS",
  audience: "INTENDED AUDIENCE",
  tone: "TONE",
  pointOfView: "POINT OF VIEW",
  beginning: "BEGINNING",
  middle: "MIDDLE",
  end: "END",
  keyMoments: "KEY MOMENTS / SCENES",
  visualIntentions: "VISUAL INTENTIONS",
  soundIntentions: "SOUND INTENTIONS",
  formatChoice: "FORMAT CHOICE",
  unsureAbout: "WHAT I'M STILL UNSURE ABOUT",
  feedbackWant: "WHAT FEEDBACK I WANT"
};

const sectionHelpers = {
  coreIdea: "Describe your film idea in one paragraph.",
  storyMatters: "Why this idea? Why do you think it matters?",
  audience: "What are your target audience characteristics? Avoid \"everyone.\"",
  tone: "Select your story tone from below.",
  pointOfView: "Choose how the audience experiences the story.",
  beginning: "What happens in the beginning? Think about giving your audience context, introducing characters, and the problem or challenge.",
  middle: "What happens in the middle? Think about what develops, changes, or becomes more complicated.",
  end: "What happens at the end? Think about how the story resolves, or what final feeling or image you want to leave with the audience.",
  keyMoments: "List specific scenes, moments, or shots you already know you want to include.",
  visualIntentions: "Describe the visual style. Think about lighting, color, camera movement, framing, and references.",
  soundIntentions: "Describe the sound. Think about music, ambient sound, silence, voiceover, or other audio choices.",
  formatChoice: "Choose your format and think about how framing affects the meaning of the film.",
  unsureAbout: "What are you still unsure about? What feels unresolved or unclear right now?",
  feedbackWant: "What kind of feedback would be most useful to you at this stage?"
};

// FEATURE: Scene Rows
function getSceneRows() {
  return Array.from(sceneList.querySelectorAll(".scene-row"));
}

function updateSceneLabels() {
  getSceneRows().forEach((row, index) => {
    const label = row.querySelector(".scene-label");
    const input = row.querySelector(".scene-input");
    const removeButton = row.querySelector(".remove-scene-button");
    const sceneNumber = index + 1;

    input.id = `scene-${sceneNumber}`;
    input.name = `scene-${sceneNumber}`;
    label.htmlFor = input.id;
    label.textContent = `Scene ${sceneNumber}`;
    removeButton.setAttribute("aria-label", `Remove scene ${sceneNumber}`);
    removeButton.disabled = getSceneRows().length <= minimumSceneRows;
  });
}

function createSceneRow(value = "") {
  const fragment = sceneTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".scene-row");
  const input = row.querySelector(".scene-input");
  const removeButton = row.querySelector(".remove-scene-button");

  input.value = value;

  removeButton.addEventListener("click", () => {
    if (getSceneRows().length > minimumSceneRows) {
      row.remove();
      updateSceneLabels();
    }
  });

  sceneList.appendChild(fragment);
  updateSceneLabels();
}

function resetSceneRows() {
  sceneList.innerHTML = "";
  createSceneRow();
  createSceneRow();
}

addSceneButton.addEventListener("click", () => {
  createSceneRow();
});

// FEATURE: Tone Pills
function getSelectedTones() {
  return tonePills
    .filter((pill) => pill.classList.contains("is-selected"))
    .map((pill) => pill.dataset.tone);
}

function clearTonePills() {
  tonePills.forEach((pill) => {
    pill.classList.remove("is-selected");
    pill.setAttribute("aria-pressed", "false");
  });
}

tonePills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const isSelected = pill.classList.toggle("is-selected");
    pill.setAttribute("aria-pressed", String(isSelected));
  });
});

// FEATURE: Format Choice Explanation Toggle
function updateFormatReasonVisibility() {
  const selectedFormat = document.querySelector('input[name="formatChoice"]:checked');
  const hasSelection = Boolean(selectedFormat);

  formatReasonWrapper.hidden = !hasSelection;

  if (!hasSelection) {
    formatReasonInput.value = "";
  }
}

formatRadios.forEach((radio) => {
  radio.addEventListener("change", updateFormatReasonVisibility);
});

// FEATURE: Toggle Guidance
function updateGuidanceButtonLabel() {
  const guidanceHidden = document.body.classList.contains("guidance-hidden");
  guidanceToggleButton.textContent = guidanceHidden ? guidanceToggleLabels.show : guidanceToggleLabels.hide;
}

guidanceToggleButton.addEventListener("click", () => {
  document.body.classList.toggle("guidance-hidden");
  updateGuidanceButtonLabel();
});

// FEATURE: Print / Save as PDF
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function formatPrintValue(value) {
  const trimmed = value.trim();
  return trimmed ? escapeHtml(trimmed) : "<em>[Not provided]</em>";
}

function buildPrintSummary() {
  const formatChoice = document.querySelector('input[name="formatChoice"]:checked')?.value || "";
  const formatReason = formatReasonInput.value.trim();
  const scenes = getSceneRows()
    .map((row) => row.querySelector(".scene-input").value.trim())
    .filter(Boolean);
  const toneValue = escapeHtml(formatToneLine());
  const formatValue = formatChoice
    ? `${escapeHtml(formatChoice)}${formatReason ? `<br><br><strong>Why did you choose this format?</strong><br>${formatPrintValue(formatReason)}` : ""}`
    : "<em>[Not provided]</em>";

  printSummary.innerHTML = `
    <div class="print-summary-section">
      <h2>${exportHeadings.coreIdea}</h2>
      <p class="print-summary-helper">${sectionHelpers.coreIdea}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("core-idea").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.storyMatters}</h2>
      <p class="print-summary-helper">${sectionHelpers.storyMatters}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("story-matters").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.audience}</h2>
      <p class="print-summary-helper">${sectionHelpers.audience}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("audience").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.tone}</h2>
      <p class="print-summary-helper">${sectionHelpers.tone}</p>
      <p class="print-summary-value">${toneValue || "<em>[Not provided]</em>"}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.pointOfView}</h2>
      <p class="print-summary-helper">${sectionHelpers.pointOfView}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("point-of-view").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.beginning}</h2>
      <p class="print-summary-helper">${sectionHelpers.beginning}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("beginning").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.middle}</h2>
      <p class="print-summary-helper">${sectionHelpers.middle}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("middle").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.end}</h2>
      <p class="print-summary-helper">${sectionHelpers.end}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("end").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.keyMoments}</h2>
      <p class="print-summary-helper">${sectionHelpers.keyMoments}</p>
      ${scenes.length > 0 ? `<ul class="print-summary-list">${scenes.map((scene) => `<li>${escapeHtml(scene)}</li>`).join("")}</ul>` : `<p class="print-summary-value"><em>[Not provided]</em></p>`}
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.visualIntentions}</h2>
      <p class="print-summary-helper">${sectionHelpers.visualIntentions}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("visual-intentions").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.soundIntentions}</h2>
      <p class="print-summary-helper">${sectionHelpers.soundIntentions}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("sound-intentions").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.formatChoice}</h2>
      <p class="print-summary-helper">${sectionHelpers.formatChoice}</p>
      <p class="print-summary-value">${formatValue}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.unsureAbout}</h2>
      <p class="print-summary-helper">${sectionHelpers.unsureAbout}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("unsure-about").value)}</p>
    </div>
    <div class="print-summary-section">
      <h2>${exportHeadings.feedbackWant}</h2>
      <p class="print-summary-helper">${sectionHelpers.feedbackWant}</p>
      <p class="print-summary-value">${formatPrintValue(document.getElementById("feedback-want").value)}</p>
    </div>
  `;
}

printButton.addEventListener("click", () => {
  buildPrintSummary();
  window.print();
});

window.addEventListener("beforeprint", buildPrintSummary);

// FEATURE: Download as TXT
function formatMultilineValue(value) {
  const trimmed = value.trim();
  return trimmed || "[Not provided]";
}

function formatSceneLines() {
  const scenes = getSceneRows()
    .map((row) => row.querySelector(".scene-input").value.trim())
    .filter(Boolean);

  if (scenes.length === 0) {
    return "- [Not provided]";
  }

  return scenes.map((scene) => `- ${scene}`).join("\n");
}

function formatToneLine() {
  const selected = getSelectedTones();
  const selectedText = selected.length > 0 ? selected.join(", ") : "[None]";
  const customText = document.getElementById("tone-custom").value.trim() || "[None]";
  return `Selected: ${selectedText}, Custom: ${customText}`;
}

function buildTextExport() {
  const generatedDate = new Date().toLocaleString();
  const formatChoice = document.querySelector('input[name="formatChoice"]:checked')?.value || "[Not provided]";
  const formatReason = formatReasonInput.value.trim();

  return [
    worksheetTitle,
    `Generated: ${generatedDate}`,
    "=====================================",
    "",
    exportHeadings.coreIdea,
    formatMultilineValue(document.getElementById("core-idea").value),
    "",
    exportHeadings.storyMatters,
    formatMultilineValue(document.getElementById("story-matters").value),
    "",
    exportHeadings.audience,
    formatMultilineValue(document.getElementById("audience").value),
    "",
    exportHeadings.tone,
    formatToneLine(),
    "",
    exportHeadings.pointOfView,
    formatMultilineValue(document.getElementById("point-of-view").value),
    "",
    exportHeadings.beginning,
    formatMultilineValue(document.getElementById("beginning").value),
    "",
    exportHeadings.middle,
    formatMultilineValue(document.getElementById("middle").value),
    "",
    exportHeadings.end,
    formatMultilineValue(document.getElementById("end").value),
    "",
    exportHeadings.keyMoments,
    formatSceneLines(),
    "",
    exportHeadings.visualIntentions,
    formatMultilineValue(document.getElementById("visual-intentions").value),
    "",
    exportHeadings.soundIntentions,
    formatMultilineValue(document.getElementById("sound-intentions").value),
    "",
    exportHeadings.formatChoice,
    `${formatChoice}${formatReason ? `\nWhy did you choose this format?\n${formatReason}` : ""}`,
    "",
    exportHeadings.unsureAbout,
    formatMultilineValue(document.getElementById("unsure-about").value),
    "",
    exportHeadings.feedbackWant,
    formatMultilineValue(document.getElementById("feedback-want").value)
  ].join("\n");
}

downloadButton.addEventListener("click", () => {
  const content = buildTextExport();
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "short-film-week-1-story-intent.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

// FEATURE: Clear Form
clearButton.addEventListener("click", () => {
  const confirmed = window.confirm("Clear the worksheet and start over?");

  if (!confirmed) {
    return;
  }

  form.reset();
  clearTonePills();
  resetSceneRows();
  updateFormatReasonVisibility();
});

// INITIALIZATION
resetSceneRows();
updateFormatReasonVisibility();
updateGuidanceButtonLabel();
