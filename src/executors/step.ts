import type { APIRequestContext, TestInfo } from '@playwright/test';
import { ScenarioStep } from '../objects/scenarios';
import { VariableMap } from '../objects/variables';
import { executeHttpRequest } from './request';
import { runAssertions } from './assertion';
import { captureVariablesFromResponse } from './capture-variables';


export async function executeStep(apiRequestContext: APIRequestContext,
  testInfo: TestInfo,
  step: ScenarioStep,
  variables: VariableMap,
): Promise<VariableMap> {
  let capturedVariables: VariableMap = {};

  // TODO: run_if condition check

  // Prepare and send the request
  const response = await executeHttpRequest(apiRequestContext, testInfo,
    step.request!, variables);

  // Run assertions on the response
  runAssertions(response, step.assertions!);

  capturedVariables = captureVariablesFromResponse(response, step.capture!);

  return capturedVariables;
}

export default { executeStep };



