import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of } from 'rxjs';

import { FieldGridComponent, FieldTypeOption } from './field-grid.component';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';
import { Field } from 'src/app/core/models/field.model';

// ─── Mock Facades ────────────────────────────────────────────────

class MockFieldPropertyFacade {
  getEntities = jasmine.createSpy('getEntities').and.returnValue(of([]));
  addEntity = jasmine.createSpy('addEntity').and.callFake((entity: FieldProperty) => of(entity));
}

class MockFieldFacade {
  updateEntity = jasmine.createSpy('updateEntity').and.callFake((f: Field) => of(f));
  addEntity = jasmine.createSpy('addEntity').and.callFake((f: Field) => of(f));
  removeEntity = jasmine.createSpy('removeEntity').and.returnValue(of(true));
}

// ─── Test Helpers ────────────────────────────────────────────────

function createMockField(overrides: Partial<Field> = {}): Field {
  return new Field({
    id: 'field-1',
    x: 1,
    y: 1,
    width: 3,
    height: 1,
    fieldPropertyId: 'prop-1',
    fieldPropertyName: 'Test Field',
    fieldPropertyType: 'Text',
    recordId: 'record-1',
    hasValue: false,
    textValue: null,
    booleanValue: null,
    dateValue: null,
    ...overrides,
  } as Field);
}

function createMockFieldProperty(overrides: Partial<FieldProperty> = {}): FieldProperty {
  return new FieldProperty({
    id: 'prop-1',
    name: 'Test Property',
    type: FieldPropertyType.Text,
    ...overrides,
  } as FieldProperty);
}

function createMockProperties(): FieldProperty[] {
  return [
    createMockFieldProperty({ id: 'prop-text', name: 'Name', type: FieldPropertyType.Text }),
    createMockFieldProperty({ id: 'prop-date', name: 'Birthday', type: FieldPropertyType.Date }),
    createMockFieldProperty({ id: 'prop-bool', name: 'Active', type: FieldPropertyType.Boolean }),
  ];
}

// ─── Tests ───────────────────────────────────────────────────────

