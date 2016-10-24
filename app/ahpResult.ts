import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'ahp-result',
  template: `
    <div class="panel panel-default">
        <div class="panel-heading">Wynik</div>
        <div class="panel-body">
            <h4 *ngIf="isInconsistent">Podane dane są sprzeczne, obliczony wynik może nie być poprawny</h4>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th></th>
                        <th *ngFor="let c of config.criterias">{{c}}</th>
                        <th>Wynik</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let a of config.alternatives; let i = index;">
                        <td>{{a}}</td>
                        <td *ngFor="let c of config.criterias; let j = index;">
                            <span *ngIf="resultCalculated">{{resultMatrix[i][j]}}</span>
                        </td>
                        <td>
                            <span *ngIf="resultCalculated">{{resultMatrix[i][config.criterias.length]}}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
     </div>
    `
})

export class AhpResult {
    @Input()
    set viewIsValid(valid: boolean) {
        console.log("viewIsValid ", valid);
        this.isValid = valid;
        if (valid) {
            this.calculate();
        }
    }
    @Input() config;
    @Input() criteriaEvaluation;
    @Input() alternativeEvaluation;
    isValid;
    isInconsistent;
    resultCalculated;
    resultMatrix = [];

  constructor() {
  }

  calculate() {
      var matrix = [];

      var criteriaList = this.config.criterias;
      var criteriaMatrix = [];
      for (var i = 0; i < criteriaList.length; i++) {
          var row = [];
          for(var j = 0; j < criteriaList.length; j++) {
              var criteria1 = criteriaList[i];
              var criteria2 = criteriaList[j];
              if (criteria1 == criteria2) {
                  row.push(1);
              } else {
                  var criteriaEvalRow = this.criteriaEvaluation.find(item => {
                      return item.c1 === criteria1 && item.c2 === criteria2;
                  });

                  if (criteriaEvalRow != undefined && criteriaEvalRow != null) {
                      row.push(criteriaEvalRow.val);
                  } else {
                      var criteriaEvalRow2 = this.criteriaEvaluation.find(item => {
                          return item.c1 === criteria2 && item.c2 === criteria1;
                      });
                      if (criteriaEvalRow2 != undefined && criteriaEvalRow2 != null) {
                          var cVal = 1 / criteriaEvalRow2.val;
                          if (criteriaEvalRow2.val < 1) {
                              cVal = Math.floor(1 / criteriaEvalRow2.val);
                          }
                          row.push(cVal);
                      }
                  }
              }
          }
          criteriaMatrix.push(row);
      }
      console.log("this.criteriaEvaluation", this.criteriaEvaluation);
      console.log("criteriaMatrix ", criteriaMatrix);
  }
}