import { ACTORS, ProcessStep } from "../domain/ProcessStep";
import { ACTOR_LABELS, STEP_TYPE_LABELS } from "./labels";

export interface RendererCallbacks {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function renderSteps(
  container: HTMLElement,
  steps: ProcessStep[],
  callbacks: RendererCallbacks
): void {
  container.innerHTML = "";

  if (steps.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Aún no hay pasos. Agrega el primero desde el formulario.";
    container.appendChild(empty);
    return;
  }

  const orderById = new Map<string, number>();
  steps.forEach((step, index) => orderById.set(step.id, index + 1));

  for (const actor of ACTORS) {
    const actorSteps = steps.filter((s) => s.actor === actor);
    if (actorSteps.length === 0) continue;

    const group = document.createElement("section");
    group.className = "actor-group";

    const heading = document.createElement("h3");
    heading.textContent = `${ACTOR_LABELS[actor]} (${actorSteps.length})`;
    group.appendChild(heading);

    for (const step of actorSteps) {
      group.appendChild(buildStepCard(step, orderById.get(step.id)!, callbacks));
    }

    container.appendChild(group);
  }
}

function buildStepCard(
  step: ProcessStep,
  order: number,
  callbacks: RendererCallbacks
): HTMLElement {
  const card = document.createElement("div");
  card.className = `step-card ${step.type}`;
  card.dataset.stepId = step.id;

  const info = document.createElement("div");
  info.className = "step-info";

  const titleRow = document.createElement("div");
  titleRow.className = "step-title-row";

  const orderSpan = document.createElement("span");
  orderSpan.className = "step-order";
  orderSpan.textContent = `#${order}`;

  const title = document.createElement("span");
  title.className = "step-title";
  title.textContent = step.title;

  const typeTag = document.createElement("span");
  typeTag.className = `step-type-tag ${step.type}`;
  typeTag.textContent = STEP_TYPE_LABELS[step.type];

  titleRow.append(orderSpan, title, typeTag);

  const description = document.createElement("p");
  description.className = "step-description";
  description.textContent = step.description || "Sin descripción disponible.";

  info.append(titleRow, description);

  const actions = document.createElement("div");
  actions.className = "step-actions";

  const upBtn = makeButton("Subir", () => callbacks.onMoveUp(step.id));
  const downBtn = makeButton("Bajar", () => callbacks.onMoveDown(step.id));
  const editBtn = makeButton("Editar", () => callbacks.onEdit(step.id));
  const deleteBtn = makeButton("Eliminar", () => callbacks.onDelete(step.id));
  deleteBtn.classList.add("delete-btn");

  actions.append(upBtn, downBtn, editBtn, deleteBtn);

  card.append(info, actions);
  return card;
}

function makeButton(label: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}
