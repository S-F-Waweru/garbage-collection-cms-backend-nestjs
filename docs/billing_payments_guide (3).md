# Billing & Payments Module - Entity Design & Rules

## Entity Relationships

```
Client (from Client Management Module)
  ↓ 1:M
Invoice
  ↓ 1:M
Payment
  ↑ M:1
Client

ClientCredit
  ↑ 1:1
Client
```

---

## Base Entities

### 1. Invoice Entity

**Fields:**
- `id` (UUID, PK)
- `invoiceNumber` (string, unique, sequential - e.g., "INV-2024-0001")
- `clientId` (UUID, FK → Client)
- `billingPeriodStart` (date)
- `billingPeriodEnd` (date)
- `invoiceDate` (date)
- `dueDate` (date)
- `unitCount` (number) - snapshot of units at invoice time
- `unitPrice` (decimal) - price per unit at invoice time
- `subtotal` (decimal) - calculated: unitCount × unitPrice
- `creditApplied` (decimal, default: 0) - client credit used
- `totalAmount` (decimal) - calculated: subtotal - creditApplied
- `amountPaid` (decimal, default: 0) - sum of all payments
- `balance` (decimal) - calculated: totalAmount - amountPaid
- `status` (enum: PENDING, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED)
- `notes` (text, optional)
- `createdBy` (UUID, FK → User)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relations:**
- `ManyToOne` → Client
- `OneToMany` → Payment
- `ManyToOne` → User (createdBy)

**Business Rules:**
1. Invoice number must be **sequential and unique** across the system
2. Invoice is **immutable** once generated (except status and payment tracking)
3. `unitCount` and `unitPrice` are **snapshots** - changes to client pricing don't affect existing invoices
4. Status transitions:
   - PENDING → PARTIALLY_PAID (when amountPaid > 0 && balance > 0)
   - PENDING/PARTIALLY_PAID → PAID (when balance = 0)
   - PENDING/PARTIALLY_PAID → OVERDUE (when dueDate passed && balance > 0)
   - Any status → CANCELLED (manual intervention only)
5. `creditApplied` is set **at invoice generation** from ClientCredit
6. New invoices cannot be generated for deactivated clients
7. Soft delete not allowed - use CANCELLED status instead

---

### 2. Payment Entity

**Fields:**
- `id` (UUID, PK)
- `paymentNumber` (string, unique, sequential - e.g., "PAY-2024-0001")
- `clientId` (UUID, FK → Client)
- `invoiceId` (UUID, FK → Invoice, nullable initially)
- `amount` (decimal)
- `paymentMethod` (enum: BANK, MPESA, CASH, CUSTOM)
- `paymentDate` (date)
- `referenceNumber` (string, optional) - Mpesa code, bank ref, etc.
- `notes` (text, optional)
- `appliedToInvoice` (decimal) - amount applied to linked invoice
- `excessAmount` (decimal, default: 0) - amount moved to ClientCredit
- `createdBy` (UUID, FK → User)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

**Relations:**
- `ManyToOne` → Client
- `ManyToOne` → Invoice (nullable)
- `ManyToOne` → User (createdBy)

**Business Rules:**
1. Payment number must be **sequential and unique**
2. Payment is **immutable** once recorded (no edits/deletes)
3. Payment amount must be > 0
4. Payment must specify valid `paymentMethod`
5. **Payment Application Logic** (automatic):
   - Find oldest PENDING/PARTIALLY_PAID/OVERDUE invoice for client
   - Apply payment amount to invoice.balance
   - If payment > invoice.balance:
     - Set `appliedToInvoice` = invoice.balance
     - Set `excessAmount` = payment amount - appliedToInvoice
     - Add excessAmount to ClientCredit
     - Mark invoice as PAID
     - Repeat for next oldest invoice if excess remains
   - If payment ≤ invoice.balance:
     - Set `appliedToInvoice` = payment amount
     - Set `excessAmount` = 0
     - Update invoice status to PARTIALLY_PAID or PAID
6. If no outstanding invoices exist, entire payment goes to ClientCredit
7. `paymentDate` can be backdated for late entries

---

### 3. ClientCredit Entity

**Fields:**
- `id` (UUID, PK)
- `clientId` (UUID, FK → Client, unique)
- `balance` (decimal, default: 0)
- `lastUpdated` (timestamp)

**Relations:**
- `OneToOne` → Client

