import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { BooleanFieldComponent } from './boolean-field.component';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';

class MockFieldFacade {
  updateEntity = jasmine.createSpy('updateEntity');
}

function createField(value: boolean | null = null): Field {
  return new Field({
    id: 'f-1',
    x: 1, y: 1, width: 2, height: 1,
    fieldPropertyId: 'p-1',
    fieldPropertyName: 'Active',
    fieldPropertyType: 'Boolean',
    recordId: 'r-1',
    hasValue: value !== null,
    textValue: null,
    booleanValue: value,
    dateValue: null,
  } as Field);
}

function createProp(): FieldProperty {
  return new FieldProperty({
    id: 'p-1', name: 'Active', type: FieldPropertyType.Boolean,
  } as FieldProperty);
}

describe('BooleanFieldComponent', () => {
  let component: BooleanFieldComponent;
  let fixture: ComponentFixture<BooleanFieldComponent>;
  let mockFacade: MockFieldFacade;

  beforeEach(async () => {
    mockFacade = new MockFieldFacade();

    await TestBed.configureTestingModule({
      imports: [BooleanFieldComponent, NoopAnimationsModule],
      providers: [{ provide: FieldFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(BooleanFieldComponent);
    component = fixture.componentInstance;
    component.field = createField(false);
    component.property = createProp();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with field value (false)', () => {
    component.field = createField(false);
    fixture.detectChanges();
    expect(component.value).toBeFalse();
  });

  it('should initialize with field value (true)', () => {
    component.field = createField(true);
    fixture.detectChanges();
    expect(component.value).toBeTrue();
  });

  it('should default to false when value is null', () => {
    component.field = createField(null);
    fixture.detectChanges();
    expect(component.value).toBeFalse();
  });

  it('should toggle value and save', () => {
    const savedField = createField(true);
    mockFacade.updateEntity.and.returnValue(of(savedField));
    spyOn(component.valueChanged, 'emit');

    component.field = createField(false);
    fixture.detectChanges();

    component.toggle();

    expect(component.value).toBeTrue();
    expect(mockFacade.updateEntity).toHaveBeenCalled();
    const sentField = mockFacade.updateEntity.calls.mostRecent().args[0] as Field;
    expect(sentField.booleanValue).toBeTrue();
    expect(component.valueChanged.emit).toHaveBeenCalledWith(savedField);
  });

  it('should revert value on save error', () => {
    mockFacade.updateEntity.and.returnValue(throwError(() => new Error('fail')));

    component.field = createField(false);
    fixture.detectChanges();

    component.toggle();

    // Value should revert back to false after error
    expect(component.value).toBeFalse();
    expect(component.status).toBe('error');
  });

  it('should set status to "saved" on successful toggle', () => {
    mockFacade.updateEntity.and.returnValue(of(createField(true)));
    component.field = createField(false);
    fixture.detectChanges();

    component.toggle();
    expect(component.status).toBe('saved');
  });

  it('should reset status after timeout', fakeAsync(() => {
    mockFacade.updateEntity.and.returnValue(of(createField(true)));
    component.field = createField(false);
    fixture.detectChanges();

    component.toggle();
    expect(component.status).toBe('saved');

    tick(2500);
    expect(component.status).toBe('idle');
  }));

  it('should render toggle button', () => {
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.sf__toggle');
    expect(toggle).toBeTruthy();
  });

  it('should show "No" label when false', () => {
    component.field = createField(false);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sf__toggle-label');
    expect(label.textContent.trim()).toBe('No');
  });

  it('should show "Yes" label when true', () => {
    component.field = createField(true);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sf__toggle-label');
    expect(label.textContent.trim()).toBe('Yes');
  });

  it('should apply --on class when true', () => {
    component.field = createField(true);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.sf__toggle');
    expect(toggle.classList).toContain('sf__toggle--on');
  });

  it('should render property name in label', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sf__label');
    expect(label.textContent).toContain('Active');
  });

  it('should update value when field input changes', () => {
    fixture.detectChanges();
    expect(component.value).toBeFalse();

    component.field = createField(true);
    component.ngOnChanges({
      field: { currentValue: component.field, previousValue: createField(false), firstChange: false, isFirstChange: () => false },
    });

    expect(component.value).toBeTrue();
  });
});
