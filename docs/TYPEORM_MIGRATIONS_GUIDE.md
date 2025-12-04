# TypeORM Migrations Setup & Usage Guide

## 1. Create DataSource Configuration

Create `src/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env file

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'gm_client_cms_db',
  entities: ['src/**/*.schema.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  logging: true,
});
```

## 2. Update AppModule

Turn off `synchronize` once using migrations:

```typescript
TypeOrmModule.forRootAsync({
  useFactory: () => ({
    // ... other config
    synchronize: false, // Change from true to false
    logging: true,
  }),
}),
```

## 3. Migration Commands

### Generate Migration (after schema changes)
```bash
npm run typeorm migration:generate src/migrations/MigrationName -- -d src/data-source.ts
```

### Run Migrations
```bash
npm run typeorm migration:run -- -d src/data-source.ts
```

### Revert Last Migration
```bash
npm run typeorm migration:revert -- -d src/data-source.ts
```

### Show Migration Status
```bash
npm run typeorm migration:show -- -d src/data-source.ts
```

## 4. Migration Workflow

1. **Make schema changes** (e.g., add column to `UserSchema`)
2. **Generate migration**:
   ```bash
   npm run typeorm migration:generate src/migrations/AddRoleToUser -- -d src/data-source.ts
   ```
3. **Review generated file** in `src/migrations/`
4. **Run migration**:
   ```bash
   npm run typeorm migration:run -- -d src/data-source.ts
   ```
5. **Update repository mappers** to include new fields
6. **Test** the changes

## 5. Common Migration Examples

### Adding a Column
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "users" 
        ADD "role" character varying NOT NULL DEFAULT 'accountant'
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
}
```

### Creating an Index
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
}
```

### Adding Foreign Key
```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "invoices" 
        ADD CONSTRAINT "FK_invoices_client" 
        FOREIGN KEY ("clientId") REFERENCES "clients"("id")
    `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "invoices" 
        DROP CONSTRAINT "FK_invoices_client"
    `);
}
```

## 6. Best Practices

- ✅ **Always review** generated migrations before running
- ✅ **Test migrations** on development database first
- ✅ **Keep synchronize: false** in production
- ✅ **Commit migrations** to version control
- ✅ **Never edit** already-run migrations
- ✅ **Use descriptive names** for migrations
- ❌ **Don't delete** migration files
- ❌ **Don't use synchronize: true** with migrations

## 7. Troubleshooting

### "DataSource not found" error
- Ensure `data-source.ts` path is correct
- Check that `.env` file is loaded

### "Entity not found" error
- Verify `entities` path in `data-source.ts` matches your schema location

### Migration doesn't detect changes
- Ensure schema file has been saved
- Check that TypeORM can find the schema file
- Try restarting TypeScript compilation

### "No changes in database schema were found"
- Make sure you saved your schema file
- Verify the entity is in the correct location
- Check that `entities` pattern in `data-source.ts` matches your file structure

## 8. Package.json Scripts (Optional)

Add these for easier commands:

```json
"scripts": {
  "typeorm": "typeorm-ts-node-commonjs",
  "migration:generate": "npm run typeorm migration:generate -- -d src/data-source.ts",
  "migration:run": "npm run typeorm migration:run -- -d src/data-source.ts",
  "migration:revert": "npm run typeorm migration:revert -- -d src/data-source.ts",
  "migration:show": "npm run typeorm migration:show -- -d src/data-source.ts"
}
```

Then use:
```bash
npm run migration:generate src/migrations/MigrationName
npm run migration:run
npm run migration:revert
npm run migration:show
```

## 9. Production Deployment Checklist

Before deploying to production:

- [ ] All migrations tested in development
- [ ] `synchronize: false` in production config
- [ ] Migrations committed to version control
- [ ] Backup database before running migrations
- [ ] Run migrations in maintenance window
- [ ] Have rollback plan ready

## 10. Emergency Rollback

If migration fails in production:

```bash
# Revert last migration
npm run typeorm migration:revert -- -d src/data-source.ts

# Check status
npm run typeorm migration:show -- -d src/data-source.ts

# Restore from backup if needed
```

---

**Project**: Garbage Collection CMS  
**Last Updated**: December 202
