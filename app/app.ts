import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component, NgZone} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {DecisionService} from './decisionService';
import {AhpMethod} from './ahpMethod';
import {Decision} from './model';

declare var require: any
const electron = require('electron');
const remote = electron.remote;
const fs = require('fs');

let {dialog} = remote;
var appComponent;

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
    <ahp-method *ngIf="currentDecision && ahpMethodSelected" [currentDecision]="currentDecision"></ahp-method>
  `
})

export class App {
  currentDecision: Decision;
  ahpMethodSelected: boolean = true;
  openedFileName: String;

  constructor(private decisionService: DecisionService, private zone: NgZone) {
    appComponent = this;
    var menu = remote.Menu.buildFromTemplate([{
      label: "Otwórz",
      click: function() {
          appComponent.openProject();
      }
    }, {
      label: "Zapisz",
      click: function() {
          appComponent.saveCurrentDecision();
      }
    }]);
    remote.Menu.setApplicationMenu(menu);
    this.setDecision();
  }

  setDecision() {
    this.zone.run(() => {
      this.currentDecision = this.decisionService.getCurrentDecision();
    });
  }

  ahpSelected() {
    this.ahpMethodSelected = true;
  }

  electreSelected() {
    this.ahpMethodSelected = false;
  }

  openProject() {
    dialog.showOpenDialog({filters: [{name: 'text', extensions: ['json'] }]}, function (fileNames) {
      if(fileNames !== undefined) {
        fs.readFile(fileNames[0], 'utf-8', function (err, data) {
          if(err) {
            alert("Wystąpił błąd podczas otwierania pliku");
            return;
          }
          appComponent.decisionService.setDecision(JSON.parse(data));
          appComponent.setDecision();
          appComponent.openedFileName = fileNames[0];
        });
      }
    });
  }

  saveCurrentDecision() {
    let content = JSON.stringify(appComponent.decisionService.getCurrentDecision());

    if (appComponent.openedFileName !== undefined && appComponent.openedFileName !== null && appComponent.openedFileName.length > 0) {
        fs.writeFile(appComponent.openedFileName, content, function (err) {
          if(err) {
            alert("Wystąpił błąd podczas zapisywania pliku");
            return;
          }
          alert("Plik został zapisany");
        }); 
    } else {
        dialog.showSaveDialog({filters: [{name: 'text', extensions: ['json'] }]}, function (fileName) {
        if (fileName === undefined) {
          return;
        }
        // fileName is a string that contains the path and filename created in the save file dialog.  
        fs.writeFile(fileName, content, function (err) {
          if(err) {
            alert("Wystąpił błąd podczas zapisywania pliku");
          }
          alert("Plik został zapisany");
        });
      });
    }
  }
}

bootstrap(App);