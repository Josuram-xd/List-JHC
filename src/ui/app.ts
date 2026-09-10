import { OrderProcessList } from "../domain/OrderProcessList";
import { OrderBoard } from "../domain/OrderBoard";
import { ACTORS, Actor, ProcessStep, STEP_TYPES } from "../domain/ProcessStep";
import { sampleSteps } from "../data/sampleSteps";
import { renderSteps } from "./renderer";
import { renderActorBoard, renderSummaryBoard } from "./board";
import { ACTOR_LABELS, STEP_TYPE_LABELS } from "./labels";

type RoleTab = "summary" | "admin" | Actor;

const processList = new OrderProcessList();
processList.loadSteps(sampleSteps);

const orderBoard = new OrderBoard();
let orderCounter = 0;

function nextOrderCode(): string {
  orderCounter += 1;
  return `PED-${String(orderCounter).padStart(3, "0")}`;
}

// Un par de pedidos de ejemplo ya en curso, para que el tablero de cada
// rol tenga algo que mostrar sin esperar a que se cree uno manualmente.
orderBoard.createOrder(nextOrderCode(), "step-01");
orderBoard.createOrder(nextOrderCode(), "step-06");

let editingId: string | null = null;
let activeRole: RoleTab = "summary";

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

  const roleNav = qs<HTMLElement>("#role-nav");
  const boardPanel = qs<HTMLElement>("#board-panel");
  const adminPanel = qs<HTMLElement>("#admin-panel");
  const boardTitle = qs<HTMLElement>("#board-title");
  const boardSubtitle = qs<HTMLElement>("#board-subtitle");
  const ordersContainer = qs<HTMLElement>("#orders-container");
  const newOrderBtn = qs<HTMLButtonElement>("#new-order-btn");
  const toastContainer = qs<HTMLElement>("#toast-container");

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

  function showToast(message: string, variant: "info" | "reject" = "info"): void {
    const toast = document.createElement("div");
    toast.className = `toast ${variant}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function refreshNavBadges(): void {
    for (const actor of ACTORS) {
      const btn = roleNav.querySelector<HTMLButtonElement>(`.role-tab[data-role="${actor}"]`);
      if (!btn) continue;
      btn.querySelector(".role-tab-badge")?.remove();

      const count = orderBoard.getOrdersForActor(processList, actor).length;
      if (count === 0) continue;

      const badge = document.createElement("span");
      badge.className = "role-tab-badge";
      badge.textContent = String(count);
      btn.appendChild(badge);
    }
  }

  function refreshBoard(): void {
    refreshNavBadges();
    if (activeRole === "admin") return;

    if (activeRole === "summary") {
      boardTitle.textContent = "Resumen de pedidos";
      boardSubtitle.textContent = "Estado y ubicación actual de cada pedido dentro del proceso.";
      renderSummaryBoard(ordersContainer, orderBoard.getAllOrders(), processList);
      return;
    }

    const actor = activeRole;
    boardTitle.textContent = ACTOR_LABELS[actor];
    boardSubtitle.textContent = "Pedidos que necesitan una acción de este rol en este momento.";
    renderActorBoard(ordersContainer, actor, orderBoard.getOrdersForActor(processList, actor), processList, {
      onAdvance: (orderId, nextStepId) => {
        const order = orderBoard.getOrderById(orderId);
        const code = order?.code ?? "El pedido";
        orderBoard.advanceOrder(orderId, nextStepId);

        const nextStep = nextStepId ? processList.getStepById(nextStepId) : null;
        showToast(
          nextStep
            ? `${code} pasó a ${ACTOR_LABELS[nextStep.actor]}: “${nextStep.title}”`
            : `${code} se completó`
        );
        refreshBoard();
      },
      onReject: (orderId) => {
        const order = orderBoard.getOrderById(orderId);
        const code = order?.code ?? "El pedido";
        orderBoard.rejectOrder(orderId);
        showToast(`${code} fue rechazado`, "reject");
        refreshBoard();
      },
    });
  }

  function refreshAdmin(): void {
    const steps = processList.getAllSteps();
    stepCount.textContent = `${steps.length} paso${steps.length === 1 ? "" : "s"}`;
    renderSteps(container, steps, {
      onEdit: startEdit,
      onDelete: handleDelete,
      onMoveUp: (id) => {
        processList.moveStepUp(id);
        refreshAdmin();
      },
      onMoveDown: (id) => {
        processList.moveStepDown(id);
        refreshAdmin();
      },
    });
    refreshReferenceOptions();
  }

  function refresh(): void {
    refreshAdmin();
    refreshBoard();
  }

  function setActiveRole(role: RoleTab): void {
    activeRole = role;

    for (const btn of roleNav.querySelectorAll<HTMLButtonElement>(".role-tab")) {
      btn.classList.toggle("active", btn.dataset.role === role);
    }

    const isAdmin = role === "admin";
    boardPanel.hidden = isAdmin;
    adminPanel.hidden = !isAdmin;
    newOrderBtn.hidden = isAdmin;

    if (!isAdmin) refreshBoard();
  }

  roleNav.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(".role-tab");
    if (!target || !target.dataset.role) return;
    setActiveRole(target.dataset.role as RoleTab);
  });

  newOrderBtn.addEventListener("click", () => {
    const firstStep = processList.getAllSteps()[0];
    if (!firstStep) {
      window.alert("Primero define al menos un paso del proceso en “Definir proceso”.");
      return;
    }
    orderBoard.createOrder(nextOrderCode(), firstStep.id);
    refreshBoard();
  });

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

  setActiveRole("summary");
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
