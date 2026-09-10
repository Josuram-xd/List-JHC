import { Order } from "../domain/Order";
import { OrderProcessList } from "../domain/OrderProcessList";
import { Actor, ProcessStep } from "../domain/ProcessStep";
import { ACTOR_LABELS, ORDER_STATUS_LABELS, STEP_TYPE_LABELS } from "./labels";

export interface BoardCallbacks {
  onAdvance: (orderId: string, nextStepId: string | null) => void;
  onReject: (orderId: string) => void;
}

export function renderSummaryBoard(
  container: HTMLElement,
  orders: Order[],
  processList: OrderProcessList
): void {
  container.innerHTML = "";

  if (orders.length === 0) {
    container.appendChild(emptyMessage("Aún no hay pedidos. Crea uno con “Nuevo pedido”."));
    return;
  }

  const table = document.createElement("div");
  table.className = "order-summary-table";

  for (const order of orders) {
    const step = order.currentStepId ? processList.getStepById(order.currentStepId) : null;
    table.appendChild(buildSummaryRow(order, step));
  }

  container.appendChild(table);
}

function buildSummaryRow(order: Order, step: ProcessStep | null): HTMLElement {
  const row = document.createElement("div");
  row.className = "order-row";

  const code = document.createElement("span");
  code.className = "order-code";
  code.textContent = order.code;

  const location = document.createElement("span");
  location.className = "order-location";
  location.textContent = step
    ? `${ACTOR_LABELS[step.actor]} · ${step.title}`
    : order.status === "rejected"
    ? "Rechazado antes de completarse"
    : "Proceso completado";

  const status = document.createElement("span");
  status.className = `order-status-badge ${order.status}`;
  status.textContent = ORDER_STATUS_LABELS[order.status];

  row.append(code, location, status);
  return row;
}

export function renderActorBoard(
  container: HTMLElement,
  actor: Actor,
  orders: Order[],
  processList: OrderProcessList,
  callbacks: BoardCallbacks
): void {
  container.innerHTML = "";

  if (orders.length === 0) {
    container.appendChild(
      emptyMessage(`No hay pedidos esperando acción de ${ACTOR_LABELS[actor]} en este momento.`)
    );
    return;
  }

  for (const order of orders) {
    const step = order.currentStepId ? processList.getStepById(order.currentStepId) : null;
    if (!step) continue;
    container.appendChild(buildActionCard(order, step, processList, callbacks));
  }
}

function destinationText(nextStepId: string | null, processList: OrderProcessList): string {
  if (!nextStepId) return "→ Se completa el pedido";
  const step = processList.getStepById(nextStepId);
  if (!step) return "→ Se completa el pedido";
  return `→ pasa a ${ACTOR_LABELS[step.actor]}: “${step.title}”`;
}

function buildActionCard(
  order: Order,
  step: ProcessStep,
  processList: OrderProcessList,
  callbacks: BoardCallbacks
): HTMLElement {
  const card = document.createElement("div");
  card.className = `order-card ${step.type}`;

  const header = document.createElement("div");
  header.className = "order-card-header";

  const code = document.createElement("span");
  code.className = "order-code";
  code.textContent = order.code;

  const typeTag = document.createElement("span");
  typeTag.className = `step-type-tag ${step.type}`;
  typeTag.textContent = STEP_TYPE_LABELS[step.type];

  header.append(code, typeTag);

  const title = document.createElement("h4");
  title.className = "order-step-title";
  title.textContent = step.title;

  const description = document.createElement("p");
  description.className = "order-step-description";
  description.textContent = step.description || "Sin descripción disponible.";

  const actions = document.createElement("div");
  actions.className = "order-card-actions";

  if (step.type === "task") {
    const nextId = processList.getNaturalNextId(step.id);
    actions.appendChild(
      buildActionOption("advance-btn", "Completar y continuar", destinationText(nextId, processList), () => {
        callbacks.onAdvance(order.id, nextId);
      })
    );
  } else {
    const yesNextId = processList.getNaturalNextId(step.id);
    actions.appendChild(
      buildActionOption("advance-btn yes-btn", step.yesLabel || "Sí", destinationText(yesNextId, processList), () => {
        callbacks.onAdvance(order.id, yesNextId);
      })
    );

    const noHint = step.noNextId
      ? destinationText(step.noNextId, processList)
      : "→ Se rechaza el pedido";
    actions.appendChild(
      buildActionOption("advance-btn no-btn", step.noLabel || "No", noHint, () => {
        if (step.noNextId) callbacks.onAdvance(order.id, step.noNextId);
        else callbacks.onReject(order.id);
      })
    );
  }

  card.append(header, title, description, actions);
  return card;
}

function buildActionOption(className: string, label: string, hint: string, onClick: () => void): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "order-action";

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = className;
  btn.textContent = label;
  btn.addEventListener("click", onClick);

  const hintEl = document.createElement("span");
  hintEl.className = "order-action-hint";
  hintEl.textContent = hint;

  wrapper.append(btn, hintEl);
  return wrapper;
}

function emptyMessage(text: string): HTMLElement {
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = text;
  return p;
}
