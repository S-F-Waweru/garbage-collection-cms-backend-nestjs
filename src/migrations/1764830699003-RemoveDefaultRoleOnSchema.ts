import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDefaultRoleOnSchema1764830699003 implements MigrationInterface {
  name = 'RemoveDefaultRoleOnSchema1764830699003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'accountant'`,
    );
  }
}
