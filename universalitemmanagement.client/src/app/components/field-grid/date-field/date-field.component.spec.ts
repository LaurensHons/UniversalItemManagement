import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { DateFieldComponent } from './date-field.component';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';

class MockFieldFacade {
  updateEntity = jasmine.createSpy('updateEntity');
}

function createField(date: Date | string | null = null): Field {
  return new Field({
    id: 'f-1',
    x: 1, y: 1, width: 3, height: 1,
    fieldPropertyId: 'p-1',
    fieldPropertyName: 'Birthday',
    fieldPropertyType: 'Date',
    recordId: 'r-1',
    hasValue: !!date,
    textValue: null,
    booleanValue: null,
    dateValue: date,
  } as Field);
}

function createProp(): FieldProperty {
  return new FieldProperty({
    id: 'p-1', name: 'Birthday', type: FieldPropertyType.Date,
  } as FieldProperty);
}

describe('DateFieldComponent', () => {
  let component: DateFieldComponent;
  let fixture: ComponentFixture<DateFieldComponent>;
  let mockFacade: MockFieldFacade;

  beforeEach(async () => {
    mockFacade = new MockFieldFacade();

    await TestBed.configureTestingModule({
      imports: [DateFieldComponent, NoopAnimationsModule],
      providers: [{ provide: FieldFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(DateFieldComponent);
    component = fixture.componentInstance;
    component.field = createField(null);
    component.property = createProp();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with null date', () => {
    fixture.detectChanges();
    expect(component.dateControl.value).toBeNull();
  });

  it('should initialize with existing date value', () => {
    const testDate = '2024-06-15T00:00:00.000Z';
    component.field = createField(testDate);
    fixture.detectChanges();

    expect(component.dateControl.value).toBeTruthy();
    expect(component.dateControl.value instanceof Date).toBeTrue();
  });

  it('should save on value change and emit updated field', () => {
    const date = new Date(2024, 5, 15);
    const savedField = createField(date);
    mockFacade.updateEntity.and.returnValue(of(savedField));
    spyOn(component.valueChanged, 'emit');

    fixture.detectChanges();
    component.dateControl.setValue(date);

    component.onValueChange();

    expect(mockFacade.updateEntity).toHaveBeenCalled();
    const sentField = mockFacade.updateEntity.calls.mostRecent().args[0] as Field;
    expect(sentField.dateValue).toEqual(date);
    expect(component.valueChanged.emit).toHaveBeenCalledWith(savedField);
  });

  it('should set status to "saved" after successful save', () => {
    mockFacade.updateEntity.and.returnValue(of(createField(new Date())));
    fixture.detectChanges();
    component.dateControl.setValue(new Date());

    component.onValueChange();
    expect(component.status).toBe('saved');
  });

  it('should set status to "error" on save failure', () => {
    mockFacade.updateEntity.and.returnValue(throwError(() => new Error('fail')));
    fixture.detectChanges();
    component.dateControl.setValue(new Date());

    component.onValueChange();
    expect(component.status).toBe('error');
  });

  it('should reset status after timeout', fakeAsync(() => {
    mockFacade.updateEntity.and.returnValue(of(createField(new Date())));
    fixture.detectChanges();
    component.dateControl.setValue(new Date());

    component.onValueChange();
    expect(component.status).toBe('saved');

    tick(2500);
    expect(component.status).toBe('idle');
  }));

  it('should update control when field input changes', () => {
    fixture.detectChanges();
    expect(component.dateControl.value).toBeNull();

    const newDate = '2025-01-01T00:00:00.000Z';
    component.field = createField(newDate);
    component.ngOnChanges({
      field: { currentValue: component.field, previousValue: createField(null), firstChange: false, isFirstChange: () => false },
    });

    expect(component.dateControl.value).toBeTruthy();
  });

  it('should render label with property name', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sf__label');
    expect(label.textContent).toContain('Birthday');
  });

  it('should render input element', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.sf__input');
    expect(input).toBeTruthy();
  });

  it('should render datepicker toggle', () => {
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.sf__date-toggle');
    expect(toggle).toBeTruthy();
  });
});
