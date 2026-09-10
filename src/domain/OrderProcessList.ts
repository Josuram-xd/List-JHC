import { DoublyLinkedList } from "../models/DoublyLinkedList";
import { Actor, ProcessStep } from "./ProcessStep";

export class OrderProcessList {
  private list = new DoublyLinkedList<ProcessStep>();

  public loadSteps(steps: ProcessStep[]): void {
    this.list.clear();
    for (const step of steps) this.list.insertAtTail(step);
  }

  public getAllSteps(): ProcessStep[] {
    return this.list.toArray();
  }

  public size(): number {
    return this.list.size();
  }

  public addStepAtEnd(step: ProcessStep): void {
    this.list.insertAtTail(step);
  }

  public addStepAfter(afterId: string, step: ProcessStep): boolean {
    const target = this.list.findNode((s) => s.id === afterId);
    if (!target) return false;
    this.list.insertAfterNode(target, step);
    return true;
  }

  public addStepBefore(beforeId: string, step: ProcessStep): boolean {
    const target = this.list.findNode((s) => s.id === beforeId);
    if (!target) return false;
    this.list.insertBeforeNode(target, step);
    return true;
  }

  public editStep(id: string, updates: Partial<Omit<ProcessStep, "id">>): boolean {
    const node = this.list.findNode((s) => s.id === id);
    if (!node) return false;
    node.data = { ...node.data, ...updates };
    return true;
  }

  public deleteStep(id: string): boolean {
    return this.list.removeBy((s) => s.id === id) !== null;
  }

  public getStepsByActor(actor: Actor): ProcessStep[] {
    return this.list.toArray().filter((s) => s.actor === actor);
  }

  public getStepById(id: string): ProcessStep | null {
    return this.list.find((s) => s.id === id);
  }

  public reorderStep(id: string, newIndex: number): boolean {
    return this.list.moveTo((s) => s.id === id, newIndex);
  }

  public moveStepUp(id: string): boolean {
    const index = this.list.indexOf((s) => s.id === id);
    if (index <= 0) return false;
    return this.reorderStep(id, index - 1);
  }

  public moveStepDown(id: string): boolean {
    const index = this.list.indexOf((s) => s.id === id);
    if (index === -1 || index >= this.list.size() - 1) return false;
    return this.reorderStep(id, index + 1);
  }

  public indexOfStep(id: string): number {
    return this.list.indexOf((s) => s.id === id);
  }
}
