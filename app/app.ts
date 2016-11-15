import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component, NgZone} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {DecisionService} from './decisionService';
import {AhpMethod} from './ahpMethod';
import {Decision} from './model';
import {ElectreMethod} from './electreMethod';

declare var require: any
const electron = require('electron');
const remote = electron.remote;
const fs = require('fs');

let {dialog} = remote;
var appComponent;

@Component({
  selector: 'app',
  directives: [AhpMethod, ElectreMethod],
  providers: [DecisionService],
  template: `
    <div *ngIf="calcMode">
       <nav class="navbar navbar-inverse">
          <div class="container">
            <div class="navbar-header">
              <a class="navbar-brand" href="#">{{currentDecision ? currentDecision.name : ""}}</a>
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
        <electre-method *ngIf="currentDecision && !ahpMethodSelected" [currentDecision]="currentDecision"></electre-method>
    </div>
    <div *ngIf="!calcMode && formModel" style="margin-top:20px;">
        <div class="form-group" style="margin:15px;">
          <label>Nazwa projektu:</label>
          <input type="text" class="form-control" [value]="formModel.name" (keyup)="onFormModelNameChange($event)"/>
          <small *ngIf="!viewModel.nameValid" class="text-danger">
            Nazwa projektu jest wymagana.
          </small>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12">
          <div class="panel panel-default">
              <div class="panel-heading" style="height:55px;">
                <h3 class="panel-title pull-left">Kryteria</h3>
                <button class="btn btn-default pull-right" (click)="addNewCriteria()">Dodaj</button>
              </div>
              <div class="panel-body">
                <table *ngIf="formModel.criterias.length > 0" class="table">
                  <tbody>
                    <tr *ngFor="let c of formModel.criterias; let i=index; trackBy:customTrackBy">
                      <td><span style="vertical-align:-webkit-baseline-middle;font-size:18px;">{{i + 1}}.</span></td>
                      <td>
                        <input type="text" class="form-control" [(ngModel)]="formModel.criterias[i]" />
                      </td>
                      <td>
                        <button class="btn btn-info" (click)="removeCriteria(i)">Usuń</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <small *ngIf="!viewModel.criteriaValid" class="text-danger">
                Należy wprowadzić przynajmniej 2 kryteria.
              </small>
          </div>
        </div>
        <div class="col-lg-6 col-md-6 col-sm-12">
          <div class="panel panel-default">
              <div class="panel-heading" style="height:55px;">
                <h3 class="panel-title pull-left">Warianty decyzyjne</h3>
                <button class="btn btn-default pull-right" (click)="addNewAlternative()">Dodaj</button>
              </div>
              <div class="panel-body">
                <table *ngIf="formModel.alternatives.length > 0" class="table">
                  <tbody>
                    <tr *ngFor="let a of formModel.alternatives; let i=index; trackBy:customTrackBy">
                      <td><span style="vertical-align:-webkit-baseline-middle;font-size:18px;">{{i + 1}}.</span></td>
                      <td>
                        <input type="text" class="form-control" [(ngModel)]="formModel.alternatives[i]" />
                      </td>
                      <td>
                        <button class="btn btn-info" (click)="removeAlternative(i)">Usuń</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <small *ngIf="!viewModel.alternativeValid" class="text-danger">
                Należy wprowadzić przynajmniej 2 warianty decyzyjne.
              </small>
          </div>
        </div>
        <button type="button" class="btn btn-primary pull-right" style="margin-right:15px;" (click)="saveDecisionModel()">Utwórz</button>
    </div>
  `
})

export class App {
  currentDecision: Decision;
  ahpMethodSelected: boolean = true;
  openedFileName: String;
  calcMode: boolean = true;
  formModel: Decision;
  viewModel = {
    nameValid: true,
    criteriaValid: true,
    alternativeValid: true
  };

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
    }, {
      label: "Nowy projekt",
      click: function() {
          appComponent.createNewProject();
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

  setCalcMode(calcMode: boolean) {
    this.zone.run(() => {
      this.calcMode = calcMode;
    });
  }

  createDecisionModel() {
    this.zone.run(() => {
      this.formModel = {
        name: "",
        criterias: [],
        alternatives: []
      };
    });
  }

  saveDecisionModel() {
    this.viewModel.nameValid = this.formModel.name.length > 0;
    this.viewModel.criteriaValid = this.formModel.criterias.filter((item) => item.length > 0).length >= 2;
    this.viewModel.alternativeValid = this.formModel.alternatives.filter((item) => item.length > 0).length >= 2;
    if (this.viewModel.nameValid && this.viewModel.criteriaValid && this.viewModel.alternativeValid) {
      this.decisionService.setDecision(this.formModel);
      this.currentDecision = this.formModel;
      this.calcMode = true;
    }
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
            dialog.showErrorBox("Wystąpił błąd podczas zapisywania pliku", err.message);
            return;
          }
          appComponent.decisionService.setDecision(JSON.parse(data));
          appComponent.setDecision();
          appComponent.openedFileName = fileNames[0];
          appComponent.setCalcMode(true);
        });
      }
    });
  }

  saveCurrentDecision() {
    let content = JSON.stringify(appComponent.decisionService.getCurrentDecision());

    if (appComponent.openedFileName !== undefined && appComponent.openedFileName !== null && appComponent.openedFileName.length > 0) {
        fs.writeFile(appComponent.openedFileName, content, function (err) {
          if(err) {
            dialog.showErrorBox("Wystąpił błąd podczas zapisywania pliku", err.message);
            return;
          }
          dialog.showMessageBox({message: "Plik został zapisany.", buttons: ["OK"]});
        }); 
    } else {
        dialog.showSaveDialog({filters: [{name: 'text', extensions: ['json'] }]}, function (fileName) {
        if (fileName === undefined) {
          return;
        }
        // fileName is a string that contains the path and filename created in the save file dialog.  
        fs.writeFile(fileName, content, function (err) {
          if(err) {
            dialog.showErrorBox("Wystąpił błąd podczas zapisywania pliku", err.message);
          }
          dialog.showMessageBox({message: "Plik został zapisany.", buttons: ["OK"]});
        });
      });
    }
  }

  createNewProject() {
    appComponent.setCalcMode(false);
    appComponent.createDecisionModel();
  }

  onFormModelNameChange(event) {
    this.formModel.name = event.target.value;
    this.viewModel.nameValid = this.formModel.name.length > 0;
  }

  onFormModelCriteriaChange(event, index) {
    this.formModel.criterias[index] = event.target.value;
  }

  addNewCriteria() {
    this.formModel.criterias.push("");
  }

  removeCriteria(index) {
    this.formModel.criterias.splice(index, 1);
  }

  onFormModelAlternativeChange(event, index) {
    this.formModel.alternatives[index] = event.target.value;
  }

  addNewAlternative() {
    this.formModel.alternatives.push("");
  }

  removeAlternative(index) {
    this.formModel.alternatives.splice(index, 1);
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }
 }

bootstrap(App);