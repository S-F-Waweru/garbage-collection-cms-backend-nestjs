import { Building } from '../building.entity';

export interface IBuildingRepository {
  findAll(): Promise<Building[]>;
  findById(id: string): Promise<Building | null>;
  findClientBuildings(id: string): Promise<Building[]>;
  save(buiding: Building): Promise<Building | null>;
  delete(id: string): Promise<{
    message: string;
  }>;
}

export const IBuildingRepository = Symbol('IBuildingRepository');
