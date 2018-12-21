import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  data: any;

  constructor() {}

  onSchemaSelected(result: any) {
    console.log('onSchemaSelected', result);
    this.data = undefined;
    this.data = result;
  }

}