**Business Rules:**
1. Each client has **exactly one** ClientCredit record
2. Balance must be ≥ 0 (never negative)
3. Balance increases when:
   - Payment exceeds ALL outstanding invoices (excess stored here)
   - Payment made with no outstanding invoices
4. Balance decreases when:
   - New invoice is generated (credit applied automatically to reduce invoice total)
5. Credit is applied **at invoice generation time**, not payment time
6. Credit application is **all-or-nothing per invoice** (apply full credit or until invoice total = 0)
7. **CRITICAL**: ClientCredit does NOT automatically pay existing outstanding invoices - it only reduces future invoices
8. Create ClientCredit record when client is created (with balance = 0)

---

## How ClientCredit Works

### Concept
ClientCredit is like a **prepaid balance** or **store credit** for each client. It stores excess payments that couldn't be applied to existing invoices and is used to reduce future invoice amounts.

### Priority Order
```
Payment Received
    ↓
1. Apply to Outstanding Invoices FIRST (oldest to newest, FIFO)
    ↓
2. Any remaining excess → ClientCredit
```

### Flow Diagram
```
Payment Recorded
    ↓
Apply to Oldest Outstanding Invoice
    ↓
More Outstanding Invoices?
    ↓ YES → Apply to Next Invoice
    ↓ NO
Payment Has Excess?
    ↓ YES
Excess goes to ClientCredit ←─────┐
    ↓                              │
Next Invoice Generated             │
    ↓                              │
Check ClientCredit Balance         │
    ↓                              │
Credit > 0?                        │
    ↓ YES                          │
Reduce Invoice by Credit ──────────┘
```

### Key Scenarios

#### Scenario 1: Excess Payment
```
Outstanding Invoices:
- Invoice #1: KES 5,000 balance

Client pays: KES 7,000

Result:
- Invoice #1: PAID (5,000 applied)
- ClientCredit: +2,000 (excess stored)
- Payment.appliedToInvoice: 5,000
- Payment.excessAmount: 2,000
```

#### Scenario 2: Credit Applied to New Invoice
```
ClientCredit Balance: KES 2,000
New invoice generated: KES 8,000

Result:
- Invoice created with:
  - subtotal: 8,000
  - creditApplied: 2,000
  - totalAmount: 6,000
  - status: PENDING
- ClientCredit: 0 (fully used)
```

#### Scenario 3: Credit Covers Full Invoice
```
ClientCredit Balance: KES 10,000
New invoice generated: KES 5,000

Result:
- Invoice created with:
  - subtotal: 5,000
  - creditApplied: 5,000
  - totalAmount: 0
  - status: PAID (auto-paid by credit)
- ClientCredit: 5,000 (remaining balance)
```

#### Scenario 4: Payment with No Outstanding Invoices
```
Client has NO outstanding invoices
Client pays: KES 3,000

Result:
- Payment recorded
- ClientCredit: +3,000 (entire payment stored)
- When next invoice generates, this credit applies automatically
```

#### Scenario 5: Payment Covers Multiple Invoices
```
Outstanding Invoices:
- Invoice #1 (Jan): KES 5,000 balance
- Invoice #2 (Feb): KES 8,000 balance
- Invoice #3 (Mar): KES 6,000 balance
Total Outstanding: KES 19,000

ClientCredit Balance: KES 2,000 (from previous)

Client pays: KES 10,000

Result:
1. Apply 5,000 to Invoice #1 → PAID
2. Apply 5,000 to Invoice #2 → PARTIALLY_PAID (3,000 balance remains)
3. No excess (payment fully consumed)
4. ClientCredit: UNCHANGED at 2,000

Final State:
- Invoice #1: PAID
- Invoice #2: 3,000 balance remaining
- Invoice #3: 6,000 balance (untouched)
- ClientCredit: 2,000 (untouched)
- Total Outstanding: 9,000
```

#### Scenario 6: Payment Exceeds All Outstanding
```
Outstanding Invoices:
- Invoice #1: KES 5,000 balance
- Invoice #2: KES 3,000 balance
Total Outstanding: KES 8,000

ClientCredit Balance: KES 1,000

Client pays: KES 12,000

Result:
1. Apply 5,000 to Invoice #1 → PAID
2. Apply 3,000 to Invoice #2 → PAID
3. Remaining 4,000 → Add to ClientCredit

Final State:
- Invoice #1: PAID
- Invoice #2: PAID
- ClientCredit: 5,000 (1,000 + 4,000)
- Total Outstanding: 0
```

