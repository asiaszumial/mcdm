import {Injectable} from '@angular/core';

@Injectable()
export class DecisionService {
    selectedDecisionIndex = 0;
    decisions = [
        {name: "Elektrownia wiatrowa",
            config: {
                criterias: ["Koszty", "Zagospodarowanie terenu", "Infrastruktura"],
                alternatives: ["La Braguia", "Estacas"]
            }},
        {name: "Elektrownia wodna",
            config: {
                criterias: [],
                alternatives: []
            }}
    ];

    getConfig() {
        return this.decisions;
    }

    getSelectedDecisionIndex() {
        return this.selectedDecisionIndex;
    }

    setSelectedDecisionIndex(index) {
        this.selectedDecisionIndex = index;
    }

    getCurrentDecision() {
        return this.decisions[this.selectedDecisionIndex].config;
    }
}

