import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { PasswordHasherService } from '../password-hasher-service/password-hasher-service.service';

import { Role } from '../../../policies/rbac.policy';
import { UserSchema } from '../../../infrastructure/persistence/schema/user.schema';
import { LocationSchema } from '../../../../location/infrastracture/persistence/schema/location.schema';
import { ClientSchema } from '../../../../clients/client/infrastructure/perisistence/schema/client.schema';

@Injectable()
export class DemoSeederService implements OnModuleInit {
  private readonly logger = new Logger(DemoSeederService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordHasher: PasswordHasherService,
  ) {}

  async onModuleInit() {
    if (
      process.env.NODE_ENV !== 'production' &&
      process.env.SEED_DEMO_DATA === 'true'
    ) {
      await this.seedDemoData();
    }
  }

  private getRandomDate(monthsBack = 1): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    date.setDate(15); // deterministic for presentation
    return date;
  }

  async seedDemoData() {
    this.logger.log('Starting slim demo seeding...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const users = await this.seedUsers(queryRunner);
      const adminId = users[0]?.id;
      if (!adminId) throw new Error('Admin user not found');

      const locations = await this.seedLocations(queryRunner);
      const clients = await this.seedClients(queryRunner);
      const buildings = await this.seedBuildings(
        queryRunner,
        clients,
        locations,
      );

      await this.seedClientCredits(queryRunner, clients);
      const pettyCash = await this.seedPettyCash(queryRunner, adminId);
      await this.seedExpenses(queryRunner, pettyCash, adminId);

      const invoices = await this.seedInvoices(queryRunner, buildings, adminId);
      await this.seedPayments(queryRunner, invoices, adminId);

      await queryRunner.commitTransaction();
      this.logger.log('Slim seeding completed');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Slim seeding failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async seedUsers(queryRunner: QueryRunner): Promise<UserSchema[]> {
    const hp = await this.passwordHasher.hash('Demo@123');
    const user = { f: 'Super', l: 'Admin', e: 'admin@demo.com', r: Role.ADMIN };
    const exist = await queryRunner.query(
      'SELECT id FROM users WHERE email = $1',
      [user.e],
    );
    if (exist.length > 0) return exist;

    const res = await queryRunner.query(
      `INSERT INTO users (id, "firstName", "lastName", email, "passwordHash", role, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
      [user.f, user.l, user.e, hp, user.r],
    );
    return res;
  }

  private async seedLocations(
    queryRunner: QueryRunner,
  ): Promise<LocationSchema[]> {
    const loc = { c: 'Nairobi', r: 'Westlands' };
    const exist = await queryRunner.query(
      'SELECT id FROM locations WHERE city = $1 AND region = $2',
      [loc.c, loc.r],
    );
    if (exist.length > 0) return exist;

    const res = await queryRunner.query(
      `INSERT INTO locations (id, city, region, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id`,
      [loc.c, loc.r],
    );
    return res;
  }

  private async seedClients(queryRunner: QueryRunner): Promise<ClientSchema[]> {
    const seeds = [
      {
        name: 'Acme Holdings Ltd',
        pin: 'KRA-ACME-001',
        email: 'hello@acme.com',
      },
      {
        name: 'Solace Properties Ltd',
        pin: 'KRA-SOL-002',
        email: 'contact@solace.com',
      },
    ];

    const results: any[] = [];
    for (const s of seeds) {
      const exist = await queryRunner.query(
        'SELECT id, "KRAPin" FROM clients WHERE "KRAPin" = $1',
        [s.pin],
      );
      if (exist.length > 0) results.push(exist[0]);
      else {
        const res = await queryRunner.query(
          `INSERT INTO clients (id, "companyName", "KRAPin", "firstName", "lastName", email, phone, "paymentMethod", "billingDate", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 'Seed', 'Client', $3, '0700000000', 'MPESA', 1, NOW(), NOW()) RETURNING id, "KRAPin"`,
          [s.name, s.pin, s.email],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedBuildings(
    queryRunner: QueryRunner,
    clients: any[],
    locations: any[],
  ): Promise<any[]> {
    const results: any[] = [];
    for (const c of clients) {
      const name = `HQ - ${String(c['KRAPin']).slice(-3)}`;
      const exist = await queryRunner.query(
        'SELECT id, "clientId" FROM buildings WHERE name = $1 AND "clientId" = $2',
        [name, c.id],
      );
      if (exist.length > 0) {
        results.push(exist[0]);
        continue;
      }

      const res = await queryRunner.query(
        `INSERT INTO buildings
         (id, name, "clientId", "locationId", "unitPrice", "unitCount", "activeUnits", "binsAssigned", "createdAt", "updatedAt")
         VALUES
           (gen_random_uuid(), $1, $2, $3, 1500, 20, 20, 20, NOW(), NOW())
           RETURNING id, "clientId"`,
        [name, c.id, locations[0].id],
      );
      results.push(res[0]);
    }
    return results;
  }

  private async seedClientCredits(queryRunner: QueryRunner, clients: any[]) {
    for (const c of clients) {
      const exist = await queryRunner.query(
        'SELECT id FROM client_credits WHERE client_id = $1',
        [c.id],
      );
      if (exist.length === 0) {
        await queryRunner.query(
          `INSERT INTO client_credits (id, client_id, balance, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, 0, NOW(), NOW())`,
          [c.id],
        );
      }
    }
  }

  private async seedPettyCash(
    queryRunner: QueryRunner,
    userId: string,
  ): Promise<any[]> {
    const exist = await queryRunner.query(
      'SELECT id FROM petty_cashes WHERE name = $1',
      ['Main Vault'],
    );
    if (exist.length > 0) return exist;

    const res = await queryRunner.query(
      `INSERT INTO petty_cashes (id, name, "totalAmount", "createdBy", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Main Vault', 200000, $1, NOW(), NOW()) RETURNING id`,
      [userId],
    );
    return res;
  }

  private async seedExpenses(
    queryRunner: QueryRunner,
    pettyCash: any[],
    userId: string,
  ) {
    const exist = await queryRunner.query(
      'SELECT id FROM expenses WHERE description = $1 AND "pettyCashId" = $2',
      ['Seed Expense', pettyCash[0].id],
    );
    if (exist.length > 0) return;

    await queryRunner.query(
      `INSERT INTO expenses (id, "pettyCashId", category, amount, description, notes, "recordedBy", "expenseDate", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, 'Maintenance', 500, 'Seed Expense', 'System Generated', $2, NOW(), NOW(), NOW())`,
      [pettyCash[0].id, userId],
    );
  }

  private getInvoiceDateForMonth(month: number): Date {
    const year = new Date().getFullYear() - 1; // last year
    return new Date(year, month, 1);
  }

  private async seedInvoices(
    queryRunner: QueryRunner,
    buildings: any[],
    userId: string,
  ): Promise<any[]> {
    const results: any[] = [];

    for (const b of buildings) {
      for (let month = 0; month < 12; month++) {
        const invoiceDate = this.getInvoiceDateForMonth(month);
        const dueDate = this.addDays(invoiceDate, 14);

        const clientShort = String(b.clientId).slice(0, 4).toUpperCase();
        const invoiceNumber = `INV-${invoiceDate.getFullYear()}-${month + 1}-${clientShort}`;

        const exist = await queryRunner.query(
          'SELECT id, "totalAmount", "invoiceNumber", "clientId" FROM invoices WHERE "invoiceNumber" = $1',
          [invoiceNumber],
        );
        if (exist.length > 0) {
          results.push(exist[0]);
          continue;
        }

        const res = await queryRunner.query(
          `INSERT INTO invoices (
            id, "invoiceNumber", "clientId",
            "billingPeriodStart", "billingPeriodEnd",
            "invoiceDate", "dueDate", "unitCount", "unitPrice", subtotal,
            "creditApplied", "totalAmount", "amountPaid", balance, status, "createdBy", "createdAt", "updatedAt"
          ) VALUES (gen_random_uuid(), $1, $2, $3, $3, $3, $4, 20, 1500, 30000, 0, 30000, 0, 30000, 'PENDING', $5, NOW(), NOW())
          RETURNING id, "totalAmount", "clientId", "invoiceNumber"`,
          [invoiceNumber, b.clientId, invoiceDate, dueDate, userId],
        );

        results.push(res[0]);
      }
    }

    return results;
  }

  private async seedPayments(
    queryRunner: QueryRunner,
    invoices: any[],
    userId: string,
  ) {
    for (const inv of invoices) {
      const paymentNumber = `PAY-${String(inv.invoiceNumber).slice(-8)}`;
      const exist = await queryRunner.query(
        'SELECT id FROM payments WHERE "paymentNumber" = $1',
        [paymentNumber],
      );
      if (exist.length > 0) continue;

      const amount = Number(inv.totalAmount);
      const app = JSON.stringify([
        {
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          amountApplied: amount,
        },
      ]);

      await queryRunner.query(
        `INSERT INTO payments (id, "paymentNumber", "clientId", amount, "paymentMethod", "paymentDate", "referenceNumber", "createdBy", "appliedToInvoices", "excessAmount", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'MPESA', NOW(), $4, $5, $6::jsonb, 0, NOW(), NOW())`,
        [
          paymentNumber,
          inv.clientId,
          amount,
          `REF-${String(inv.id).slice(0, 4)}`,
          userId,
          app,
        ],
      );

      await queryRunner.query(
        `UPDATE invoices SET "amountPaid" = $1, balance = 0, status = 'PAID' WHERE id = $2`,
        [amount, inv.id],
      );
    }
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
