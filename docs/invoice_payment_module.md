# Invoice & Payment Module - Implementation Guide

## Quick Reference: How They Work Together

```
Client Credit ──┐
                ↓
Client ──→ Invoice ──→ Payment ──→ Client Credit (excess)
           (reduces)    (applies)     (increases)
```

---

## 📋 Invoice Module - Step by Step

### Core Concept
**Invoice = Monthly bill for garbage collection based on building units**

### Key Rules
1. Invoice pulls **current** client unit count × unit price (snapshot)
2. Invoice **automatically applies** client credit at generation time
3. Sequential numbering: `INV-2024-0001`, `INV-2024-0002`...
4. Status flow: `PENDING → PARTIALLY_PAID → PAID` (or `OVERDUE`)

---

### Implementation Steps

#### Step 1: Generate Invoice Use Case

```typescript
// generate-invoice.use-case.ts

async execute(dto: GenerateInvoiceDto, userId: string): Promise<Invoice> {
  
  // 1. Get client with buildings
  const client = await this.clientRepo.findById(dto.clientId);
  if (!client) throw new NotFoundException('Client not found');
  
  // 2. Check if invoice already exists for this period
  const exists = await this.invoiceRepo.existsForPeriod(
    dto.clientId, 
    dto.billingPeriodStart, 
    dto.billingPeriodEnd
  );
  if (exists) throw new BadRequestException('Invoice already exists');
  
  // 3. Calculate from buildings (snapshot current state)
  let totalUnits = 0;
  let totalAmount = 0;
  
  for (const building of client.buildings) {
    totalUnits += building.unitCount;
    totalAmount += (building.unitCount * building.unitPrice);
  }
  
  const subtotal = totalAmount;
  
  // 4. Apply client credit (KEY LOGIC)
  const clientCredit = await this.creditRepo.findByClientId(dto.clientId);
  const creditToApply = Math.min(clientCredit.balance, subtotal);
  
  const totalAfterCredit = subtotal - creditToApply;
  
  // 5. Get next invoice number
  const invoiceNumber = await this.invoiceRepo.getNextInvoiceNumber();
  
  // 6. Calculate due date (30 days default)
  const dueDate = new Date(dto.invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  // 7. Determine initial status
  const status = totalAfterCredit === 0 
    ? InvoiceStatus.PAID 
    : InvoiceStatus.PENDING;
  
  // 8. Create invoice entity
  const invoice = Invoice.create({
    invoiceNumber,
    clientId: dto.clientId,
    billingPeriodStart: dto.billingPeriodStart,
    billingPeriodEnd: dto.billingPeriodEnd,
    invoiceDate: dto.invoiceDate || new Date(),
    dueDate,
    unitCount: totalUnits,
    unitPrice: totalAmount / totalUnits, // Average
    subtotal,
    creditApplied: creditToApply,
    totalAmount: totalAfterCredit,
    amountPaid: 0,
    balance: totalAfterCredit,
    status,
    notes: dto.notes,
    createdBy: userId
  });
  
  // 9. Save in transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // Save invoice
    const saved = await this.invoiceRepo.save(invoice);
    
    // Deduct credit if applied
    if (creditToApply > 0) {
      await this.creditRepo.decrementBalance(dto.clientId, creditToApply);
    }
    
    await queryRunner.commitTransaction();
    return saved;
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

#### Step 2: Auto-Generate Cron Job

```typescript
// invoice-cron.service.ts

@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
async handleMonthlyInvoiceGeneration() {
  
  // 1. Get all active clients
  const clients = await this.clientRepo.findAll();
  
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  let generated = 0;
  let failed = 0;
  
  // 2. Generate for each client
  for (const client of clients) {
    try {
      // Check if client's billing date is today
      if (client.billingDate === today.getDate()) {
        
        await this.generateInvoiceUseCase.execute({
          clientId: client.id,
          billingPeriodStart: firstDay,
          billingPeriodEnd: lastDay,
          invoiceDate: today
        }, 'SYSTEM');
        
        generated++;
      }
    } catch (error) {
      this.logger.error(`Failed for client ${client.id}: ${error.message}`);
      failed++;
    }
  }
  
  this.logger.log(`Generated ${generated} invoices, ${failed} failed`);
}
```

#### Step 3: Controller

```typescript
// invoice.controller.ts

@Post('generate')
@UseGuards(JwtAuthGuard)
async generate(@Body() dto: GenerateInvoiceDto, @CurrentUser() user: any) {
  const invoice = await this.generateInvoiceUseCase.execute(dto, user.userId);
  return InvoiceResponseDto.fromDomain(invoice);
}

@Get()
async list(@Query() query: ListInvoicesDto) {
  const filters = {
    clientId: query.clientId,
    status: query.status,
    fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
    toDate: query.toDate ? new Date(query.toDate) : undefined
  };
  return await this.listInvoicesUseCase.execute(filters);
}

@Get(':id')
async getById(@Param('id') id: string) {
  return await this.getInvoiceUseCase.execute(id);
}

@Get('client/:clientId')
async getByClient(@Param('clientId') clientId: string) {
  return await this.listInvoicesUseCase.execute({ clientId });
}

