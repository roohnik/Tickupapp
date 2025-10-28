// This is a new file: utils/formUtils.ts
import { Form, FormSubmission, FormField, CalculationSettings, ValueScore, OptionScore } from '../types';

/**
 * Calculates the total score for a given form submission based on the form's calculation settings.
 * Can be limited to a specific subset of field IDs.
 */
export const calculateScoreForSubmission = (submission: FormSubmission, form: Form, fieldIds?: string[]): number => {
    let totalScore = 0;
    if (!form.enableCalculations) return 0;

    const fieldsToScore = fieldIds ? form.fields.filter(f => fieldIds.includes(f.id)) : form.fields;
    const valuesToScore = submission.values.filter(v => fieldsToScore.some(f => f.id === v.fieldId));

    for (const fieldValue of valuesToScore) {
        const field = fieldsToScore.find(f => f.id === fieldValue.fieldId);
        if (!field || !field.calculationConfig) continue;

        const config = field.calculationConfig;
        const value = fieldValue.value;

        switch (field.type) {
            case 'SELECT':
            case 'RADIO': {
                const option = field.options?.find(o => o.label === value);
                if (option) {
                    const scoreInfo = config.optionScores?.find(s => s.optionId === option.id);
                    if (scoreInfo) totalScore += scoreInfo.score;
                }
                break;
            }
            case 'CHECKBOX': {
                if (Array.isArray(value)) {
                    value.forEach(selectedValue => {
                        const option = field.options?.find(o => o.label === selectedValue);
                        if (option) {
                            const scoreInfo = config.optionScores?.find(s => s.optionId === option.id);
                            if (scoreInfo) totalScore += scoreInfo.score;
                        }
                    });
                }
                break;
            }
            case 'CONFIRMATION':
            case 'APPROVAL': {
                const scoreInfo = config.valueScores?.find(s => s.value === value);
                if (scoreInfo) totalScore += scoreInfo.score;
                break;
            }
            case 'RATING': {
                if (typeof value === 'number' && config.ratingScores?.[value]) {
                    totalScore += config.ratingScores[value];
                }
                break;
            }
            case 'NUMBER': {
                if (typeof value === 'number' && config.numberRules) {
                    let scoreAdded = false;
                    for (const rule of config.numberRules.rules) {
                        let conditionMet = false;
                        switch (rule.condition) {
                            case 'EQUALS': conditionMet = value === rule.value1; break;
                            case 'NOT_EQUALS': conditionMet = value !== rule.value1; break;
                            case 'GREATER_THAN': conditionMet = value > rule.value1; break;
                            case 'LESS_THAN': conditionMet = value < rule.value1; break;
                            case 'BETWEEN': conditionMet = value >= rule.value1 && value <= (rule.value2 ?? rule.value1); break;
                        }
                        if (conditionMet) {
                            totalScore += rule.score;
                            scoreAdded = true;
                            break; // First matching rule wins
                        }
                    }
                    if (!scoreAdded) {
                        totalScore += config.numberRules.defaultScore || 0;
                    }
                }
                break;
            }
        }
    }
    return totalScore;
};

/**
 * Calculates the maximum possible score for a given set of form fields.
 */
export const calculateMaxScoreForFields = (fields: FormField[]): number => {
    let totalMax = 0;
    fields.forEach(field => {
        const config = field.calculationConfig;
        if (!config) return;

        let fieldMax = 0;
        if (config.optionScores && field.type !== 'CHECKBOX') {
            fieldMax = Math.max(0, ...config.optionScores.map(s => s.score || 0));
        } else if (config.optionScores && field.type === 'CHECKBOX') {
            // For checkboxes, max score is the sum of all positive scores
            fieldMax = config.optionScores.reduce((sum, s) => sum + Math.max(0, s.score || 0), 0);
        } else if (config.valueScores) {
            fieldMax = Math.max(0, ...config.valueScores.map(s => s.score || 0));
        } else if (config.ratingScores) {
            fieldMax = Math.max(0, ...Object.values(config.ratingScores).map(s => s as number || 0));
        } else if (config.numberRules) {
            fieldMax = Math.max(config.numberRules.defaultScore || 0, ...config.numberRules.rules.map(r => r.score || 0));
        }
        totalMax += fieldMax;
    });
    return totalMax;
};