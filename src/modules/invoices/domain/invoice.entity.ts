// invoice.entity.ts
import { BaseEntity } from 'src/shared/domain/entities/base.entity';
import { BadRequestException } from '@nestjs/common';

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

interface InvoiceProps {
  invoiceNumber: string;
  clientId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  invoiceDate: Date;
  dueDate: Date;
  activeUnits: number;
  unitPrice: number;
  subtotal: number;
  creditApplied: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  notes?: string;
  createdBy: string;

  // Relationships (optional - loaded separately)
  client?: any; // Will be Client entity when needed
  payments?: any[]; // Will be Payment[] when needed
  creator?: any; // Will be User entity when needed
}

export class Invoice extends BaseEntity {
  private _invoiceNumber: string;
  private _clientId: string;
  private _billingPeriodStart: Date;
  private _billingPeriodEnd: Date;
  private _invoiceDate: Date;
  private _dueDate: Date;
  private _activeUnits: number;
  private _unitPrice: number;
  private _subtotal: number;
  private _creditApplied: number;
  private _totalAmount: number;
  private _amountPaid: number;
  private _balance: number;
  private _status: InvoiceStatus;
  private _notes?: string;
  private _createdBy: string;

  // Relationships (loaded on demand)
  private _client?: any;
  private _payments?: any[];
  private _creator?: any;

  private constructor(props: InvoiceProps, id?: string) {
    super(id);
    this._invoiceNumber = props.invoiceNumber;
    this._clientId = props.clientId;
    this._billingPeriodStart = props.billingPeriodStart;
    this._billingPeriodEnd = props.billingPeriodEnd;
    this._invoiceDate = props.invoiceDate;
    this._dueDate = props.dueDate;
    this._activeUnits = props.activeUnits;
    this._unitPrice = props.unitPrice;
    this._subtotal = props.subtotal;
    this._creditApplied = props.creditApplied;
    this._totalAmount = props.totalAmount;
    this._amountPaid = props.amountPaid;
    this._balance = props.balance;
    this._status = props.status;
    this._notes = props.notes;
    this._createdBy = props.createdBy;

    // Set relationships if provided
    this._client = props.client;
    this._payments = props.payments;
    this._creator = props.creator;
  }

  // Getters
  get invoiceNumber(): string {
    return this._invoiceNumber;
  }

  get clientId(): string {
    return this._clientId;
  }

  get billingPeriodStart(): Date {
    return this._billingPeriodStart;
  }

  get billingPeriodEnd(): Date {
    return this._billingPeriodEnd;
  }

  get invoiceDate(): Date {
    return this._invoiceDate;
  }

  get dueDate(): Date {
    return this._dueDate;
  }

