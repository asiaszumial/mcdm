import {Injectable} from '@angular/core';
import {Decision} from './model';

@Injectable()
export class DecisionService {
    decision: Decision;

    getCurrentDecision() {
        return this.decision;
    }

    setDecision(d: Decision) {
        this.decision = d;
    }
}

