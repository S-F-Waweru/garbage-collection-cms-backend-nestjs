import { Building } from '../building.entity';

export interface IBuildingRepository {
  findAll(): Promise<Building[]>;
  findById(id: string): Promise<Building | null>;
  findClientBuildings(id: string): Promise<Building[]>;
  save(building: Building): Promise<Building | null>;
  findAllPaginated(skip: number, limit: number): Promise<[Building[], number]>;
  delete(id: string): Promise<{
    message: string;
  }>;
}

export const IBuildingRepository = Symbol('IBuildingRepository');
