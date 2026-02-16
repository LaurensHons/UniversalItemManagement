import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { FieldProperty, FieldPropertyType } from 'src/app/core/models/field-property.model';
import { FieldPropertyFacade, FieldPropertyEntities } from 'src/app/core/domain/store/fields/field-property.state';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-property-creator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
  ],
  templateUrl: './property-creator.component.html',
  styleUrls: ['./property-creator.component.scss'],
})
export class PropertyCreatorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  properties: FieldProperty[] = [];
  propertyTypes = Object.values(FieldPropertyType);
  displayedColumns: string[] = ['name', 'type', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(private fieldPropertyFacade: FieldPropertyFacade) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      type: new FormControl(FieldPropertyType.Text, [Validators.required]),
    });

    // Load existing properties from store
    this.fieldPropertyFacade.getEntities(FieldPropertyEntities.FieldProperty)
      .pipe(takeUntil(this.destroy$))
      .subscribe();

    // Subscribe to properties from store
    this.fieldPropertyFacade.entities$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(properties => {
        this.properties = properties;
      });
  }

  createProperty(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const property = new FieldProperty({
      ...this.form.value,
      id: crypto.randomUUID(),
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    } as FieldProperty);

    this.fieldPropertyFacade.addEntity(property)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.form.reset({ type: FieldPropertyType.Text });
        },
        error: (error) => {
          console.error('Error creating property:', error);
        }
      });
  }

  deleteProperty(property: FieldProperty): void {
    this.fieldPropertyFacade.removeEntity(property.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('Error deleting property:', error);
        }
      });
  }

  saveProperties(): void {
    console.log('All properties are automatically saved via the store');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.form.reset();
  }
}
