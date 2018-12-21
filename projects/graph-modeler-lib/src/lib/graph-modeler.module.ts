import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GraphModelerComponent } from './graph-modeler.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [GraphModelerComponent],
  exports: [GraphModelerComponent]
})
export class GraphModelerModule { }
