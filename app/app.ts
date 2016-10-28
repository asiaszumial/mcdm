import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {DecisionService} from './decisionService';
import {AhpMethod} from './ahpMethod';

declare var require: any
const electron = require('electron');
const remote = electron.remote;

let {dialog} = remote;

@Component({
  selector: 'app',
  directives: [AhpMethod],
  providers: [DecisionService],
  template: `
    <nav class="navbar navbar-inverse">
      <div class="container">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">{{currentProjectName}}</a>
        </div>
        <ul class="nav navbar-nav">
          <li (click)="ahpSelected()" [class.active]="ahpMethodSelected">
            <a href="#">AHP</a>
          </li>
          <li (click)="electreSelected()" [class.active]="!ahpMethodSelected">
            <a href="#">Electre</a>
          </li>
        </ul>
      </div>
    </nav>
    <ahp-method *ngIf="ahpMethodSelected"></ahp-method>
  `
})

export class App {
  currentProjectName: String;
  ahpMethodSelected: boolean = true;
  constructor(private decisionService: DecisionService) {
    var menu = remote.Menu.buildFromTemplate([{
      label: "Otwórz",
      click: function(){
            console.log("open")
            }
    }, {
      label: "Zapisz",
        click: function(){
              console.log("save")
            }
    }]);
    remote.Menu.setApplicationMenu(menu);
    this.currentProjectName = decisionService.getCurrentDecision().name;
  }

  ahpSelected() {
    this.ahpMethodSelected = true;
  }

  electreSelected() {
    this.ahpMethodSelected = false;
  }
}

bootstrap(App);