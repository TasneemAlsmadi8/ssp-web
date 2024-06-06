export interface Item {
  id: string;
  status: ItemStatusString;
  remarks?: string;

  employeeId?: string;
  employeeCode?: string;
  fullName?: string;
  fullNameF?: string;
}

export interface ItemType {
  code: string;
  name: string;
}

export enum ItemStatus {
  Pending = '0',
  Rejected = '1',
  Approved = '2',
  Canceled = '3',
}

export type ItemStatusString = keyof typeof ItemStatus;

export interface UpdateSchema {
  id: string;
  remarks?: string;
}

export interface AddSchema {
  remarks?: string;
}
