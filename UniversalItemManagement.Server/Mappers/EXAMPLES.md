# Mapper System - Response Examples

## Field Response Comparison

### Before (Without Mapper System)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "createdOn": "2024-01-01T00:00:00Z",
  "modifiedOn": "2024-01-15T10:30:00Z",
  "createdById": "user-guid-1",
  "modifiedById": "user-guid-2",
  "x": 0,
  "y": 0,
  "width": 2,
  "height": 1,
  "valueId": "value-guid-123",
  "fieldValue": {
    "id": "value-guid-123",
    "createdOn": "2024-01-01T00:00:00Z",
    "modifiedOn": "2024-01-15T10:30:00Z",
    "createdById": "user-guid-1",
    "modifiedById": "user-guid-2",
    "textValueId": "text-value-guid",
    "textValue": {
      "valueId": "text-value-guid",
      "value": "john.doe@example.com"
    },
    "booleanValueId": null,
    "booleanValue": null,
    "dateValueId": null,
    "dateValue": null
  },
  "propertyId": "prop-guid-456",
  "property": {
    "id": "prop-guid-456",
    "createdOn": "2024-01-01T00:00:00Z",
    "modifiedOn": "2024-01-01T00:00:00Z",
    "createdById": "user-guid-1",
    "modifiedById": "user-guid-1",
    "name": "Email",
    "type": "Text"
  },
  "recordId": "record-guid-789",
  "record": null
}
```

### After (With Mapper System - `/api/field/{id}`)

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "createdOn": "2024-01-01T00:00:00Z",
  "modifiedOn": "2024-01-15T10:30:00Z",
  "createdById": "user-guid-1",
  "modifiedById": "user-guid-2",
  "x": 0,
  "y": 0,
  "width": 2,
  "height": 1,
  "fieldPropertyId": "prop-guid-456",
  "fieldPropertyName": "Email",
  "fieldPropertyType": "Text",
  "textValue": "john.doe@example.com",
  "booleanValue": null,
  "dateValue": null,
  "valueId": "text-value-guid",
  "hasValue": true
}
```

**Benefits:**
- 60% smaller payload
- Flat structure - easier to work with
- No nested null objects
- Direct access to property name and type
- Simple `hasValue` boolean flag

---

## Record Response Comparison

### Before (Without Mapper System)

```json
{
  "id": "record-guid-789",
  "createdOn": "2024-01-01T00:00:00Z",
  "modifiedOn": "2024-01-15T10:30:00Z",
  "createdById": "user-guid-1",
  "modifiedById": "user-guid-2",
  "name": "User Profile",
  "description": "User registration data",
  "fields": [
    {
      "id": "field-guid-1",
      "createdOn": "2024-01-01T00:00:00Z",
      "modifiedOn": "2024-01-15T10:30:00Z",
      "createdById": "user-guid-1",
      "modifiedById": "user-guid-2",
      "x": 0,
      "y": 0,
      "width": 2,
      "height": 1,
      "valueId": "value-guid-1",
      "fieldValue": {
        "id": "value-guid-1",
        "createdOn": "2024-01-01T00:00:00Z",
        "modifiedOn": "2024-01-15T10:30:00Z",
        "createdById": "user-guid-1",
        "modifiedById": "user-guid-2",
        "textValueId": "text-guid-1",
        "textValue": {
          "valueId": "text-guid-1",
          "value": "john.doe@example.com"
        },
        "booleanValueId": null,
        "booleanValue": null,
        "dateValueId": null,
        "dateValue": null
      },
      "propertyId": "prop-guid-1",
      "property": {
        "id": "prop-guid-1",
        "createdOn": "2024-01-01T00:00:00Z",
        "modifiedOn": "2024-01-01T00:00:00Z",
        "createdById": "user-guid-1",
        "modifiedById": "user-guid-1",
        "name": "Email",
        "type": "Text"
      },
      "recordId": "record-guid-789",
      "record": null
    },
    {
      "id": "field-guid-2",
      "createdOn": "2024-01-01T00:00:00Z",
      "modifiedOn": "2024-01-10T14:20:00Z",
      "createdById": "user-guid-1",
      "modifiedById": "user-guid-2",
      "x": 2,
      "y": 0,
      "width": 1,
      "height": 1,
      "valueId": "value-guid-2",
      "fieldValue": {
        "id": "value-guid-2",
        "createdOn": "2024-01-01T00:00:00Z",
        "modifiedOn": "2024-01-10T14:20:00Z",
        "createdById": "user-guid-1",
        "modifiedById": "user-guid-2",
        "textValueId": null,
        "textValue": null,
        "booleanValueId": "bool-guid-1",
        "booleanValue": {
          "valueId": "bool-guid-1",
          "value": true
        },
        "dateValueId": null,
        "dateValue": null
      },
      "propertyId": "prop-guid-2",
      "property": {
        "id": "prop-guid-2",
        "createdOn": "2024-01-01T00:00:00Z",
        "modifiedOn": "2024-01-01T00:00:00Z",
        "createdById": "user-guid-1",
        "modifiedById": "user-guid-1",
        "name": "Active",
        "type": "Boolean"
      },
      "recordId": "record-guid-789",
      "record": null
    }
  ]
}
```

### After (With Mapper System - `/api/record/{id}`)

