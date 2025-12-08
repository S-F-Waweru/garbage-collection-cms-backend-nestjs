# TypeORM Relations Guide

## Key Concepts You're Missing

### 1. Bidirectional Relations

Relations in TypeORM work best when defined on **both sides** of the relationship.

**Your Current Issue:**
```typescript
// Building schema - you have this ✓
@ManyToOne(() => ClientSchema, { eager: true })
client: ClientSchema;

// Client schema - you're missing this ✗
// Need to add:
@OneToMany(() => BuildingShema, (building) => building.client)
buildings: BuildingShema[];
```

**Why Both Sides Matter:**
- Allows querying in both directions
- TypeORM can properly manage the relationship
- Makes cascading operations work correctly

---

### 2. Relation Loading Strategies

#### Eager Loading
```typescript
@ManyToOne(() => ClientSchema, { eager: true })
client: ClientSchema;
```
- Automatically loads related data
- **Problem**: Can cause performance issues and circular loading
- **Your case**: Both Building and Client use eager loading, causing circular references

#### Lazy Loading
```typescript
@ManyToOne(() => ClientSchema)
client: ClientSchema;
```
- Only loads when explicitly requested
- **Better approach** for your domain model

#### Explicit Loading (Recommended)
```typescript
// In repository
const building = await repository.findOne({
  where: { id },
  relations: ['client', 'location']
});
```
- Full control over what gets loaded
- Prevents circular reference issues
- Better performance

---

### 3. Your Specific Issues

#### Issue 1: Circular References
```typescript
// ClientSchema
@OneToMany(() => BuildingShema, (building) => building.client, { eager: true })
buildings: BuildingShema[];

// BuildingShema  
@ManyToOne(() => ClientSchema, { eager: true })
client: ClientSchema;
```
**Problem**: Client eagerly loads Buildings, Buildings eagerly load Client → infinite loop

**Solution**: Remove eager loading, use explicit relations in queries

#### Issue 2: Missing Relations in Queries
```typescript
// ❌ Bad - missing relations
const schemas = await this.repository.find({
  where: { deletedAt: IsNull() }
});

// ✓ Good - explicitly load what you need
const schemas = await this.repository.find({
  where: { deletedAt: IsNull() },
  relations: ['client', 'location']
});
```

#### Issue 3: JoinColumn Missing
```typescript
// ❌ OneToOne without JoinColumn
@OneToOne(() => LocationSchema, { eager: true })
location: LocationSchema;

// ✓ OneToOne with JoinColumn
@OneToOne(() => LocationSchema, { eager: true })
@JoinColumn()
location: LocationSchema;
```
**Rule**: The owner side of `@OneToOne` **must** have `@JoinColumn()`

---

### 4. Relation Types Explained

#### OneToOne
One entity relates to exactly one other entity.
```typescript
// Building has one Location
@OneToOne(() => LocationSchema)
@JoinColumn()  // Required on owner side
location: LocationSchema;
```

#### ManyToOne / OneToMany
Many entities relate to one entity (bidirectional).
```typescript
// Many Buildings belong to One Client
@ManyToOne(() => ClientSchema, (client) => client.buildings)
client: ClientSchema;

// One Client has Many Buildings  
@OneToMany(() => BuildingShema, (building) => building.client)
buildings: BuildingShema[];
```

#### ManyToMany
Many entities relate to many other entities.
```typescript
@ManyToMany(() => Tag)
@JoinTable()  // Required on owner side
tags: Tag[];
```

---

### 5. Best Practices for Your Code

#### In Schemas
```typescript
@Entity('buildings')
export class BuildingShema {
  // Remove eager: true from relations
  @ManyToOne(() => ClientSchema, (client) => client.buildings)
  client: ClientSchema;

  @OneToOne(() => LocationSchema)
  @JoinColumn()
  location: LocationSchema;
}

@Entity('clients')
export class ClientSchema {
  // Add the inverse relation
  @OneToMany(() => BuildingShema, (building) => building.client)
  buildings: BuildingShema[];
}
```

#### In Repositories
```typescript
// Always specify relations you need
async findById(id: string): Promise<Building | null> {
  const schema = await this.repository.findOne({
    where: { id, deletedAt: IsNull() },
    relations: ['client', 'location'], // Explicit
  });
  
  return schema ? this.toDomain(schema) : null;
}
```

#### In Domain Mapping
```typescript
private toDomain(schema: BuildingShema): Building {
  return Building.fromPersistence({
    id: schema.id,
    name: schema.name,
    location: schema.location,
    client: Client.fromPersistence({
      id: schema.client.id,
      // ... other client fields
      buildings: [], // Avoid circular reference in domain
    }),
    unitPrice: schema.unitPrice,
    unitCount: schema.unitCount,
  });
}
```

---

### 6. Common Pitfalls

❌ **Don't**: Use eager loading on both sides of bidirectional relations
❌ **Don't**: Forget to load relations when mapping to domain
❌ **Don't**: Create circular references in domain objects
❌ **Don't**: Forget `@JoinColumn()` on OneToOne owner side

✓ **Do**: Use explicit `relations: []` in queries
✓ **Do**: Define both sides of bidirectional relations
✓ **Do**: Keep domain models free of circular references
✓ **Do**: Reload entities after save if you need relations populated

---

### 7. Quick Reference

| Relation Type | Owner Side | Inverse Side | JoinColumn Required? |
|--------------|------------|--------------|---------------------|
| OneToOne | @OneToOne + @JoinColumn | @OneToOne | Yes (owner side) |
| ManyToOne/OneToMany | @ManyToOne | @OneToMany | No (automatic FK) |
| ManyToMany | @ManyToMany + @JoinTable | @ManyToMany | Yes (owner side) |

---

### 8. Your Action Items

1. **Remove `eager: true`** from all relations
2. **Add `@OneToMany`** to ClientSchema for buildings
3. **Add `@JoinColumn()`** to BuildingShema location
4. **Always specify `relations: []`** in repository queries
5. **Avoid circular references** when mapping to domain (pass empty arrays for nested collections)
