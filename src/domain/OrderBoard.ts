import { DoublyLinkedList } from "../models/DoublyLinkedList";
import { Order } from "./Order";
import { OrderProcessList } from "./OrderProcessList";
import { Actor } from "./ProcessStep";

/**
 * Holds every order (pedido) currently moving through the process, each
 * pointing at the step (node id) of OrderProcessList where it currently
 * sits. This is a second doubly linked list, independent from the one that
 * stores the process definition.
 */
export class OrderBoard {
  private orders = new DoublyLinkedList<Order>();

  public createOrder(code: string, firstStepId: string): Order {
    const order: Order = {
      id: `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code,
      currentStepId: firstStepId,
      status: "in-progress",
      history: [firstStepId],
    };
    this.orders.insertAtTail(order);
    return order;
  }

  public getAllOrders(): Order[] {
    return this.orders.toArray();
  }

  public size(): number {
    return this.orders.size();
  }

  public getOrdersForActor(processList: OrderProcessList, actor: Actor): Order[] {
    return this.orders.toArray().filter((order) => {
      if (order.status !== "in-progress" || !order.currentStepId) return false;
      const step = processList.getStepById(order.currentStepId);
      return step !== null && step.actor === actor;
    });
  }

  /** Moves an order to `nextStepId`, or marks it completed when null. */
  public advanceOrder(orderId: string, nextStepId: string | null): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (nextStepId) {
      order.currentStepId = nextStepId;
      order.status = "in-progress";
      order.history.push(nextStepId);
    } else {
      order.currentStepId = null;
      order.status = "completed";
    }
    return true;
  }

  public rejectOrder(orderId: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;
    order.currentStepId = null;
    order.status = "rejected";
    return true;
  }
}
