export class ArrayPaginator {
  private _index = 0;
  private _numOfPages: number;
  private pageChangeCallback?: (pageNumber: number) => void;

  constructor(private items: any[] = [], private pageSize: number = 10) {
    this._numOfPages = Math.ceil(items.length / pageSize);
  }

  private set index(value) {
    this._index = value;
    if (this.pageChangeCallback) this.pageChangeCallback(this.activePageNumber);
  }

  get index() {
    return this._index;
  }

  get numOfPages(): number {
    return this._numOfPages;
  }

  get activePageNumber(): number {
    return this.index + 1;
  }

  setPageChangeCallback(callbackFn: (pageNumber: number) => void) {
    this.pageChangeCallback = callbackFn;
  }

  removePageChangeCallback() {
    delete this.pageChangeCallback;
  }

  setActivePageNumber(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this._numOfPages) {
      throw new Error('Invalid page number');
    }
    this.index = pageNumber - 1;
  }

  get page(): any[] {
    const start = this.index * this.pageSize;
    const end = Math.min(start + this.pageSize, this.items.length);
    return this.items.slice(start, end);
  }

  nextPage(): void {
    if (this.index < this._numOfPages - 1) {
      this.index++;
    }
  }

  previousPage(): void {
    if (this.index > 0) {
      this.index--;
    }
  }

  get isLastPage(): boolean {
    return this.index >= this._numOfPages - 1;
  }

  get isFirstPage(): boolean {
    return this.index <= 0;
  }

  setPageSize(value: number) {
    this.pageSize = value;
    this._numOfPages = Math.ceil(this.items.length / this.pageSize);
    this.reset();
  }

  reset() {
    this.index = 0;
  }

  updateItems(newItems: any[]) {
    const oldPage = this.activePageNumber;
    this.items = newItems;
    this._numOfPages = Math.ceil(newItems.length / this.pageSize);

    this.reset();

    try {
      this.setActivePageNumber(oldPage);
    } catch (error) {
      this.reset;
    }
  }
  getActiveRange(): string {
    const start = this.index * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.items.length);
    return `${start}-${end}`;
  }
  get totalItems(): number {
    return this.items.length;
  }

  pageSequence(): number[] {
    const totalPages = this.numOfPages;
    const currentPage = this.activePageNumber;
    const sequence: number[] = [];

    let startPage: number, endPage: number;

    if (totalPages <= 5) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPages) {
        startPage = totalPages - 4;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      sequence.push(i);
    }

    return sequence;
  }
}
