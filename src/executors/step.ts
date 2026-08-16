import type { APIRequestContext } from '@playwright/test';
import { ScenarioStep } from '../objects/scenarios';
import { VariableMap } from '../objects/variables';
import { executeHttpRequest } from './request';
import { runAssertions } from './assertion';
import { captureVariablesFromResponse } from './capture-variables';


// export interface ScenarioStep {
//   id?: string;
//   run_if?: ConditionExpression;
//   request?: HttpRequest;
//   capture?: CaptureDefinition[];
//   assertions?: AssertionsMap;
//   on_failure?: 'continue' | 'abort' | (string & {});
//   [key: string]: JsonValue | undefined;
// }
export async function executeStep(apiRequestContext: APIRequestContext,
  step: ScenarioStep,
  variables: VariableMap,
): Promise<VariableMap> {
  let capturedVariables: VariableMap = {};

  // TODO: run_if condition check

  // Prepare and send the request
  const response = await executeHttpRequest(apiRequestContext, step.request!, variables);

  // Run assertions on the response
  runAssertions(response, step.assertions!);

  capturedVariables = captureVariablesFromResponse(response, step.capture!);

  return capturedVariables;
}

export default { executeStep };



