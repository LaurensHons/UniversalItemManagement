import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Field } from 'src/app/core/models/field.model';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
})
export class TextFieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() property!: FieldProperty;
  @Output() valueChanged = new EventEmitter<Field>();

  textControl = new FormControl('');
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
    this.textControl.setValue(this.field.textValue ?? '', { emitEvent: false });
  }

  onValueChange(): void {
    const newValue = this.textControl.value || '';
    if (newValue === (this.field.textValue ?? '')) return;

    this.status = 'saving';
    const updatedField = new Field({ ...this.field, textValue: newValue });

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
