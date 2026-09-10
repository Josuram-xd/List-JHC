import { ListNode } from "./Node";

export class DoublyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length = 0;

  public size(): number {
    return this.length;
  }

  public isEmpty(): boolean {
    return this.length === 0;
  }

  public getHead(): ListNode<T> | null {
    return this.head;
  }

  public getTail(): ListNode<T> | null {
    return this.tail;
  }

  public insertAtHead(data: T): ListNode<T> {
    const node = new ListNode(data);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this.length++;
    return node;
  }

  public insertAtTail(data: T): ListNode<T> {
    const node = new ListNode(data);
    if (!this.tail) {
      this.head = node;
      this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
    return node;
  }

  public insertAt(index: number, data: T): ListNode<T> {
    if (index < 0 || index > this.length) {
      throw new RangeError(`Index ${index} is out of bounds`);
    }
    if (index === 0) return this.insertAtHead(data);
    if (index === this.length) return this.insertAtTail(data);

    const current = this.getNodeAt(index);
    const node = new ListNode(data);
    const before = current!.prev;

    node.prev = before;
    node.next = current;
    before!.next = node;
    current!.prev = node;

    this.length++;
    return node;
  }

  public insertBeforeNode(target: ListNode<T>, data: T): ListNode<T> {
    if (target === this.head) return this.insertAtHead(data);

    const node = new ListNode(data);
    const before = target.prev;

    node.prev = before;
    node.next = target;
    before!.next = node;
    target.prev = node;

    this.length++;
    return node;
  }

  public insertAfterNode(target: ListNode<T>, data: T): ListNode<T> {
    if (target === this.tail) return this.insertAtTail(data);

    const node = new ListNode(data);
    const after = target.next;

    node.prev = target;
    node.next = after;
    target.next = node;
    after!.prev = node;

    this.length++;
    return node;
  }

  public removeAt(index: number): T | null {
    const node = this.getNodeAt(index);
    if (!node) return null;
    return this.removeNode(node);
  }

  public removeNode(node: ListNode<T>): T {
    const { prev, next } = node;

    if (prev) prev.next = next;
    else this.head = next;

    if (next) next.prev = prev;
    else this.tail = prev;

    node.prev = null;
    node.next = null;
    this.length--;
    return node.data;
  }

  public removeBy(predicate: (data: T) => boolean): T | null {
    const node = this.findNode(predicate);
    if (!node) return null;
    return this.removeNode(node);
  }

  public updateAt(index: number, data: T): boolean {
    const node = this.getNodeAt(index);
    if (!node) return false;
    node.data = data;
    return true;
  }

  public getAt(index: number): T | null {
    const node = this.getNodeAt(index);
    return node ? node.data : null;
  }

  public getNodeAt(index: number): ListNode<T> | null {
    if (index < 0 || index >= this.length) return null;

    let current: ListNode<T> | null;
    if (index <= this.length / 2) {
      current = this.head;
      for (let i = 0; i < index && current; i++) current = current.next;
    } else {
      current = this.tail;
      for (let i = this.length - 1; i > index && current; i--) current = current.prev;
    }
    return current;
  }

  public find(predicate: (data: T) => boolean): T | null {
    const node = this.findNode(predicate);
    return node ? node.data : null;
  }

  public findNode(predicate: (data: T) => boolean): ListNode<T> | null {
    let current = this.head;
    while (current) {
      if (predicate(current.data)) return current;
      current = current.next;
    }
    return null;
  }

  public indexOf(predicate: (data: T) => boolean): number {
    let current = this.head;
    let index = 0;
    while (current) {
      if (predicate(current.data)) return index;
      current = current.next;
      index++;
    }
    return -1;
  }

  public moveTo(predicate: (data: T) => boolean, newIndex: number): boolean {
    const node = this.findNode(predicate);
    if (!node) return false;
    if (newIndex < 0 || newIndex >= this.length) return false;

    const data = this.removeNode(node);
    this.insertAt(newIndex, data);
    return true;
  }

  public toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  public clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  public [Symbol.iterator](): Iterator<T> {
    let current = this.head;
    return {
      next(): IteratorResult<T> {
        if (!current) return { value: undefined as unknown as T, done: true };
        const value = current.data;
        current = current.next;
        return { value, done: false };
      },
    };
  }
}
