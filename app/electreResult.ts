import {Component, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import {NgFor, NgIf} from '@angular/common';
import {Decision} from './model';

@Component({
  selector: 'electre-result',
  template: `
    <div class="panel panel-default">
        <div class="panel-heading">Wynik</div>
        <div class="panel-body">
            <h4 *ngIf="!decision.econfig.isValid">Obliczenie wyniku jest niemożliwe, ponieważ nie wprowadzono wszystkich danych</h4>
            <div *ngIf="!decision.econfig.isConsistent">
                <h4>Obliczenie wyniku jest niemożliwe, ponieważ poniższe dane są błędne:</h4>
                <ul>
                    <li *ngFor="let message of decision.econfig.inconsistentMessageList">{{message}}</li>
                </ul>
            </div>
            <div *ngIf="decision.econfig.resultRank && decision.econfig.resultRank.length > 0">
                <div class="col-lg-4 col-md-4 col-sm-12">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Ranking</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let rankItem of decision.econfig.resultRank">
                                <td>{{rankItem}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-12">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th></th>
                                <th *ngFor="let a of decision.alternatives">{{a}}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr *ngFor="let ai of decision.alternatives; let i = index;">
                                <td>{{ai}}</td>
                                <td *ngFor="let aj of decision.alternatives; let j = index;" class="text-right">
                                    <span *ngIf="decision.econfig.resultCalculated">{{decision.econfig.outrankingMatrix[i][j]}}</span>
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

export class ElectreResult implements DoCheck  {
    ngDoCheck() {
        if (this.decision.econfig.isValid && this.decision.econfig.isConsistent) {
            this.calculate();
        }
    }
    @Input() decision: Decision;

    constructor() {}

    calculate() {
        let criteriaNo = this.decision.criterias.length;
        let alternativesNo = this.decision.alternatives.length;

        let alternativeRelationMatrixes = [];
        for (let k = 0; k < criteriaNo; k++) {
            alternativeRelationMatrixes[k] = this.buildRelationMatrix(alternativesNo, this.decision.econfig.alternativeWeights[k]);
        }

        let concordanceMatrix = [];
        for (let i = 0; i < alternativesNo; i++) {
            concordanceMatrix[i] = new Array(alternativesNo);
            for (let j = 0; j < alternativesNo; j++) {
                concordanceMatrix[i][j] = 0;
                for (let k = 0; k < criteriaNo; k++) {
                    let alternativeRelationMatrix = alternativeRelationMatrixes[k];
                    let cWeight = this.decision.econfig.criteriaWeights[k];
                    concordanceMatrix[i][j] += alternativeRelationMatrix[i][j] * cWeight;
                }
            }
        }

        let concordanceSet = [];
        for (let i = 0; i < alternativesNo; i++) {
            concordanceSet[i] = new Array(alternativesNo);
            for (let j = 0; j < alternativesNo; j++) {
                if (concordanceMatrix[i][j] >= this.decision.econfig.complianceThreshold) {
                    concordanceSet[i][j] = 0;
                } else {
                    concordanceSet[i][j] = "*";
                }
            }
        }

        let discordanceMatrixes = [];
        for (let k = 0; k <criteriaNo; k++) {
            let discordanceMatrix = [];
            for (let i = 0; i < alternativesNo; i++) {
                discordanceMatrix[i] = new Array(alternativesNo);
                for (let j = 0; j < alternativesNo; j++) {
                    if (concordanceSet[i][j] === 0) {
                        let cVeto = this.decision.econfig.criteriaWetoTresholds[k];
                        if (this.decision.econfig.alternativeWeights[k][i] + cVeto >= this.decision.econfig.alternativeWeights[k][j]) {
                            discordanceMatrix[i][j] = 0;
                        } else {
                            discordanceMatrix[i][j] = 1;
                        }
                    } else {
                        discordanceMatrix[i][j] = "*";
                    }
                }
            }
            discordanceMatrixes[k] = discordanceMatrix;
        }

        for (let i = 0; i < concordanceSet.length; i++) {
            for (let j = 0; j < concordanceSet.length; j++) {
                if (concordanceSet[i][j] === 0) {
                    for (let k = 0; k < criteriaNo; k++) {
                        if (discordanceMatrixes[k][i][j] === 1) {
                            concordanceSet[i][j] = "*";
                            break;
                        }
                    }
                }
            }
        }
        
        let preferenceRelationVectors = [];
        for (let i = 0; i < concordanceSet.length; i++) {
            for (let j = 0; j < concordanceSet.length; j++) {
                if (i !== j && concordanceSet[i][j] === 0) {
                    preferenceRelationVectors.push({item1: i, item2: j});
                }
            }
        }

        this.decision.econfig.outrankingMatrix = concordanceSet;
        this.buildResult(preferenceRelationVectors)
    }

    buildRelationMatrix(size: number, matrix: number[]) {
        let result = [];
        for (let i = 0; i < size; i++) {
            result[i] = new Array(size);
            for (let j = 0; j < size; j++) {
                result[i][j] = matrix[i] >= matrix[j] ? 1 : 0;
            }
        }
        return result;
    }

    buildResult(preferenceRelationVectors) {
        let processedItems = {};
        let count = preferenceRelationVectors.length;
        this.decision.econfig.resultRank = [];
        while (count > 0) {
            let indexesToRemove = [];
            for (let i = 0; i < preferenceRelationVectors.length; i++) {
                let currentItem = preferenceRelationVectors[i];
                let contains = false;
                for (let j = 0; j < preferenceRelationVectors.length; j++) {
                    if (currentItem.item1 === preferenceRelationVectors[j].item2) {
                        contains = true;
                        break;
                    }
                }
                if (!contains) {
                    indexesToRemove.push(i);
                    if (processedItems[currentItem.item1] === undefined || processedItems[currentItem.item1] === null) {
                        processedItems[currentItem.item1] = true;
                        let rankItem = this.decision.econfig.resultRank[this.decision.econfig.resultRank.length];
                        if (rankItem === undefined || rankItem === null) {
                            this.decision.econfig.resultRank.push(this.decision.alternatives[currentItem.item1]);
                        } else {
                            rankItem += ", " + this.decision.alternatives[currentItem.item1];
                        }
                    }
                }
            }
            
            for (let i = 0; i < indexesToRemove.length; i++) {
                preferenceRelationVectors[indexesToRemove[i]] = undefined;
            }
            preferenceRelationVectors = preferenceRelationVectors.filter(item => item !== undefined);
            count = preferenceRelationVectors.length;
        }

        for (let i = 0; i < this.decision.alternatives.length; i++) {
            if (processedItems[i] === undefined || processedItems[i] === null) {
                processedItems[i] = true;
                let rankItem = this.decision.econfig.resultRank[this.decision.econfig.resultRank.length];
                if (rankItem === undefined || rankItem === null) {
                    this.decision.econfig.resultRank.push(this.decision.alternatives[i]);
                } else {
                    rankItem += ", " + this.decision.alternatives[i];
                }
            }
        }

        this.decision.econfig.resultCalculated = true;
    }
}