import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NgFor, NgIf} from '@angular/common';

@Component({
  selector: 'ahp-result',
  template: `
    <div class="panel panel-default">
        <div class="panel-heading">Wynik</div>
        <div class="panel-body">
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th></th>
                        <th *ngFor="let c of config.criterias">{{c}}</th>
                        <th>Wynik</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let a of config.alternatives">
                        <td>{{a}}</td>
                        <td *ngFor="let c of config.criterias"></td>
                        <td></td>
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
        this.isValid = valid;
        if (valid) {
            this.calculate();
        }
    }
    @Input() config;
    @Input() criteriaEvaluation;
    @Input() alternativeEvaluation;
    isValid;

  constructor() {
  }

  calculate() {

  }
}