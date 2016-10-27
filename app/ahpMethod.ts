import {Component, Input, EventEmitter} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {DecisionService} from './decisionService';
import {AhpEval} from './ahpEval';
import {AhpResult} from './ahpResult';
import {Decision, DecisionConfig, AlternativeEvaluation, Evaluation} from './model';

@Component({
  selector: 'ahp-method',
  providers: [DecisionService],
  directives: [AhpEval, AhpResult],
  template: `
    <div class="col-lg-4 col-md-4 col-sm-12">
        <ul class="list-group">
            <li class="list-group-item" (click)="showGoal()" [class.active]="currentPart == 0">Wynik</li>
            <li class="list-group-item" (click)="showCriterias()" [class.active]="currentPart == 1">
                Kryteria <span *ngIf="decisionConfig.criteriaEvaluationIsValid" class="glyphicon glyphicon-ok"></span>
            </li>
            <li class="list-group-item" style="padding-left: 30px;" *ngFor="let item of decisionConfig.alternativeEvaluations; let i = index;" [class.active]="currentAltEvalIndex == i" (click)="showAlternativesForCriteria(i)">
                Warianty decyzyjne wg kryterium: {{item.criteriaLabel}} <span *ngIf="decisionConfig.alternativeEvaluationIsValid[i]" class="glyphicon glyphicon-ok"></span>
            </li>
        </ul>
    </div>
    <div class="col-lg-8 col-md-8 col-sm-12">
        <div [hidden]="currentPart != 0">
            <ahp-result [decision]="decision"></ahp-result>
        </div>
        <div [hidden]="currentPart != 1">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena kryteriów</div>
                <div class="panel-body">
                    <h4>Wybierz, które kryterium jest ważniejsze</h4>
                    <ahp-eval *ngFor="let ce of decisionConfig.criteriaEvaluations; let i = index;" [label1]="ce.label1" [label2]="ce.label2" [value]="ce.value" [index]="i" (valueUpdated)="criteriaValueUpdated($event)"></ahp-eval>
                </div>
            </div>
        </div>
        <div *ngFor="let item of decisionConfig.alternativeEvaluations; let i = index;" [hidden]="currentAltEvalIndex != i">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena wariantów decyzyjnych względem kryterium: {{item.criteriaLabel}}</div>
                <div class="panel-body">
                    <h4>Wybierz, który wariant decyzyjny jest ważniejszy</h4>
                    <ahp-eval *ngFor="let ae of item.evalArray; let j = index;" [label1]="ae.label1" [label2]="ae.label2" [value]="ae.value" [index]="j" [index2]="i" (valueUpdated)="alternativeValueUpdated($event)"></ahp-eval>
                </div>
            </div>
        </div>
    </div>
    `
})

export class AhpMethod {
    decision: Decision;
    decisionConfig: DecisionConfig;
    currentPart = 0;
    currentAltEvalIndex = -1;
  constructor(private decisionService: DecisionService) {
      this.decision = decisionService.getCurrentDecision();
      if (this.decision.aconfig == undefined || this.decision.aconfig == null) {
          this.decision.aconfig = {
              resultCalculated: false,
              resultMatrix: [],
              resultTotal: [],
              criteriaTotal: [],
              crCriteria: 0,
              crAlternatives: [],
              isValid: false,
              isConsistent: true,
              criteriaEvaluations: [],
              alternativeEvaluations: [],
              criteriaEvaluationIsValid: false,
              alternativeEvaluationIsValid: [],
              inconsistentMessageList: []
          };
      }
      this.decisionConfig = this.decision.aconfig;
      if (this.decisionConfig.criteriaEvaluations.length == 0) {
          this.createCriteriaEvaluation();
      }
      if (this.decisionConfig.alternativeEvaluations.length == 0) {
          this.createAlternativeEvaluation();
      }
  }

  createCriteriaEvaluation() {
      var list = this.decision.criterias;

      for (var i = 0; i < list.length; i++) {
          for (var j = i + 1; j < list.length; j++) {
              var c1 = list[i];
              var c2 = list[j];
              this.decisionConfig.criteriaEvaluations.push({label1: c1, label2: c2});
          }
      }

      this.checkIfCriteriaEvaluationIsValid();
  }

  createAlternativeEvaluation() {
      for (var i = 0; i < this.decision.criterias.length; i++) {
          var altEval: AlternativeEvaluation = {criteriaLabel: this.decision.criterias[i], evalArray: []};

          var list = this.decision.alternatives;
          for (var j = 0; j < list.length; j++) {
              for (var k = j + 1; k < list.length; k++) {
                  var a1 = list[j];
                  var a2 = list[k];
                  altEval.evalArray.push({label1: a1, label2: a2});
              }
          }
          this.decisionConfig.alternativeEvaluations.push(altEval);
      }
      this.checkIfAlternativeEvaluationIsValid();
  }

  criteriaValueUpdated(event) {
      this.decisionConfig.criteriaEvaluations[event.index].value = event.value;
      this.checkIfCriteriaEvaluationIsValid();
  }

  alternativeValueUpdated(event) {
      this.decisionConfig.alternativeEvaluations[event.index2].evalArray[event.index].value = event.value;
      this.checkIfAlternativeEvaluationIsValid();
  }

  checkViewValid() {
      if (!this.decisionConfig.criteriaEvaluationIsValid) {
          this.decisionConfig.isValid = false;
      } else {
          var isValid = true;
          for (var i = 0; i < this.decisionConfig.alternativeEvaluationIsValid.length; i++) {
              if (!this.decisionConfig.alternativeEvaluationIsValid[i]) {
                  isValid = false;
                  break;
              }
          }
          this.decisionConfig.isValid = isValid;
      }
  }

  checkIfCriteriaEvaluationIsValid() {
      var isValid = true;
      for (var i = 0; i < this.decisionConfig.criteriaEvaluations.length; i++) {
          if (this.decisionConfig.criteriaEvaluations[i].value == undefined || this.decisionConfig.criteriaEvaluations[i].value == null) {
            isValid = false;
            break;
          }
      }
      this.decisionConfig.criteriaEvaluationIsValid = isValid;
      this.checkViewValid();
  }

  checkIfAlternativeEvaluationIsValid() {
      for (var i = 0; i < this.decisionConfig.alternativeEvaluations.length; i++) {
          var isValid = true;
          var ae = this.decisionConfig.alternativeEvaluations[i];
          if (ae != undefined && ae != null) {
              var opts = ae.evalArray;
              if (opts != undefined && opts != null) {
                  for (var j = 0; j < opts.length; j++) {
                      if (opts[j].value == undefined || opts[j].value == null) {
                          isValid = false;
                          break;
                      }
                  }
              } else {
                  isValid = false;
              }
          } else {
              isValid = false;
          }
          this.decisionConfig.alternativeEvaluationIsValid[i] = isValid;
      }
      this.checkViewValid();
  }

  showGoal() {
      this.currentPart = 0;
      this.currentAltEvalIndex = -1;
  }

  showCriterias() {
        this.currentPart = 1;
        this.currentAltEvalIndex = -1;
  }

  showAlternativesForCriteria(index) {
      this.currentPart = -1;
      this.currentAltEvalIndex = index;
  }
}