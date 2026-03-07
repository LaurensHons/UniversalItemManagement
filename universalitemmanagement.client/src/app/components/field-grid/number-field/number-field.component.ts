import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-number-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './number-field.component.html',
  styleUrls: ['./number-field.component.scss'],
})
export class NumberFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<Field>();

  numberControl = new FormControl<number | null>(null);
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
    this.numberControl.setValue(this.field.numberValue ?? null, { emitEvent: false });
  }

  onValueChange(): void {
    const raw = this.numberControl.value;
    const newValue = raw != null ? Number(raw) : null;
    const oldValue = this.field.numberValue ?? null;

    if (newValue === oldValue) return;
    if (newValue != null && isNaN(newValue)) return;

    this.status = 'saving';
    const updatedField = new Field({ ...this.field, numberValue: newValue });

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
