import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';

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
export class TextFieldComponent implements OnInit {
  @Input() field!: Field;
  @Input() property!: FieldProperty;

  textControl = new FormControl('');

  ngOnInit(): void {
    // Load initial value if exists
    if (this.field.textValueId) {
      // TODO: Load value from service
    }
  }

  onValueChange(): void {
    // TODO: Save value to backend
    console.log('Text value changed:', this.textControl.value);
  }
}