#### Scenario 7: New Invoice with Existing Outstanding Balance
```
Outstanding Invoices:
- Invoice #1 (Jan): KES 5,000 balance
- Invoice #2 (Feb): KES 3,000 balance

ClientCredit Balance: KES 2,000

New invoice (March) generated: KES 10,000

Result:
- Invoice #1: STILL 5,000 balance (unchanged)
- Invoice #2: STILL 3,000 balance (unchanged)
- Invoice #3 (new):
  - subtotal: 10,000
  - creditApplied: 2,000
  - totalAmount: 8,000
  - status: PENDING
- ClientCredit: 0 (used on new invoice only)

IMPORTANT: Total Outstanding is now 5,000 + 3,000 + 8,000 = 16,000
The credit does NOT reduce old outstanding invoices!
```

### Important Distinctions

**ClientCredit vs Outstanding Balance:**
- **Outstanding Balance**: Sum of unpaid/partially paid invoices (existing debt)
- **ClientCredit**: Prepayment for future invoices (forward balance)
- These are SEPARATE and do NOT mix

**When Credit is Used:**
- ✅ During new invoice generation (reduces the new invoice amount)
- ❌ NOT applied to existing outstanding invoices

**When Credit is Added:**
- ✅ Only when payment exceeds ALL outstanding invoices
- ❌ NOT when outstanding balance remains

**Why This Design?**
Keeps accounting clean and audit-friendly:
- Outstanding invoices remain visible and trackable
- Credit is clearly a prepayment, not debt forgiveness
- Each invoice has a clear payment history
- No confusion about which payment paid which invoice

---

## Key Module Rules

### Invoice Generation Rules
1. **Sequential Numbering**: Use database-level sequence or atomic counter
2. **Billing Date Logic**:
   - Use client's custom billing date OR default to 1st of month
   - Due date = billing date + 30 days (configurable)
3. **Price Snapshot**: Always use current client.unitPrice and client.unitCount
4. **Credit Application**:
   - Check ClientCredit.balance before finalizing invoice
   - If credit ≥ subtotal: creditApplied = subtotal, totalAmount = 0, status = PAID
   - If credit < subtotal: creditApplied = credit, totalAmount = subtotal - credit
   - Deduct creditApplied from ClientCredit.balance
5. **Deactivated Clients**: Skip invoice generation for deactivated clients
6. **Idempotency**: Prevent duplicate invoices for same billing period

### Payment Application Rules
1. **Oldest First (FIFO)**: Always apply to oldest invoice by invoiceDate
2. **Partial Payment Handling**:
   - Update invoice.amountPaid and invoice.balance
   - Update invoice.status accordingly
3. **Excess Payment Handling**:
   - Calculate excess = payment.amount - sum(appliedToInvoice)
   - Add excess to ClientCredit.balance
   - Record excess in payment.excessAmount
4. **Transaction Safety**: Wrap payment application in database transaction

---

## NestJS @Cron Notes

### What is @Cron?
NestJS decorator for scheduling tasks using cron expressions (similar to Linux cron).

### Setup
```typescript
// In app.module.ts
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
})
```

### Usage
```typescript
// In service
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async generateMonthlyInvoices() {
  // Pseudocode
}
```

### Common Cron Expressions
- `CronExpression.EVERY_DAY_AT_MIDNIGHT` → '0 0 * * *'
- `CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT` → '0 0 1 * *'
- Custom: `'0 9 * * *'` (9 AM daily)

### For This Module
Use cron to:
1. Generate invoices for all clients on 1st of month
2. Check for overdue invoices daily (update status)
3. Optional: Send reminders for upcoming due dates

---

## High-Level Pseudocode

### Generate Single Invoice
```
FUNCTION GenerateInvoice(clientId, billingDate)
  client = findClientById(clientId)
  IF client.isDeactivated THEN RETURN error
  
  invoiceNumber = getNextInvoiceNumber()
  unitCount = client.unitCount
  unitPrice = client.unitPrice
  subtotal = unitCount × unitPrice
  
  clientCredit = findClientCredit(clientId)
  creditToApply = MIN(clientCredit.balance, subtotal)
  
  totalAmount = subtotal - creditToApply
  status = IF totalAmount = 0 THEN PAID ELSE PENDING
  
  BEGIN TRANSACTION
    invoice = createInvoice({
      invoiceNumber, clientId, subtotal, creditApplied: creditToApply,
      totalAmount, status, unitCount, unitPrice, billingDate
    })
    
    IF creditToApply > 0 THEN
      updateClientCredit(clientId, balance - creditToApply)
    END IF
  COMMIT TRANSACTION
  
  RETURN invoice
END FUNCTION
```

