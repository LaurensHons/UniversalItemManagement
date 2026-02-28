import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';

import { RecordComponent } from './record.component';
import { RecordFacade } from 'src/app/core/domain/store/record/record.state';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { Record } from 'src/app/core/models/record.model';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';

// ─── Mocks ───────────────────────────────────────────────────────

function createField(overrides: Partial<Field> = {}): Field {
  return new Field({
    id: 'f-1',
    x: 1, y: 1, width: 3, height: 1,
    fieldPropertyId: 'p-text',
    fieldPropertyName: 'Name',
    fieldPropertyType: 'Text',
    recordId: 'rec-1',
    hasValue: false,
    textValue: null,
    booleanValue: null,
    dateValue: null,
    ...overrides,
  } as Field);
}

function createRecord(fields: Field[] = []): Record {
  return new Record({
    id: 'rec-1',
    name: 'Test Record',
    description: 'A test record',
    fields,
  } as Record);
}

function createProp(overrides: Partial<FieldProperty> = {}): FieldProperty {
  return new FieldProperty({
    id: 'p-text',
    name: 'Name',
    type: FieldPropertyType.Text,
    ...overrides,
  } as FieldProperty);
}

class MockRecordFacade {
  private recordSubject = new BehaviorSubject<Record>(createRecord());

  entity$ = jasmine.createSpy('entity$').and.callFake(() => this.recordSubject.asObservable());
  updateEntity = jasmine.createSpy('updateEntity').and.callFake((record: Record) => {
    this.recordSubject.next(record);
    return of(record);
  });

  setRecord(record: Record) {
    this.recordSubject.next(record);
  }
}

class MockFieldFacade {
  addEntity = jasmine.createSpy('addEntity').and.callFake((field: Field) => of(field));
  updateEntity = jasmine.createSpy('updateEntity').and.callFake((field: Field) => of(field));
  removeEntity = jasmine.createSpy('removeEntity').and.returnValue(of(true));
}

class MockFieldPropertyFacade {
  getEntities = jasmine.createSpy('getEntities').and.returnValue(of([]));
  getEntity = jasmine.createSpy('getEntity').and.callFake((id: string) => of(createProp({ id })));
  entities$ = jasmine.createSpy('entities$').and.returnValue(of([createProp()]));
}

// ─── Test Suite ──────────────────────────────────────────────────