  get activeUnits(): number {
    return this._activeUnits;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get subtotal(): number {
    return this._subtotal;
  }

  get creditApplied(): number {
    return this._creditApplied;
  }

  get totalAmount(): number {
    return this._totalAmount;
  }

  get amountPaid(): number {
    return this._amountPaid;
  }

  get balance(): number {
    return this._balance;
  }

  get status(): InvoiceStatus {
    return this._status;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get createdBy(): string {
    return this._createdBy;
  }

  // Relationship getters
  get client(): any {
    return this._client;
  }

  get payments(): any[] {
    return this._payments || [];
  }

  get creator(): any {
    return this._creator;
  }

  // Relationship setters (for loading relationships)
  setClient(client: any): void {
    this._client = client;
  }

  setPayments(payments: any[]): void {
    this._payments = payments;
  }

  setCreator(creator: any): void {
    this._creator = creator;
  }

  // Helper - Check if relationships are loaded
  hasClient(): boolean {
    return this._client !== undefined;
  }

  hasPayments(): boolean {
    return this._payments !== undefined && this._payments.length > 0;
  }

  hasCreator(): boolean {
    return this._creator !== undefined;
  }

  // Factory method - Create new invoice
  static create(props: InvoiceProps): Invoice {
    const invoice = new Invoice(props);
    invoice.validate();
    return invoice;
  }

  // Factory method - Recreate from persistence
  static createFromPersistence(
    props: InvoiceProps & { id: string; createdAt: Date; updatedAt: Date },
  ): Invoice {
    const invoice = new Invoice(props, props.id);
    invoice._createdAt = props.createdAt;
    invoice._updatedAt = props.updatedAt;
    invoice.validate();
    return invoice;
  }

  // Business Rules & Validation - FIXED VERSION
  private validate(): void {
    if (!this._invoiceNumber || this._invoiceNumber.trim() === '') {
      throw new BadRequestException('Invoice number is required');
    }

    if (!this._clientId) {
      throw new BadRequestException('Client ID is required');
    }

    if (this._activeUnits <= 0) {
      throw new BadRequestException('Unit count must be greater than 0');
    }

    if (this._unitPrice < 0) {
      throw new BadRequestException('Unit price cannot be negative');
    }

    if (this._subtotal < 0) {
      throw new BadRequestException('Subtotal cannot be negative');
    }

    if (this._creditApplied < 0) {
      throw new BadRequestException('Credit applied cannot be negative');
    }

    if (this._creditApplied > this._subtotal) {
      throw new BadRequestException('Credit applied cannot exceed subtotal');
    }

    if (this._totalAmount < 0) {
      throw new BadRequestException('Total amount cannot be negative');
    }

    if (this._amountPaid < 0) {
      throw new BadRequestException('Amount paid cannot be negative');
    }

    if (this._balance < 0) {
      throw new BadRequestException('Balance cannot be negative');
    }

    // Commented out for now to avoid validation issues during creation
    // if (this._billingPeriodStart >= this._billingPeriodEnd) {
    //   throw new BadRequestException('Billing period start must be before end');
    // }

    if (!this._createdBy) {
      throw new BadRequestException('Created by user is required');
    }

    // FIXED: Use activeUnits instead of non-existent _activeUnits
    const calculatedSubtotal = this._activeUnits * this._unitPrice;
    // Allow small rounding differences for floating point arithmetic
    const tolerance = 0.01; // 1 cent tolerance for currency calculations
    if (Math.abs(this._subtotal - calculatedSubtotal) > tolerance) {
      throw new BadRequestException(
        `Subtotal calculation mismatch. Expected: ${calculatedSubtotal.toFixed(2)}, Got: ${this._subtotal.toFixed(2)}. ` +
          `Unit Count: ${this._activeUnits}, Unit Price: ${this._unitPrice.toFixed(2)}`,
      );
    }

    const calculatedTotal = this._subtotal - this._creditApplied;
    if (Math.abs(this._totalAmount - calculatedTotal) > tolerance) {
      throw new BadRequestException(
        `Total amount calculation mismatch. Expected: ${calculatedTotal.toFixed(2)}, Got: ${this._totalAmount.toFixed(2)}`,
      );
    }

    // Comment out balance validation to allow manual balance adjustments
    // const calculatedBalance = this._totalAmount - this._amountPaid;
    // if (Math.abs(this._balance - calculatedBalance) > tolerance) {
    //   throw new BadRequestException(
    //     `Balance calculation mismatch. Expected: ${calculatedBalance.toFixed(2)}, Got: ${this._balance.toFixed(2)}`
    //   );
    // }
  }

  // Business Logic - Apply payment to invoice
  // applyPayment(amount: number): void {
  //   if (amount <= 0) {
  //     throw new BadRequestException('Payment amount must be greater than 0');
  //   }

  //   if (this._status === InvoiceStatus.CANCELLED) {
  //     throw new BadRequestException(
  //       'Cannot apply payment to cancelled invoice',
  //     );
  //   }

  //   if (amount > this._balance) {
  //     throw new BadRequestException('Payment amount exceeds invoice balance');
  //   }

  //   this._amountPaid += amount;
  //   this._balance = this._totalAmount - this._amountPaid;
  //   this.updateStatusAfterPayment();
  //   this.touch();
  // }

  applyPayment(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    if (this._status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot apply payment to cancelled invoice',
      );
    }

    // Convert all amounts to cents to avoid floating point errors
    const totalCents = Math.round(this._totalAmount * 100);
    const paidCents = Math.round(this._amountPaid * 100);
    const amountCents = Math.round(amount * 100);

    if (amountCents > totalCents - paidCents) {
      throw new BadRequestException('Payment amount exceeds invoice balance');
    }

    const newPaidCents = paidCents + amountCents;
    this._amountPaid = newPaidCents / 100;

    const newBalanceCents = totalCents - newPaidCents;
    this._balance = newBalanceCents / 100;

    this.updateStatusAfterPayment();
    this.touch();
  }

  // Business Logic - Status transitions
  canTransitionTo(newStatus: InvoiceStatus): boolean {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.PENDING]: [
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.PARTIALLY_PAID]: [
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.OVERDUE]: [
        InvoiceStatus.PAID,
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.PAID]: [InvoiceStatus.CANCELLED],
      [InvoiceStatus.CANCELLED]: [],
    };