### Auto-Generate Invoices (Cron)
```
@Cron('0 0 1 * *') // 1st of every month at midnight
FUNCTION AutoGenerateInvoices()
  activeClients = findAllActiveClients()
  
  FOR EACH client IN activeClients DO
    billingDate = client.customBillingDate OR 1st of current month
    
    IF billingDate = today THEN
      TRY
        GenerateInvoice(client.id, today)
      CATCH error
        logError(error, client.id)
      END TRY
    END IF
  END FOR
END FUNCTION
```

### Record Payment
```
FUNCTION RecordPayment(clientId, amount, paymentMethod, paymentDate, referenceNumber)
  IF amount ≤ 0 THEN RETURN error
  
  paymentNumber = getNextPaymentNumber()
  
  BEGIN TRANSACTION
    payment = createPayment({
      paymentNumber, clientId, amount, paymentMethod,
      paymentDate, referenceNumber
    })
    
    remainingAmount = amount
    invoices = findOutstandingInvoices(clientId, orderBy: invoiceDate ASC)
    
    FOR EACH invoice IN invoices DO
      IF remainingAmount ≤ 0 THEN BREAK
      
      amountToApply = MIN(remainingAmount, invoice.balance)
      
      updateInvoice(invoice.id, {
        amountPaid: invoice.amountPaid + amountToApply,
        balance: invoice.balance - amountToApply,
        status: IF balance = 0 THEN PAID ELSE PARTIALLY_PAID
      })
      
      updatePayment(payment.id, {
        invoiceId: invoice.id,
        appliedToInvoice: amountToApply
      })
      
      remainingAmount = remainingAmount - amountToApply
    END FOR
    
    IF remainingAmount > 0 THEN
      updatePayment(payment.id, {
        excessAmount: remainingAmount
      })
      updateClientCredit(clientId, balance + remainingAmount)
    END IF
  COMMIT TRANSACTION
  
  RETURN payment
END FUNCTION
```

### Get Client Outstanding Balance
```
FUNCTION GetClientOutstandingBalance(clientId)
  invoices = findAllInvoicesByClient(clientId)
  
  totalOutstanding = 0
  FOR EACH invoice IN invoices DO
    IF invoice.status != PAID AND invoice.status != CANCELLED THEN
      totalOutstanding = totalOutstanding + invoice.balance
    END IF
  END FOR
  
  RETURN totalOutstanding
END FUNCTION
```

### Get Client Credit Balance
```
FUNCTION GetClientCreditBalance(clientId)
  clientCredit = findClientCredit(clientId)
  RETURN clientCredit.balance
END FUNCTION
```

### Update Invoice Status (Manual)
```
FUNCTION UpdateInvoiceStatus(invoiceId, newStatus)
  invoice = findInvoiceById(invoiceId)
  
  IF NOT isValidStatusTransition(invoice.status, newStatus) THEN
    RETURN error
  END IF
  
  updateInvoice(invoiceId, { status: newStatus })
  RETURN invoice
END FUNCTION
```

### Get Next Sequential Invoice Number
```
FUNCTION GetNextInvoiceNumber()
  // Use database sequence or atomic counter
  lastInvoiceNumber = findLastInvoiceNumber()
  
  IF lastInvoiceNumber IS NULL THEN
    RETURN "INV-2024-0001"
  END IF
  
  // Extract numeric part and increment
  numericPart = extractNumber(lastInvoiceNumber)
  nextNumber = numericPart + 1
  
  RETURN "INV-" + currentYear + "-" + padZeros(nextNumber, 4)
END FUNCTION
```

---

## API Endpoints Summary

### Invoice Endpoints
- `POST /invoices/generate` - Generate invoice for single client
- `POST /invoices/generate-all` - Auto-generate invoices for all due clients (cron trigger)
- `GET /invoices/:id` - Get invoice by ID
- `GET /invoices/client/:clientId` - List invoices by client
- `GET /invoices` - List all invoices (with filters: status, date range, client)
- `PATCH /invoices/:id/status` - Update invoice status