describe('FieldGridComponent', () => {
  let component: FieldGridComponent;
  let fixture: ComponentFixture<FieldGridComponent>;
  let mockFieldPropertyFacade: MockFieldPropertyFacade;

  beforeEach(async () => {
    mockFieldPropertyFacade = new MockFieldPropertyFacade();

    await TestBed.configureTestingModule({
      imports: [FieldGridComponent, NoopAnimationsModule, MatDialogModule],
      providers: [
        { provide: FieldPropertyFacade, useValue: mockFieldPropertyFacade },
        { provide: FieldFacade, useValue: new MockFieldFacade() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldGridComponent);
    component = fixture.componentInstance;
  });

  // ─── Rendering ──────────────────────────────────────────────

  describe('Rendering', () => {
    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should start in locked mode', () => {
      fixture.detectChanges();
      expect(component.isLocked).toBeTrue();
    });

    it('should render toolbar with title', () => {
      fixture.detectChanges();
      const title = fixture.nativeElement.querySelector('.fg__title');
      expect(title).toBeTruthy();
      expect(title.textContent).toContain('Fields');
    });

    it('should show field count badge when fields exist', () => {
      component.fields = [createMockField()];
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.fg__field-count');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('1');
    });

    it('should not show field count badge when no fields', () => {
      component.fields = [];
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.fg__field-count');
      expect(badge).toBeNull();
    });

    it('should show empty state when locked with no fields', () => {
      component.fields = [];
      component.isLocked = true;
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.fg__empty');
      expect(empty).toBeTruthy();
    });

    it('should show drop prompt when unlocked with no fields', () => {
      component.isLocked = false;
      component.fields = [];
      fixture.detectChanges();
      const prompt = fixture.nativeElement.querySelector('.fg__drop-prompt');
      expect(prompt).toBeTruthy();
    });

    it('should render field cards for each field', () => {
      const prop = createMockFieldProperty();
      component.fields = [
        createMockField({ id: 'f1' }),
        createMockField({ id: 'f2', x: 4 }),
      ];
      component.fieldProperties = new Map([['prop-1', prop]]);
      fixture.detectChanges();

      const cards = fixture.nativeElement.querySelectorAll('.fg__card');
      expect(cards.length).toBe(2);
    });

    it('should apply correct grid positioning styles', () => {
      const prop = createMockFieldProperty();
      component.fields = [createMockField({ x: 2, y: 3, width: 4, height: 2 })];
      component.fieldProperties = new Map([['prop-1', prop]]);
      fixture.detectChanges();

      const card = fixture.nativeElement.querySelector('.fg__card') as HTMLElement;
      expect(card.style.gridColumn).toContain('2 / span 4');
      expect(card.style.gridRow).toContain('3 / span 2');
    });
  });

  // ─── Lock / Unlock ──────────────────────────────────────────

  describe('Lock / Unlock', () => {
    it('should toggle lock state', () => {
      fixture.detectChanges();
      expect(component.isLocked).toBeTrue();

      component.toggleLock();
      expect(component.isLocked).toBeFalse();

      component.toggleLock();
      expect(component.isLocked).toBeTrue();
    });

    it('should fetch field properties when unlocking', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of(createMockProperties()));
      fixture.detectChanges();

      component.toggleLock();
      expect(mockFieldPropertyFacade.getEntities).toHaveBeenCalled();
    });

    it('should populate fieldTypeOptions after unlocking', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of(createMockProperties()));
      fixture.detectChanges();

      component.toggleLock();
      expect(component.fieldTypeOptions.length).toBe(3);
      expect(component.fieldTypeOptions[0].label).toBe('Name');
      expect(component.fieldTypeOptions[1].label).toBe('Birthday');
      expect(component.fieldTypeOptions[2].label).toBe('Active');
    });

    it('should show sidebar when unlocked', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of([]));
      fixture.detectChanges();

      component.toggleLock();
      fixture.detectChanges();

      const sidebar = fixture.nativeElement.querySelector('.fg__sidebar');
      expect(sidebar).toBeTruthy();
    });

    it('should hide sidebar when locked', () => {
      fixture.detectChanges();
      const sidebar = fixture.nativeElement.querySelector('.fg__sidebar');
      expect(sidebar).toBeNull();
    });

    it('should show editing UI elements when unlocked', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of([]));
      const prop = createMockFieldProperty();
      component.fields = [createMockField()];
      component.fieldProperties = new Map([['prop-1', prop]]);
      fixture.detectChanges();

      component.toggleLock();
      fixture.detectChanges();

      const header = fixture.nativeElement.querySelector('.fg__card-header');
      expect(header).toBeTruthy();

      const resizeHandle = fixture.nativeElement.querySelector('.fg__card-resize');
      expect(resizeHandle).toBeTruthy();
    });

    it('should clear delete confirm state when locking', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of([]));
      fixture.detectChanges();
      component.toggleLock(); // unlock
      component.deleteConfirmId = 'some-field';

      component.toggleLock(); // lock
      expect(component.deleteConfirmId).toBeNull();
    });
  });

  // ─── Sidebar ────────────────────────────────────────────────

  describe('Sidebar', () => {
    beforeEach(() => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of(createMockProperties()));
      fixture.detectChanges();
      component.toggleLock();
      fixture.detectChanges();
    });

    it('should render sidebar items for each property', () => {
      const items = fixture.nativeElement.querySelectorAll('.fg__sidebar-item');
      expect(items.length).toBe(3);
    });

    it('should display correct icons for each type', () => {
      const icons = fixture.nativeElement.querySelectorAll('.fg__sidebar-item-icon');
      expect(icons[0].getAttribute('data-type')).toBe('Text');
      expect(icons[1].getAttribute('data-type')).toBe('Date');
      expect(icons[2].getAttribute('data-type')).toBe('Boolean');
    });

    it('should show empty state when no properties exist', () => {
      mockFieldPropertyFacade.getEntities.and.returnValue(of([]));
      component.fieldTypeOptions = [];
      fixture.detectChanges();

      const empty = fixture.nativeElement.querySelector('.fg__sidebar-empty');
      expect(empty).toBeTruthy();
    });

    it('should toggle sidebar visibility', fakeAsync(() => {
      expect(component.sidebarExpanded).toBeTrue();

      component.toggleSidebar();
      fixture.detectChanges();
      tick(); // Allow animation to complete
      fixture.detectChanges();

      expect(component.sidebarExpanded).toBeFalse();

      // Sidebar should be removed after animation completes
      const sidebar = fixture.nativeElement.querySelector('.fg__sidebar');
      expect(sidebar).toBeNull();
    }));
  });

  // ─── Field Property Lookup ──────────────────────────────────

  describe('Field Property Lookup', () => {
    it('should return matching field property', () => {
      const prop = createMockFieldProperty();
      component.fieldProperties = new Map([['prop-1', prop]]);

      const field = createMockField({ fieldPropertyId: 'prop-1' });
      expect(component.getFieldProperty(field)).toBe(prop);
    });

    it('should return undefined for missing property', () => {
      component.fieldProperties = new Map();
      const field = createMockField({ fieldPropertyId: 'nonexistent' });
      expect(component.getFieldProperty(field)).toBeUndefined();
    });

    it('should get correct label for field', () => {
      const prop = createMockFieldProperty({ name: 'Email' });
      component.fieldProperties = new Map([['prop-1', prop]]);
      const field = createMockField({ fieldPropertyId: 'prop-1' });
      expect(component.getFieldTypeLabel(field)).toBe('Email');
    });

    it('should return "Unknown" for missing property label', () => {
      component.fieldProperties = new Map();
      const field = createMockField({ fieldPropertyId: 'missing' });
      expect(component.getFieldTypeLabel(field)).toBe('Unknown');
    });
  });

  // ─── Grid Calculations ─────────────────────────────────────

  describe('Grid Calculations', () => {
    it('should calculate minimum grid rows when empty', () => {
      component.fields = [];
      expect(component.gridRows).toBe(6);
    });

    it('should calculate grid rows from field positions', () => {
      component.fields = [
        createMockField({ y: 5, height: 2 }),
      ];
      // maxRow = 5+2 = 7, result = max(6, 7+2) = 9
      expect(component.gridRows).toBe(9);
    });

    it('should generate correct field styles', () => {
      const field = createMockField({ x: 3, y: 2, width: 4, height: 1 });
      const style = component.getFieldStyle(field);
      expect(style['grid-column']).toBe('3 / span 4');
      expect(style['grid-row']).toBe('2 / span 1');
    });

    it('should generate correct ghost styles', () => {
      component.ghost = { x: 5, y: 3, width: 2, height: 1 };
      const style = component.getGhostStyle();
      expect(style['grid-column']).toBe('5 / span 2');
      expect(style['grid-row']).toBe('3 / span 1');
    });

    it('should return empty object for ghost styles when no ghost', () => {
      component.ghost = null;
      expect(component.getGhostStyle()).toEqual({});
    });
  });

  // ─── Collision Detection ────────────────────────────────────

  describe('Collision Detection', () => {
    it('should detect overlapping fields', () => {
      component.fields = [
        createMockField({ id: 'f1', x: 1, y: 1, width: 3, height: 1 }),
      ];
      // @ts-ignore - accessing private method for testing
      expect(component.hasCollision(2, 1, 2, 1)).toBeTrue();
    });

    it('should not detect collision with non-overlapping fields', () => {
      component.fields = [
        createMockField({ id: 'f1', x: 1, y: 1, width: 3, height: 1 }),
      ];
      // @ts-ignore
      expect(component.hasCollision(5, 1, 2, 1)).toBeFalse();
    });

    it('should exclude specified field from collision check', () => {
      component.fields = [
        createMockField({ id: 'f1', x: 1, y: 1, width: 3, height: 1 }),
      ];
      // @ts-ignore
      expect(component.hasCollision(1, 1, 3, 1, 'f1')).toBeFalse();
    });

    it('should detect collision with adjacent fields but not touching ones', () => {
      component.fields = [
        createMockField({ id: 'f1', x: 1, y: 1, width: 3, height: 1 }),
      ];
      // Touching (x=4) should NOT collide
      // @ts-ignore
      expect(component.hasCollision(4, 1, 2, 1)).toBeFalse();
    });
  });

  // ─── Drag & Drop Events ────────────────────────────────────

  describe('Drag & Drop', () => {
    it('should set draggedOption on sidebar drag start', () => {
      const option: FieldTypeOption = {
        propertyId: 'prop-1',
        type: FieldPropertyType.Text,
        label: 'Name',
        icon: 'notes',
      };

      const mockEvent = {
        dataTransfer: {
          effectAllowed: '',
          setData: jasmine.createSpy(),
          setDragImage: jasmine.createSpy(),
        },
        target: document.createElement('div'),
      } as unknown as DragEvent;

      component.onDragStart(option, mockEvent);
      expect(component.draggedOption).toBe(option);
      expect(component.draggedField).toBeNull();
    });

    it('should set draggedField on field drag start', () => {
      component.isLocked = false;
      const field = createMockField();

      const mockEvent = {
        stopPropagation: jasmine.createSpy(),
        currentTarget: document.createElement('div'),
        dataTransfer: {
          effectAllowed: '',
          setData: jasmine.createSpy(),
        },
      } as unknown as DragEvent;

      component.onFieldDragStart(field, mockEvent);
      expect(component.draggedField).toBe(field);
      expect(component.draggedOption).toBeNull();
    });

    it('should not allow field drag when locked', () => {
      component.isLocked = true;
      const field = createMockField();

      const mockEvent = {
        stopPropagation: jasmine.createSpy(),
        dataTransfer: null,
      } as unknown as DragEvent;

      component.onFieldDragStart(field, mockEvent);
      expect(component.draggedField).toBeNull();
    });

    it('should reset drag state on drag end', () => {
      component.draggedOption = { propertyId: 'p', type: FieldPropertyType.Text, label: 'T', icon: 'i' };
      component.draggedField = createMockField();
      component.isDraggingOver = true;
      component.ghost = { x: 1, y: 1, width: 2, height: 1 };

      component.onDragEnd();

      expect(component.draggedOption).toBeNull();
      expect(component.draggedField).toBeNull();
      expect(component.isDraggingOver).toBeFalse();
      expect(component.ghost).toBeNull();
    });

    it('should emit fieldAdded on drop with new field type', () => {
      spyOn(component.fieldAdded, 'emit');

      component.draggedOption = {
        propertyId: 'prop-1',
        type: FieldPropertyType.Text,
        label: 'Name',
        icon: 'notes',
      };
      component.fields = [];

      // Create a mock grid element for pixel calculation
      const gridEl = document.createElement('div');
      Object.defineProperty(gridEl, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, width: 912, height: 600, right: 912, bottom: 600 }),
      });
      component.gridArea = { nativeElement: gridEl } as any;

      const mockEvent = {
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy(),
        clientX: 100,
        clientY: 50,
        currentTarget: gridEl,
      } as unknown as DragEvent;

      component.onDrop(mockEvent);
      expect(component.fieldAdded.emit).toHaveBeenCalled();

      const emittedValue = (component.fieldAdded.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedValue.propertyId).toBe('prop-1');
      expect(emittedValue.width).toBe(4); // Text default width
      expect(emittedValue.height).toBe(1);
    });

    it('should emit fieldMoved on drop with existing field', () => {
      spyOn(component.fieldMoved, 'emit');

      const field = createMockField({ x: 1, y: 1, width: 3, height: 1 });
      component.draggedField = field;
      component.fields = [field];

      const gridEl = document.createElement('div');
      Object.defineProperty(gridEl, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, width: 912, height: 600, right: 912, bottom: 600 }),
      });
      component.gridArea = { nativeElement: gridEl } as any;

      const mockEvent = {
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy(),
        clientX: 400,
        clientY: 200,
        currentTarget: gridEl,
      } as unknown as DragEvent;

      component.onDrop(mockEvent);
      expect(component.fieldMoved.emit).toHaveBeenCalled();
    });

    it('should not emit fieldMoved if position unchanged', () => {
      spyOn(component.fieldMoved, 'emit');

      const field = createMockField({ x: 1, y: 1, width: 3, height: 1 });
      component.draggedField = field;
      component.fields = [field];

      const gridEl = document.createElement('div');
      Object.defineProperty(gridEl, 'getBoundingClientRect', {
        value: () => ({ left: 0, top: 0, width: 912, height: 600, right: 912, bottom: 600 }),
      });
      component.gridArea = { nativeElement: gridEl } as any;

      // Drop at position that maps to x=1, y=1 (same as field)
      const mockEvent = {
        preventDefault: jasmine.createSpy(),
        stopPropagation: jasmine.createSpy(),
        clientX: 10,
        clientY: 10,
        currentTarget: gridEl,
      } as unknown as DragEvent;

      component.onDrop(mockEvent);
      expect(component.fieldMoved.emit).not.toHaveBeenCalled();
    });
  });

  // ─── Delete ─────────────────────────────────────────────────

  describe('Delete', () => {
    it('should set confirm state on first click', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy() } as unknown as MouseEvent;
      component.onDeleteClick('field-1', mockEvent);
      expect(component.deleteConfirmId).toBe('field-1');
    });

    it('should emit fieldDeleted on second click (confirm)', () => {
      spyOn(component.fieldDeleted, 'emit');
      const mockEvent = { stopPropagation: jasmine.createSpy() } as unknown as MouseEvent;

      component.onDeleteClick('field-1', mockEvent);
      component.onDeleteClick('field-1', mockEvent);

      expect(component.fieldDeleted.emit).toHaveBeenCalledWith('field-1');
      expect(component.deleteConfirmId).toBeNull();
    });

    it('should switch confirm to different field', () => {
      const mockEvent = { stopPropagation: jasmine.createSpy() } as unknown as MouseEvent;

      component.onDeleteClick('field-1', mockEvent);
      expect(component.deleteConfirmId).toBe('field-1');

      component.onDeleteClick('field-2', mockEvent);
      expect(component.deleteConfirmId).toBe('field-2');
    });

    it('should auto-clear confirm state after timeout', fakeAsync(() => {
      const mockEvent = { stopPropagation: jasmine.createSpy() } as unknown as MouseEvent;

      component.onDeleteClick('field-1', mockEvent);
      expect(component.deleteConfirmId).toBe('field-1');

      tick(3000);
      expect(component.deleteConfirmId).toBeNull();
    }));

    it('should correctly report confirm state', () => {
      component.deleteConfirmId = 'field-1';
      expect(component.isDeleteConfirming('field-1')).toBeTrue();
      expect(component.isDeleteConfirming('field-2')).toBeFalse();
    });
  });

  // ─── Value Changed ─────────────────────────────────────────

  describe('Value Changed', () => {
    it('should re-emit field value changes', () => {
      spyOn(component.fieldValueChanged, 'emit');
      const field = createMockField({ textValue: 'Hello' });

      component.onValueChanged(field);
      expect(component.fieldValueChanged.emit).toHaveBeenCalledWith(field);
    });
  });

  // ─── TrackBy Functions ──────────────────────────────────────

  describe('TrackBy', () => {
    it('should track fields by id', () => {
      const field = createMockField({ id: 'abc-123' });
      expect(component.trackByFieldId(0, field)).toBe('abc-123');
    });

    it('should track field types by propertyId', () => {
      const option: FieldTypeOption = {
        propertyId: 'prop-xyz',
        type: FieldPropertyType.Text,
        label: 'Test',
        icon: 'notes',
      };
      expect(component.trackByFieldType(0, option)).toBe('prop-xyz');
    });
  });

  // ─── Cleanup ────────────────────────────────────────────────

  describe('Cleanup', () => {
    it('should clean up on destroy without errors', () => {
      fixture.detectChanges();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
