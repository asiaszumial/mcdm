import {Component, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {Decision, DecisionConfig, AlternativeEvaluation, Evaluation} from './model';

@Component({
  selector: 'ahp-result',
  template: `
    <div class="panel panel-default">
        <div class="panel-heading">Wynik</div>
        <div class="panel-body">
            <button (click)="calculate()">Calculate</button>
            <h4 *ngIf="isInconsistent">Podane dane są sprzeczne, obliczony wynik może nie być poprawny</h4>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th></th>
                        <th *ngFor="let c of decision.criterias">{{c}}</th>
                        <th>Wynik</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th *ngFor="let c of decision.criterias; let i = index;" class="text-right">
                            <span *ngIf="resultCalculated">{{criteriaTotal[i].toFixed(2)}}</span>
                        </th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let a of decision.alternatives; let i = index;">
                        <td>{{a}}</td>
                        <td *ngFor="let c of decision.criterias; let j = index;" class="text-right">
                            <span *ngIf="resultCalculated">{{resultMatrix[i][j].toFixed(2)}}</span>
                        </td>
                        <td class="text-right">
                            <span style="font-weight: bold;" *ngIf="resultCalculated">{{resultTotal[i].toFixed(2)}}</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
     </div>
    `
})

export class AhpResult implements OnChanges {
    ngOnChanges(changes) {
        if (this.decision.config.isValid) {
            this.calculate();
        }
    }
    @Input() decision: Decision;
    isInconsistent;
    resultCalculated;
    resultMatrix = [];
    resultTotal = [];
    criteriaTotal = [];
    consistencyIndex = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

    constructor() {}

    calculate() {
      var matrix = [];

      //prepare criteria matrix
      var criteriaList = this.decision.criterias;
      var criteriaMatrix = [];
      for (var i = 0; i < criteriaList.length; i++) {
          var criteriaMatrixRow = [];
          for(var j = 0; j < criteriaList.length; j++) {
              var criteria1 = criteriaList[i];
              var criteria2 = criteriaList[j];
              if (criteria1 == criteria2) {
                  criteriaMatrixRow.push(1);
              } else {
                  var ceRow = this.decision.config.criteriaEvaluations.find(item => {
                      return item.label1 === criteria1 && item.label2 === criteria2;
                  });

                  if (ceRow != undefined && ceRow != null) {
                      criteriaMatrixRow.push(ceRow.value);
                  } else {
                      ceRow = this.decision.config.criteriaEvaluations.find(item => {
                          return item.label1 === criteria2 && item.label2 === criteria1;
                      });
                      if (ceRow != undefined && ceRow != null) {
                          var cVal = 1 / ceRow.value;
                          if (ceRow.value < 1) {
                              cVal = Math.floor(1 / ceRow.value);
                          }
                          criteriaMatrixRow.push(cVal);
                      }
                  }
              }
          }
          criteriaMatrix.push(criteriaMatrixRow);
      }

      console.log("criteriaMatrix ", criteriaMatrix);

      var criteriaMatrixSumColumnTotal = this.sumColumnTotal(criteriaMatrix);
      for (var i = 0; i < criteriaMatrix.length; i++) {
          for (var j = 0; j < criteriaMatrix.length; j++) {
              criteriaMatrix[j][i] = criteriaMatrix[j][i] / criteriaMatrixSumColumnTotal[i];
          }
      }
      this.criteriaTotal = this.averageRowTotal(criteriaMatrix);
      var cEigen = this.calcConsistencyRatio(matrix, this.criteriaTotal);


      //prepare alternatives matrix for each criteria
      var criteriaNo = criteriaList.length;
      var alternativeList = this.decision.alternatives;
      var criteriaAlternativeMatrix = [];
      var criteriaAlternativeCalculations = [];

      for (var k = 0; k < criteriaNo; k++) {
          var alternativeMatrix = [];

          for (var i = 0; i < alternativeList.length; i++) {
                var alternativeMatrixRow = [];
                for(var j = 0; j < alternativeList.length; j++) {
                    var alternative1 = alternativeList[i];
                    var alternative2 = alternativeList[j];
                    if (alternative1 == alternative2) {
                        alternativeMatrixRow.push(1);
                    } else {
                        var criteriaEvalRow = this.decision.config.alternativeEvaluations.find(item => {
                            return item.criteriaLabel === criteriaList[k];
                        });

                        var aeRow = criteriaEvalRow.evalArray.find(item => {
                            return item.label1 === alternative1 && item.label2 === alternative2;
                        });

                        if (aeRow != undefined && aeRow != null) {
                            alternativeMatrixRow.push(aeRow.value);
                        } else {
                            aeRow = criteriaEvalRow.evalArray.find(item => {
                                return item.label1 === alternative2 && item.label2 === alternative1;
                            });
                            if (aeRow != undefined && aeRow != null) {
                                var cVal = 1 / aeRow.value;
                                if (aeRow.value < 1) {
                                    cVal = Math.floor(1 / aeRow.value);
                                }
                                alternativeMatrixRow.push(cVal);
                            }
                        }
                    }
                }
                alternativeMatrix.push(alternativeMatrixRow);
          }
          criteriaAlternativeMatrix.push(alternativeMatrix);
      }

      console.log("criteriaAlternativeMatrix ", criteriaAlternativeMatrix);

      for (var k = 0; k < criteriaNo; k++) {
          var currentAlternativeMatrix = criteriaAlternativeMatrix[k];
          var sumColumnTotal = this.sumColumnTotal(currentAlternativeMatrix);
          for (var i = 0; i < currentAlternativeMatrix.length; i++) {
              for (var j = 0; j < currentAlternativeMatrix.length; j++) {
                  currentAlternativeMatrix[j][i] = currentAlternativeMatrix[j][i] / sumColumnTotal[i];
              }
          }
          var averageRowTotal = this.averageRowTotal(currentAlternativeMatrix);
          var crEigen = this.calcConsistencyRatio(matrix, averageRowTotal);
          criteriaAlternativeCalculations[k] = {cr: crEigen.cr, eigenVector: crEigen.eigenVector, averageRowTotal: averageRowTotal};
      }

      //prepare result
      var result = [];
      for (var aNo = 0; aNo < alternativeList.length; aNo++){
          result.push(new Array(criteriaNo).fill(0));
          for (var cNo = 0; cNo < criteriaNo; cNo++) {
              result[aNo][cNo] = criteriaAlternativeCalculations[cNo].averageRowTotal[aNo];
          }
      }

      var resultTotalItems = [];
      for (var i = 0; i < result.length; i++) {
          var matrixRow = result[i];
          var resultTotalItem = 0;
          for (var j = 0; j < matrixRow.length; j++) {
              resultTotalItem += matrixRow[j] * this.criteriaTotal[j];
          }
          resultTotalItems.push(resultTotalItem);
      }

      this.isInconsistent = false;
      if (cEigen.cr > 0.1) {
          this.isInconsistent = true;
      } else {
          var isInconsistent = false;
          for (var k = 0; k < criteriaAlternativeCalculations.length; k++) {
              if (criteriaAlternativeCalculations[k].cr > 0.1) {
                  isInconsistent = true;
                  break;
              }
          }
          this.isInconsistent = isInconsistent;
      }

      this.resultTotal = resultTotalItems;
      this.resultMatrix = result;
      this.resultCalculated = true;
      console.log("resultMatrix ", this.resultMatrix);
      console.log("resultTotal ", this.resultTotal);
  }

  sumColumnTotal(matrix) {
      var columnTotal = [];
      for (var column = 0; column < matrix.length; column++) {
          columnTotal[column] = 0;
          for (var row = 0; row < matrix.length; row++) {
              columnTotal[column] += matrix[row][column];
          }
      }
      return columnTotal;
  }

  averageRowTotal(matrix) {
      var size = matrix.length;
      var rowAverage = [];
      for (var row = 0; row < size; row++) {
          rowAverage[row] = 0;
          for (var column = 0; column < size; column++) {
              rowAverage[row] += matrix[row][column];
          }
          rowAverage[row] = rowAverage[row] / size;
      }
      return rowAverage;
  }

  calcConsistencyRatio(matrix, averageRowTotal) {
      var size = matrix.length;
      var array = [];
      for (var i = 0; i < size; i++) {
          array[i] = 0;
          for (var j = 0; j < size; j++) {
              array[i] += averageRowTotal[j] * matrix[i][j];
          }
      }

      //calculate eigen values
      var eigenVector = [];
      var eigenValue = 0;
      var maxEigenValue = 0;

      for (var i = 0; i < size; i++) {
          var val = array[i] / averageRowTotal[i];
          eigenVector[i] = val;
          eigenValue += val;
          if (val > maxEigenValue) {
              maxEigenValue = val;
          }
      }
      var avgEigenValue = eigenValue / size;

      var ci = (avgEigenValue - size) / (size - 1);
      var cr = ci / this.consistencyIndex[size - 1];

      return {cr: cr, eigenVector: eigenVector};
  }
}