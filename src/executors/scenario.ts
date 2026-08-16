import { test, APIRequestContext } from '@playwright/test';
import { ScenarioObject } from '../objects/scenarios';
import { executeStep } from './step';
import { VariableMap } from '../objects/variables';

export async function  executeScenario(apiRequestCtx: APIRequestContext,
  scenario: ScenarioObject,
  variables: VariableMap,
): Promise<VariableMap> {
  let capturedVariables: VariableMap = {};

  // Execute each step in the scenario
  for (const step of scenario.steps || []) {
    const stepName = step?.id ?? 'Unnamed step';
    // Execute the step and wait for the response
    await test.step(`Executing Step: ${stepName}`, async () => {
      const stepCapturedVariables = await executeStep(apiRequestCtx, step, variables);
      console.log(`Executed step: ${step.id ?? 'Unnamed step'}, 
        capturedVariables: ${JSON.stringify(capturedVariables, null, 2)}`);
      variables = { ...variables, ...stepCapturedVariables };
    });
  }
  return { ...variables, ...capturedVariables };
}