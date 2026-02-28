# Development Conventions

This document outlines important conventions and patterns used in the UniversalItemManagement.Server project.

## Repository vs EntityService Usage

**IMPORTANT: Always use IEntityService for write operations, not IEntityRepository**

### Rules:

1. **Write Operations (POST, PATCH, DELETE)**:
   - ✅ USE: `IEntityService<T>` (EntityUpdatedService)
   - ❌ DO NOT USE: `IEntityRepository<T>`
   - **Reason**: IEntityService triggers SignalR notifications for real-time updates

2. **Read Operations (GET)**:
   - ✅ USE: `IEntityRepository<T>`
   - **Reason**: Read-only operations don't need SignalR notifications

### Example:

```csharp
public class SomeController : AbstractMappedController<Entity, EntityDto>
{
    private readonly IEntityService<Entity> _entityService;  // For writes
    private readonly IEntityRepository<Entity> _repository;   // For reads

    public SomeController(
        ILogger<SomeController> logger,
        IEntityService<Entity> entityService,
        IEntityRepository<Entity> repository,
        SomeMapper mapper)
        : base(logger, entityService, repository, mapper)
    {
        _entityService = entityService;
        _repository = repository;
    }

    // ✅ CORRECT - Use repository for reads
    [HttpGet]
    public async Task<EntityDto> Get()
    {
        var entities = await _repository.ListAsync();
        return _mapper.Map(entities);
    }

    // ✅ CORRECT - Use entityService for writes
    [HttpPost]
    public async Task<EntityDto> Post([FromBody] EntityDto dto)
    {
        var entity = _mapper.MapToEntity(dto);
        var savedEntity = await _entityService.Add(entity);
        return _mapper.Map(savedEntity);
    }
}
```

## Controller Patterns

### AbstractMappedController

Controllers should inherit from `AbstractMappedController<TEntity, TDto>` which provides:
- Standard CRUD operations
- Automatic DTO ↔ Entity mapping
- SignalR notification integration via IEntityService

### DTO Mapping

1. **GET operations**: Return DTOs (entities → DTOs via mapper)
2. **POST/PATCH operations**:
   - Accept DTOs
   - Map to entities
   - Save via IEntityService
   - Return DTOs

## Service Layer

### Domain Services

Create dedicated services for complex domain logic that doesn't belong in controllers:

Example: `FieldValueService`
- Handles FieldValue creation/updates from FieldDto
- Manages complex nested entity relationships
- Keeps controllers thin and focused

### Service Registration

Register services in `ServiceCollection.cs`:

```csharp
// Domain services
services.AddScoped<YourService>();

// Entity services with SignalR
services.AddTransient<IEntityService<YourEntity>, EntityUpdatedService<YourEntity>>(
    (provider) => new EntityUpdatedService<YourEntity>(provider, HubEnum.YourEntity)
);
```

## Mapper Patterns

### Bidirectional Mapping

All mappers must implement:
- `TDto Map(TEntity entity)` - Entity to DTO
- `TEntity MapToEntity(TDto dto)` - DTO to Entity

### Complex Mapping

When mapping requires database access or complex logic:
- Create a dedicated service (like FieldValueService)
- Don't put database logic in mappers
- Mappers should be pure transformation logic

## SignalR Integration

All entity changes must go through `IEntityService` to ensure:
- Real-time notifications to connected clients
- Consistent state updates across the application
- Proper hub routing via `HubEnum`

## Related Files

- Entity Services: `/Services/EntityUpdatedService.cs`
- Base Controller: `/Controllers/AbstractMappedController.cs`
- Service Registration: `/ServiceCollection.cs`
- SignalR Hub: `/Hubs/EntityHub.cs`