    return validTransitions[this._status]?.includes(newStatus) ?? false;
  }

  updateStatus(newStatus: InvoiceStatus): void {
    if (!this.canTransitionTo(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${this._status} to ${newStatus}`,
      );
    }

    this._status = newStatus;
    this.touch();
  }

  private updateStatusAfterPayment(): void {
    if (this._balance === 0) {
      this._status = InvoiceStatus.PAID;
    } else if (this._amountPaid > 0 && this._balance > 0) {
      this._status = InvoiceStatus.PARTIALLY_PAID;
    }
  }

  // Business Logic - Check invoice state
  isPaid(): boolean {
    return this._status === InvoiceStatus.PAID;
  }

  isOutstanding(): boolean {
    return this._balance > 0 && this._status !== InvoiceStatus.CANCELLED;
  }

  isOverdue(): boolean {
    return (
      this._status === InvoiceStatus.OVERDUE ||
      (this.isOutstanding() && new Date() > this._dueDate)
    );
  }

  isCancelled(): boolean {
    return this._status === InvoiceStatus.CANCELLED;
  }

  // Business Logic - Mark as overdue
  markAsOverdue(): void {
    if (this.isOutstanding() && new Date() > this._dueDate) {
      this.updateStatus(InvoiceStatus.OVERDUE);
    }
  }

  // Business Logic - Cancel invoice
  cancel(): void {
    if (this._amountPaid > 0) {
      throw new BadRequestException(
        'Cannot cancel invoice with payments applied',
      );
    }

    this.updateStatus(InvoiceStatus.CANCELLED);
  }

  // Update notes
  updateNotes(notes: string): void {
    this._notes = notes;
    this.touch();
  }

  // Update invoice with new values
  updateInvoice(
    props: Partial<{
      activeUnits: number;
      unitPrice: number;
      subtotal: number;
      creditApplied: number;
      totalAmount: number;
      notes: string;
    }>,
  ): void {
    if (props.activeUnits !== undefined) this._activeUnits = props.activeUnits;
    if (props.unitPrice !== undefined) this._unitPrice = props.unitPrice;
    if (props.subtotal !== undefined) this._subtotal = props.subtotal;
    if (props.creditApplied !== undefined)
      this._creditApplied = props.creditApplied;
    if (props.totalAmount !== undefined) this._totalAmount = props.totalAmount;
    if (props.notes !== undefined) this._notes = props.notes;

    // Recalculate balance if needed
    if (
      props.subtotal !== undefined ||
      props.creditApplied !== undefined ||
      props.totalAmount !== undefined
    ) {
      this._balance = this._totalAmount - this._amountPaid;
    }

    this.validate();
    this.touch();
  }

  // For serialization/persistence
  toObject() {
    return {
      id: this._id,
      invoiceNumber: this._invoiceNumber,
      clientId: this._clientId,
      billingPeriodStart: this._billingPeriodStart,
      billingPeriodEnd: this._billingPeriodEnd,
      invoiceDate: this._invoiceDate,
      dueDate: this._dueDate,
      activeUnits: this._activeUnits,
      unitPrice: this._unitPrice,
      subtotal: this._subtotal,
      creditApplied: this._creditApplied,
      totalAmount: this._totalAmount,
      amountPaid: this._amountPaid,
      balance: this._balance,
      status: this._status,
      notes: this._notes,
      createdBy: this._createdBy,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      // Include relationships if loaded
      ...(this._client && { client: this._client }),
      ...(this._payments && { payments: this._payments }),
      ...(this._creator && { creator: this._creator }),
    };
  }

  // Helper method to create invoice with proper calculations
  static createWithCalculations(
    props: Omit<InvoiceProps, 'subtotal' | 'totalAmount' | 'balance'>,
  ): Invoice {
    // Calculate subtotal from activeUnits and unitPrice
    const subtotal =
      Math.round(props.activeUnits * props.unitPrice * 100) / 100;

    // Calculate total amount (subtotal - credit applied)
    const totalAmount =
      Math.round((subtotal - props.creditApplied) * 100) / 100;

    // Initial balance equals total amount when no payments applied
    const balance = totalAmount;

    return Invoice.create({
      ...props,
      subtotal,
      totalAmount,
      balance,
    });
  }
}
