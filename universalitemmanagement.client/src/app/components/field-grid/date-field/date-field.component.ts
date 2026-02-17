import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldValue } from 'src/app/core/models/field-value.model';
import { FieldValueFacade } from 'src/app/core/domain/store/fields/field-value.state';
import { tap } from 'rxjs';

@Component({
  selector: 'app-date-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
})
export class DateFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<{ fieldId: string; valueId: string }>();

  dateControl = new FormControl<Date | null>(null);
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
          const dateValue = fieldValue.dateValue?.value ? new Date(fieldValue.dateValue.value) : null;
          this.dateControl.setValue(dateValue, { emitEvent: false });
        })
      ).subscribe();
    } else {
      // Clear value if no valueId
      this.currentFieldValue = undefined;
      this.dateControl.setValue(null, { emitEvent: false });
    }
  }

  onValueChange(): void {
    const newValue = this.dateControl.value;

    if (this.currentFieldValue && this.currentFieldValue.dateValue) {
      // Update existing date value within the field value
      const updatedValue = new FieldValue({
        ...this.currentFieldValue,
        dateValue: {
          ...this.currentFieldValue.dateValue,
          value: newValue ?? new Date()
        }
      });

      this.fieldValueFacade.updateEntity(updatedValue).subscribe((savedValue: FieldValue) => {
        console.log('Date value updated:', savedValue);
        this.currentFieldValue = savedValue;
      });
    } else if (newValue) {
      // Create new field value with date value (only if date is selected)
      const newFieldValue = new FieldValue({
        dateValue: {
          valueId: crypto.randomUUID(),
          value: newValue
        }
      } as FieldValue);

      this.fieldValueFacade.addEntity(newFieldValue).subscribe((savedValue: FieldValue) => {
        console.log('Date value created:', savedValue);
        this.currentFieldValue = savedValue;
        this.valueChanged.emit({ fieldId: this.field.id, valueId: savedValue.id });
      });
    }
  }
}
