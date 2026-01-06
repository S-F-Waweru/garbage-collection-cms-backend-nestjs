import { SetMetadata } from '@nestjs/common';
import { Role } from 'nest-access-control';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
