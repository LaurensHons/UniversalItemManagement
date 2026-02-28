import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-boolean-field',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './boolean-field.component.html',
  styleUrls: ['./boolean-field.component.scss'],
})
export class BooleanFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<Field>();

  value = false;
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
    this.value = this.field.booleanValue ?? false;
  }

  toggle(): void {
    this.value = !this.value;
    this.status = 'saving';

    const updatedField = new Field({ ...this.field, booleanValue: this.value });

    this.fieldFacade.updateEntity(updatedField).subscribe({
      next: (savedField: Field) => {
        this.status = 'saved';
        this.valueChanged.emit(savedField);
        this.clearSavedStatus();
      },
      error: () => {
        this.value = !this.value; // Revert on error
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
