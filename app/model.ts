export interface Decision {
    name: String;
    criterias: String[];
    alternatives: String[];
    config?: DecisionConfig;
}

export interface DecisionConfig {
    isValid: boolean;
    criteriaEvaluations: Evaluation[];
    alternativeEvaluations: AlternativeEvaluation[];
    criteriaEvaluationIsValid: boolean;
    alternativeEvaluationIsValid: boolean[];
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