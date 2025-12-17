import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PasswordHasherService } from '../password-hasher-service/password-hasher-service.service';

// --- SCHEMA IMPORTS ---

// --- ENUMS & CONSTANTS ---
import { Role } from '../../../policies/rbac.policy';
import { InvoiceStatus } from '../../../../invoices/domain/invoice.entity';
import { UserSchema } from '../../../infrastructure/persistence/schema/user.schema';
import { LocationSchema } from '../../../../location/infrastracture/persistence/schema/location.schema';
import { ClientSchema } from '../../../../clients/client/infrastructure/perisistence/schema/client.schema';
import { BuildingSchema } from '../../../../clients/building/infrastructure/persistense/schema/buildingSchema';
import { PettyCashSchema } from '../../../../expences/petty-cash/infrastructure/petty-cash-schema';
import { InvoiceSchema } from '../../../../invoices/infrasctructure/invoice.rschema';

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

  private getRandomDate(monthsBack = 6): Date {
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * monthsBack));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    return date;
  }

  async seedDemoData() {
    this.logger.log('🚀 Starting BULK demo data seeding...');

    try {
      const users = await this.seedUsers();
      if (!users.length) throw new Error('No users seeded');
      const adminId = users[0].id;

      const locations = await this.seedLocations();
      const clients = await this.seedClients();
      const buildings = await this.seedBuildings(clients, locations);

      await this.seedClientCredits(clients);

      const pettyCash = await this.seedPettyCash(adminId);
      await this.seedExpenses(pettyCash, adminId);

      const invoices = await this.seedInvoices(buildings, adminId);
      await this.seedPayments(invoices, adminId);

      this.logger.log('🎉 Bulk seeding completed successfully!');
    } catch (error) {
      this.logger.error('❌ Bulk seeding failed:', error);
    }
  }

  private async seedUsers(): Promise<UserSchema[]> {
    const hp = await this.passwordHasher.hash('Demo@123');
    const users = [
      { f: 'Super', l: 'Admin', e: 'admin@demo.com', r: Role.ADMIN },
      { f: 'Jane', l: 'Accountant', e: 'finance@demo.com', r: Role.ACCOUNTANT },
    ];
    const results: UserSchema[] = [];
    for (const u of users) {
      const exist = await this.dataSource.query<UserSchema[]>(
        'SELECT id FROM users WHERE email = $1',
        [u.e],
      );
      if (exist.length > 0) {
        results.push(exist[0]);
      } else {
        const res = await this.dataSource.query<UserSchema[]>(
          `INSERT INTO users (id, "firstName", "lastName", email, "passwordHash", role, "createdAt", "updatedAt") 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id`,
          [u.f, u.l, u.e, hp, u.r],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedLocations(): Promise<LocationSchema[]> {
    const locs = [
      { c: 'Nairobi', r: 'Westlands' },
      { c: 'Mombasa', r: 'Nyali' },
      { c: 'Kisumu', r: 'Milimani' },
    ];
    const results: LocationSchema[] = [];
    for (const l of locs) {
      const res = await this.dataSource.query<LocationSchema[]>(
        `INSERT INTO locations (id, city, region, "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) 
         ON CONFLICT DO NOTHING RETURNING id`,
        [l.c, l.r],
      );
      if (res.length > 0) {
        results.push(res[0]);
      } else {
        const exist = await this.dataSource.query<LocationSchema[]>(
          'SELECT id FROM locations WHERE city = $1',
          [l.c],
        );
        results.push(exist[0]);
      }
    }
    return results;
  }

  private async seedClients(): Promise<ClientSchema[]> {
    const clients = [
      { n: 'Acme Holdings', p: 'A111B', e: 'info@acme.com' },
      { n: 'Global Tech', p: 'B222C', e: 'admin@gtech.com' },
      { n: 'Urban Living', p: 'C333D', e: 'hello@urban.com' },
    ];
    const results: ClientSchema[] = [];
    for (const c of clients) {
      const res = await this.dataSource.query<ClientSchema[]>(
        `INSERT INTO clients (id, "companyName", "KRAPin", "firstName", "lastName", email, phone, "paymentMethod", "billingDate", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, 'Manager', 'Contact', $3, '07000000', 'MPESA', 1, NOW(), NOW())
         ON CONFLICT DO NOTHING RETURNING id`,
        [c.n, c.p, c.e],
      );
      if (res.length > 0) {
        results.push(res[0]);
      } else {
        const exist = await this.dataSource.query<ClientSchema[]>(
          'SELECT id FROM clients WHERE "KRAPin" = $1',
          [c.p],
        );
        results.push(exist[0]);
      }
    }
    return results;
  }

  private async seedBuildings(
    clients: ClientSchema[],
    locations: LocationSchema[],
  ): Promise<BuildingSchema[]> {
    const results: BuildingSchema[] = [];
    for (const client of clients) {
      for (let i = 1; i <= 2; i++) {
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const res = await this.dataSource.query<BuildingSchema[]>(
          `INSERT INTO buildings (id, name, "clientId", "locationId", "unitPrice", "unitCount", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id, "unitPrice", "unitCount", "clientId"`,
          [
            `${client.companyName} - Wing ${i}`,
            client.id,
            loc.id,
            2000 + i * 500,
            10 + i * 5,
          ],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedClientCredits(clients: ClientSchema[]) {
    for (const c of clients) {
      await this.dataSource.query(
        `INSERT INTO client_credits (id, client_id, balance, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) ON CONFLICT (client_id) DO NOTHING`,
        [c.id, Math.floor(Math.random() * 5000)],
      );
    }
  }

  private async seedPettyCash(userId: string): Promise<PettyCashSchema[]> {
    return await this.dataSource.query<PettyCashSchema[]>(
      `INSERT INTO petty_cashes (id, name, "totalAmount", notes, "createdBy", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), 'Main Vault', 100000, 'Main', $1, NOW(), NOW()) RETURNING id`,
      [userId],
    );
  }

  private async seedExpenses(pettyCash: PettyCashSchema[], userId: string) {
    const categories = [
      'Maintenance',
      'Fuel',
      'Salaries',
      'Permits',
      'Cleaning Supplies',
    ];

    for (let i = 0; i < 20; i++) {
      const date = this.getRandomDate(4);
      // Round the amount to 2 decimal places for clean reports
      const amount = Math.round((1000 + Math.random() * 2000) * 100) / 100;

      await this.dataSource.query(
        `INSERT INTO expenses (
          id, "pettyCashId", category, amount, description, notes,
          "recordedBy", "expenseDate", "createdAt", "updatedAt"
        ) VALUES (
                   gen_random_uuid(), $1, $2, $3, $4, 'Automated Seed', $5,
                   $6::date, $7::timestamp, $8::timestamp
                 )`,
        [
          pettyCash[0].id,
          categories[i % 5],
          amount,
          `Monthly ${categories[i % 5]} - Batch ${i}`,
          userId,
          date, // $6 cast to date
          date, // $7 cast to timestamp
          date, // $8 cast to timestamp
        ],
      );
    }
  }

  private async seedInvoices(
    buildings: BuildingSchema[],
    userId: string,
  ): Promise<InvoiceSchema[]> {
    const results: InvoiceSchema[] = [];
    for (const b of buildings) {
      const buildingId = b.id;
      const clientId = (b as any).clientId;

      for (let i = 0; i < 4; i++) {
        const date = this.getRandomDate(4);
        const subtotal = b.unitPrice * b.unitCount;

        const res = await this.dataSource.query<InvoiceSchema[]>(
          `INSERT INTO invoices (
            id, "invoiceNumber", "clientId", "billingPeriodStart", "billingPeriodEnd",
            "invoiceDate", "dueDate", "unitCount", "unitPrice", subtotal,
            "totalAmount", balance, status, "createdBy", "createdAt", "updatedAt"
          ) VALUES (
                     gen_random_uuid(), $1, $2, $3::date, $3::date, $3::date, $3::date,
                     $4, $5, $6, $6, $6, $7, $8, $9::timestamp, $10::timestamp
                   ) RETURNING id, "totalAmount", "clientId"`,
          [
            `INV-${buildingId.slice(0, 4)}-${i}`,
            clientId,
            date,
            b.unitCount,
            b.unitPrice,
            subtotal,
            InvoiceStatus.PENDING,
            userId,
            date, // createdAt
            date, // updatedAt
          ],
        );
        results.push(res[0]);
      }
    }
    return results;
  }

  private async seedPayments(invoices: InvoiceSchema[], userId: string) {
    for (const inv of invoices) {
      const chance = Math.random();
      let payAmount = 0;

      if (chance > 0.4) payAmount = Number(inv.totalAmount);
      else if (chance > 0.2) payAmount = Number(inv.totalAmount) / 2;

      if (payAmount > 0) {
        await this.dataSource.query(
          `INSERT INTO payments (id, "paymentNumber", "clientId", "invoiceId", amount, "paymentMethod", "paymentDate", "referenceNumber", "createdBy", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'MPESA', NOW(), $5, $6, NOW(), NOW())`,
          [
            `PAY-${inv.id.slice(0, 4)}`,
            inv.clientId,
            inv.id,
            payAmount,
            `REF-${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
            userId,
          ],
        );

        const newStatus =
          payAmount >= Number(inv.totalAmount)
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;
        await this.dataSource.query(
          `UPDATE invoices SET balance = balance - $1, status = $2 WHERE id = $3`,
          [payAmount, newStatus, inv.id],
        );
      }
    }
  }
}