### Payment Endpoints
- `POST /payments` - Record payment (auto-applies to invoices)
- `GET /payments/:id` - Get payment by ID
- `GET /payments/client/:clientId` - List payments by client
- `GET /payments` - List all payments (with filters: method, date range, client)

### Client Balance Endpoints
- `GET /clients/:id/outstanding` - Get client outstanding balance
- `GET /clients/:id/credit` - Get client credit balance

---

## Implementation Checklist

### Database Schema
- [ ] Create Invoice table with all fields and indexes
- [ ] Create Payment table with all fields and indexes
- [ ] Create ClientCredit table with all fields
- [ ] Set up foreign key constraints
- [ ] Create database sequences for invoice/payment numbers
- [ ] Add indexes on: clientId, invoiceDate, status, paymentDate

### Entity Models
- [ ] Define Invoice entity with TypeORM decorators
- [ ] Define Payment entity with TypeORM decorators
- [ ] Define ClientCredit entity with TypeORM decorators
- [ ] Set up entity relations (ManyToOne, OneToMany, OneToOne)
- [ ] Add validation decorators (class-validator)

### Services
- [ ] InvoiceService: CRUD + generation logic
- [ ] PaymentService: CRUD + application logic
- [ ] ClientCreditService: balance management
- [ ] Implement transaction wrappers for critical operations

### Controllers
- [ ] InvoiceController: all invoice endpoints
- [ ] PaymentController: all payment endpoints
- [ ] Add DTOs for request/response validation
- [ ] Add proper error handling and status codes

### Cron Jobs
- [ ] Set up ScheduleModule in app.module
- [ ] Create auto-invoice generation cron (1st of month)
- [ ] Create overdue invoice checker cron (daily)
- [ ] Add logging for cron job execution

### Business Logic
- [ ] Implement sequential numbering (thread-safe)
- [ ] Implement payment application algorithm (oldest first)
- [ ] Implement credit application on invoice generation
- [ ] Add status transition validation
- [ ] Prevent duplicate invoice generation

### Testing
- [ ] Unit tests for invoice generation
- [ ] Unit tests for payment application
- [ ] Integration tests for payment → invoice → credit flow
- [ ] Test edge cases: excess payment, partial payment, no outstanding invoices
- [ ] Test cron job execution

---

## Implementation Order (Start Here!)

### Recommended Build Sequence

Build modules in order of **independence** (least dependent → most dependent):

```
1. ClientCredit (no dependencies)
      ↓
2. Invoice (depends on ClientCredit)
      ↓
3. Payment (depends on Invoice + ClientCredit)
```

---

### Phase 1: ClientCredit Module (Day 1-2)
**Why first:** Most independent, simplest entity, no complex logic

**Checklist:**
- [ ] Create `client-credit.entity.ts`
- [ ] Create `client-credit.service.ts` (no controller needed - internal only)
- [ ] Implement `getCredit(clientId)`
- [ ] Implement `updateBalance(clientId, amount)`
- [ ] Implement `createCredit(clientId)` - called when client is created
- [ ] Write unit tests for balance updates
- [ ] Test edge cases (negative balance prevention)

**What to build:**
```typescript
// Service methods only
- getCredit(clientId): Promise<ClientCredit>
- createCredit(clientId): Promise<ClientCredit>
- updateBalance(clientId, amount): Promise<ClientCredit>
- incrementBalance(clientId, amount): Promise<ClientCredit>
- decrementBalance(clientId, amount): Promise<ClientCredit>
```

**Testing focus:**
- Balance always ≥ 0
- One credit record per client
- Concurrent updates handled correctly

---

### Phase 2: Invoice Module (Day 3-5)
**Why second:** Depends only on ClientCredit (already done), Payment will depend on this

**Checklist:**
- [ ] Create `invoice.entity.ts` with all fields and relations
- [ ] Create `invoice.service.ts`
- [ ] Create `invoice.controller.ts`
- [ ] Implement `generateInvoice(clientId, date)` with credit application
- [ ] Implement `getNextInvoiceNumber()` with sequential logic
- [ ] Implement status transition validation
- [ ] Add CRUD endpoints (GET, LIST with filters, PATCH status)
- [ ] Set up `@Cron` job for auto-generation
- [ ] Write unit tests for invoice generation
- [ ] Write integration tests for credit application
- [ ] Test idempotency (no duplicate invoices for same period)