describe('RecordComponent (Integration)', () => {
  let component: RecordComponent;
  let fixture: ComponentFixture<RecordComponent>;
  let mockRecordFacade: MockRecordFacade;
  let mockFieldFacade: MockFieldFacade;
  let mockFieldPropertyFacade: MockFieldPropertyFacade;

  const paramMapSubject = new BehaviorSubject(convertToParamMap({ id: 'rec-1' }));

  beforeEach(async () => {
    mockRecordFacade = new MockRecordFacade();
    mockFieldFacade = new MockFieldFacade();
    mockFieldPropertyFacade = new MockFieldPropertyFacade();

    await TestBed.configureTestingModule({
      imports: [RecordComponent, NoopAnimationsModule],
      providers: [
        { provide: RecordFacade, useValue: mockRecordFacade },
        { provide: FieldFacade, useValue: mockFieldFacade },
        { provide: FieldPropertyFacade, useValue: mockFieldPropertyFacade },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordComponent);
    component = fixture.componentInstance;
  });

  // ─── Initialization ─────────────────────────────────────────

  describe('Initialization', () => {
    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load record from route param', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(mockRecordFacade.entity$).toHaveBeenCalled();
      expect(component.record).toBeTruthy();
      expect(component.record!.name).toBe('Test Record');
    }));

    it('should populate form with record data', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(component.form.get('name')!.value).toBe('Test Record');
      expect(component.form.get('description')!.value).toBe('A test record');
    }));

    it('should load field properties for record fields', fakeAsync(() => {
      const field = createField({ fieldPropertyId: 'p-text' });
      mockRecordFacade.setRecord(createRecord([field]));

      fixture.detectChanges();
      tick();

      expect(component.fieldPropertiesMap.size).toBeGreaterThan(0);
    }));
  });

  // ─── Field Addition Save Flow ───────────────────────────────

  describe('Field Addition', () => {
    it('should create field via facade when fieldAdded is emitted', fakeAsync(() => {
      mockRecordFacade.setRecord(createRecord());
      fixture.detectChanges();
      tick();

      component.onFieldAdded({
        propertyId: 'p-text',
        x: 1, y: 1,
        width: 3, height: 1,
      });

      expect(mockFieldFacade.addEntity).toHaveBeenCalled();
      const addedField = mockFieldFacade.addEntity.calls.mostRecent().args[0] as Field;
      expect(addedField.fieldPropertyId).toBe('p-text');
      expect(addedField.recordId).toBe('rec-1');
      expect(addedField.x).toBe(1);
      expect(addedField.y).toBe(1);
    }));

    it('should update record with new field after creation', fakeAsync(() => {
      mockRecordFacade.setRecord(createRecord());
      fixture.detectChanges();
      tick();

      component.onFieldAdded({
        propertyId: 'p-text',
        x: 1, y: 1, width: 3, height: 1,
      });

      // updateEntity should be called to add field to record
      expect(mockRecordFacade.updateEntity).toHaveBeenCalled();
    }));

    it('should not add field when no record is loaded', () => {
      component.record = undefined;

      component.onFieldAdded({
        propertyId: 'p-text',
        x: 1, y: 1, width: 3, height: 1,
      });

      expect(mockFieldFacade.addEntity).not.toHaveBeenCalled();
    });
  });

  // ─── Field Move Save Flow ──────────────────────────────────

  describe('Field Move', () => {
    it('should update field position via facade', fakeAsync(() => {
      const field = createField({ id: 'f-1', x: 1, y: 1 });
      mockRecordFacade.setRecord(createRecord([field]));
      fixture.detectChanges();
      tick();

      component.onFieldMoved({ fieldId: 'f-1', x: 5, y: 3 });

      expect(mockFieldFacade.updateEntity).toHaveBeenCalled();
      const updatedField = mockFieldFacade.updateEntity.calls.mostRecent().args[0] as Field;
      expect(updatedField.x).toBe(5);
      expect(updatedField.y).toBe(3);
    }));

    it('should not move field when record is not loaded', () => {
      component.record = undefined;
      component.onFieldMoved({ fieldId: 'f-1', x: 5, y: 3 });
      expect(mockFieldFacade.updateEntity).not.toHaveBeenCalled();
    });

    it('should not move non-existent field', fakeAsync(() => {
      mockRecordFacade.setRecord(createRecord([]));
      fixture.detectChanges();
      tick();

      component.onFieldMoved({ fieldId: 'non-existent', x: 5, y: 3 });
      expect(mockFieldFacade.updateEntity).not.toHaveBeenCalled();
    }));
  });

  // ─── Field Resize Save Flow ────────────────────────────────

  describe('Field Resize', () => {
    it('should update field dimensions via facade', fakeAsync(() => {
      const field = createField({ id: 'f-1', width: 3, height: 1 });
      mockRecordFacade.setRecord(createRecord([field]));
      fixture.detectChanges();
      tick();

      component.onFieldResized({ fieldId: 'f-1', width: 6, height: 2 });

      expect(mockFieldFacade.updateEntity).toHaveBeenCalled();
      const updatedField = mockFieldFacade.updateEntity.calls.mostRecent().args[0] as Field;
      expect(updatedField.width).toBe(6);
      expect(updatedField.height).toBe(2);
    }));
  });

  // ─── Field Deletion Save Flow ──────────────────────────────

  describe('Field Deletion', () => {
    it('should remove field via facade', fakeAsync(() => {
      const field = createField({ id: 'f-1' });
      mockRecordFacade.setRecord(createRecord([field]));
      fixture.detectChanges();
      tick();

      component.onFieldDeleted('f-1');

      expect(mockFieldFacade.removeEntity).toHaveBeenCalledWith('f-1');
    }));

    it('should update record to remove field after deletion', fakeAsync(() => {
      const field = createField({ id: 'f-1' });
      mockRecordFacade.setRecord(createRecord([field]));
      fixture.detectChanges();
      tick();

      mockRecordFacade.updateEntity.calls.reset();
      component.onFieldDeleted('f-1');

      expect(mockRecordFacade.updateEntity).toHaveBeenCalled();
      const updatedRecord = mockRecordFacade.updateEntity.calls.mostRecent().args[0] as Record;
      expect(updatedRecord.fields.length).toBe(0);
    }));

    it('should not delete when no record is loaded', () => {
      component.record = undefined;
      component.onFieldDeleted('f-1');
      expect(mockFieldFacade.removeEntity).not.toHaveBeenCalled();
    });
  });

  // ─── Field Value Change Save Flow ──────────────────────────

  describe('Field Value Change', () => {
    it('should update record when field value changes', fakeAsync(() => {
      const field = createField({ id: 'f-1', textValue: 'old' });
      mockRecordFacade.setRecord(createRecord([field]));
      fixture.detectChanges();
      tick();

      const updatedField = createField({ id: 'f-1', textValue: 'new' });
      mockRecordFacade.updateEntity.calls.reset();
      component.onFieldValueChanged(updatedField);

      expect(mockRecordFacade.updateEntity).toHaveBeenCalled();
      const record = mockRecordFacade.updateEntity.calls.mostRecent().args[0] as Record;
      const changedField = record.fields.find(f => f.id === 'f-1');
      expect(changedField!.textValue).toBe('new');
    }));

    it('should replace the correct field in record', fakeAsync(() => {
      const field1 = createField({ id: 'f-1', textValue: 'a' });
      const field2 = createField({ id: 'f-2', x: 5, textValue: 'b' });
      mockRecordFacade.setRecord(createRecord([field1, field2]));
      fixture.detectChanges();
      tick();

      const updatedField1 = createField({ id: 'f-1', textValue: 'updated-a' });
      mockRecordFacade.updateEntity.calls.reset();
      component.onFieldValueChanged(updatedField1);

      const record = mockRecordFacade.updateEntity.calls.mostRecent().args[0] as Record;
      expect(record.fields[0].textValue).toBe('updated-a');
      expect(record.fields[1].textValue).toBe('b'); // Unchanged
    }));
  });

  // ─── Record Save ───────────────────────────────────────────

  describe('Record Save', () => {
    it('should save record metadata', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.form.patchValue({ name: 'Updated Name', description: 'Updated Desc' });
      mockRecordFacade.updateEntity.calls.reset();

      component.saveRecord();

      expect(mockRecordFacade.updateEntity).toHaveBeenCalled();
    }));

    it('should not save if form is invalid', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      component.form.patchValue({ name: '' }); // Required field empty
      mockRecordFacade.updateEntity.calls.reset();

      component.saveRecord();

      expect(mockRecordFacade.updateEntity).not.toHaveBeenCalled();
    }));
  });

  // ─── Field Properties Loading ──────────────────────────────

  describe('Field Properties Loading', () => {
    it('should handle record with no fields', fakeAsync(() => {
      mockRecordFacade.setRecord(createRecord([]));
      fixture.detectChanges();
      tick();

      expect(component.fieldPropertiesMap.size).toBe(0);
    }));

    it('should load missing properties from API', fakeAsync(() => {
      // Setup: no properties in state, one field referencing a property
      mockFieldPropertyFacade.entities$.and.returnValue(of([]));
      const field = createField({ fieldPropertyId: 'p-missing' });
      mockRecordFacade.setRecord(createRecord([field]));

      fixture.detectChanges();
      tick();

      expect(mockFieldPropertyFacade.getEntity).toHaveBeenCalledWith('p-missing');
    }));

    it('should use cached properties from state when available', fakeAsync(() => {
      const prop = createProp({ id: 'p-text' });
      mockFieldPropertyFacade.entities$.and.returnValue(of([prop]));

      const field = createField({ fieldPropertyId: 'p-text' });
      mockRecordFacade.setRecord(createRecord([field]));

      fixture.detectChanges();
      tick();

      expect(mockFieldPropertyFacade.getEntity).not.toHaveBeenCalled();
      expect(component.fieldPropertiesMap.has('p-text')).toBeTrue();
    }));
  });
});
