import {Component, Input} from '@angular/core';
import {NgFor} from '@angular/common';
import {DecisionService} from './decisionService';

@Component({
  selector: 'ahp-method',
  providers: [DecisionService],
  template: `
    <div style="width: 300px; display: inline-block;">
        <ul class="list-group">
            <li class="list-group-item" (click)="showGoal()" [class.active]="currentPart == 0">Wynik</li>
            <li class="list-group-item" (click)="showCriterias()" [class.active]="currentPart == 1">Kryteria</li>
            <li class="list-group-item" (click)="showAlternatives()" [class.active]="currentPart == 2">Warianty decyzyjne</li>
            <li class="list-group-item" style="padding-left: 30px;" *ngFor="let item of alternativeEvaluation; let i = index;" [class.active]="currentAltEvalIndex == i" (click)="showAlternativesForCriteria(i)">Wg kryterium: {{item.c}}</li>
        </ul>
    </div>
    <div style="display: inline-block;">
        <div [hidden]="currentPart != 0">Wynik</div>
        <div [hidden]="currentPart != 1">Kryteria</div>
        <div [hidden]="currentPart != 2">Warianty</div>
    </div>
    `
})

export class AhpMethod {
    @Input() config;
    criteriaEvaluation = [];
    alternativeEvaluation = [];
    currentPart = 0;
    currentAltEvalIndex = -1;
  constructor(private decisionService: DecisionService) {
      this.config = decisionService.getCurrentDecision();
      this.createCriteriaEvaluation();
      this.createAlternativeEvaluation();
  }

  createCriteriaEvaluation() {
      for (var i = 0; i < this.config.criterias.length - 1; i++) {
          var c1 = this.config.criterias[i];
          var c2 = this.config.criterias[i + 1];
          this.criteriaEvaluation.push({c1: c1, c2: c2});
      }
  }

  createAlternativeEvaluation() {
      for (var i = 0; i < this.config.criterias.length; i++) {
          var c = {c: this.config.criterias[i], a: []}
          for (var j = 0; j < this.config.alternatives.length - 1; j++) {
              var a1 = this.config.alternatives[j];
              var a2 = this.config.alternatives[j + 1];
              c.a.push({a1: a1, a2: a2})
          }
          this.alternativeEvaluation.push(c);
      }
  }

  showGoal() {
      this.currentPart = 0;
      this.currentAltEvalIndex = -1;
  }

  showCriterias() {
        this.currentPart = 1;
        this.currentAltEvalIndex = -1;
  }

  showAlternatives() {
        this.currentPart = 2;
        this.currentAltEvalIndex = -1;
  }

  showAlternativesForCriteria(index) {
      this.currentPart = -1;
      this.currentAltEvalIndex = index;
  }
}