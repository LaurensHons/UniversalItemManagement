import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
    MatIconModule,
  ],
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
})
export class DateFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<Field>();

  dateControl = new FormControl<Date | null>(null);
  status: SaveStatus = 'idle';

  private savedTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private fieldFacade: FieldFacade) {}

  ngOnInit(): void {
    this.loadValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['field'] && !changes['field'].firstChange) {
      this.loadValue();
    }
  }

  private loadValue(): void {
    const dateValue = this.field.dateValue ? new Date(this.field.dateValue) : null;
    this.dateControl.setValue(dateValue, { emitEvent: false });
  }

  onValueChange(): void {
    const newValue = this.dateControl.value;
    this.status = 'saving';

    const updatedField = new Field({ ...this.field, dateValue: newValue });

    this.fieldFacade.updateEntity(updatedField).subscribe({
      next: (savedField: Field) => {
        this.status = 'saved';
        this.valueChanged.emit(savedField);
        this.clearSavedStatus();
      },
      error: () => {
        this.status = 'error';
        this.clearSavedStatus();
      },
    });
  }

  private clearSavedStatus(): void {
    if (this.savedTimeout) clearTimeout(this.savedTimeout);
    this.savedTimeout = setTimeout(() => { this.status = 'idle'; }, 2500);
  }
}
