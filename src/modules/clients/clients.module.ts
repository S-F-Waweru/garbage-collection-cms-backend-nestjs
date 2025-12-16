import { Module } from '@nestjs/common';
import { BuildingModule } from './building/building.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [BuildingModule, ClientModule],
})
export class ClientsModule {}
