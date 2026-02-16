# FieldProperty Entity Slice Integration

This document describes the complete entity slice implementation for FieldProperty with full NgRx store integration and API connectivity.

## Architecture Overview

The FieldProperty entity slice follows the same pattern as the Record entity, using:
- **NgRx Store** for state management
- **Generic EntityService** for API communication
- **Facades** for simplified store access
- **Effects** for handling side effects
- **SignalR** for real-time updates (when configured)

## Files Created/Modified

### New Files

1. **[src/app/core/services/field-property.service.ts](universalitemmanagement.client/src/app/core/services/field-property.service.ts)**
   - Extends `EntityService<FieldProperty>`
   - Connects to `/api/FieldProperty` endpoints
   - Provides CRUD operations: getEntities, getEntityById, AddEntity, UpdateEntity, DeleteEntityById

2. **[src/app/core/domain/store/field-property/field-property.state.ts](universalitemmanagement.client/src/app/core/domain/store/field-property/field-property.state.ts)**
   - Defines FieldPropertyState interface
   - Implements FieldPropertyReducer
   - Provides FieldPropertyEntityEffects for async operations
   - Exports FieldPropertyFacade for component usage

### Modified Files

1. **[src/app/core/domain/store/core.feature.ts](universalitemmanagement.client/src/app/core/domain/store/core.feature.ts)**
   - Added FieldPropertyFeatureKey to CoreState interface
   - Registered FieldPropertyReducer in reducers map
   - Added FieldPropertyEntityEffects to effects array

2. **[src/app/components/property-creator/property-creator.component.ts](universalitemmanagement.client/src/app/components/property-creator/property-creator.component.ts)**
   - Injected FieldPropertyFacade
   - Loads existing properties on init via `getEntities()`
   - Subscribes to `entities$` observable for reactive updates
   - Creates properties via `addEntity()` with API persistence
   - Deletes properties via `removeEntity()` with API persistence
   - Properties now automatically sync with backend

## API Endpoints Used

All endpoints are at `/api/FieldProperty`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/FieldProperty` | List all field properties |
| GET | `/api/FieldProperty/:id` | Get field property by ID |
| POST | `/api/FieldProperty` | Create new field property |
| PATCH | `/api/FieldProperty` | Update existing field property |
| DELETE | `/api/FieldProperty/:id` | Delete field property by ID |

## State Management Flow

### Loading Properties
```typescript
// Component calls facade
this.fieldPropertyFacade.getEntities(FieldPropertyEntities.FieldProperty)

// Facade dispatches action → Effect intercepts → Service makes HTTP call
// → Effect dispatches success/failure → Reducer updates state
// → Component receives updates via entities$ observable
```

### Creating Property
```typescript
// Component calls facade with new property
this.fieldPropertyFacade.addEntity(FieldPropertyEntities.FieldProperty, property)

// Same flow: Action → Effect → HTTP POST → Success → Store Update → Observable
```

### Deleting Property
```typescript
// Component calls facade with property ID
this.fieldPropertyFacade.removeEntity(FieldPropertyEntities.FieldProperty, propertyId)

// Same flow: Action → Effect → HTTP DELETE → Success → Store Update → Observable
```

## Component Integration

### PropertyCreatorComponent

The component now uses reactive patterns with RxJS:

```typescript
constructor(private fieldPropertyFacade: FieldPropertyFacade) {}

ngOnInit(): void {
  // Load all properties from API
  this.fieldPropertyFacade.getEntities(FieldPropertyEntities.FieldProperty)
    .pipe(takeUntil(this.destroy$))
    .subscribe();

  // Subscribe to store updates
  this.fieldPropertyFacade.entities$<FieldProperty>(FieldPropertyEntities.FieldProperty)
    .pipe(takeUntil(this.destroy$))
    .subscribe(properties => {
      this.properties = properties; // Auto-updates when store changes
    });
}

createProperty(): void {
  const property = new FieldProperty({...});

  // Saves to API and updates store automatically
  this.fieldPropertyFacade.addEntity(FieldPropertyEntities.FieldProperty, property)
    .subscribe();
}

deleteProperty(property: FieldProperty): void {
  // Deletes from API and updates store automatically
  this.fieldPropertyFacade.removeEntity(FieldPropertyEntities.FieldProperty, property.id)
    .subscribe();
}
```

## Benefits

1. **Type Safety**: Full TypeScript type checking throughout the stack
2. **Reactive**: UI automatically updates when store changes
3. **Centralized State**: Single source of truth for all field properties
4. **Reusable**: Facade can be injected in any component that needs field properties
5. **Testable**: Easy to mock the facade for unit testing
6. **Consistent**: Follows the same pattern as Record and other entities
7. **Real-time Ready**: SignalR integration available when backend configures it

## Future Enhancements

1. **SignalR Integration**: Configure backend to broadcast FieldProperty changes
   - Update [UniversalItemManagement.Server/ServiceCollection.cs](UniversalItemManagement.Server/ServiceCollection.cs)
   - Add HubEnum for FieldProperty
   - Subscribe to SignalR events in component

2. **Optimistic Updates**: Update UI immediately, rollback on error
3. **Caching Strategy**: Add TTL-based cache invalidation
4. **Pagination**: Implement paged loading for large property lists

## Testing

To verify the integration:

1. Start the backend server
2. Navigate to `/property-creator`
3. Create a new field property
4. Verify it appears in the table
5. Refresh the page - property should persist (loaded from API)
6. Delete a property - verify it's removed from both UI and database

## Related Documentation

- [Backend API Controllers](../UniversalItemManagement.Server/Controllers/FieldPropertyController.cs)
- [Backend Repository](../UniversalItemManagement.EF/Domain/Services/Repositories/FieldPropertyRepository.cs)
- [Component Documentation](COMPONENTS_README.md)
- [Entity Framework README](../UniversalItemManagement.EF/README.md)
