import {Component, Input, EventEmitter} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {Decision, EDecisionConfig} from './model';
import {ElectreResult} from './electreResult';

@Component({
  selector: 'electre-method',
  directives: [ElectreResult],
  template: `
    <div class="col-lg-4 col-md-4 col-sm-12">
        <ul class="list-group">
            <li class="list-group-item" (click)="showGoal()" [class.active]="currentPart == 0">Wynik</li>
            <li class="list-group-item" (click)="showCriterias()" [class.active]="currentPart == 1">
                Kryteria <span *ngIf="decisionConfig.criteriaEvaluationIsValid && decisionConfig.isConsistent" class="glyphicon glyphicon-ok"></span>
            </li>
            <li class="list-group-item" style="padding-left: 30px;" *ngFor="let item of decision.criterias; let i = index;" [class.active]="currentAltIndex == i" (click)="showAlternativesForCriteria(i)">
                Warianty decyzyjne wg kryterium: {{item}} <span *ngIf="decisionConfig.alternativeEvaluationIsValid[i]" class="glyphicon glyphicon-ok"></span>
            </li>
        </ul>
    </div>
    <div class="col-lg-8 col-md-8 col-sm-12">
        <div [hidden]="currentPart != 0">
            <div class="form-group" [class.has-error]="decisionConfig.complianceThreshold < 0.5 || decisionConfig.complianceThreshold > 1.0">
                <label>Podaj próg zgodności:</label>
                <input type="number" style="width: 100px;" class="form-control" value="{{decisionConfig.complianceThreshold}}" #complianceThreshold (keyup)="onComplianceThresholdChange(complianceThreshold.value)">
                <span>*Próg zgodności musi się mieścić w przedziale 0.5-1</span>
                <electre-result [decision]="decision"></electre-result>
            </div>
        </div>
        <div [hidden]="currentPart != 1">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena kryteriów</div>
                <div class="panel-body">
                    <h4>Zdefiniuj wagi oraz progi weta dla każdego kryterium</h4>
                    <span>*Suma wag kryteriów musi wynosić 1</span>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th *ngFor="let c of decision.criterias">{{c}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Waga</td>
                                <td *ngFor="let c of decision.criterias; let i = index;" class="text-right">
                                    <input type="number" class="form-control" value="{{decisionConfig.criteriaWeights[i]}}" (keyup)="onCriteriaWeightChange($event.target.value, i)"/>
                                </td>
                            </tr>
                            <tr>
                                <td>Próg weta</td>
                                <td *ngFor="let c of decision.criterias; let i = index;" class="text-right">
                                    <input type="number" class="form-control" value="{{decisionConfig.criteriaWetoTresholds[i]}}" (keyup)="onCriteriaWetoTresholdChange($event.target.value, i)"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div *ngFor="let c of decision.criterias; let i = index;" [hidden]="currentAltIndex != i">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena wariantów decyzyjnych względem kryterium: {{c}}</div>
                <div class="panel-body">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th *ngFor="let a of decision.alternatives">{{a}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Waga</td>
                                <td *ngFor="let a of decision.alternatives; let j = index;" class="text-right">
                                    <input type="number" class="form-control" value="{{decisionConfig.alternativeWeights[i][j]}}" (keyup)="onAlternativeWeightChange($event.target.value, j, i)"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    `
})

export class ElectreMethod {
    decision: Decision;
    @Input() set currentDecision (d: Decision) {
        this.decision = d;
        this.initDecision();
    }
    decisionConfig: EDecisionConfig;
    currentPart = 0;
    currentAltIndex = -1;
  constructor() {}

  initDecision() {
      if (this.decision.econfig == undefined || this.decision.econfig == null) {
          this.decision.econfig = {
              resultCalculated: false,
              isValid: false,
              criteriaEvaluationIsValid: false,
              alternativeEvaluationIsValid: [],
              criteriaWeights: [],
              criteriaWetoTresholds: [],
              alternativeWeights: this.getEmptyAlternativeWeights(),
              complianceThreshold: 0.5,
              isConsistent: true,
              inconsistentMessageList: []
          };
      }
      this.decisionConfig = this.decision.econfig;
  }

  getEmptyAlternativeWeights() {
      let result = [];
      for (let i = 0; i < this.decision.criterias.length; i++) {
          result.push(new Array(this.decision.alternatives.length));
      }
      return result;
  }

