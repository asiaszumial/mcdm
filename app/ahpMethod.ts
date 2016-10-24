import {Component, Input, EventEmitter} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {DecisionService} from './decisionService';
import {AhpEval} from './ahpEval';
import {AhpResult} from './ahpResult';

@Component({
  selector: 'ahp-method',
  providers: [DecisionService],
  directives: [AhpEval, AhpResult],
  template: `
    <div class="col-lg-4 col-md-4 col-sm-12">
        <ul class="list-group">
            <li class="list-group-item" (click)="showGoal()" [class.active]="currentPart == 0">Wynik</li>
            <li class="list-group-item" (click)="showCriterias()" [class.active]="currentPart == 1">
                Kryteria <span *ngIf="criteriaEvaluationIsValid" class="glyphicon glyphicon-ok"></span>
            </li>
            <li class="list-group-item" style="padding-left: 30px;" *ngFor="let item of alternativeEvaluation; let i = index;" [class.active]="currentAltEvalIndex == i" (click)="showAlternativesForCriteria(i)">
                Warianty decyzyjne wg kryterium: {{item.c}} <span *ngIf="alternativeEvaluationIsValid[i]" class="glyphicon glyphicon-ok"></span>
            </li>
        </ul>
    </div>
    <div class="col-lg-8 col-md-8 col-sm-12">
        <div [hidden]="currentPart != 0">
            <div *ngIf="!viewIsValid">Obliczenie wyniku jest niemożliwe, ponieważ nie wprowadzono wszystkich danych</div>
            <div>
                <ahp-result [viewIsValid]="viewIsValid" [config]="config" [criteriaEvaluation]="criteriaEvaluation" [alternativeEvaluation]="alternativeEvaluation"></ahp-result>
            </div>
        </div>
        <div [hidden]="currentPart != 1">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena kryteriów</div>
                <div class="panel-body">
                    <h4>Wybierz, które kryterium jest ważniejsze</h4>
                    <ahp-eval *ngFor="let ce of criteriaEvaluation; let i = index;" [label1]="ce.c1" [label2]="ce.c2" [value]="ce.val" [index]="i" (valueUpdated)="criteriaValueUpdated($event)"></ahp-eval>
                </div>
            </div>
        </div>
        <div *ngFor="let item of alternativeEvaluation; let i = index;" [hidden]="currentAltEvalIndex != i">
            <div class="panel panel-default">
                <div class="panel-heading">Ocena wariantów decyzyjnych względem kryterium: {{item.c}}</div>
                <div class="panel-body">
                    <h4>Wybierz, który wariant decyzyjny jest ważniejszy</h4>
                    <ahp-eval *ngFor="let ae of item.a; let j = index;" [label1]="ae.a1" [label2]="ae.a2" [value]="ae.val" [index]="j" [index2]="i" (valueUpdated)="alternativeValueUpdated($event)"></ahp-eval>
                </div>
            </div>
        </div>
    </div>
    `
})

export class AhpMethod {
    @Input() config;
    viewIsValid;
    criteriaEvaluation = [];
    criteriaEvaluationIsValid;
    alternativeEvaluation = [];
    alternativeEvaluationIsValid = [];
    currentPart = 0;
    currentAltEvalIndex = -1;
  constructor(private decisionService: DecisionService) {
      this.config = decisionService.getCurrentDecision();
      this.createCriteriaEvaluation();
      this.createAlternativeEvaluation();
  }

  createCriteriaEvaluation() {
      var list = this.config.criterias;

      for (var i = 0; i < list.length; i++) {
          for (var j = i + 1; j < list.length; j++) {
              var c1 = list[i];
              var c2 = list[j];
              this.criteriaEvaluation.push({c1: c1, c2: c2});
          }
      }

      this.checkIfCriteriaEvaluationIsValid();
  }

  createAlternativeEvaluation() {
      for (var i = 0; i < this.config.criterias.length; i++) {
          var c = {c: this.config.criterias[i], a: []}

          var list = this.config.alternatives;
          for (var j = 0; j < list.length; j++) {
              for (var k = j + 1; k < list.length; k++) {
                  var a1 = list[j];
                  var a2 = list[k];
                  c.a.push({a1: a1, a2: a2})
              }
          }
          this.alternativeEvaluation.push(c);
      }
      this.checkIfAlternativeEvaluationIsValid();
  }

  criteriaValueUpdated(event) {
      this.criteriaEvaluation[event.index].val = event.value;
      this.checkIfCriteriaEvaluationIsValid();
  }

  alternativeValueUpdated(event) {
      this.alternativeEvaluation[event.index2].a[event.index].val = event.value;
      this.checkIfAlternativeEvaluationIsValid();
  }

  checkViewValid() {
      if (!this.criteriaEvaluationIsValid) {
          if (this.viewIsValid != false) {
              this.viewIsValid = false;
          }
      } else {
          var isValid = true;
          for (var i = 0; i < this.alternativeEvaluationIsValid.length; i++) {
              if (!this.alternativeEvaluationIsValid[i]) {
                  isValid = false;
                  break;
              }
          }
          if (this.viewIsValid != isValid) {
              this.viewIsValid = isValid;
          }
      }
  }

  checkIfCriteriaEvaluationIsValid() {
      var isValid = true;
      for (var i = 0; i < this.criteriaEvaluation.length; i++) {
          if (this.criteriaEvaluation[i].val == undefined || this.criteriaEvaluation[i].val == null) {
            isValid = false;
            break;
          }
      }
      this.criteriaEvaluationIsValid = isValid;
      this.checkViewValid();
  }

  checkIfAlternativeEvaluationIsValid() {
      for (var i = 0; i < this.alternativeEvaluation.length; i++) {
          var isValid = true;
          var ae = this.alternativeEvaluation[i];
          if (ae != undefined && ae != null) {
              var opts = ae.a;
              if (opts != undefined && opts != null) {
                  for (var j = 0; j < opts.length; j++) {
                      if (opts[j].val == undefined || opts[j].val == null) {
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
          this.alternativeEvaluationIsValid[i] = isValid;
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