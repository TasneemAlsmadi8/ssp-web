import { Item } from "../generic-item";

export enum ApprovalAction {
  Rejected = '1',
  Accepted = '2',
}


export interface GenericApproval extends Item{
  id: string;
  dateSubmitted: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  fullNameF: string;
  status: string;
  remarks: string;
}