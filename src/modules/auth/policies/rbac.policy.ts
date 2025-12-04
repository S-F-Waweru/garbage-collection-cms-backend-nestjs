import { RolesBuilder } from 'nest-access-control';

export enum Role {
  ADMIN = 'admin',
  DIRECTOR = 'director',
  ACCOUNTANT = 'accountant',
}
export const roles: RolesBuilder = new RolesBuilder();

// ACCOUNTANT - full operational access
roles
  .grant(Role.ACCOUNTANT)
  .readOwn('user')
  .updateOwn('user')
  .createAny('client')
  .readAny('client')
  .updateAny('client')
  .deleteAny('client')
  .createAny('other-income')
  .readAny('other-income')
  .updateAny('other-income')
  .deleteAny('other-income')
  .createAny('expenses')
  .readAny('expenses')
  .updateAny('expenses')
  .deleteAny('expenses')
  .createAny('payments')
  .readAny('payments')
  .updateAny('payments')
  .deleteAny('payments')
  .createAny('invoices')
  .readAny('invoices')
  .updateAny('invoices')
  .deleteAny('invoices');

// DIRECTOR - same as Accountant + view reports
roles.grant(Role.DIRECTOR).extend(Role.ACCOUNTANT);

// ADMIN - same as Director + user management
roles
  .grant(Role.ADMIN)
  .extend(Role.DIRECTOR)
  .createAny('user')
  .readAny('user')
  .updateAny('user')
  .deleteAny('user');
