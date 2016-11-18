export interface Decision {
    name: String;
    criterias: String[];
    alternatives: String[];
    aconfig?: ADecisionConfig;
    econfig?: EDecisionConfig;
}

export interface DecisionConfig {
    resultCalculated: boolean;
    isValid: boolean;
    criteriaEvaluationIsValid: boolean;
    alternativeEvaluationIsValid: boolean[];
    isConsistent: boolean;
    inconsistentMessageList: String[];
    resultRank: String[];
}

export interface ADecisionConfig extends DecisionConfig {
    resultMatrix: number[][];
    resultTotal: number[];
    criteriaTotal: number[];
    crCriteria: number;
    crAlternatives: number[];
    criteriaEvaluations: Evaluation[];
    alternativeEvaluations: AlternativeEvaluation[];
}

export interface Evaluation {
    label1: String;
    label2: String;
    value?: number;
}

export interface AlternativeEvaluation {
    criteriaLabel: String;
    evalArray: Evaluation[];
}

export interface EDecisionConfig extends DecisionConfig {
    criteriaWeights: number[];
    criteriaWetoTresholds: number[];
    alternativeWeights: number[][];
    complianceThreshold: number;
    outrankingMatrix: number[][];
}