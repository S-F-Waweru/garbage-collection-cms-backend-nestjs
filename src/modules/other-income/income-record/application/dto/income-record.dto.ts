export class CreateIncomeRecordDto {
  categoryId: string;
  clientName: string;
  unitPrice: number;
  unitCount: number;
  unitType: Unit;
  notes?: string;
  // recordedBy?: string; // logged in user ID
}

export class UpdateIncomeRecordDto {
  categoryId?: string | null;
  clientName?: string;
  unitPrice?: number;
  unitCount?: number;
  unitType?: Unit;
  notes?: string;
}

export enum Unit {
  KG = 'KG',
  LITER = 'LITER',
  PIECE = 'PIECE',
}
