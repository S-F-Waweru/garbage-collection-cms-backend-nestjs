import { Location } from '../enetites/location.entity';

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  getAll(): Promise<Location[]>;
  save(location: Location): Promise<Location>;
  delete(id: string): Promise<void>;
  exists(city: string, region: string): Promise<boolean>;
}
export const ILocationRepository = Symbol('ILocationRepository');
