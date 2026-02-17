import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldValue } from 'src/app/core/models/field-value.model';
import { FieldValueFacade } from 'src/app/core/domain/store/fields/field-value.state';
import { tap } from 'rxjs';

@Component({
  selector: 'app-boolean-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss'],
})
export class BooleanFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<{ fieldId: string; valueId: string }>();

  booleanControl = new FormControl(false);
  private currentFieldValue?: FieldValue;

  constructor(private fieldValueFacade: FieldValueFacade) {}

  ngOnInit(): void {
    this.loadValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload value when field's valueId changes
    if (changes['field'] && !changes['field'].firstChange) {
      const previousField = changes['field'].previousValue as Field;
      const currentField = changes['field'].currentValue as Field;

      // Only reload if valueId changed
      if (previousField?.valueId !== currentField?.valueId) {
        this.loadValue();
      }
    }
  }

  private loadValue(): void {
    // Load value if exists
    if (this.field.valueId) {
      this.fieldValueFacade.getEntity(this.field.valueId).pipe(
        tap((fieldValue: FieldValue) => {
          this.currentFieldValue = fieldValue;
          this.booleanControl.setValue(fieldValue.booleanValue?.value ?? false, { emitEvent: false });
        })
      ).subscribe();
    } else {
      // Clear value if no valueId
      this.currentFieldValue = undefined;
      this.booleanControl.setValue(false, { emitEvent: false });
    }
  }

  onValueChange(): void {
    const newValue = this.booleanControl.value ?? false;

    if (this.currentFieldValue && this.currentFieldValue.booleanValue) {
      // Update existing boolean value within the field value
      const updatedValue = new FieldValue({
        ...this.currentFieldValue,
        booleanValue: {
          ...this.currentFieldValue.booleanValue,
          value: newValue
        }
      });

      this.fieldValueFacade.updateEntity(updatedValue).subscribe((savedValue: FieldValue) => {
        console.log('Boolean value updated:', savedValue);
        this.currentFieldValue = savedValue;
      });
    } else {
      // Create new field value with boolean value
      const newFieldValue = new FieldValue({
        booleanValue: {
          valueId: crypto.randomUUID(),
          value: newValue
        }
      } as FieldValue);

      this.fieldValueFacade.addEntity(newFieldValue).subscribe((savedValue: FieldValue) => {
        console.log('Boolean value created:', savedValue);
        this.currentFieldValue = savedValue;
        this.valueChanged.emit({ fieldId: this.field.id, valueId: savedValue.id });
      });
    }
  }
}
