import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipDirective } from 'projects/angular-tooltip/src/public-api';

import { AppComponent } from './app.component';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [BrowserModule, TooltipDirective],
  providers: []
})
export class AppModule {}