```json
{
  "id": "record-guid-789",
  "createdOn": "2024-01-01T00:00:00Z",
  "modifiedOn": "2024-01-15T10:30:00Z",
  "createdById": "user-guid-1",
  "modifiedById": "user-guid-2",
  "name": "User Profile",
  "description": "User registration data",
  "fields": [
    {
      "id": "field-guid-1",
      "createdOn": "2024-01-01T00:00:00Z",
      "modifiedOn": "2024-01-15T10:30:00Z",
      "createdById": "user-guid-1",
      "modifiedById": "user-guid-2",
      "x": 0,
      "y": 0,
      "width": 2,
      "height": 1,
      "fieldPropertyId": "prop-guid-1",
      "fieldPropertyName": "Email",
      "fieldPropertyType": "Text",
      "textValue": "john.doe@example.com",
      "booleanValue": null,
      "dateValue": null,
      "valueId": "text-guid-1",
      "hasValue": true
    },
    {
      "id": "field-guid-2",
      "createdOn": "2024-01-01T00:00:00Z",
      "modifiedOn": "2024-01-10T14:20:00Z",
      "createdById": "user-guid-1",
      "modifiedById": "user-guid-2",
      "x": 2,
      "y": 0,
      "width": 1,
      "height": 1,
      "fieldPropertyId": "prop-guid-2",
      "fieldPropertyName": "Active",
      "fieldPropertyType": "Boolean",
      "textValue": null,
      "booleanValue": true,
      "dateValue": null,
      "valueId": "bool-guid-1",
      "hasValue": true
    }
  ]
}
```

**Benefits:**
- Much smaller payload (approx 50% reduction)
- Flat field structure
- Easy iteration over fields
- Direct access to values without navigation

---

## Frontend Usage Examples

### React/TypeScript

```typescript
// Type definitions
interface FieldDto {
  id: string;
  fieldPropertyName: string;
  fieldPropertyType: 'Text' | 'Boolean' | 'Date';
  textValue?: string | null;
  booleanValue?: boolean | null;
  dateValue?: string | null;
  hasValue: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RecordDto {
  id: string;
  name: string;
  description: string;
  fields: FieldDto[];
}

// Fetch and use
async function loadRecord(id: string): Promise<RecordDto> {
  const response = await fetch(`/api/mapped/record/${id}`);
  return response.json();
}

// Render fields easily
function FieldGrid({ record }: { record: RecordDto }) {
  return (
    <div className="field-grid">
      {record.fields.map(field => (
        <div
          key={field.id}
          style={{
            gridColumn: `${field.x + 1} / span ${field.width}`,
            gridRow: `${field.y + 1} / span ${field.height}`
          }}
        >
          <label>{field.fieldPropertyName}</label>
          {field.fieldPropertyType === 'Text' && (
            <input type="text" value={field.textValue || ''} />
          )}
          {field.fieldPropertyType === 'Boolean' && (
            <input type="checkbox" checked={field.booleanValue || false} />
          )}
          {field.fieldPropertyType === 'Date' && (
            <input type="date" value={field.dateValue || ''} />
          )}
        </div>
      ))}
    </div>
  );
}
```

### Angular

```typescript
// models/field-dto.ts
export interface FieldDto {
  id: string;
  fieldPropertyName: string;
  fieldPropertyType: 'Text' | 'Boolean' | 'Date';
  textValue?: string | null;
  booleanValue?: boolean | null;
  dateValue?: string | null;
  hasValue: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RecordDto {
  id: string;
  name: string;
  description: string;
  fields: FieldDto[];
}

// services/record.service.ts
@Injectable()
export class RecordService {
  constructor(private http: HttpClient) {}

  getRecord(id: string): Observable<RecordDto> {
    return this.http.get<RecordDto>(`/api/mapped/record/${id}`);
  }

  getAllRecords(): Observable<RecordDto[]> {
    return this.http.get<RecordDto[]>('/api/mapped/record');
  }
}

// component
export class RecordComponent {
  record$ = this.recordService.getRecord(this.route.snapshot.params['id']);

  getFieldValue(field: FieldDto): any {
    switch (field.fieldPropertyType) {
      case 'Text': return field.textValue;
      case 'Boolean': return field.booleanValue;
      case 'Date': return field.dateValue;
    }
  }
}
```

---

## Performance Comparison

### Database Query Efficiency

Both endpoints use the same underlying queries with eager loading:

```csharp
// Both load the same navigation properties
query.Include(r => r.Fields)
     .ThenInclude(f => f.Property)
     .Include(r => r.Fields)
     .ThenInclude(f => f.FieldValue)
         .ThenInclude(fv => fv.TextValue)
     // ... etc
```

---

## Frontend Migration Checklist

When updating frontend to use the new DTO structure:

- [ ] Update TypeScript/model interfaces to match DTO structure
- [ ] Change field value access from `field.fieldValue.textValue.value` to `field.textValue`
- [ ] Change property access from `field.property.name` to `field.fieldPropertyName`
- [ ] Ensure write operations (POST/PATCH) still use entity structure
- [ ] Test all CRUD operations
- [ ] Update unit/integration tests
- [ ] Update API documentation

---

## Quick Reference

| Operation | Endpoint | Returns |
|-----------|----------|---------|
| Get all fields | `GET /api/field` | FieldDto[] |
| Get field by ID | `GET /api/field/{id}` | FieldDto |
| Get all records | `GET /api/record` | RecordDto[] (with nested fields) |
| Get record by ID | `GET /api/record/{id}` | RecordDto (with nested fields) |
| Get field properties | `GET /api/fieldproperty` | FieldPropertyDto[] |
| Create field | `POST /api/field` | Accepts/returns Field entity |
| Update field | `PATCH /api/field` | Accepts/returns Field entity |
| Delete field | `DELETE /api/field/{id}` | boolean |

---

## Tips

1. **Use DTOs for reads** - Cleaner structure, smaller payloads
2. **Use entities for writes** - EF handles relationships automatically
3. **Cache property names** - Field property names rarely change
4. **Batch requests** - Fetch all fields at once rather than individually
5. **Consider pagination** - For large record sets, use paginated endpoints
