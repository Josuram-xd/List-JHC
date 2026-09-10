import { Actor, StepType } from "../domain/ProcessStep";

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
