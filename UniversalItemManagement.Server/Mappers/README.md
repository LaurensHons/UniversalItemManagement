# Mapper System Documentation

## Overview

The mapper system provides a clean way to transform Entity Framework entities into Data Transfer Objects (DTOs) after database queries. This allows you to adjust response structures without modifying your database schema.

## Architecture

### Core Components

1. **Interfaces**
   - `IMapper<TEntity, TDto>` - Synchronous mapping interface
   - `IAsyncMapper<TEntity, TDto>` - Asynchronous mapping interface (for complex mappings requiring DB lookups)

2. **Base Classes**
   - `BaseMapper<TEntity, TDto>` - Implements collection mapping logic
   - `BaseAsyncMapper<TEntity, TDto>` - Async version with Task-based methods

3. **DTOs** (`Domain/DTOs/`)
   - `FieldDto` - Flattened field structure with inline values
   - `RecordDto` - Record with nested field DTOs
   - `FieldPropertyDto` - Field metadata

4. **Mappers** (`Domain/Mappers/`)
   - `FieldMapper` - Maps Field entities to FieldDto
   - `RecordMapper` - Maps Record entities to RecordDto with nested fields
   - `FieldPropertyMapper` - Maps FieldProperty entities to FieldPropertyDto

5. **Repositories** (`Domain/Services/Repositories/`)
   - `MappedEntityRepository<TEntity, TDto>` - Base mapped repository
   - `MappedFieldRepository` - Returns FieldDto
   - `MappedRecordRepository` - Returns RecordDto
   - `MappedFieldPropertyRepository` - Returns FieldPropertyDto

## Key Features

### Flattened Field Structure

Instead of the complex entity structure:
```csharp
Field {
  Property { Name, Type },
  FieldValue {
    TextValue { Value },
    BooleanValue { Value },
    DateValue { Value }
  }
}
```

The DTO provides a flat structure:
```csharp
FieldDto {
  FieldPropertyName: "Email",
  FieldPropertyType: "Text",
  TextValue: "user@example.com",
  BooleanValue: null,
  DateValue: null,
  ValueId: "...",
  HasValue: true
}
```

### Nested Field Mapping

`RecordDto` automatically includes all mapped fields:
```csharp
RecordDto {
  Id: "...",
  Name: "User Profile",
  Fields: [
    { FieldPropertyName: "Email", TextValue: "user@example.com" },
    { FieldPropertyName: "Active", BooleanValue: true },
    { FieldPropertyName: "Created", DateValue: "2024-01-01" }
  ]
}
```

## Usage

### 1. Using Mapped Repositories

Inject `IMappedEntityRepository<TEntity, TDto>` instead of `IEntityRepository<TEntity>`:

```csharp
public class MyService
{
    private readonly IMappedEntityRepository<Field, FieldDto> _mappedFieldRepo;

    public MyService(IMappedEntityRepository<Field, FieldDto> mappedFieldRepo)
    {
        _mappedFieldRepo = mappedFieldRepo;
    }

    public async Task<List<FieldDto>> GetAllFields()
    {
        // Returns DTOs instead of entities
        return await _mappedFieldRepo.ListAsync();
    }

    public async Task<FieldDto?> GetFieldById(Guid id)
    {
        return await _mappedFieldRepo.FindByIdAsync(id);
    }
}
```

### 2. Using Mappers Directly

You can also inject and use mappers directly:

```csharp
public class MyService
{
    private readonly IEntityRepository<Field> _fieldRepo;
    private readonly FieldMapper _fieldMapper;

    public MyService(
        IEntityRepository<Field> fieldRepo,
        FieldMapper fieldMapper)
    {
        _fieldRepo = fieldRepo;
        _fieldMapper = fieldMapper;
    }

    public async Task<FieldDto> GetMappedField(Guid id)
    {
        var entity = await _fieldRepo.FindByIdAsync(id);
        return _fieldMapper.Map(entity);
    }

    public async Task<List<FieldDto>> GetMappedFields()
    {
        var entities = await _fieldRepo.ListAsync();
        return _fieldMapper.Map(entities).ToList();
    }
}
```

### 3. Using Controllers with DTOs

The existing controllers now automatically return DTOs for GET operations:

- `GET /api/field` - Returns all fields as FieldDto[]
- `GET /api/field/{id}` - Returns single field as FieldDto
- `GET /api/record` - Returns all records with nested field DTOs
- `GET /api/record/{id}` - Returns single record with nested fields
- `GET /api/fieldproperty` - Returns all field properties as DTOs

**Note:** Write operations (POST, PATCH, DELETE) still use entities, not DTOs.

## Creating Custom Mappers

### Step 1: Create a DTO

```csharp
public class MyEntityDto
{
    public Guid Id { get; set; }
    public string CustomField { get; set; }
    // Add your custom structure here
}
```

### Step 2: Create a Mapper

```csharp
public class MyEntityMapper : BaseMapper<MyEntity, MyEntityDto>
{
    public override MyEntityDto Map(MyEntity entity)
    {
        if (entity == null)
            throw new ArgumentNullException(nameof(entity));

        return new MyEntityDto
        {
            Id = entity.Id,
            CustomField = entity.SomeComplexProperty.ToString()
            // Transform as needed
        };
    }
}
```

### Step 3: Create a Mapped Repository

```csharp
public class MappedMyEntityRepository
    : MappedEntityRepository<MyEntity, MyEntityDto>
{
    public MappedMyEntityRepository(
        IEntityRepository<MyEntity> entityRepository,
        MyEntityMapper mapper)
        : base(entityRepository, mapper)
    {
    }
}
```

### Step 4: Register in ServiceCollection

```csharp
// In UniversalItemManagement.EF/ServiceCollection.cs
services.AddTransient<MyEntityMapper>();
services.AddTransient<IMappedEntityRepository<MyEntity, MyEntityDto>,
    MappedMyEntityRepository>();
```

### Step 5: Create a Controller (Optional)

```csharp
[Route("api/mapped/myentity")]
public class MappedMyEntityController
    : AbstractMappedController<MyEntity, MyEntityDto>
{
    public MappedMyEntityController(
        ILogger<MappedMyEntityController> logger,
        IEntityService<MyEntity> entityService,
        IMappedEntityRepository<MyEntity, MyEntityDto> mappedRepository)
        : base(logger, entityService, mappedRepository)
    {
    }
}
```

## Advanced: Async Mappers

For mappers that need to make database calls or other async operations:

```csharp
public class ComplexMapper : BaseAsyncMapper<MyEntity, MyDto>
{
    private readonly IEntityRepository<RelatedEntity> _relatedRepo;

    public ComplexMapper(IEntityRepository<RelatedEntity> relatedRepo)
    {
        _relatedRepo = relatedRepo;
    }

    public override async Task<MyDto> MapAsync(MyEntity entity)
    {
        // Can make async calls during mapping
        var related = await _relatedRepo.FindByIdAsync(entity.RelatedId);

        return new MyDto
        {
            Id = entity.Id,
            RelatedName = related?.Name ?? "Unknown"
        };
    }
}
```

## Benefits

1. **Separation of Concerns** - Database structure vs. API response structure
2. **Performance** - Can flatten complex navigation properties
3. **Flexibility** - Adjust response format without changing database
4. **Type Safety** - Compile-time checking for mappings
5. **Reusability** - Mappers can be used across multiple services
6. **Testability** - Mappers can be unit tested independently

## How It Works

The controllers (`/api/record`, `/api/field`, etc.) now use `AbstractMappedController` which:

1. **GET operations** - Use `IMappedEntityRepository` to return DTOs
2. **Write operations** - Use `IEntityService` to accept/return entities

This hybrid approach gives you:
- Clean DTO responses for reads
- Full entity handling for writes (EF can track relationships)

## Related Files

- Interfaces: `Domain/Mappers/Contracts/`
- Base classes: `Domain/Mappers/BaseMapper.cs`, `BaseAsyncMapper.cs`
- DTOs: `Domain/DTOs/`
- Mappers: `Domain/Mappers/`
- Mapped repositories: `Domain/Services/Repositories/Mapped*Repository.cs`
- Controllers: `UniversalItemManagement.Server/Controllers/Mapped*Controller.cs`
- DI registration: `UniversalItemManagement.EF/ServiceCollection.cs`
