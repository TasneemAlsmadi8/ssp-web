export class SelectedItems<T> {
  private selectedItems: Map<string, T> = new Map();

  add(id: string, item: T): void {
    this.selectedItems.set(id, item);
  }

  delete(id: string): void {
    this.selectedItems.delete(id);
  }

  has(id: string): boolean {
    return this.selectedItems.has(id);
  }

  toggle(id: string, item: T): void {
    if (this.has(id)) {
      this.delete(id);
    } else {
      this.add(id, item);
    }
  }

  clear() {
    this.selectedItems.clear();
  }

  get length(): number {
    return this.selectedItems.size;
  }

  asArray(): T[] {
    return Array.from(this.selectedItems.values());
  }
}
