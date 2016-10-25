import {Injectable} from '@angular/core';
import {Decision} from './model';

@Injectable()
export class DecisionService {
    selectedDecisionIndex: number = 0;
    decisions: Decision[] = [
        {
            name: "Elektrownia wiatrowa",
            criterias: ["Koszty", "Zagospodarowanie terenu", "Infrastruktura"],
            alternatives: ["La Braguia", "Estacas"]
        }
    ];

    getDecisions() {
        return this.decisions;
    }

    getSelectedDecisionIndex() {
        return this.selectedDecisionIndex;
    }

    setSelectedDecisionIndex(index) {
        this.selectedDecisionIndex = index;
    }

    getCurrentDecision() {
        return this.decisions[this.selectedDecisionIndex];
    }
}

