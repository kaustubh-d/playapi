import { HttpResponse } from '../objects/http';
import { CaptureDefinition } from '../objects/scenarios';
import { VariableMap, VariablePair } from '../objects/variables';
import { resolvePath } from '../utils/json-helper';
import { logger } from '../utils/logger';

function captureFromBody(body: unknown, capture: CaptureDefinition): VariablePair | undefined {
  const value = resolvePath(body, capture.path);
  if (value !== undefined && value !== null) {
    const normalizedValue = typeof value === 'string' ? value : JSON.stringify(value);
    return { variable_name: capture.name, variable_value: normalizedValue };
  } else {
    console.warn(`Warning: Could not capture variable '${capture.name}' from body path '${capture.path}'`);
    return undefined;
  }
}

function captureFromHeaders(headers: Record<string, string>, capture: CaptureDefinition): VariablePair | undefined {
  const headerValue = headers[capture.path];
  if (headerValue !== undefined) {
    return { variable_name: capture.name, variable_value: headerValue };
  } else {
    console.warn(`Warning: Could not capture variable '${capture.name}' from header '${capture.path}'`);
    return undefined;
  }
}

export function captureVariablesFromResponse(response: HttpResponse, captureDefinitions: CaptureDefinition[] | undefined): VariableMap {
  const capturedVariables: Record<string, string> = {};

  if (!captureDefinitions) {
    return capturedVariables;
  }

  logger.debug(`Capturing variables
    from response ${JSON.stringify(response, null, 2)} 
    with definitions: ${JSON.stringify(captureDefinitions, null, 2)}`);

  for (const capture of captureDefinitions) {
    if (capture.from === 'body') {
      let result = captureFromBody(response.body, capture);
      if (result) {
        capturedVariables[result.variable_name] = result.variable_value;
      }
    } else if (capture.from === 'headers') {
      let result = captureFromHeaders(response.headers, capture);
      if (result) {
        capturedVariables[result.variable_name] = result.variable_value;
      }
    } else {
      logger.warn(`Warning: Unsupported capture source '${capture.from}' for variable '${capture.name}'`);
    }
  }

  return capturedVariables;
}

export default {
  captureVariablesFromResponse,
};