**What to build:**
```typescript
// Service methods
- generateInvoice(clientId, billingDate): Promise<Invoice>
- generateAllDueInvoices(): Promise<Invoice[]>
- getNextInvoiceNumber(): Promise<string>
- findById(id): Promise<Invoice>
- findByClient(clientId): Promise<Invoice[]>
- findAll(filters): Promise<Invoice[]>
- updateStatus(id, status): Promise<Invoice>
- findOutstandingByClient(clientId): Promise<Invoice[]>

// Controller endpoints
POST /invoices/generate
POST /invoices/generate-all (also triggered by cron)
GET /invoices/:id
GET /invoices/client/:clientId
GET /invoices
PATCH /invoices/:id/status
```

**Testing focus:**
- Invoice generation applies credit correctly
- Sequential numbering (no gaps, no duplicates)
- Status transitions follow rules
- Deactivated clients skipped
- Cron job executes on schedule

---

### Phase 3: Payment Module (Day 6-8)
**Why last:** Most complex, depends on both Invoice and ClientCredit

**Checklist:**
- [ ] Create `payment.entity.ts` with all fields and relations
- [ ] Create `payment.service.ts`
- [ ] Create `payment.controller.ts`
- [ ] Implement `recordPayment(data)` with transaction wrapper
- [ ] Implement `applyPaymentToInvoices(payment, clientId)` with FIFO logic
- [ ] Implement `getNextPaymentNumber()` with sequential logic
- [ ] Handle partial payments correctly
- [ ] Handle excess payments → ClientCredit
- [ ] Handle no outstanding invoices case
- [ ] Add CRUD endpoints (POST, GET, LIST with filters)
- [ ] Write unit tests for payment application algorithm
- [ ] Write integration tests for full payment → invoice → credit flow
- [ ] Test edge cases (multiple invoices, exact amounts, large excess)

**What to build:**
```typescript
// Service methods
- recordPayment(data): Promise<Payment>
- applyPaymentToInvoices(payment, clientId): Promise<void>
- getNextPaymentNumber(): Promise<string>
- findById(id): Promise<Payment>
- findByClient(clientId): Promise<Payment[]>
- findAll(filters): Promise<Payment[]>

// Controller endpoints
POST /payments
GET /payments/:id
GET /payments/client/:clientId
GET /payments
```

**Testing focus:**
- FIFO application (oldest invoice first)
- Partial payment tracking
- Excess to credit calculation
- Multi-invoice payment scenarios
- Transaction rollback on errors
- No outstanding invoices case

---

### Phase 4: Integration & Balance Endpoints (Day 9)
**After all modules are built**

**Checklist:**
- [ ] Add `GET /clients/:id/outstanding` endpoint
- [ ] Add `GET /clients/:id/credit` endpoint
- [ ] Write end-to-end tests:
  - [ ] Generate invoice → record payment → verify balances
  - [ ] Payment with excess → verify credit → generate new invoice → verify credit applied
  - [ ] Multiple invoices → single large payment → verify FIFO application
  - [ ] Payment with no invoices → verify goes to credit
- [ ] Load testing for sequential numbering
- [ ] Test cron job in production-like environment

---

## Module Structure

```
billing-payments/
├── billing-payments.module.ts (parent module)
│
├── client-credit/
│   ├── client-credit.entity.ts
│   └── client-credit.service.ts
│
├── invoices/
│   ├── invoice.module.ts
│   ├── invoice.entity.ts
│   ├── invoice.service.ts
│   ├── invoice.controller.ts
│   └── dto/
│       ├── generate-invoice.dto.ts
│       ├── update-invoice-status.dto.ts
│       └── invoice-response.dto.ts
│
└── payments/
    ├── payment.module.ts
    ├── payment.entity.ts
    ├── payment.service.ts
    ├── payment.controller.ts
    └── dto/
        ├── record-payment.dto.ts
        └── payment-response.dto.ts
```

---

## Why This Order Works

1. **ClientCredit is a pure data store** - Simple getters/setters, no business logic, no dependencies

2. **Invoice can be built and tested independently** - Generate invoices, apply credits, test cron jobs - no payments needed yet

3. **Payment is the orchestrator** - Uses both Invoice and ClientCredit services, so they must exist and be tested first

4. **Each phase is testable in isolation** - You can verify each module works before moving to the next

