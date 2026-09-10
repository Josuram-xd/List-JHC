import { Actor, StepType } from "../domain/ProcessStep";
import { OrderStatus } from "../domain/Order";

export const ACTOR_LABELS: Record<Actor, string> = {
  ShippingOffice: "Oficina de Envíos",
  BuyerAgent: "Agente Comprador",
  Supervisor: "Supervisor",
  Seller: "Vendedor",
  ReceiveAgent: "Agente Receptor",
};

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  task: "Tarea",
  decision: "Decisión",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  "in-progress": "En proceso",
  completed: "Completado",
  rejected: "Rechazado",
};
