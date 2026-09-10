export type OrderStatus = "in-progress" | "completed" | "rejected";

export interface Order {
  id: string;
  code: string;
  currentStepId: string | null;
  status: OrderStatus;
  /** Ids of every step the order has passed through, in order. */
  history: string[];
}
