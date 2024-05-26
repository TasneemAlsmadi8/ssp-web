export interface Item {
  // Define properties of Item here
  // get id(): string;
}

export interface ItemType {
  code: string;
  name: string;
}

export enum ItemStatus {
  Pending = 0,
  Rejected = 1,
  Approved = 2,
  Canceled = 3,
}

export interface UpdateSchema {
  // Define properties of UpdateSchema here
}

export interface AddSchema {
  // Define properties of AddSchema here
}