5. **Reduces debugging complexity** - When Payment has issues, you know Invoice and ClientCredit are solid

---

## Sequential Numbering with UUID Primary Keys

### Problem
- Need UUID for `id` (primary key) for relationships
- Need sequential, human-readable numbers for invoices/payments (e.g., INV-2024-0001)

### Solution: Separate Sequence from Primary Key

**Use UUID for `id` + separate database sequence for invoice/payment numbers**

---

### Database Sequence Approach (Recommended)

#### Step 1: Create Database Sequences (Migration)

```typescript
// migration: create-sequences.migration.ts
export class CreateSequences1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Invoice sequence
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS invoice_number_seq 
      START WITH 1 
      INCREMENT BY 1;
    `);
    
    // Payment sequence
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS payment_number_seq 
      START WITH 1 
      INCREMENT BY 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS invoice_number_seq;`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS payment_number_seq;`);
  }
}
```

#### Step 2: Entity Definition

```typescript
// invoice.entity.ts
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // ← UUID primary key for relationships

  @Column({ unique: true, nullable: false })
  invoiceNumber: string;  // ← Sequential string (e.g., "INV-2024-0001")

  @Column()
  clientId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;
  
  // ... other fields
}
```

#### Step 3: Repository Implementation (Infrastructure Layer)

```typescript
// invoice.repository.ts
@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repo: Repository<Invoice>,
    private readonly dataSource: DataSource,  // ← For raw SQL queries
  ) {}

  async getNextInvoiceNumber(): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    
    try {
      // Get next number from PostgreSQL sequence
      const result = await queryRunner.query(
        `SELECT nextval('invoice_number_seq') as next_number`
      );
      
      const sequenceNumber = result[0].next_number;  // e.g., 1, 2, 3...
      const year = new Date().getFullYear();         // e.g., 2024
      
      // Format: INV-2024-0001
      return `INV-${year}-${String(sequenceNumber).padStart(4, '0')}`;
      
    } finally {
      await queryRunner.release();  // Always close connection
    }
  }

  async save(invoice: Invoice): Promise<Invoice> {
    return this.repo.save(invoice);
  }

  async findById(id: string): Promise<Invoice> {
    return this.repo.findOne({ where: { id } });
  }
  
  // ... other methods
}
```

#### Step 4: Use Case Implementation (Application Layer)

```typescript
// generate-invoice.use-case.ts
@Injectable()
export class GenerateInvoiceUseCase {
  constructor(
    @Inject('IInvoiceRepository')
    private readonly invoiceRepo: IInvoiceRepository,
    @Inject('IClientCreditRepository')
    private readonly creditRepo: IClientCreditRepository,
  ) {}

