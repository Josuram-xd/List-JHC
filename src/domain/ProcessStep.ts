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
  /**
   * Only used when type === "decision". Texts for the two possible answers.
   */
  yesLabel?: string;
  noLabel?: string;
  /**
   * Only used when type === "decision". Id of the step the flow jumps to
   * when the answer is "No". The "Sí" answer always continues to the next
   * step in the list (the normal path of the diagram). If a decision has
   * no noNextId, answering "No" ends the order as rejected.
   */
  noNextId?: string;
}

export const ACTORS: Actor[] = [
  "ShippingOffice",
  "BuyerAgent",
  "Supervisor",
  "Seller",
  "ReceiveAgent",
];

export const STEP_TYPES: StepType[] = ["task", "decision"];
