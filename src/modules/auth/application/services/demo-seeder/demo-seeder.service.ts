import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { PasswordHasherService } from '../password-hasher-service/password-hasher-service.service';

// --- SCHEMA & ENUM IMPORTS ---
import { Role } from '../../../policies/rbac.policy';
import { UserSchema } from '../../../infrastructure/persistence/schema/user.schema';
import { LocationSchema } from '../../../../location/infrastracture/persistence/schema/location.schema';
import { ClientSchema } from '../../../../clients/client/infrastructure/perisistence/schema/client.schema';
import { BuildingSchema } from '../../../../clients/building/infrastructure/persistense/schema/buildingSchema';
import { PettyCashSchema } from '../../../../expences/petty-cash/infrastructure/petty-cash-schema';

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

  // --- HELPER UTILITIES ---
  private getRandomDate(monthsBack = 1): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    date.setDate(Math.floor(Math.random() * 25) + 1);
    return date;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // --- MAIN SEEDER FLOW ---
  async seedDemoData() {
    this.logger.log('🚀 Starting MASSIVE BULK data seeding...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const users = await this.seedUsers(queryRunner);
      const adminId = users[0]?.id;
      if (!adminId) throw new Error('Could not find or create Admin user');

      const locations = await this.seedLocations(queryRunner);
      const clients = await this.seedClients(queryRunner);
      
      // Pass both clients and locations
      const buildings = await this.seedBuildings(queryRunner, clients, locations);
      
      await this.seedClientCredits(queryRunner, clients);
      const pettyCash = await this.seedPettyCash(queryRunner, adminId);
      await this.seedExpenses(queryRunner, pettyCash, adminId);

      // This is where the null clientId was causing issues
      const invoices = await this.seedInvoices(queryRunner, buildings, adminId);
      await this.seedPayments(queryRunner, invoices, adminId);

      await queryRunner.commitTransaction();
      this.logger.log('🎉 MASSIVE seeding completed successfully!');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Bulk seeding failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- INDIVIDUAL SEEDER METHODS ---

  private async seedUsers(queryRunner: QueryRunner): Promise<UserSchema[]> {
    const hp = await this.passwordHasher.hash('Demo@123');
    const users = [{ f: 'Super', l: 'Admin', e: 'admin@demo.com', r: Role.ADMIN }];
    const results: any[] = [];
    for (const u of users) {
      const exist = await queryRunner.query('SELECT id FROM users WHERE email = $1', [u.e]);
      if (exist.length > 0) {
        results.push(exist[0]);
      } else {
        const res = await queryRunner.query(
          `INSERT INTO users (id, "firstName", "lastName", email, "passwordHash", role, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [u.f, u.l, u.e, hp, u.r],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedLocations(queryRunner: QueryRunner): Promise<LocationSchema[]> {
    const locs = [{ c: 'Nairobi', r: 'Westlands' }];
    const results: any[] = [];
    for (const l of locs) {
      const exist = await queryRunner.query('SELECT id FROM locations WHERE city = $1 AND region = $2', [l.c, l.r]);
      if (exist.length > 0) {
        results.push(exist[0]);
      } else {
        const res = await queryRunner.query(
          `INSERT INTO locations (id, city, region, "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id`,
          [l.c, l.r],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedClients(queryRunner: QueryRunner): Promise<ClientSchema[]> {
    const results: any[] = [];
    for (let i = 0; i < 3; i++) {
      const pin = `PIN-DEMO-${i}`;
      const exist = await queryRunner.query('SELECT id FROM clients WHERE "KRAPin" = $1', [pin]);
      if (exist.length > 0) {
        results.push(exist[0]);
      } else {
        const res = await queryRunner.query(
          `INSERT INTO clients (id, "companyName", "KRAPin", "firstName", "lastName", email, phone, "paymentMethod", "billingDate", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 'Seed', 'User', $3, '0700000000', 'MPESA', 1, NOW(), NOW()) RETURNING id`,
          [`Client ${i} Ltd`, pin, `client${i}@demo.com`],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedBuildings(queryRunner: QueryRunner, clients: any[], locations: any[]): Promise<any[]> {
    const results: any[] = [];
    for (const client of clients) {
      // FIXED: Added "clientId" to the RETURNING clause
      const res = await queryRunner.query(
        `INSERT INTO buildings (id, name, "clientId", "locationId", "unitPrice", "unitCount", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 1500, 20, NOW(), NOW()) 
         RETURNING id, "clientId"`,
        [`Building for ${client.id.slice(0, 5)}`, client.id, locations[0].id],
      );
      results.push(res[0]);
    }
    return results;
  }

  private async seedClientCredits(queryRunner: QueryRunner, clients: any[]) {
    for (const c of clients) {
      const exist = await queryRunner.query('SELECT id FROM client_credits WHERE client_id = $1', [c.id]);
      if (exist.length === 0) {
        await queryRunner.query(
          `INSERT INTO client_credits (id, client_id, balance, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, 0, NOW(), NOW())`,
          [c.id],
        );
      }
    }
  }

  private async seedPettyCash(queryRunner: QueryRunner, userId: string): Promise<any[]> {
    const exist = await queryRunner.query('SELECT id FROM petty_cashes WHERE name = $1', ['Main Vault']);
    if (exist.length > 0) return exist;
    return await queryRunner.query(
      `INSERT INTO petty_cashes (id, name, "totalAmount", "createdBy", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Main Vault', 500000, $1, NOW(), NOW()) RETURNING id`,
      [userId],
    );
  }

  private async seedExpenses(queryRunner: QueryRunner, pettyCash: any[], userId: string) {
    await queryRunner.query(
      `INSERT INTO expenses (id, "pettyCashId", category, amount, description, notes, "recordedBy", "expenseDate", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, 'Maintenance', 500, 'Seed Expense', 'System Generated', $2, NOW(), NOW(), NOW())`,
      [pettyCash[0].id, userId],
    );
  }

  private async seedInvoices(queryRunner: QueryRunner, buildings: any[], userId: string): Promise<any[]> {
    const results: any[] = [];
    for (const b of buildings) {
      if (!b.clientId) throw new Error(`Building ${b.id} is missing a clientId reference.`);
      
      const invDate = this.getRandomDate();
      const res = await queryRunner.query(
        `INSERT INTO invoices (
          id, "invoiceNumber", "clientId", "billingPeriodStart", "billingPeriodEnd",
          "invoiceDate", "dueDate", "unitCount", "unitPrice", subtotal,
          "creditApplied", "totalAmount", "amountPaid", balance, status, "createdBy", "createdAt", "updatedAt"
        ) VALUES (gen_random_uuid(), $1, $2, $3, $3, $3, $4, 20, 1500, 30000, 0, 30000, 0, 30000, 'PENDING', $5, NOW(), NOW())
        RETURNING id, "totalAmount", "clientId", "invoiceNumber"`,
        [`INV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, b.clientId, invDate, this.addDays(invDate, 14), userId],
      );
      results.push(res[0]);
    }
    return results;
  }

  private async seedPayments(queryRunner: QueryRunner, invoices: any[], userId: string) {
    for (const inv of invoices) {
      const amount = Number(inv.totalAmount);
      const app = JSON.stringify([{ invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, amountApplied: amount }]);
      await queryRunner.query(
        `INSERT INTO payments (id, "paymentNumber", "clientId", amount, "paymentMethod", "paymentDate", "referenceNumber", "createdBy", "appliedToInvoices", "excessAmount", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'MPESA', NOW(), $4, $5, $6::jsonb, 0, NOW(), NOW())`,
        [`PAY-${inv.id.slice(0, 4).toUpperCase()}`, inv.clientId, amount, `REF-${inv.id.slice(0,4)}`, userId, app],
      );
      await queryRunner.query(`UPDATE invoices SET "amountPaid" = $1, balance = 0, status = 'PAID' WHERE id = $2`, [amount, inv.id]);
    }
  }
}