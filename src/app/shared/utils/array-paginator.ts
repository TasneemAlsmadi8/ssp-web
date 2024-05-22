export class ArrayPaginator {
  private _index = 0;
  private _numOfPages: number;

  constructor(private items: any[], public pageSize: number = 10) {
    this._numOfPages = Math.ceil(items.length / pageSize);
  }

  get numOfPages(): number {
    return this._numOfPages;
  }

  get activePageNumber(): number {
    return this._index + 1;
  }

  setActivePageNumber(pageNumber: number) {
    if (pageNumber < 1 || pageNumber > this._numOfPages) {
      throw new Error('Invalid page number');
    }
    this._index = pageNumber - 1;
  }

  get page(): any[] {
    const start = this._index * this.pageSize;
    const end = Math.min(start + this.pageSize, this.items.length);
    return this.items.slice(start, end);
  }

  nextPage(): void {
    if (this._index < this._numOfPages - 1) {
      this._index++;
    }
  }

  previousPage(): void {
    if (this._index > 0) {
      this._index--;
    }
  }

  get isLastPage(): boolean {
    return this._index >= this._numOfPages - 1;
  }

  get isFirstPage(): boolean {
    return this._index <= 0;
  }

  reset() {
    this._index = 0;
  }

  updateItems(newItems: any[]) {
    this.items = newItems;
    this._numOfPages = Math.ceil(newItems.length / this.pageSize);
    this.reset();
  }
  getActiveRange(): string {
    const start = this._index * this.pageSize + 1;
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
