import { Routes } from '@angular/router';
import { RecordComponent } from '../components/record/record.component';
import { PropertyCreatorComponent } from '../components/property-creator/property-creator.component';

export const routes: Routes = [
  { path: 'record/:id', component: RecordComponent },
  { path: 'property-creator', component: PropertyCreatorComponent },
];

