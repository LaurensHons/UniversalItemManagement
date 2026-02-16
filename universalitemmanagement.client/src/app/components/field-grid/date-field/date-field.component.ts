import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';

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
export class DateFieldComponent implements OnInit {
  @Input() field!: Field;
  @Input() property!: FieldProperty;

  dateControl = new FormControl<Date | null>(null);

  ngOnInit(): void {
    // Load initial value if exists
    if (this.field.dateValueId) {
      // TODO: Load value from service
    }
  }

  onValueChange(): void {
    // TODO: Save value to backend
    console.log('Date value changed:', this.dateControl.value);
  }
}
