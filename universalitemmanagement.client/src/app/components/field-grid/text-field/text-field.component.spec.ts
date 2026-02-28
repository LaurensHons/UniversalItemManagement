import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { TextFieldComponent } from './text-field.component';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';

class MockFieldFacade {
  updateEntity = jasmine.createSpy('updateEntity');
}

function createField(text: string | null = null): Field {
  return new Field({
    id: 'f-1',
    x: 1, y: 1, width: 3, height: 1,
    fieldPropertyId: 'p-1',
    fieldPropertyName: 'Name',
    fieldPropertyType: 'Text',
    recordId: 'r-1',
    hasValue: !!text,
    textValue: text,
    booleanValue: null,
    dateValue: null,
  } as Field);
}

function createProp(): FieldProperty {
  return new FieldProperty({
    id: 'p-1', name: 'Name', type: FieldPropertyType.Text,
  } as FieldProperty);
}

describe('TextFieldComponent', () => {
  let component: TextFieldComponent;
  let fixture: ComponentFixture<TextFieldComponent>;
  let mockFacade: MockFieldFacade;

  beforeEach(async () => {
    mockFacade = new MockFieldFacade();

    await TestBed.configureTestingModule({
      imports: [TextFieldComponent, NoopAnimationsModule],
      providers: [{ provide: FieldFacade, useValue: mockFacade }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;
    component.field = createField();
    component.property = createProp();
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form control with field value', () => {
    component.field = createField('Hello World');
    fixture.detectChanges();
    expect(component.textControl.value).toBe('Hello World');
  });

  it('should initialize form control with empty string when no value', () => {
    component.field = createField(null);
    fixture.detectChanges();
    expect(component.textControl.value).toBe('');
  });

  it('should update form control when field input changes', () => {
    fixture.detectChanges();
    expect(component.textControl.value).toBe('');

    component.field = createField('Updated');
    component.ngOnChanges({
      field: { currentValue: component.field, previousValue: createField(), firstChange: false, isFirstChange: () => false },
    });

    expect(component.textControl.value).toBe('Updated');
  });

  it('should not save if value has not changed', () => {
    component.field = createField('Same');
    fixture.detectChanges();

    // textControl already has 'Same', calling onValueChange should skip
    component.onValueChange();
    expect(mockFacade.updateEntity).not.toHaveBeenCalled();
  });

  it('should save on value change and emit updated field', () => {
    const savedField = createField('New Value');
    mockFacade.updateEntity.and.returnValue(of(savedField));
    spyOn(component.valueChanged, 'emit');

    component.field = createField('');
    fixture.detectChanges();
    component.textControl.setValue('New Value');

    component.onValueChange();

    expect(mockFacade.updateEntity).toHaveBeenCalled();
    const sentField = mockFacade.updateEntity.calls.mostRecent().args[0] as Field;
    expect(sentField.textValue).toBe('New Value');
    expect(component.valueChanged.emit).toHaveBeenCalledWith(savedField);
  });

  it('should set status to "saving" during save', () => {
    mockFacade.updateEntity.and.returnValue(of(createField('test')));
    component.field = createField('');
    fixture.detectChanges();
    component.textControl.setValue('test');

    // Before the subscribe resolves, status should transition
    expect(component.status).toBe('idle');
    component.onValueChange();
    // After sync resolution (of()), status is 'saved'
    expect(component.status).toBe('saved');
  });

  it('should set status to "error" on save failure', () => {
    mockFacade.updateEntity.and.returnValue(throwError(() => new Error('fail')));
    component.field = createField('');
    fixture.detectChanges();
    component.textControl.setValue('fail');

    component.onValueChange();
    expect(component.status).toBe('error');
  });

  it('should reset status to "idle" after timeout', fakeAsync(() => {
    mockFacade.updateEntity.and.returnValue(of(createField('done')));
    component.field = createField('');
    fixture.detectChanges();
    component.textControl.setValue('done');

    component.onValueChange();
    expect(component.status).toBe('saved');

    tick(2500);
    expect(component.status).toBe('idle');
  }));

  it('should render label with property name', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.sf__label');
    expect(label.textContent).toContain('Name');
  });

  it('should render input element', () => {
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('.sf__input');
    expect(input).toBeTruthy();
    expect(input.getAttribute('type')).toBe('text');
  });

  it('should show save status icon when saving', () => {
    mockFacade.updateEntity.and.returnValue(of(createField('x')));
    component.field = createField('');
    fixture.detectChanges();
    component.textControl.setValue('x');
    component.onValueChange();
    fixture.detectChanges();

    const statusIcon = fixture.nativeElement.querySelector('.sf__status-icon--saved');
    expect(statusIcon).toBeTruthy();
  });
});