  onComplianceThresholdChange(value) {
      this.decisionConfig.complianceThreshold = Number(value);
      this.checkIfValid();
      this.checkIfConsistent();
  }

  onCriteriaWeightChange(value, index) {
      this.decisionConfig.criteriaWeights[index] = Number(value);
      this.checkCriteriaWeightValidity();
      this.checkIfConsistent();
  }

  onCriteriaWetoTresholdChange(value, index) {
      this.decisionConfig.criteriaWetoTresholds[index] = Number(value);
      this.checkCriteriaWetoTresholdValidity();
  }

  onAlternativeWeightChange(value, index, criteriaIndex) {
      this.decisionConfig.alternativeWeights[criteriaIndex][index] = Number(value);
      this.checkAlternativeWeightValidity();
  }

  checkIfValid() {
      let valid = true;
      if (this.decisionConfig.complianceThreshold < 0.5 || this.decisionConfig.complianceThreshold > 1.0 || !this.decisionConfig.criteriaEvaluationIsValid) {
          valid = false;
      } else {
          if (this.decisionConfig.alternativeEvaluationIsValid.length === 0) {
              valid = false;
          } else {
              for (let i = 0; i < this.decisionConfig.alternativeEvaluationIsValid.length; i++) {
                  if (!this.decisionConfig.alternativeEvaluationIsValid[i]) {
                      valid = false;
                      break;
                  } 
              }
          }
          
      }
      this.decisionConfig.isValid = valid;
  }

  checkIfConsistent() {
      let consistent = true;
      this.decision.econfig.inconsistentMessageList = [];
      if (this.decisionConfig.complianceThreshold < 0.5 || this.decisionConfig.complianceThreshold > 1.0) {
          consistent = false;
          this.decision.econfig.inconsistentMessageList.push("Próg zgodności jest poza wymaganym przedziałem wartości.");
      } else {
          let sum = 0;
          for (let i = 0; i < this.decision.criterias.length; i++) {
              if (this.decisionConfig.criteriaWeights[i] === undefined || this.decisionConfig.criteriaWeights[i] === null) {
                  consistent = false;
                  break;
              } else {
                  sum += this.decisionConfig.criteriaWeights[i];
              }
          }
          if (sum !== 1) {
              consistent = false;
          }
      }
      if (!consistent) {
          this.decision.econfig.inconsistentMessageList.push("Suma wag kryteriów nie jest równa 1.");
      }
      this.decision.econfig.isConsistent = consistent;
  }

  checkCriteriaWeightValidity() {
      let sum = 0;
      let valid = true;
      for (let i = 0; i < this.decision.criterias.length; i++) {
          if (this.decisionConfig.criteriaWeights[i] === undefined || this.decisionConfig.criteriaWeights[i] === null) {
              valid = false;
              break;
          } else {
              sum += this.decisionConfig.criteriaWeights[i];
          }
      }
      if (sum !== 1) {
          valid = false;
      }

      this.decision.econfig.isValid = valid;
      this.checkIfValid();
  }

  checkCriteriaWetoTresholdValidity() {
      let valid = true;
      for (let i = 0; i < this.decision.criterias.length; i++) {
          if (this.decisionConfig.criteriaWetoTresholds[i] === undefined || this.decisionConfig.criteriaWetoTresholds[i] === null) {
              valid = false;
              break;
          }
      }
      this.decisionConfig.criteriaEvaluationIsValid = valid;
      this.checkIfValid();
  }

  checkAlternativeWeightValidity() {
      for (let i = 0; i < this.decision.criterias.length; i++) {
          let valid = true;
          var ae = this.decisionConfig.alternativeWeights[i];
          if (ae !== undefined && ae !== null) {
              for (let j = 0; j < this.decision.alternatives.length; j++) {
                  if (ae[j] === undefined || ae[j] === null) {
                      valid = false;
                      break;
                  }
              }
          } else {
              valid = false;
          }
          this.decisionConfig.alternativeEvaluationIsValid[i] = valid;
      }
      this.checkIfValid();
  }

  showGoal() {
      this.currentPart = 0;
      this.currentAltIndex = -1;
  }

  showCriterias() {
        this.currentPart = 1;
        this.currentAltIndex = -1;
  }

  showAlternativesForCriteria(index) {
      this.currentPart = -1;
      this.currentAltIndex = index;
  }
}