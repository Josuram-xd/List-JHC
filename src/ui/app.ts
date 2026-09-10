import { OrderProcessList } from "../domain/OrderProcessList";
import { ACTORS, ProcessStep, STEP_TYPES } from "../domain/ProcessStep";
import { sampleSteps } from "../data/sampleSteps";
import { renderSteps } from "./renderer";
import { ACTOR_LABELS, STEP_TYPE_LABELS } from "./labels";

const processList = new OrderProcessList();
processList.loadSteps(sampleSteps);

let editingId: string | null = null;

function generateId(): string {
  return `step-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Element not found: ${selector}`);
  return el;
}

export function initApp(): void {
  const form = qs<HTMLFormElement>("#step-form");
  const idField = qs<HTMLInputElement>("#step-id");
  const titleField = qs<HTMLInputElement>("#title");
  const actorField = qs<HTMLSelectElement>("#actor");
  const typeField = qs<HTMLSelectElement>("#type");
  const descriptionField = qs<HTMLTextAreaElement>("#description");
  const referenceField = qs<HTMLSelectElement>("#reference-step");
  const positionModeGroup = qs<HTMLElement>("#position-mode-group");
  const submitBtn = qs<HTMLButtonElement>("#submit-btn");
  const cancelBtn = qs<HTMLButtonElement>("#cancel-edit-btn");
  const formTitle = qs<HTMLElement>("#form-title");
  const container = qs<HTMLElement>("#steps-container");
  const stepCount = qs<HTMLElement>("#step-count");

  populateSelect(actorField, ACTORS, ACTOR_LABELS);
  populateSelect(typeField, STEP_TYPES, STEP_TYPE_LABELS);

  function refreshReferenceOptions(): void {
    const currentValue = referenceField.value;
    referenceField.innerHTML = "";

    const endOption = document.createElement("option");
    endOption.value = "";
    endOption.textContent = "— Al final de la lista —";
    referenceField.appendChild(endOption);

    for (const step of processList.getAllSteps()) {
      const option = document.createElement("option");
      option.value = step.id;
      option.textContent = `${step.title} (${ACTOR_LABELS[step.actor]})`;
      referenceField.appendChild(option);
    }

    if ([...referenceField.options].some((o) => o.value === currentValue)) {
      referenceField.value = currentValue;
    }
  }

  function refresh(): void {
    const steps = processList.getAllSteps();
    stepCount.textContent = `${steps.length} paso${steps.length === 1 ? "" : "s"}`;
    renderSteps(container, steps, {
      onEdit: startEdit,
      onDelete: handleDelete,
      onMoveUp: (id) => {
        processList.moveStepUp(id);
        refresh();
      },
      onMoveDown: (id) => {
        processList.moveStepDown(id);
        refresh();
      },
    });
    refreshReferenceOptions();
  }

  function resetForm(): void {
    editingId = null;
    form.reset();
    idField.value = "";
    formTitle.textContent = "Nuevo paso";
    submitBtn.textContent = "Agregar paso";
    cancelBtn.hidden = true;
    positionModeGroup.hidden = false;
  }

  function startEdit(id: string): void {
    const step = processList.getStepById(id);
    if (!step) return;

    editingId = id;
    idField.value = step.id;
    titleField.value = step.title;
    actorField.value = step.actor;
    typeField.value = step.type;
    descriptionField.value = step.description;

    formTitle.textContent = "Editar paso";
    submitBtn.textContent = "Guardar cambios";
    cancelBtn.hidden = false;
    positionModeGroup.hidden = true;

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string): void {
    const step = processList.getStepById(id);
    if (!step) return;
    const confirmed = window.confirm(`¿Eliminar el paso "${step.title}"?`);
    if (!confirmed) return;

    processList.deleteStep(id);
    if (editingId === id) resetForm();
    refresh();
  }

  cancelBtn.addEventListener("click", resetForm);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleField.value.trim();
    if (!title) return;

    if (editingId) {
      processList.editStep(editingId, {
        title,
        actor: actorField.value as ProcessStep["actor"],
        type: typeField.value as ProcessStep["type"],
        description: descriptionField.value.trim(),
      });
    } else {
      const newStep: ProcessStep = {
        id: generateId(),
        title,
        actor: actorField.value as ProcessStep["actor"],
        type: typeField.value as ProcessStep["type"],
        description: descriptionField.value.trim(),
      };

      const referenceId = referenceField.value;
      const mode = (form.querySelector<HTMLInputElement>('input[name="position-mode"]:checked'))?.value;

      if (!referenceId) {
        processList.addStepAtEnd(newStep);
      } else if (mode === "before") {
        processList.addStepBefore(referenceId, newStep);
      } else {
        processList.addStepAfter(referenceId, newStep);
      }
    }

    resetForm();
    refresh();
  });

  refresh();
}

function populateSelect<T extends string>(
  select: HTMLSelectElement,
  values: readonly T[],
  labels: Record<T, string>
): void {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labels[value];
    select.appendChild(option);
  }
}