@Patch(':id/status')
async updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
  return await this.updateInvoiceStatusUseCase.execute(id, dto.status);
}
```

---

## 💰 Payment Module - Step by Step

### Core Concept
**Payment = Client pays money → Auto-applies to oldest invoices (FIFO) → Excess goes to credit**

### Key Rules
1. **FIFO**: Always apply to **oldest** unpaid invoice first
2. **Partial payments** supported
3. **Excess** automatically becomes client credit
4. Sequential numbering: `PAY-2024-0001`, `PAY-2024-0002`...

---

### Implementation Steps

#### Step 1: Record Payment Use Case

```typescript
// record-payment.use-case.ts

async execute(dto: RecordPaymentDto, userId: string): Promise<Payment> {
  
  // 1. Validate client exists
  const client = await this.clientRepo.findById(dto.clientId);
  if (!client) throw new BadRequestException('Client not found');
  
  if (dto.amount <= 0) throw new BadRequestException('Amount must be > 0');
  
  // 2. Get next payment number
  const paymentNumber = await this.paymentRepo.getNextPaymentNumber();
  
  // 3. Create payment entity
  const payment = Payment.create({
    paymentNumber,
    clientId: dto.clientId,
    amount: dto.amount,
    paymentMethod: dto.paymentMethod,
    paymentDate: dto.paymentDate,
    referenceNumber: dto.referenceNumber,
    notes: dto.notes,
    createdBy: userId
  });
  
  // 4. Start transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 5. Get outstanding invoices (OLDEST FIRST - FIFO)
    const outstandingInvoices = await this.invoiceRepo.findOutstandingByClient(
      dto.clientId
    );
    
    let remainingAmount = dto.amount;
    
    // 6. Apply to invoices (FIFO)
    for (const invoice of outstandingInvoices) {
      if (remainingAmount <= 0) break;
      
      // How much to apply to this invoice
      const amountToApply = Math.min(remainingAmount, invoice.balance);
      
      // Update invoice
      invoice.applyPayment(amountToApply);
      await this.invoiceRepo.update(invoice.id, invoice);
      
      // Track in payment
      payment.addInvoiceApplication(
        invoice.id,
        invoice.invoiceNumber,
        amountToApply
      );
      
      remainingAmount -= amountToApply;
    }
    
    // 7. If there's excess, add to client credit
    if (remainingAmount > 0) {
      payment.setExcessAmount(remainingAmount);
      await this.creditRepo.incrementBalance(dto.clientId, remainingAmount);
    }
    
    // 8. Save payment
    const savedPayment = await this.paymentRepo.save(payment);
    
    await queryRunner.commitTransaction();
    return savedPayment;
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

#### Step 2: Controller

```typescript
// payment.controller.ts

@Post()
@UseGuards(JwtAuthGuard)
async recordPayment(@Body() dto: RecordPaymentDto, @CurrentUser() user: any) {
  const payment = await this.recordPaymentUseCase.execute(dto, user.userId);
  return PaymentResponseDto.fromDomain(payment);
}

@Get()
async list(@Query() query: ListPaymentsDto) {
  const filters = {
    clientId: query.clientId,
    paymentMethod: query.paymentMethod,
    startDate: query.startDate ? new Date(query.startDate) : undefined,
    endDate: query.endDate ? new Date(query.endDate) : undefined
  };
  return await this.listPaymentsUseCase.execute(filters);
}

@Get(':id')
async getById(@Param('id') id: string) {
  return await this.getPaymentUseCase.execute(id);
}

@Get('client/:clientId')
async getByClient(@Param('clientId') clientId: string) {
  return await this.listPaymentsUseCase.execute({ clientId });
}
```

---

## 🔄 Complete Flow Example

### Scenario: Client with Multiple Invoices Pays

**Setup:**
- Client has 3 outstanding invoices:
  - Invoice #1 (Jan): KES 5,000 balance
  - Invoice #2 (Feb): KES 8,000 balance
  - Invoice #3 (Mar): KES 6,000 balance
- Client Credit: KES 2,000

**Client pays: KES 10,000**

**What happens:**

```
Step 1: Payment recorded (PAY-2024-0001, KES 10,000)

Step 2: Apply to Invoice #1 (oldest)
  - Apply: 5,000
  - Invoice #1: PAID ✅
  - Remaining: 5,000

Step 3: Apply to Invoice #2
  - Apply: 5,000
  - Invoice #2: PARTIALLY_PAID (3,000 balance remains)
  - Remaining: 0

Step 4: No excess, Client Credit unchanged at 2,000

Final State:
  - Invoice #1: PAID
  - Invoice #2: 3,000 balance (PARTIALLY_PAID)
  - Invoice #3: 6,000 balance (PENDING)
  - Client Credit: 2,000
  - Total Outstanding: 9,000
```

---

## 🔑 Key Database Queries

### Get Outstanding Invoices (FIFO)

```typescript
// In invoice.repository.ts

async findOutstandingByClient(clientId: string): Promise<Invoice[]> {
  const schemas = await this.repo
    .createQueryBuilder('invoice')
    .where('invoice.clientId = :clientId', { clientId })
    .andWhere('invoice.balance > 0')
    .andWhere('invoice.status != :cancelled', { 
      cancelled: InvoiceStatus.CANCELLED 
    })
    .orderBy('invoice.invoiceDate', 'ASC') // ← OLDEST FIRST (FIFO)
    .getMany();
  
  return schemas.map(s => this.toDomain(s));
}
```

### Check if Invoice Exists for Period

```typescript
async existsForPeriod(
  clientId: string, 
  periodStart: Date, 
  periodEnd: Date
): Promise<boolean> {
  const count = await this.repo.count({
    where: {
      clientId,
      billingPeriodStart: periodStart,
      billingPeriodEnd: periodEnd
    }
  });
  return count > 0;
}
```

---

## ✅ Testing Checklist

### Invoice Module Tests

```bash
# Test 1: Generate invoice without credit
POST /invoices/generate
{
  "clientId": "...",
  "billingPeriodStart": "2024-01-01",
  "billingPeriodEnd": "2024-01-31"
}
# Expected: Invoice with full amount

# Test 2: Generate invoice with credit
# (Ensure client has credit first)
POST /client-credit/increment
{
  "clientId": "...",
  "amount": 3000
}

POST /invoices/generate
{
  "clientId": "...",
  "billingPeriodStart": "2024-02-01",
  "billingPeriodEnd": "2024-02-29"
}
# Expected: Invoice amount reduced by 3000

# Test 3: Generate duplicate (should fail)
POST /invoices/generate (same period again)
# Expected: 400 Bad Request
```

### Payment Module Tests

```bash
# Test 1: Payment covers full invoice
POST /payments
{
  "clientId": "...",
  "amount": 5000,
  "paymentMethod": "MPESA",
  "paymentDate": "2024-12-16",
  "referenceNumber": "QH12345678"
}
# Expected: Invoice PAID, no excess

# Test 2: Partial payment
POST /payments
{
  "clientId": "...",
  "amount": 3000,
  "paymentMethod": "CASH",
  "paymentDate": "2024-12-16"
}
# Expected: Invoice PARTIALLY_PAID, balance updated

# Test 3: Excess payment
POST /payments
{
  "clientId": "...",
  "amount": 15000,
  "paymentMethod": "BANK",
  "paymentDate": "2024-12-16"
}
# Expected: All invoices PAID, excess to credit

# Test 4: Verify FIFO
# Create 3 invoices, pay amount that covers 1.5 invoices
# Verify oldest is paid first
```

---

## 🚨 Common Pitfalls

### ❌ DON'T:
1. Apply payment to random invoice (must be FIFO)
2. Forget to use transactions
3. Allow negative balances
4. Skip credit application during invoice generation
5. Generate duplicate invoices for same period

### ✅ DO:
1. Always use transactions for multi-step operations
2. Validate amounts > 0
3. Check invoice existence before generating
4. Load client with buildings for invoice generation
5. Order invoices by date (ASC) for FIFO
6. Update both invoice AND credit in same transaction

---

## 📝 Quick Implementation Order

**Week 1:**
1. ✅ Implement `GenerateInvoiceUseCase`
2. ✅ Test invoice generation (with/without credit)
3. ✅ Add invoice controller endpoints
4. ✅ Test via HTTP

**Week 2:**
1. ✅ Implement `RecordPaymentUseCase`
2. ✅ Test FIFO payment application
3. ✅ Test excess to credit flow
4. ✅ Add payment controller endpoints

**Week 3:**
1. ✅ Set up cron job for auto-generation
2. ✅ Add mark overdue cron job
3. ✅ Integration tests (full flow)
4. ✅ Fix any bugs

---

## 💡 Pro Tips

1. **Use DataSource for transactions**, not repository
2. **Always `await queryRunner.release()`** in finally block
3. **Test with real dates** to catch timezone issues
4. **Log everything** in cron jobs (they run unattended)
5. **Round amounts** to 2 decimals to avoid precision issues

```typescript
// Good amount handling
const amount = Math.round(value * 100) / 100;
```

6. **Check client has buildings** before generating invoice
7. **Validate payment date** isn't in future
8. **Consider idempotency** for payment recording

---

## 🔍 Debugging Queries

```sql
-- Check invoice balances
SELECT 
  invoice_number,
  client_id,
  total_amount,
  amount_paid,
  balance,
  status
FROM invoices
WHERE client_id = 'xxx'
ORDER BY invoice_date;

-- Check payment applications
SELECT 
  payment_number,
  amount,
  applied_to_invoices,
  excess_amount
FROM payments
WHERE client_id = 'xxx'
ORDER BY payment_date DESC;

-- Check credit balance
SELECT 
  client_id,
  balance
FROM client_credits
WHERE client_id = 'xxx';
```

---

**Summary:**
- **Invoice**: Snapshot units → Apply credit → Save
- **Payment**: Record → FIFO apply → Excess to credit → Save
- **Both**: Use transactions, validate everything, test thoroughly

Good luck! 🚀
