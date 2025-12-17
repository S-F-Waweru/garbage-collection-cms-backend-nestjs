# TypeORM Query Building & Reports - Complete Guide

## Table of Contents
1. [Core Principles](#core-principles)
2. [Query Building Foundations](#query-building-foundations)
3. [Common Patterns](#common-patterns)
4. [Debugging Guide](#debugging-guide)
5. [Performance Optimization](#performance-optimization)
6. [Testing Strategies](#testing-strategies)

---

## Core Principles

### 1. Always Quote Identifiers in PostgreSQL

PostgreSQL is **case-sensitive** when identifiers aren't quoted. TypeORM doesn't automatically quote everything.

```typescript
// ❌ WRONG - Will fail or behave unexpectedly
.select('c.firstName')
.where('c.isActive = true')
.leftJoin('clients', 'c', 'i.clientId = c.id')

// ✅ CORRECT - Explicit quoting
.select('"c"."firstName"')
.where('"c"."isActive" = true')
.leftJoin('clients', 'c', '"i"."clientId" = "c"."id"')
```

**Rule**: Quote ALL table aliases and column names in raw queries.

---

### 2. Soft Delete Pattern

Always exclude soft-deleted records in joins and where clauses.

```typescript
// ✅ In WHERE clause
.where('"table"."deletedAt" IS NULL')

// ✅ In JOIN conditions
.leftJoin('clients', 'c', '"i"."clientId" = "c"."id" AND "c"."deletedAt" IS NULL')

// ❌ WRONG - Missing soft delete check
.leftJoin('clients', 'c', '"i"."clientId" = "c"."id"')
```

**Why?** Prevents ghost data from appearing in reports.

---

### 3. Type Casting for UUIDs

UUID comparisons often require explicit type casting in PostgreSQL.

```typescript
// If comparing string to UUID
'"column"::uuid = "otherColumn"'

// If comparing UUID to string  
'"column" = "otherColumn"::uuid'

// Common in user joins
.leftJoin('users', 'u', '"pc"."createdBy"::uuid = "u"."id"')
```

**When needed?** When you see error: `operator does not exist: character varying = uuid`

---

### 4. SELECT vs addSelect

Use `.select()` to **replace** all selections, `.addSelect()` to **add** to existing.

```typescript
// Option 1: Array in select()
.select([
  '"i"."id"',
  '"i"."total"',
  '"c"."name"'
])

// Option 2: Multiple addSelect()
.select('"i"."id"')
.addSelect('"i"."total"')
.addSelect('"c"."name"')

// ❌ WRONG - Second select() replaces first
.select('"i"."id"')
.select('"c"."name"')  // Only this will be selected
```

---

## Query Building Foundations

### Basic Query Structure

```typescript
async getReport(filters?: Filters): Promise<Results[]> {
  // 1. Initialize query builder
  let query = this.dataSource
    .createQueryBuilder()
    
  // 2. Define selections
    .select([
      '"alias"."column" as "outputName"',
      'AGGREGATE("alias"."column") as "aggregateName"'
    ])
    
  // 3. Define main table
    .from('table_name', 'alias')
    
  // 4. Add joins (if needed)
    .leftJoin('related_table', 'rt', '"alias"."fk" = "rt"."id" AND "rt"."deletedAt" IS NULL')
    
  // 5. Base WHERE conditions
    .where('"alias"."deletedAt" IS NULL')
    .andWhere('"alias"."status" = :status', { status: 'ACTIVE' })
    
  // 6. Apply dynamic filters
  if (filters?.startDate) {
    query = query.andWhere('"alias"."date" >= :startDate', {
      startDate: filters.startDate,
    });
  }
  
  // 7. Grouping (if using aggregates)
  query = query.groupBy('"alias"."column1", "alias"."column2"')
  
  // 8. Ordering
  query = query.orderBy('"alias"."column"', 'DESC')
  
  // 9. Execute
  const results = await query.getRawMany();
  
  // 10. Transform results (if needed)
  return results.map(r => ({
    ...r,
    amount: parseFloat(r.amount || 0),
    count: parseInt(r.count || 0)
  }));
}
```

---

## Common Patterns

### Pattern 1: Simple List Report

No aggregations, just filtering and joining.

```typescript
async getInvoiceList(filters?: Filters): Promise<Invoice[]> {
  let query = this.dataSource
    .createQueryBuilder()
    .select([
      '"i"."id" as "invoiceId"',
      '"i"."invoiceNumber" as "invoiceNumber"',
      '"i"."invoiceDate" as "invoiceDate"',
      '"i"."totalAmount" as "totalAmount"',
      '"c"."firstName" as "clientFirstName"',
      '"c"."lastName" as "clientLastName"',
    ])
    .from('invoices', 'i')
    .leftJoin('clients', 'c', '"i"."clientId" = "c"."id" AND "c"."deletedAt" IS NULL')
    .where('"i"."deletedAt" IS NULL');

  // Apply filters
  if (filters?.clientId) {
    query = query.andWhere('"i"."clientId" = :clientId', {
      clientId: filters.clientId,
    });
  }

  if (filters?.status) {
    query = query.andWhere('"i"."status" = :status', {
      status: filters.status,
    });
  }

  query = query.orderBy('"i"."invoiceDate"', 'DESC');

  return query.getRawMany();
}
```

---

### Pattern 2: Aggregation Report

Group data and calculate totals, counts, averages.

```typescript
async getSalesSummary(filters?: Filters): Promise<Summary[]> {
  let query = this.dataSource
    .createQueryBuilder()
    .select([
      '"c"."id" as "clientId"',
      '"c"."firstName" as "clientFirstName"',
      '"c"."lastName" as "clientLastName"',
      'COUNT("i"."id") as "invoiceCount"',
      'SUM("i"."totalAmount") as "totalSales"',
      'SUM("i"."amountPaid") as "totalPaid"',
      'AVG("i"."totalAmount") as "averageInvoice"',
      'MAX("i"."invoiceDate") as "lastInvoiceDate"',
    ])
    .from('invoices', 'i')
    .leftJoin('clients', 'c', '"i"."clientId" = "c"."id" AND "c"."deletedAt" IS NULL')
    .where('"i"."deletedAt" IS NULL')
    .andWhere('"i"."status" != :cancelled', { cancelled: 'CANCELLED' });

  if (filters?.startDate) {
    query = query.andWhere('"i"."invoiceDate" >= :startDate', {
      startDate: filters.startDate,
    });
  }

  // GROUP BY: Include all non-aggregated columns
  query = query
    .groupBy('"c"."id", "c"."firstName", "c"."lastName"')
    .orderBy('"totalSales"', 'DESC');

  const results = await query.getRawMany();

  // Convert string numbers to proper types
  return results.map(r => ({
    ...r,
    invoiceCount: parseInt(r.invoiceCount || 0),
    totalSales: parseFloat(r.totalSales || 0),
    totalPaid: parseFloat(r.totalPaid || 0),
    averageInvoice: parseFloat(r.averageInvoice || 0),
  }));
}
```

**Key Rule**: Every column in SELECT that's NOT an aggregate function MUST be in GROUP BY.

---

### Pattern 3: Multi-Level Joins

Navigate through relationships: Client → Buildings → Location

```typescript
async getClientsByLocation(filters?: Filters): Promise<Report[]> {
  let query = this.dataSource
    .createQueryBuilder()
    .select([
      '"l"."city" as "city"',
      '"l"."region" as "region"',
      'COUNT(DISTINCT "c"."id") as "clientCount"',
      'COUNT("b"."id") as "buildingCount"',
      'SUM("b"."numberOfUnits") as "totalUnits"',
    ])
    .from('clients', 'c')
    .leftJoin('buildings', 'b', '"b"."clientId" = "c"."id" AND "b"."deletedAt" IS NULL')
    .leftJoin('locations', 'l', '"b"."locationId" = "l"."id" AND "l"."deletedAt" IS NULL')
    .where('"c"."deletedAt" IS NULL')
    .andWhere('"c"."isActive" = true');

  if (filters?.city) {
    query = query.andWhere('"l"."city" = :city', { city: filters.city });
  }

  query = query
    .groupBy('"l"."city", "l"."region"')
    .orderBy('"clientCount"', 'DESC');

  const results = await query.getRawMany();

  return results.map(r => ({
    ...r,
    clientCount: parseInt(r.clientCount || 0),
    buildingCount: parseInt(r.buildingCount || 0),
    totalUnits: parseInt(r.totalUnits || 0),
  }));
}
```

---

### Pattern 4: String Concatenation

Combine multiple columns into one output.

```typescript
// Full name
'CONCAT("u"."firstName", \' \', "u"."lastName") as "fullName"'

// Address with comma
'CONCAT("l"."city", \', \', "l"."region") as "location"'

// Custom format
'CONCAT("c"."firstName", \' \', "c"."lastName", \' (\', "c"."email", \')\') as "clientInfo"'
```

---

### Pattern 5: Conditional Logic (CASE)

Calculate values based on conditions.

```typescript
// Days overdue
'CASE WHEN "i"."dueDate" < CURRENT_DATE THEN CURRENT_DATE - "i"."dueDate" ELSE 0 END as "daysOverdue"'

// Status label
'CASE WHEN "i"."balance" = 0 THEN \'Paid\' WHEN "i"."balance" > 0 THEN \'Unpaid\' ELSE \'Unknown\' END as "paymentStatus"'

// Age groups
'CASE WHEN "age" < 18 THEN \'Minor\' WHEN "age" < 65 THEN \'Adult\' ELSE \'Senior\' END as "ageGroup"'
```

---

### Pattern 6: Date Filtering

Common date range patterns.

```typescript
// Date range
if (filters?.startDate) {
  query = query.andWhere('"table"."date" >= :startDate', {
    startDate: filters.startDate,
  });
}

if (filters?.endDate) {
  query = query.andWhere('"table"."date" <= :endDate', {
    endDate: filters.endDate,
  });
}

// Current month
.andWhere('"table"."date" >= DATE_TRUNC(\'month\', CURRENT_DATE)')
.andWhere('"table"."date" < DATE_TRUNC(\'month\', CURRENT_DATE) + INTERVAL \'1 month\'')

// Last 30 days
.andWhere('"table"."date" >= CURRENT_DATE - INTERVAL \'30 days\'')

// Specific year
.andWhere('EXTRACT(YEAR FROM "table"."date") = :year', { year: 2025 })
```

---

### Pattern 7: Subqueries

Use subqueries for complex calculations.

```typescript
async getClientsWithLastPayment(): Promise<Report[]> {
  const query = this.dataSource
    .createQueryBuilder()
    .select([
      '"c"."id" as "clientId"',
      '"c"."firstName" as "firstName"',
      '(SELECT MAX("p"."paymentDate") FROM "payments" "p" INNER JOIN "invoices" "i2" ON "p"."invoiceId" = "i2"."id" WHERE "i2"."clientId" = "c"."id") as "lastPaymentDate"',
      '(SELECT SUM("i3"."balance") FROM "invoices" "i3" WHERE "i3"."clientId" = "c"."id" AND "i3"."deletedAt" IS NULL) as "totalOutstanding"',
    ])
    .from('clients', 'c')
    .where('"c"."deletedAt" IS NULL');

  return query.getRawMany();
}
```

---

### Pattern 8: HAVING Clause

Filter aggregated results (use HAVING instead of WHERE for aggregates).

```typescript
query = query
  .groupBy('"c"."id"')
  .having('SUM("i"."totalAmount") > :minAmount', { minAmount: 10000 })
  .andHaving('COUNT("i"."id") >= :minCount', { minCount: 5 });
```

---

## Debugging Guide

### Error: "column X does not exist"

**Cause**: Missing quotes or wrong column name

```typescript
// ❌ Error
'c.name as "clientName"'

// ✅ Fix
'"c"."name" as "clientName"'
```

**Steps to fix**:
1. Add double quotes around alias and column: `"alias"."column"`
2. Check entity file for actual column name
3. Verify column exists in database

---

### Error: "relation X does not exist"

**Cause**: Wrong table name

```typescript
// ❌ Error
.from('petty_cash', 'pc')

// ✅ Fix - Check entity decorator
.from('petty_cashes', 'pc')  // From @Entity('petty_cashes')
```

**Steps to fix**:
1. Check `@Entity('table_name')` in entity file
2. Use exact table name from decorator
3. Verify table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'your_table';`

---

### Error: "operator does not exist: character varying = uuid"

**Cause**: Type mismatch between columns

```typescript
// ❌ Error
'"pc"."createdBy" = "u"."id"'

// ✅ Fix - Cast to UUID
'"pc"."createdBy"::uuid = "u"."id"'

// Or reverse
'"pc"."createdBy" = "u"."id"::uuid'
```

**Steps to fix**:
1. Identify which column is UUID and which is string
2. Cast the string column to UUID with `::uuid`
3. Check entity definitions for column types

---

### Error: "syntax error at or near"

**Cause**: Missing quotes, commas, or brackets

```typescript
// ❌ Missing closing quote
'c.firstName as "clientFirstName'

// ✅ Fix
'c.firstName as "clientFirstName"'

// ❌ Missing comma
.select([
  '"i"."id"'
  '"i"."total"'
])

// ✅ Fix
.select([
  '"i"."id"',
  '"i"."total"'
])
```

---

### Error: "column must appear in GROUP BY"

**Cause**: Selected column not included in GROUP BY

```typescript
// ❌ Error - firstName selected but not in GROUP BY
.select([
  '"c"."id"',
  '"c"."firstName"',
  'SUM("i"."total") as "total"'
])
.groupBy('"c"."id"')

// ✅ Fix - Add to GROUP BY
.groupBy('"c"."id", "c"."firstName"')
```

**Rule**: All non-aggregate columns in SELECT must be in GROUP BY.

---

### Debugging Workflow

```typescript
// 1. Start simple - test table access
const test1 = await this.dataSource
  .createQueryBuilder()
  .select('"t"."id"')
  .from('table_name', 't')
  .limit(1)
  .getRawMany();

console.log('Table accessible:', test1);

// 2. Add columns one by one
const test2 = await this.dataSource
  .createQueryBuilder()
  .select([
    '"t"."id"',
    '"t"."column1"',  // Add one
    // '"t"."column2"',  // Then add next
  ])
  .from('table_name', 't')
  .getRawMany();

// 3. Add joins one by one
const test3 = await query
  .leftJoin('related', 'r', '"t"."fk" = "r"."id"')  // Add first join
  // .leftJoin('another', 'a', ...)  // Then add next
  .getRawMany();

// 4. Log generated SQL
const sql = query.getSql();
const params = query.getParameters();
console.log('SQL:', sql);
console.log('Params:', params);

// 5. Test SQL directly in database
// Copy logged SQL and run in pgAdmin or psql
```

---

## Performance Optimization

### 1. Use Indexes

Ensure indexes on frequently filtered/joined columns:

```sql
-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'invoices';

-- Create indexes if needed
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
```

---

### 2. Limit Results

Always paginate large result sets:

```typescript
query = query
  .limit(filters?.limit || 100)
  .offset(filters?.offset || 0);
```

---

### 3. Select Only Needed Columns

Don't select `*`, specify exact columns:

```typescript
// ❌ Bad - Fetches all columns
.select('*')

// ✅ Good - Only what you need
.select(['"i"."id"', '"i"."total"'])
```

---

### 4. Use EXPLAIN for Slow Queries

```typescript
// Get query plan
const sql = query.getSql();
const explainSql = `EXPLAIN ANALYZE ${sql}`;

// Run in database to see performance
```

---

### 5. Cache Frequent Reports

```typescript
// Example with simple caching
private reportCache = new Map<string, { data: any; timestamp: number }>();

async getCachedReport(cacheKey: string, ttl = 300000): Promise<any> {
  const cached = this.reportCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await this.generateReport();
  this.reportCache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

---

## Testing Strategies

### 1. Unit Test Query Results

```typescript
describe('ReportRepository', () => {
  it('should return outstanding balances', async () => {
    const result = await repository.getOutstandingBalances();
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('invoiceId');
      expect(result[0]).toHaveProperty('balance');
      expect(typeof result[0].balance).toBe('number');
    }
  });
});
```

---

### 2. Test with Edge Cases

```typescript
// Empty result set
const empty = await repository.getReport({
  startDate: '2099-01-01',
  endDate: '2099-12-31'
});
expect(empty).toEqual([]);

// Single record
const single = await repository.getReport({
  clientId: 'specific-uuid'
});
expect(single.length).toBeLessThanOrEqual(1);

// Null handling
const withNulls = await repository.getReport();
expect(() => withNulls.map(r => r.amount)).not.toThrow();
```

---

### 3. Verify Data Integrity

```typescript
it('should match manual calculation', async () => {
  // Get report result
  const report = await repository.getRevenueSummary({
    clientId: 'test-id'
  });
  
  // Manually query same data
  const invoices = await dataSource.query(
    'SELECT SUM(total_amount) as total FROM invoices WHERE client_id = $1',
    ['test-id']
  );
  
  // Compare
  expect(report[0].totalInvoiced).toBe(parseFloat(invoices[0].total));
});
```

---

## Best Practices Checklist

- [ ] Quote all identifiers: `"table"."column"`
- [ ] Check soft deletes in all joins
- [ ] Cast UUIDs when needed: `::uuid`
- [ ] Include all SELECT columns in GROUP BY (except aggregates)
- [ ] Use parameterized queries (`:param`)
- [ ] Convert string results to proper types
- [ ] Test queries incrementally
- [ ] Add indexes on filtered/joined columns
- [ ] Limit result sets for performance
- [ ] Handle null values gracefully
- [ ] Log SQL for debugging
- [ ] Use meaningful aliases (i, c, l, etc.)
- [ ] Order results meaningfully
- [ ] Validate filter inputs
- [ ] Document complex queries with comments

---

## Quick Reference: Common Aggregates

```typescript
// Counting
'COUNT("table"."id") as "count"'
'COUNT(DISTINCT "table"."id") as "uniqueCount"'

// Summing
'SUM("table"."amount") as "total"'
'SUM(CASE WHEN "table"."status" = \'paid\' THEN "table"."amount" ELSE 0 END) as "totalPaid"'

// Averaging
'AVG("table"."amount") as "average"'
'ROUND(AVG("table"."amount"), 2) as "avgRounded"'

// Min/Max
'MIN("table"."date") as "firstDate"'
'MAX("table"."date") as "lastDate"'

// String aggregation
'STRING_AGG("table"."name", \', \') as "namesList"'
```

---

## Quick Reference: Date Functions

```typescript
// Formatting
'TO_CHAR("table"."date", \'YYYY-MM-DD\') as "formattedDate"'

// Extraction
'EXTRACT(YEAR FROM "table"."date") as "year"'
'EXTRACT(MONTH FROM "table"."date") as "month"'

// Truncation
'DATE_TRUNC(\'month\', "table"."date") as "monthStart"'
'DATE_TRUNC(\'day\', "table"."date") as "dayStart"'

// Date arithmetic
'CURRENT_DATE - "table"."date" as "daysAgo"'
'"table"."date" + INTERVAL \'30 days\' as "futureDate"'
```