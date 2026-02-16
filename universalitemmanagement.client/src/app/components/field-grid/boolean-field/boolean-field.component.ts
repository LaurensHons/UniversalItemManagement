import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';

@Component({
  selector: 'app-boolean-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss'],
})
export class BooleanFieldComponent implements OnInit {
  @Input() field!: Field;
  @Input() property!: FieldProperty;

  booleanControl = new FormControl(false);

  ngOnInit(): void {
    // Load initial value if exists
    if (this.field.booleanValueId) {
      // TODO: Load value from service
    }
  }

  onValueChange(): void {
    // TODO: Save value to backend
    console.log('Boolean value changed:', this.booleanControl.value);
  }
}
