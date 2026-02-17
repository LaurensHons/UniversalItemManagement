import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Record } from 'src/app/core/models/record.model';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RecordFacade } from 'src/app/core/domain/store/record/record.state';
import {
  filter,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FieldGridComponent } from '../field-grid/field-grid.component';
import { FieldPropertyFacade } from 'src/app/core/domain/store/fields/field-property.state';
import { FieldProperty } from 'src/app/core/models/field-property.model';
import { FieldFacade } from 'src/app/core/domain/store/fields/field.state';
import { Field } from 'src/app/core/models/field.model';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FieldGridComponent,
  ],
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss'],
})
export class RecordComponent {
  recordId = new Subject<string>();
  form!: FormGroup;

  record?: Record;
  fieldPropertiesMap = new Map<string, FieldProperty>();

  @Input()
  set id(id: string) {
    this.recordId.next(id);
  }

  constructor(
    private recordService: RecordFacade,
    private route: ActivatedRoute,
    private fieldPropertyFacade: FieldPropertyFacade,
    private fieldFacade: FieldFacade
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });

    // Subscribe to record changes from state
    this.route.paramMap
      .pipe(
        map((p) => p.get('id')),
        filter((v) => !!v),
        switchMap((v) => this.recordService.entity$(v!)),
        tap((record) => {
          // Update local record reference when state changes
          this.record = record;

          // Only update form if values have changed to avoid overwriting user edits
          if (this.form.get('id')?.value !== record.id) {
            this.form.setValue({
              id: record.id,
              name: record.name,
              description: record.description,
            });
          }
        }),
        switchMap((record) => this.loadFieldPropertiesForRecord(record))
      )
      .subscribe();
  }

  loadFieldPropertiesForRecord(record: Record): Observable<FieldProperty[]> {
    // Extract unique property IDs from the record's fields
    const uniquePropertyIds = [...new Set(record.fields.map((field) => field.propertyId))];

    // If no fields, return empty observable
    if (uniquePropertyIds.length === 0) {
      this.fieldPropertiesMap.clear();
      return of([]);
    }

    // First, try to get properties from the state
    return this.fieldPropertyFacade.entities$().pipe(
      switchMap((propertiesInState) => {
        // Check which properties are already in state
        const propertiesInStateMap = new Map<string, FieldProperty>(
          propertiesInState.map((p) => [p.id, p])
        );

        const missingPropertyIds = uniquePropertyIds.filter(
          (id) => !propertiesInStateMap.has(id)
        );

        // If all properties are in state, use them
        if (missingPropertyIds.length === 0) {
          const properties = uniquePropertyIds.map((id) => propertiesInStateMap.get(id)!);
          this.fieldPropertiesMap = new Map(
            properties.map((property) => [property.id, property])
          );
          return of(properties);
        }

        // Otherwise, fetch missing properties from backend
        const propertyRequests = missingPropertyIds.map((propertyId) =>
          this.fieldPropertyFacade.getEntity(propertyId)
        );

        return forkJoin(propertyRequests).pipe(
          map((fetchedProperties) => {
            // Combine properties from state and newly fetched
            const allProperties = [
              ...uniquePropertyIds
                .filter((id) => propertiesInStateMap.has(id))
                .map((id) => propertiesInStateMap.get(id)!),
              ...fetchedProperties,
            ];

            this.fieldPropertiesMap = new Map(
              allProperties.map((property) => [property.id, property])
            );

            return allProperties;
          })
        );
      })
    );
  }

  saveRecord() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const record = new Record(this.form.value);
    this.recordService
      .updateEntity(record)
      .subscribe(() => {
        this.form.reset();
      });
  }

  onFieldAdded(event: { propertyId: string; x: number; y: number; width: number; height: number }): void {
    if (!this.record) return;

    const newField = new Field({
      x: event.x,
      y: event.y,
      width: event.width,
      height: event.height,
      propertyId: event.propertyId,
      recordId: this.record.id,
    } as Field);


    this.fieldFacade.addEntity(newField).subscribe((createdField: Field) => {
      console.log('Field created successfully:', createdField);
      this.addFieldToRecord(createdField);
    });
  }

  onFieldMoved(event: { fieldId: string; x: number; y: number }): void {
    if (!this.record) return;

    const field = this.record.fields.find(f => f.id === event.fieldId);
    if (!field) return;

    console.log('Moving field:', { field, newPosition: event });

    const updatedField = new Field({
      ...field,
      x: event.x,
      y: event.y
    } as Field);

    this.updateFieldAndRecord(updatedField, 'Field position updated');
  }

  onFieldValueChanged(event: { fieldId: string; valueId: string }): void {
    if (!this.record) return;

    const field = this.record.fields.find(f => f.id === event.fieldId);
    if (!field) return;

    const updatedField = new Field({
      ...field,
      valueId: event.valueId
    } as Field);

    this.updateFieldAndRecord(updatedField, 'Field valueId updated');
  }

  private updateFieldAndRecord(updatedField: Field, logMessage: string): void {
    this.fieldFacade.updateEntity(updatedField).subscribe((savedField: Field) => {
      console.log(logMessage, savedField);
      this.replaceFieldInRecord(savedField);
    });
  }

  private addFieldToRecord(field: Field): void {
    if (!this.record) return;

    const updatedRecord = new Record({
      ...this.record,
      fields: [...this.record.fields, field]
    });

    this.recordService.updateEntity(updatedRecord).subscribe();
  }

  private replaceFieldInRecord(updatedField: Field): void {
    if (!this.record) return;

    const updatedRecord = new Record({
      ...this.record,
      fields: this.record.fields.map(f =>
        f.id === updatedField.id ? updatedField : f
      )
    });

    this.recordService.updateEntity(updatedRecord).subscribe();
  }
}
