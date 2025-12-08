# NestJS Dependency Injection: Complete Guide with Scenarios

## Table of Contents
1. [Understanding NestJS DI](#understanding-nestjs-di)
2. [Common Errors Explained](#common-errors-explained)
3. [Real-World Scenarios & Solutions](#real-world-scenarios--solutions)
4. [Best Practices](#best-practices)
5. [Quick Reference](#quick-reference)

---

## Understanding NestJS DI

### Core Concepts

**Providers**: Classes that can be injected as dependencies (services, repositories, factories, helpers)

**Modules**: Organize code into cohesive blocks. Control which providers are available where.

**Dependency Injection**: NestJS automatically creates and injects dependencies based on constructor parameters.

### Three Key Module Properties

```typescript
@Module({
  imports: [],    // Modules whose exported providers you want to use
  providers: [],  // Providers that belong to this module
  exports: [],    // Providers that other modules can use
})
```

### How DI Works

```typescript
// 1. Define a provider
@Injectable()
export class UserService {
  findAll() { /* ... */ }
}

// 2. Register it in a module
@Module({
  providers: [UserService],
  exports: [UserService],  // Make it available to other modules
})
export class UserModule {}

// 3. Inject it somewhere
@Injectable()
export class OrderService {
  constructor(private userService: UserService) {}
  // NestJS automatically injects UserService here
}

// 4. Import the module
@Module({
  imports: [UserModule],  // Now OrderService can use UserService
  providers: [OrderService],
})
export class OrderModule {}
```

---

## Common Errors Explained

### Error 1: UnknownDependenciesException

**What you see:**
```
Error: Nest can't resolve dependencies of the UserService (?). 
Please make sure that the argument DatabaseConnection at index [0] 
is available in the UserModule context.
```

**What it means:**
- UserService wants `DatabaseConnection` in its constructor
- NestJS can't find `DatabaseConnection` in UserModule
- Either not imported or not exported properly

**Why it happens:**
- Forgot to import the module that provides the dependency
- Provider exists but isn't exported from its module
- Wrong injection token used

---

### Error 2: UndefinedModuleException

**What you see:**
```
Error: Nest cannot create the UserModule instance.
The module at index [2] of the UserModule "imports" array is undefined.
```

**What it means:**
- One of your imports is `undefined`
- Usually caused by circular dependencies or import errors

**Why it happens:**
- Circular dependency: ModuleA imports ModuleB, ModuleB imports ModuleA
- Typo or wrong import path
- Module not exported from barrel file

---

## Real-World Scenarios & Solutions

### Scenario 1: Basic Service Injection

**Problem:** OrderService needs UserService

```typescript
// ❌ WRONG - Will fail
@Module({
  providers: [OrderService],
})
export class OrderModule {}

@Injectable()
export class OrderService {
  constructor(private userService: UserService) {}
  // Error: Can't resolve UserService
}
```

**Solution:**
```typescript
// ✅ CORRECT
@Module({
  imports: [UserModule],  // Import the module that provides UserService
  providers: [OrderService],
})
export class OrderModule {}
```

---

### Scenario 2: TypeORM Repository Injection

**Problem:** Service needs to use a TypeORM repository

```typescript
// ❌ WRONG - Will fail
@Injectable()
export class UserService {
  constructor(private userRepository: Repository<User>) {}
  // Error: Can't resolve Repository<User>
}
```

**Solution:**
```typescript
// user.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),  // Register the entity
  ],
  providers: [UserService],
})
export class UserModule {}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)  // Use the decorator
    private userRepository: Repository<User>,
  ) {}
}
```

---

### Scenario 3: Interface-Based Injection (Repository Pattern)

**Problem:** Want to inject based on interface, not concrete class

```typescript
// Define interface
export interface IUserRepository {
  findById(id: string): Promise<User>;
}

// Define token
export const IUserRepository = Symbol('IUserRepository');

// Implementation
@Injectable()
export class UserRepository implements IUserRepository {
  findById(id: string): Promise<User> { /* ... */ }
}
```

**Wrong way:**
```typescript
// ❌ WRONG
@Injectable()
export class UserService {
  constructor(private repo: IUserRepository) {}
  // Error: Can't resolve IUserRepository
}
```

**Correct way:**
```typescript
// user.module.ts
@Module({
  providers: [
    {
      provide: IUserRepository,  // Register with token
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepository],
})
export class UserModule {}

// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @Inject(IUserRepository)  // Inject using token
    private readonly repo: IUserRepository,
  ) {}
}
```

---

### Scenario 4: Circular Dependency

**Problem:** ModuleA needs ModuleB, ModuleB needs ModuleA

```typescript
// ❌ WRONG - Circular dependency
// order.module.ts
@Module({
  imports: [UserModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

// user.module.ts
@Module({
  imports: [OrderModule],  // Circular!
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

**Solution 1: Use forwardRef**
```typescript
// order.module.ts
@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

// user.module.ts
@Module({
  imports: [forwardRef(() => OrderModule)],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

**Solution 2: Create Shared Module (BETTER)**
```typescript
// shared/common.module.ts
@Module({
  providers: [SharedService],
  exports: [SharedService],
})
export class CommonModule {}

// order.module.ts
@Module({
  imports: [CommonModule],
  providers: [OrderService],
})
export class OrderModule {}

// user.module.ts
@Module({
  imports: [CommonModule],
  providers: [UserService],
})
export class UserModule {}
```

---

### Scenario 5: Multiple Repositories in One Service

**Problem:** BuildingService needs both BuildingRepository and ClientRepository

```typescript
// ❌ WRONG
@Module({
  imports: [TypeOrmModule.forFeature([Building])],  // Only Building
  providers: [BuildingService],
})
export class BuildingModule {}

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepo: Repository<Building>,
    @InjectRepository(Client)  // Error: Client not registered
    private clientRepo: Repository<Client>,
  ) {}
}
```

**Solution 1: Import Both Entities**
```typescript
// ✅ Quick fix
@Module({
  imports: [
    TypeOrmModule.forFeature([Building, Client]),  // Both entities
  ],
  providers: [BuildingService],
})
export class BuildingModule {}
```

**Solution 2: Import ClientModule**
```typescript
// ✅ Better approach
// client.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  providers: [ClientRepository],
  exports: [ClientRepository],  // Export for others
})
export class ClientModule {}

// building.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Building]),
    ClientModule,  // Import the module
  ],
  providers: [BuildingService],
})
export class BuildingModule {}

// building.service.ts
@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private buildingRepo: Repository<Building>,
    @Inject(IClientRepository)  // Use interface
    private clientRepo: IClientRepository,
  ) {}
}
```

**Solution 3: Shared Database Module (BEST)**
```typescript
// shared/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Client,
      Building,
      Location,
      // All entities
    ]),
  ],
  providers: [
    UserRepository,
    ClientRepository,
    BuildingRepository,
    LocationRepository,
    // All repositories
  ],
  exports: [
    UserRepository,
    ClientRepository,
    BuildingRepository,
    LocationRepository,
    // Export all
  ],
})
export class DatabaseModule {}

// Then in any module:
@Module({
  imports: [DatabaseModule],  // One import for all repositories
  providers: [BuildingService],
})
export class BuildingModule {}
```

---

### Scenario 6: Use Case with Multiple Dependencies

**Problem:** Use case needs multiple repositories and services

```typescript
// create-order.usecase.ts
@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(IOrderRepository)
    private orderRepo: IOrderRepository,
    @Inject(IUserRepository)
    private userRepo: IUserRepository,
    @Inject(IProductRepository)
    private productRepo: IProductRepository,
    private emailService: EmailService,
    private paymentService: PaymentService,
  ) {}
}
```

**Solution:**
```typescript
// order.module.ts
@Module({
  imports: [
    DatabaseModule,        // Provides all repositories
    EmailModule,          // Provides EmailService
    PaymentModule,        // Provides PaymentService
  ],
  providers: [
    CreateOrderUseCase,
    // Other use cases
  ],
  controllers: [OrderController],
})
export class OrderModule {}
```

---

### Scenario 7: Dynamic Module Configuration

**Problem:** Need to configure a module with dynamic values

```typescript
// ❌ WRONG - Can't inject config
@Module({
  providers: [
    {
      provide: 'API_KEY',
      useValue: process.env.API_KEY,  // Not ideal
    },
  ],
})
export class ApiModule {}
```

**Solution: Dynamic Module**
```typescript
// api.module.ts
@Module({})
export class ApiModule {
  static forRoot(config: ApiConfig): DynamicModule {
    return {
      module: ApiModule,
      providers: [
        {
          provide: 'API_CONFIG',
          useValue: config,
        },
        ApiService,
      ],
      exports: [ApiService],
    };
  }
}

// app.module.ts
@Module({
  imports: [
    ApiModule.forRoot({
      apiKey: process.env.API_KEY,
      baseUrl: process.env.API_URL,
    }),
  ],
})
export class AppModule {}

// api.service.ts
@Injectable()
export class ApiService {
  constructor(
    @Inject('API_CONFIG')
    private config: ApiConfig,
  ) {}
}
```

---

## Best Practices

### 1. Module Organization

**Group by Feature, Not by Type**
```
✅ GOOD:
src/
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.repository.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.repository.ts

❌ BAD:
src/
├── controllers/
├── services/
├── repositories/
```

### 2. Use Barrel Exports

```typescript
// users/index.ts
export * from './users.module';
export * from './users.service';
export * from './interfaces';

// Then import like:
import { UsersModule, UsersService } from './users';
```

### 3. Separate Interface from Implementation

```typescript
// users/interfaces/user-repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User>;
}

export const IUserRepository = Symbol('IUserRepository');

// users/repositories/user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  // Implementation
}

// users/users.module.ts
@Module({
  providers: [
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [IUserRepository],
})
```

### 4. Create Shared Modules for Common Dependencies

```typescript
// shared/database.module.ts
@Global()  // Makes it available everywhere without importing
@Module({
  imports: [TypeOrmModule.forFeature([...])],
  providers: [...repositories],
  exports: [...repositories],
})
export class DatabaseModule {}
```

### 5. Use Custom Providers for Testing

```typescript
// users.module.ts
@Module({
  providers: [
    {
      provide: IUserRepository,
      useClass: 
        process.env.NODE_ENV === 'test' 
          ? MockUserRepository 
          : UserRepository,
    },
  ],
})
```

---

## Debugging Checklist

When you get a dependency injection error:

1. **Read the error message carefully**
   - Which class can't be resolved?
   - Which dependency is missing?
   - In which module context?

2. **Check the class constructor**
   - Are all dependencies decorated with `@Inject()` if needed?
   - Are you injecting interfaces correctly?

3. **Check the module imports**
   - Did you import the module that provides the dependency?
   - Is the provider exported from that module?

4. **Check for circular dependencies**
   - Use `forwardRef()` or refactor to shared module

5. **Check TypeORM setup**
   - Entity registered in `TypeOrmModule.forFeature()`?
   - Using `@InjectRepository()` decorator?

6. **Verify token consistency**
   - Same token used in provider registration and `@Inject()`?

---

## Quick Reference

### Import Module
```typescript
@Module({
  imports: [OtherModule],
})
```

### Export Provider
```typescript
@Module({
  providers: [MyService],
  exports: [MyService],
})
```

### Inject Service
```typescript
constructor(private myService: MyService) {}
```

### Inject with Token
```typescript
constructor(
  @Inject(IMyService)
  private myService: IMyService,
) {}
```

### Inject Repository
```typescript
constructor(
  @InjectRepository(User)
  private userRepo: Repository<User>,
) {}
```

### Handle Circular Dependency
```typescript
@Module({
  imports: [forwardRef(() => OtherModule)],
})
```

### Create Custom Provider
```typescript
{
  provide: IMyService,
  useClass: MyService,
}
```

---

## Common Patterns Summary

| Pattern | When to Use |
|---------|-------------|
| Direct injection | Simple services within same module |
| Interface injection | Repository pattern, testability |
| forwardRef | Unavoidable circular dependencies |
| Shared module | Multiple modules need same providers |
| Dynamic module | Runtime configuration needed |
| @Global() decorator | Make module available everywhere |

---

*Last updated: December 2024*