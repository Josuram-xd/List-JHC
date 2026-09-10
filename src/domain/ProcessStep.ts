export type Actor =
  | "ShippingOffice"
  | "BuyerAgent"
  | "Supervisor"
  | "Seller"
  | "ReceiveAgent";

export type StepType = "task" | "decision";

export interface ProcessStep {
  id: string;
  title: string;
  actor: Actor;
  type: StepType;
  description: string;
}

export const ACTORS: Actor[] = [
  "ShippingOffice",
  "BuyerAgent",
  "Supervisor",
  "Seller",
  "ReceiveAgent",
];

export const STEP_TYPES: StepType[] = ["task", "decision"];
