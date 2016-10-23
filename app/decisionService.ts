import {Injectable} from '@angular/core';

@Injectable()
export class DecisionService {
    selectedDecisionIndex = 0;
    decisions = [
        {name: "Elektrownia wiatrowa",
            config: {
                criterias: ["Koszty eksploatacji i utrzymania", "Zagospodarowanie terenu", "Infrastruktura", "Koszt inwestycji"],
                alternatives: ["La Braguia", "Cilda", "San Pedro", "Estacas"]
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

