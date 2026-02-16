# New UI Components

This document describes the two new UI components created for the Universal Item Management system.

## 1. Property Creator Component

**Location:** `src/app/components/property-creator/`

**Purpose:** Create and manage FieldProperty definitions that define the metadata for fields (name and type).

### Features:
- **Form-based creation**: Simple form to add new properties with name and type
- **Type selection**: Choose from Text, Date, or Boolean field types
- **Property list**: View all created properties in a data table
- **Delete functionality**: Remove properties before saving
- **Batch save**: Save all properties at once

### Usage:

```typescript
import { PropertyCreatorComponent } from './components/property-creator/property-creator.component';

// In your component
@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [PropertyCreatorComponent],
  template: '<app-property-creator></app-property-creator>'
})
```

### Dependencies:
- Angular Material (Button, Form Field, Input, Select, Card, Table, Icon)
- Reactive Forms
- FieldProperty model

### API Integration (TODO):
The `saveProperties()` method currently logs to console. You need to:
1. Inject your API service
2. Implement the HTTP call to save properties
3. Handle success/error states

Example:
```typescript
constructor(private apiService: YourApiService) {}

saveProperties(): void {
  this.apiService.saveFieldProperties(this.properties).subscribe({
    next: () => {
      this.properties = [];
      // Show success message
    },
    error: (error) => {
      // Handle error
    }
  });
}
```

## 2. Field Mover Component

**Location:** `src/app/components/field-mover/`

**Purpose:** Drag-and-drop interface for positioning Field instances on a canvas, controlling their X, Y, Width, and Height properties.

### Features:
- **Drag-and-drop**: Move fields around the canvas using Angular CDK Drag Drop
- **Grid snapping**: Fields snap to a configurable grid for precise alignment
- **Visual canvas**: 800×600px canvas with grid background
- **Field selection**: Click to select a field and view/edit its properties
- **Size adjustment**: Resize selected fields using the properties panel
- **Position display**: Real-time display of field coordinates and dimensions
- **Save layout**: Persist field positions and sizes
- **Reset function**: Return all fields to default positions

### Usage:

```typescript
import { FieldMoverComponent } from './components/field-mover/field-mover.component';
import { Field } from './core/models/field.model';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [FieldMoverComponent],
  template: '<app-field-mover [fields]="myFields"></app-field-mover>'
})
export class YourComponent {
  myFields: Field[] = [
    // Your fields array
  ];
}
```

### Input Properties:
- `@Input() fields: Field[]` - Array of Field objects to position

### Dependencies:
- Angular Material (Button, Form Field, Input, Card, Icon)
- Angular CDK Drag Drop
- FormsModule
- Field model

### API Integration (TODO):
The `saveLayout()` method currently logs to console. You need to:
1. Inject your API service
2. Implement the HTTP call to update field positions
3. Handle success/error states

Example:
```typescript
constructor(private apiService: YourApiService) {}

saveLayout(): void {
  const updates = this.fieldPositions.map(fp => ({
    id: fp.field.id,
    x: fp.x,
    y: fp.y,
    width: fp.width,
    height: fp.height,
  }));

  this.apiService.updateFieldPositions(updates).subscribe({
    next: () => {
      // Show success message
    },
    error: (error) => {
      // Handle error
    }
  });
}
```

## Models Created

### FieldProperty Model
**Location:** `src/app/core/models/field-property.model.ts`

```typescript
export enum FieldPropertyType {
  Text = 'Text',
  Date = 'Date',
  Boolean = 'Boolean'
}

export class FieldProperty extends Entity {
  name!: string;
  type!: FieldPropertyType;
}
```

## Integration with Routing

To add these components to your routing:

```typescript
// In your routes configuration
import { PropertyCreatorComponent } from './components/property-creator/property-creator.component';
import { FieldMoverComponent } from './components/field-mover/field-mover.component';

export const routes: Routes = [
  {
    path: 'properties/create',
    component: PropertyCreatorComponent,
    title: 'Create Field Properties'
  },
  {
    path: 'fields/layout',
    component: FieldMoverComponent,
    title: 'Field Layout Designer'
  },
  // ... other routes
];
```

## Styling

Both components use Angular Material theming and are responsive. They will adapt to your application's Material theme automatically.

### Customization

You can customize the appearance by modifying the SCSS files:
- `property-creator.component.scss` - Form layout and table styling
- `field-mover.component.scss` - Canvas size, grid appearance, and field styling

To change canvas dimensions in FieldMoverComponent:
```typescript
canvasWidth: number = 1200;  // Change from 800
canvasHeight: number = 900;  // Change from 600
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Edge, Safari)
- Requires HTML5 drag-and-drop support
- Responsive design works on tablets and desktops

## Future Enhancements

### Property Creator:
- [ ] Add property validation rules
- [ ] Edit existing properties
- [ ] Property templates/presets
- [ ] Import/export properties as JSON

### Field Mover:
- [ ] Multi-select fields
- [ ] Alignment tools (align left, center, distribute)
- [ ] Undo/redo functionality
- [ ] Zoom in/out on canvas
- [ ] Field grouping
- [ ] Collision detection
- [ ] Copy/paste field layout

## Testing

To test these components manually:

1. **Property Creator:**
   ```bash
   # Navigate to the component route
   http://localhost:4200/properties/create

   # Add a few properties
   # Verify they appear in the table
   # Test delete functionality
   # Check console for save output
   ```

2. **Field Mover:**
   ```bash
   # Create some mock fields first
   # Navigate to the component route
   http://localhost:4200/fields/layout

   # Drag fields around
   # Select a field and resize it
   # Test reset and save buttons
   # Check console for save output
   ```

## Notes

- Both components are **standalone** and can be used independently
- They use Angular Material, which must be installed in your project
- The Field Mover component requires `@angular/cdk` for drag-and-drop
- API integration is left as TODO for you to implement with your backend
- Components follow the existing patterns in the codebase (reactive forms, Material UI, etc.)
