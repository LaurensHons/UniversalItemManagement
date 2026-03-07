import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldPropertyType } from 'src/app/core/models/field-property.model';

export interface SelectOptionDraft {
  id?: string;
  name: string;
  color: string;
}

export interface PropertyFormValue {
  name: string;
  type: FieldPropertyType;
  isMultiSelect: boolean;
  selectOptions: SelectOptionDraft[];
}

const OPTION_COLORS = [
  '#c45d3e', // terracotta
  '#7a9e7e', // sage
  '#d4a03c', // honey
  '#5b8fb9', // sky
  '#c96b6b', // rose
  '#8b6db0', // lavender
  '#4a9e9e', // teal
  '#d97b61', // terracotta-light
];

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
})
export class PropertyFormComponent implements OnInit, OnChanges {
  @Input() initialData?: PropertyFormValue;
  @Input() lockType = false;
  @Output() formValueChange = new EventEmitter<PropertyFormValue>();
  @Output() validChange = new EventEmitter<boolean>();

  propertyForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    type: new FormControl<FieldPropertyType>(FieldPropertyType.Text, [Validators.required]),
  });

  propertyTypes = [
    { value: FieldPropertyType.Text, label: 'Text', icon: 'notes', desc: 'Short or long text values' },
    { value: FieldPropertyType.Number, label: 'Number', icon: 'tag', desc: 'Numeric values with decimals' },
    { value: FieldPropertyType.Boolean, label: 'Boolean', icon: 'toggle_on', desc: 'True / false toggle' },
    { value: FieldPropertyType.Date, label: 'Date', icon: 'calendar_today', desc: 'Calendar date picker' },
    { value: FieldPropertyType.Select, label: 'Select', icon: 'list', desc: 'Pick from predefined options' },
  ];

  selectOptions: SelectOptionDraft[] = [];
  newOptionName = '';
  isMultiSelect = false;

  get selectedType(): FieldPropertyType {
    return this.propertyForm.get('type')!.value!;
  }

  get isSelectType(): boolean {
    return this.selectedType === FieldPropertyType.Select;
  }

  get isValid(): boolean {
    if (!this.propertyForm.valid) return false;
    if (this.isSelectType && this.selectOptions.length < 2) return false;
    return true;
  }

  ngOnInit(): void {
    this.applyInitialData();
    this.propertyForm.valueChanges.subscribe(() => this.emitState());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && !changes['initialData'].firstChange) {
      this.applyInitialData();
    }
  }

  private applyInitialData(): void {
    if (!this.initialData) return;
    this.propertyForm.patchValue({
      name: this.initialData.name,
      type: this.initialData.type,
    });
    this.isMultiSelect = this.initialData.isMultiSelect;
    this.selectOptions = this.initialData.selectOptions.map(o => ({ ...o }));
    this.emitState();
  }

  selectType(type: FieldPropertyType): void {
    if (this.lockType) return;
    this.propertyForm.get('type')?.setValue(type);
  }

  toggleMultiSelect(): void {
    this.isMultiSelect = !this.isMultiSelect;
    this.emitState();
  }

  addOption(): void {
    const name = this.newOptionName.trim();
    if (!name) return;
    if (this.selectOptions.some(o => o.name.toLowerCase() === name.toLowerCase())) return;

    this.selectOptions.push({
      name,
      color: OPTION_COLORS[this.selectOptions.length % OPTION_COLORS.length],
    });
    this.newOptionName = '';
    this.emitState();
  }

  removeOption(index: number): void {
    this.selectOptions.splice(index, 1);
    this.emitState();
  }

  onOptionKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addOption();
    }
  }

  getValue(): PropertyFormValue {
    return {
      name: this.propertyForm.get('name')!.value ?? '',
      type: this.propertyForm.get('type')!.value!,
      isMultiSelect: this.isMultiSelect,
      selectOptions: [...this.selectOptions],
    };
  }

  private emitState(): void {
    this.formValueChange.emit(this.getValue());
    this.validChange.emit(this.isValid);
  }
}