  async execute(clientId: string, billingDate: Date): Promise<Invoice> {
    // 1. Get next invoice number from repository
    const invoiceNumber = await this.invoiceRepo.getNextInvoiceNumber();
    // Returns: "INV-2024-0001", "INV-2024-0002", etc.

    // 2. Create invoice entity
    const invoice = new Invoice();
    invoice.invoiceNumber = invoiceNumber;  // ← Sequential number
    invoice.clientId = clientId;
    // ... set other fields

    // 3. Save invoice
    return await this.invoiceRepo.save(invoice);
  }
}
```

---

### How It Works

1. **Database Sequence**: PostgreSQL manages a counter (1, 2, 3...)
   - Thread-safe (no race conditions)
   - Atomic (no duplicates)
   - Fast (no table locking)

2. **Format in Application**: Convert number to human-readable string
   - Sequence: `1` → Format: `INV-2024-0001`
   - Sequence: `42` → Format: `INV-2024-0042`
   - Sequence: `1000` → Format: `INV-2024-1000`

3. **Store as String**: Save formatted string in `invoiceNumber` column
   - Unique constraint prevents duplicates
   - Easy to display and search

4. **UUID Remains Primary Key**: Used for all relationships and foreign keys

---

### Payment Sequential Numbering (Same Pattern)

```typescript
// payment.repository.ts
async getNextPaymentNumber(): Promise<string> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  
  try {
    const result = await queryRunner.query(
      `SELECT nextval('payment_number_seq') as next_number`
    );
    
    const sequenceNumber = result[0].next_number;
    const year = new Date().getFullYear();
    
    return `PAY-${year}-${String(sequenceNumber).padStart(4, '0')}`;
    
  } finally {
    await queryRunner.release();
  }
}
```

---

### Alternative: Table Lock Approach (Simpler but Slower)

If database sequences seem complex, use table locking:

```typescript
async getNextInvoiceNumber(): Promise<string> {
  // Find last invoice with pessimistic lock
  const lastInvoice = await this.repo.findOne({
    order: { invoiceNumber: 'DESC' },
    lock: { mode: 'pessimistic_write' },  // ← Prevents concurrent access
  });

  let nextNumber = 1;
  if (lastInvoice) {
    // Extract number from "INV-2024-0001"
    const match = lastInvoice.invoiceNumber.match(/\d+$/);
    nextNumber = parseInt(match[0]) + 1;
  }

  const year = new Date().getFullYear();
  return `INV-${year}-${String(nextNumber).padStart(4, '0')}`;
}
```

**Pros:** No database sequence needed, simpler setup
**Cons:** Slower (locks table), more complex parsing logic

---

### Clean Architecture Integration

```
┌─────────────────────────────────────┐
│   Interface Layer (Controller)      │
│   - POST /invoices/generate          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Application Layer (Use Case)      │
│   - GenerateInvoiceUseCase           │
│   - Calls: getNextInvoiceNumber()    │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Infrastructure Layer (Repository) │
│   - InvoiceRepository                │
│   - getNextInvoiceNumber()           │
│   - Uses: DataSource.query()         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│   Database (PostgreSQL)              │
│   - invoice_number_seq               │
│   - SELECT nextval(...)              │
└─────────────────────────────────────┘
```

---

### Module Setup

```typescript
// invoice.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
  ],
  providers: [
    // Repository
    {
      provide: 'IInvoiceRepository',
      useClass: InvoiceRepository,
    },
    // Use cases
    GenerateInvoiceUseCase,
  ],
  controllers: [InvoiceController],
  exports: ['IInvoiceRepository'],
})
export class InvoiceModule {}
```

---

### Key Benefits

1. **UUID Primary Key**: Perfect for distributed systems and relationships
2. **Sequential Numbers**: Human-readable, easy to reference (INV-2024-0001)
3. **Thread-Safe**: Multiple users can generate invoices simultaneously
4. **No Gaps**: Sequence guarantees continuous numbering
5. **Auditable**: Sequential numbers make it easy to spot missing invoices

---

### Testing Sequential Numbers

```typescript
describe('Invoice Sequential Numbering', () => {
  it('should generate sequential invoice numbers', async () => {
    const invoice1 = await generateInvoiceUseCase.execute(clientId, new Date());
    const invoice2 = await generateInvoiceUseCase.execute(clientId, new Date());
    
    expect(invoice1.invoiceNumber).toBe('INV-2024-0001');
    expect(invoice2.invoiceNumber).toBe('INV-2024-0002');
  });

  it('should handle concurrent generation', async () => {
    const promises = Array(10).fill(null).map(() => 
      generateInvoiceUseCase.execute(clientId, new Date())
    );
    
    const invoices = await Promise.all(promises);
    const numbers = invoices.map(inv => inv.invoiceNumber);
    
    // All numbers should be unique
    expect(new Set(numbers).size).toBe(10);
  });
});
```

---

## Notes for Development

1. **Transaction Safety**: Always wrap operations that modify multiple entities (payment application, invoice generation with credit) in database transactions.

2. **Sequential Numbering**: Use database sequences (PostgreSQL `nextval()`) for thread-safe, atomic sequential numbering. Never use auto-increment on UUID primary keys.

3. **Concurrency**: Database sequences prevent race conditions - multiple users can generate invoices simultaneously without conflicts.

4. **Audit Trail**: The immutability of invoices and payments creates a natural audit trail. Never delete, only cancel/archive.

5. **Performance**: Add database indexes on frequently queried fields (clientId, status, invoiceDate, paymentDate, invoiceNumber).

6. **Validation**: Validate all monetary amounts to prevent negative values or precision issues (use decimal type, not float).

7. **Error Handling**: Log all errors in cron jobs - they run unattended and failures must be visible.

8. **Testing**: Test the payment application logic extensively - it's the most complex part of the module. Also test sequential numbering under concurrent load.

9. **Start Simple**: Build each module with basic CRUD first, then add complex logic (generation, application, cron).

10. **DataSource Injection**: Inject `DataSource` alongside repository for raw SQL queries (sequences). Use repository for normal CRUD.
