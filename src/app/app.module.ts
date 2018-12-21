import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { GraphModelerModule } from 'graph-modeler';

import { AppComponent } from './app.component';
import { JsonService } from './json.service';
import { ChangeSchemaComponent } from './change-schema.component';

@NgModule({
  declarations: [
    AppComponent,
    ChangeSchemaComponent
  ],
  imports: [
    BrowserModule,
    GraphModelerModule,
    HttpClientModule
  ],
  providers: [
    JsonService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
