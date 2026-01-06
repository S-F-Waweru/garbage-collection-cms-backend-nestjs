# Implementation Notes - Client & Building Modules (Clean Architecture)

## Step 1: Domain Layer (Entities)

### Building Entity
```typescript
// modules/building/domain/building.entity.ts
- id (uuid)
- name (string)
- locationId (uuid, FK)
- clientId (uuid, FK)
- unitCount (number)
- unitPrice (number, decimal)
- createdAt, updatedAt, deletedAt
- Relations: ManyToOne to Client, ManyToOne to Location
```

### Client Entity
```typescript
// modules/client/domain/client.entity.ts
- id (uuid)
- firstName, lastName (string)
- email (string, nullable)
- phone (string)
- billingDate (number, 1-31)
- isActive (boolean, default true)
- createdBy (uuid, FK to User)
- createdAt, updatedAt, deletedAt
- Relations: OneToMany to Building
```

### Repository Interfaces
```typescript
// building/domain/building.repository.interface.ts
export abstract class IBuildingRepository {
  abstract create(data): Promise<Building>;
  abstract findByClientId(clientId): Promise<Building[]>;
  abstract update(id, data): Promise<Building>;
  abstract delete(id): Promise<void>;
}

// client/domain/client.repository.interface.ts
export abstract class IClientRepository {
  abstract create(data): Promise<Client>;
  abstract findById(id): Promise<Client>;
  abstract findAll(): Promise<Client[]>;
  abstract update(id, data): Promise<Client>;
  abstract deactivate(id): Promise<void>;
}
```

## Step 2: Application Layer (Use Cases & DTOs)

### DTOs
```typescript
// client/application/dto/create-client.dto.ts
- CreateBuildingDto { name, locationId, unitCount, unitPrice }
- CreateClientDto { firstName, lastName, email?, phone, billingDate?, buildings[] }
- Use class-validator decorators (@IsString, @IsArray, @Min, etc.)
```

### Use Cases
```typescript
// client/application/use-cases/create-client.use-case.ts
- Inject IClientRepository, IBuildingRepository
- Validate: at least 1 building required
- Create client first
- Loop through buildings and create each with clientId
- Return client with buildings array

// client/application/use-cases/find-client-by-id.use-case.ts
- Load client with buildings relation

// client/application/use-cases/update-client.use-case.ts
- Update client details only (buildings updated separately)

// client/application/use-cases/deactivate-client.use-case.ts
- Soft delete client (stops future invoices)
```

## Step 3: Infrastructure Layer (Persistence)

### Schemas
```typescript
// building/infrastructure/building.schema.ts
- Use EntitySchema or @Entity decorator
- Define all columns and relations
- Table name: 'buildings'

// client/infrastructure/client.schema.ts
- Table name: 'clients'
```

### Repository Implementations
```typescript
// building/infrastructure/building.repository.ts
- Implements IBuildingRepository
- Inject TypeORM Repository<Building>
- Implement all interface methods

// client/infrastructure/client.repository.ts
- Implements IClientRepository
- Use relations: ['buildings', 'buildings.location'] when loading
```

## Step 4: Presentation Layer (Controllers)

```typescript
// client/presentation/client.controller.ts
@Controller('clients')
- POST / -> create(user, dto) -> CreateClientUseCase
- GET / -> findAll() -> FindAllClientsUseCase
- GET /:id -> findById(id) -> FindClientByIdUseCase
- PUT /:id -> update(id, dto) -> UpdateClientUseCase
- DELETE /:id -> deactivate(id) -> DeactivateClientUseCase
- Use // @UseGuards(JwtAuthGuard)
- Use @CurrentUser() decorator for userId
```

## Step 5: Module Setup

### BuildingModule
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([BuildingSchema]),
    LocationModule, // Need location validation
  ],
  providers: [
    CreateBuildingUseCase,
    FindBuildingsByClientUseCase,
    { provide: IBuildingRepository, useClass: BuildingRepository }
  ],
  exports: [IBuildingRepository], // Export for ClientModule
})
```

### ClientModule
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([ClientSchema]),
    BuildingModule, // Need to create buildings
    LocationModule, // For validation
  ],
  controllers: [ClientController],
  providers: [
    CreateClientUseCase,
    FindClientByIdUseCase,
    FindAllClientsUseCase,
    UpdateClientUseCase,
    DeactivateClientUseCase,
    { provide: IClientRepository, useClass: ClientRepository }
  ],
  exports: [IClientRepository], // For future Billing module
})
```

## Step 6: Database Migration

```typescript
// Create migration for both tables
- clients table
- buildings table with FK to clients and locations
- Indexes on clientId, locationId, isActive
```

## Key Points to Remember

1. **Clean Architecture Flow**: Controller → Use Case → Repository → Entity
2. **Dependencies**: Building depends on Location, Client depends on Building
3. **Transaction**: Wrap client + buildings creation in transaction (optional but recommended)
4. **Validation**: Validate locationId exists before creating building
5. **Soft Delete**: Use deletedAt, don't hard delete (for historical records)
6. **Business Rules**: 
   - Client must have at least 1 building
   - Deactivated clients don't get new invoices
   - Track who created/modified records (createdBy)

## Order of Implementation

1. ✅ Location Module (already done)
2. Building Domain Layer (entity, repository interface)
3. Building Infrastructure (schema, repository)
4. Building Application (use cases, DTOs)
5. Building Module setup
6. Client Domain Layer
7. Client Infrastructure
8. Client Application (with building creation)
9. Client Presentation
10. Client Module setup
11. Test the flow

## Complete Example: CreateClientUseCase

```typescript
@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(IClientRepository) 
    private readonly clientRepo: IClientRepository,
    @Inject(IBuildingRepository) 
    private readonly buildingRepo: IBuildingRepository,
  ) {}

  async execute(userId: string, dto: CreateClientDto) {
    // Validate
    if (!dto.buildings?.length) {
      throw new BadRequestException('At least one building is required');
    }

    // Create client
    const client = await this.clientRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      billingDate: dto.billingDate || 1,
      isActive: true,
      createdBy: userId,
    });

    // Create buildings
    const buildings = await Promise.all(
      dto.buildings.map(building =>
        this.buildingRepo.create({
          name: building.name,
          locationId: building.locationId,
          unitCount: building.unitCount,
          unitPrice: building.unitPrice,
          clientId: client.id,
        })
      )
    );

    return { ...client, buildings };
  }
}
```

## Sample Request Body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0712345678",
  "email": "john@example.com",
  "billingDate": 1,
  "buildings": [
    {
      "name": "Sunrise Apartments",
      "locationId": "uuid-location-1",
      "unitCount": 12,
      "unitPrice": 500
    },
    {
      "name": "Sunset Plaza",
      "locationId": "uuid-location-2",
      "unitCount": 8,
      "unitPrice": 600
    }
  ]
}
```

## Error Handling

```typescript
// Common errors to handle:
- No buildings provided (BadRequestException)
- Invalid locationId (NotFoundException)
- Duplicate phone/email (ConflictException)
- Database errors (InternalServerErrorException)
```

## Testing Checklist

- [ ] Create client with single building
- [ ] Create client with multiple buildings
- [ ] Create client without buildings (should fail)
- [ ] Create client with invalid locationId (should fail)
- [ ] Retrieve client with buildings loaded
- [ ] Update client details
- [ ] Deactivate client
- [ ] Verify soft delete works

---

**Project**: Garbage Collection Client Management System  
**Architecture**: Clean Architecture (4 Layers)  
**Framework**: NestJS + TypeORM + PostgreSQL
