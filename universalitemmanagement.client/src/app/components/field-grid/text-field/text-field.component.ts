import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldValue } from 'src/app/core/models/field-value.model';
import { FieldValueFacade } from 'src/app/core/domain/store/fields/field-value.state';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<{ fieldId: string; valueId: string }>();

  textControl = new FormControl('');
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
          this.textControl.setValue(fieldValue.textValue?.value ?? '', { emitEvent: false });
        })
      ).subscribe();
    } else {
      // Clear value if no valueId
      this.currentFieldValue = undefined;
      this.textControl.setValue('', { emitEvent: false });
    }
  }

  onValueChange(): void {
    const newValue = this.textControl.value || '';

    if (this.currentFieldValue && this.currentFieldValue.textValue) {
      // Update existing text value within the field value
      const updatedValue = new FieldValue({
        ...this.currentFieldValue,
        textValue: {
          ...this.currentFieldValue.textValue,
          value: newValue
        }
      });

      this.fieldValueFacade.updateEntity(updatedValue).subscribe((savedValue: FieldValue) => {
        console.log('Text value updated:', savedValue);
        this.currentFieldValue = savedValue;
      });
    } else {
      // Create new field value with text value
      const newFieldValue = new FieldValue({
        textValue: {
          valueId: crypto.randomUUID(),
          value: newValue
        }
      } as FieldValue);

      this.fieldValueFacade.addEntity(newFieldValue).subscribe((savedValue: FieldValue) => {
        console.log('Text value created:', savedValue);
        this.currentFieldValue = savedValue;
        this.valueChanged.emit({ fieldId: this.field.id, valueId: savedValue.id });
      });
    }
  }
}
