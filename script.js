"use strict";

const subjects = [
  { id: "portugues", name: "Português", total: 20, weight: 5 },
  { id: "matematica", name: "Matemática", total: 20, weight: 5 },
  { id: "historia", name: "História", total: 12, weight: 100 / 12 },
  { id: "geografia", name: "Geografia", total: 12, weight: 100 / 12 },
  { id: "ingles", name: "Inglês", total: 12, weight: 100 / 12 },
  { id: "fisica", name: "Física", total: 12, weight: 100 / 12 },
  { id: "quimica", name: "Química", total: 12, weight: 100 / 12 }
];

const state = {
  page: 1,
  essayDigits: 0
};

const subjectGrid = document.querySelector("#subject-grid");
const pageContent = document.querySelector(".page-content");
const essayCard = document.querySelector("#essay-card");
const essayInput = document.querySelector("#essay");
const essayStatus = document.querySelector("#essay-status");
const resultCard = document.querySelector("#result-card");
const pageButton = document.querySelector("#page-button");
const pageIndicator = document.querySelector("#page-indicator");

function createSubjectFields() {
  subjectGrid.innerHTML = subjects.map((subject, index) => `
    <section class="subject-card" data-page="${index < 6 ? 1 : 2}">
      <h3 id="${subject.id}-title">${subject.name}</h3>
      <div class="subject-entry">
        <label class="sr-only" for="${subject.id}">Acertos em ${subject.name}</label>
        <input id="${subject.id}" type="text" inputmode="numeric" autocomplete="off"
          maxlength="2" data-subject="${index}" aria-labelledby="${subject.id}-title"
          aria-describedby="${subject.id}-total">
        <span class="subject-total" id="${subject.id}-total">/ ${subject.total} questões</span>
      </div>
    </section>
  `).join("");
}

function formatScore(value) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function getSubjectValues() {
  return subjects.map((subject) => {
    const input = document.getElementById(subject.id);
    return Number.parseInt(input.value, 10) || 0;
  });
}

function getEssayValue() {
  return Number.parseInt(essayInput.value, 10) || 0;
}

function updateEssayStatus() {
  essayStatus.classList.remove("is-pass", "is-fail");

  if (state.essayDigits === 0) {
    essayStatus.textContent = "";
  } else if (getEssayValue() >= 50000) {
    essayStatus.textContent = "APTO.";
    essayStatus.classList.add("is-pass");
  } else {
    essayStatus.textContent = "INAPTO.";
    essayStatus.classList.add("is-fail");
  }
}

function updateResult() {
  const values = getSubjectValues();
  const correctAnswers = values.reduce((sum, value) => sum + value, 0);
  const weightedScores = values.map((value, index) => value * subjects[index].weight);
  let weightedSum =
    weightedScores[0] * 2 +
    weightedScores[1] * 2 +
    weightedScores[2] +
    weightedScores[3] +
    weightedScores[4] * 1.5 +
    weightedScores[5] * 1.5 +
    weightedScores[6];
  let divisor = 10;

  if (state.essayDigits > 0 && getEssayValue() > 0) {
    weightedSum += getEssayValue() / 1000;
    divisor = 11;
  }

  document.querySelector("#total-correct").textContent = `Acertos: ${correctAnswers} / 100`;
  document.querySelector("#average").textContent = `Média ponderada: ${formatScore(weightedSum / divisor)}`;
  document.querySelector("#score-grid").innerHTML = subjects.map((subject, index) =>
    `<span>${subject.name}: ${formatScore(weightedScores[index])}</span>`
  ).join("");
}

function setPage(page) {
  state.page = page;
  subjectGrid.querySelectorAll(".subject-card").forEach((card) => {
    card.hidden = Number(card.dataset.page) !== page;
  });
  pageContent.classList.toggle("is-results", page === 2);
  essayCard.hidden = page !== 2;
  resultCard.hidden = page !== 2;
  pageButton.textContent = page === 1 ? "PRÓXIMA PÁGINA" : "VOLTAR";
  pageIndicator.textContent = `Página ${page} de 2`;
  document.querySelector("#page-title").textContent = "Acertos por questões e média aritmética.";

  if (page === 1) {
    document.querySelector("#portugues").focus();
  } else {
    document.querySelector("#quimica").focus();
  }
}

function focusNextField(currentInput) {
  const fieldIds = state.page === 1
    ? subjects.slice(0, 6).map((subject) => subject.id)
    : ["quimica", "essay"];
  const fields = fieldIds.map((id) => document.getElementById(id));
  const currentIndex = fields.indexOf(currentInput);
  const nextField = fields[currentIndex + 1];

  if (nextField) {
    nextField.focus();
  } else {
    currentInput.blur();
  }
}

createSubjectFields();
setPage(1);

document.querySelectorAll("[data-subject]").forEach((input) => {
  const subject = subjects[Number(input.dataset.subject)];

  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "").slice(0, 2);
    const value = Math.min(Number.parseInt(digits, 10) || 0, subject.total);
    input.value = digits === "" ? "" : String(value);
    updateResult();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      focusNextField(input);
    }
  });
});

essayInput.addEventListener("input", () => {
  const digits = essayInput.value.replace(/\D/g, "").slice(0, 6);
  const value = Math.min(Number.parseInt(digits, 10) || 0, 100000);
  essayInput.value = digits === "" ? "" : String(value);
  state.essayDigits = essayInput.value.length;
  updateEssayStatus();
  updateResult();
});

essayInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    essayInput.blur();
  }
});

pageButton.addEventListener("click", () => {
  setPage(state.page === 1 ? 2 : 1);
});

updateEssayStatus();
updateResult();
