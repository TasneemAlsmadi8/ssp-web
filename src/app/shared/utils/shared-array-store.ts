import { BehaviorSubject, Observable } from 'rxjs';

export class SharedArrayStore<T> {
  private subject: BehaviorSubject<T[]>;
  public observable$: Observable<T[]>;
  private defaultSortFn?: (a: T, b: T) => number;
  private defaultSortKeys?: { key: keyof T; ascending: boolean }[];
  private applySorting = false;

  constructor() {
    this.subject = new BehaviorSubject<T[]>([]);
    this.observable$ = this.subject.asObservable();
  }

  setDefaultSortFn(defaultSortFn?: (a: T, b: T) => number) {
    delete this.defaultSortKeys;
    this.defaultSortFn = defaultSortFn;
    this.applySorting = true;
  }

  setDefaultSortByKey(key: keyof T, ascending: boolean) {
    this.setDefaultSortByKeys([{ key, ascending }]);
  }

  setDefaultSortByKeys(sortKeys: { key: keyof T; ascending: boolean }[]) {
    delete this.defaultSortFn;
    this.defaultSortKeys = sortKeys;
    this.applySorting = true;
  }

  isEmpty(): boolean {
    return this.subject.getValue().length === 0;
  }

  get length(): number {
    return this.subject.getValue().length;
  }

  getValue(): T[] {
    return this.subject.getValue();
  }

  update(value: T[], applyDefaultSorting: boolean = true): void {
    if (applyDefaultSorting && this.applySorting) {
      value = this.defaultSort(value);
    }
    this.subject.next(value);
  }

  add(
    value: T[] | T,
    compareFn: (a: T, b: T) => boolean = (a, b) => a === b,
    applyDefaultSorting: boolean = true
  ) {
    if (!(value instanceof Array)) value = [value];
    const newValue: T[] = [...this.getValue()];

    value.forEach((newItem) => {
      const index = newValue.findIndex((existingItem) =>
        compareFn(existingItem, newItem)
      );
      if (index !== -1) {
        // Replace existing value with new value
        newValue[index] = newItem;
      } else {
        // Add new value if not a duplicate
        newValue.push(newItem);
      }
    });

    this.update(newValue, applyDefaultSorting);
  }

  find(compareFn: (value: T) => boolean): T | undefined {
    return this.subject.value.find(compareFn);
  }

  sort(compareFn: (a: T, b: T) => number): void {
    const sortedValue = this._sort(compareFn);
    this.subject.next(sortedValue);
  }

  sortByKey<K extends keyof T>(key: K, ascending: boolean = true): void {
    const sortedValue = this._sortByKeys([{ key, ascending }]);
    this.subject.next(sortedValue);
  }

  private defaultSort(value: T[]): T[] {
    if (this.defaultSortFn) {
      return this._sort(this.defaultSortFn, value);
    } else if (this.defaultSortKeys) {
      return this._sortByKeys(this.defaultSortKeys, value);
    }
    throw new Error('No default sorting criteria provided');
  }

  private _sort(
    compareFn: (a: T, b: T) => number,
    array: T[] = this.subject.getValue()
  ): T[] {
    const sortedValue = [...array].sort(compareFn);
    return sortedValue;
  }

  private _sortByKeys(
    sortKeys: { key: keyof T; ascending: boolean }[],
    array: T[] = this.subject.getValue()
  ): T[] {
    return [...array].sort((a, b) => {
      for (const { key, ascending } of sortKeys) {
        const extractValue = (item: T): any => {
          const value = item[key];

          if (typeof value === 'string') {
            const numberValue = Number(value);
            if (!isNaN(numberValue)) return numberValue;

            const date = new Date(value);
            if (!isNaN(date.getTime())) return date.getTime();
          }

          return value;
        };

        const aValue = extractValue(a);
        const bValue = extractValue(b);

        if (aValue == null && bValue == null) continue;
        if (aValue == null) return ascending ? -1 : 1;
        if (bValue == null) return ascending ? 1 : -1;

        if (aValue < bValue) return ascending ? -1 : 1;
        if (aValue > bValue) return ascending ? 1 : -1;
      }
      return 0;
    });
  }
}
