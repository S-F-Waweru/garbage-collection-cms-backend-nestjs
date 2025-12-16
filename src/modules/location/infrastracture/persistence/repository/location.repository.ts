import { InjectRepository } from '@nestjs/typeorm';
import { LocationSchema } from '../schema/location.schema';
import { IsNull, Repository } from 'typeorm';
import { ILocationRepository } from '../../../domain/interface/location.repository.inteface';
import { Location } from '../../../domain/entities/location.entity'; // Assuming this is correct

export class LocationRepository implements ILocationRepository {
  constructor(
    @InjectRepository(LocationSchema)
    private readonly repository: Repository<LocationSchema>,
  ) {}

  /**
   * Performs a soft delete by setting the deletedAt timestamp.
   */
  async delete(id: string): Promise<void> {
    // 1. Use update to set the deletedAt column to the current time.
    await this.repository.update(id, { deletedAt: new Date() });
  }

  /**
   * Checks if an ACTIVE location with the given city and region exists.
   */
  async exists(city: string, region: string): Promise<boolean> {
    const count = await this.repository.count({
      // 2. Correctly check for active records (deletedAt IS NULL).
      where: { city, region, deletedAt: IsNull() },
    });
    return count > 0;
  }

  /**
   * Finds a location by ID, excluding soft-deleted records.
   */
  async findById(id: string): Promise<Location | null> {
    const schema = await this.repository.findOne({
      where: {
        id,
        // 3. Fix: Ensure only active records are retrieved.
        deletedAt: IsNull(),
      },
    });
    return schema ? this.toDomain(schema) : null;
  }

  /**
   * Retrieves all ACTIVE locations, excluding soft-deleted records.
   */
  async getAll(): Promise<Location[]> {
    const schemas = await this.repository.find({
      where: {
        // 4. Fix: Ensure only active records are retrieved.
        deletedAt: IsNull(),
      },
    });
    return schemas.map((schema) => this.toDomain(schema));
  }

  /**
   * Saves a new location or updates an existing one.
   */
  async save(location: Location): Promise<Location> {
    const schema = this.toSchema(location);
    const savedSchema = await this.repository.save(schema);
    return this.toDomain(savedSchema);
  }

  async getAllPaginated(
    skip: number,
    limit: number,
  ): Promise<[Location[], number]> {
    const [schemas, total] = await this.repository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
    });
    return [schemas.map((s) => this.toDomain(s)), total];
  }

  // --- Private Mapping Methods ---

  private toDomain(schema: LocationSchema): Location {
    // Assumption: Location.fromPersistence is the correct factory method
    return Location.fromPersistence({
      id: schema.id,
      region: schema.region,
      city: schema.city,
      // You may want to include deletedAt here if your domain entity tracks it
    });
  }

  private toSchema(location: Location): LocationSchema {
    const schema = new LocationSchema();
    if (location.id) {
      schema.id = location.id;
    }
    schema.region = location.region;
    schema.city = location.city;
    return schema;
  }
}
