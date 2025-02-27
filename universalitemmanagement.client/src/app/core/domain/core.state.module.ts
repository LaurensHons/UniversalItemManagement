import { isDevMode, NgModule } from '@angular/core';
import { NgModel } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { effects, featureKey, reducers } from './store/core.feature';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(featureKey, reducers),
    EffectsModule.forFeature(effects),
    StoreDevtoolsModule.instrument({ logOnly: !isDevMode() }),
  ],
  providers: [],
})
export class CoreStateModule {}
