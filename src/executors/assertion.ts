import { expect } from '@playwright/test';
import { AssertionsMap, BodyAssertion } from '../objects/scenarios';
import { HttpResponse } from '../objects/http';
import { resolvePath } from '../utils/json-helper';
import { logger } from '../utils/logger';

function toStringValue(value: unknown): string {
  if (value === undefined || value === null) {
    return String('');
  }
  return typeof value === 'object' ? JSON.stringify(value) : String('');
}

// This function asserts the response status against the provided status rules.
// Only "equals" and "in" rules are supported for status assertions.
// Examples
// assertions:
//   status:
//     equals: 200                     # or: in: [200, 201]
//     in: [200, 201]
function assertStatus(status: number, statusRules: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(statusRules)) {
    if ((key === 'equals' || key === 'in') || value === undefined) {
      continue;
    }

    console.error(
      `Unsupported status rule "${key}". Only "equals" and "in" are supported for response status assertions.`
    );
    return;
  }

  // Perform the actual assertions
  if (statusRules.equals !== undefined) {
    expect(status, 'response status equals').toBe(statusRules.equals);
  }

  if (statusRules.in !== undefined) {
    const allowedStatuses = Array.isArray(statusRules.in) ? statusRules.in : [statusRules.in];
    expect(allowedStatuses, 'response status in').toContain(status);
  }
}

function assertHeaderExists(resHeaderValue: string | undefined, headerName: string): void {
  // exists: true means the header should exist, so we assert that resHeaderValue is defined
  expect(resHeaderValue, 
    `header ${headerName} is expected to exist but was not found`).toBeDefined();
}

function assertHeaderNotExists(resHeaderValue: string | undefined, headerName: string): void {
  // exists: false means the header should not exist, so we assert that resHeaderValue
  // is undefined
  expect(resHeaderValue, `header ${headerName} is expected to not exist but was 
    found with value ${resHeaderValue}`).toBeUndefined();
}

function assertHeaderRule(resHeaderValue: string | undefined, 
  headerName: string, ruleName: string, ruleValue: unknown): void {

  const ruleValueStr = JSON.stringify(ruleValue);

  if (ruleName === 'equals') {
    expect(resHeaderValue, `header ${headerName} has value ${resHeaderValue} 
      which does not match expected value ${ruleValueStr}`).toBe(ruleValueStr);
  } else if (ruleName === 'contains') {
    expect(resHeaderValue, `header ${headerName} has value ${resHeaderValue} 
      which does not contain expected value ${ruleValueStr}`).toContain(ruleValueStr);
  } else if (ruleName === 'exists') {
    if (ruleValue === true) {
      assertHeaderExists(resHeaderValue, headerName);
    } else if (ruleValue === false) {
      assertHeaderNotExists(resHeaderValue, headerName);
    } else {
      console.error(`Invalid value for "exists" rule on header "${headerName}".
        Expected true or false, but got: ${ruleValueStr}`);
    }
  } else {
    // Unsupported rule, report an error
    console.error(`Unsupported header rule "${ruleName}". 
      The "exists" rule is handled separately and should not be used here.`);
  }
}

// Examples
// assertions:
//   headers:
//     Header-Name:
//       equals: some-value
//       exists: true (header must exist) / false (header must not exist)
//       contains: some-substring
function assertHeaders(responseHeaders: Record<string, string>, headersRules: Record<string, Record<string, unknown>>): void {
  // Iterate over each header rule and perform the corresponding assertions
  for (const [headerName, rules] of Object.entries(headersRules)) {
    // Get the actual header value from the response headers, considering case-insensitivity
    const resHeaderValue = responseHeaders[headerName.toLowerCase()] ?? responseHeaders[headerName];

    for (const [ruleName, ruleValue] of Object.entries(rules)) {
      if (ruleValue !== undefined) {
        assertHeaderRule(resHeaderValue, headerName, ruleName, ruleValue);
      }
    }
  }
}

function assertBodyValueExists (actualValue: unknown) {
  expect(actualValue !== undefined, 
    'body value expected to exist but does not').toBe(true);
}

function assertBodyValueNotExists (actualValue: unknown) {
  expect(actualValue === undefined, 
    'body value expected to not exist but does').toBe(true);
}

function assertBodyValue(actualValue: unknown, assertion: BodyAssertion): void {
  // Verify exists rule first, as it determines whether we should proceed with other assertions
  if (assertion.exists !== undefined) {
    if (assertion.exists) {
      assertBodyValueExists(actualValue);
    } else {
      assertBodyValueNotExists(actualValue);
    }
  }

  if (actualValue === undefined) {
    // If the value does not exist, we cannot perform further assertions,
    // so we return early.
    return;
  }

  if (assertion.equals !== undefined) {
    expect(actualValue, `body path ${assertion.path} 
      expected to equal ${JSON.stringify(assertion.equals)} 
      but got ${JSON.stringify(actualValue)}`).toEqual(assertion.equals);
  }

  if (assertion.contains !== undefined) {
    if (typeof actualValue === 'string' || typeof actualValue === 'number' || typeof actualValue === 'boolean') {
      expect(toStringValue(actualValue), 
          `body path ${assertion.path} expected to contain ${JSON.stringify(assertion.contains)} 
          but got ${JSON.stringify(actualValue)}`)
        .toContain(String(assertion.contains));
    } else if (Array.isArray(actualValue)) {
      expect(actualValue,
          `body path ${assertion.path} expected to contain ${JSON.stringify(assertion.contains)} 
          but got ${JSON.stringify(actualValue)}`)
        .toContainEqual(assertion.contains);
    }
  }

  if (assertion.type) {
    expect(typeof actualValue, `body path ${assertion.path} 
        expected to be of type ${JSON.stringify(assertion.type)} 
        but got ${JSON.stringify(typeof actualValue)}`)
      .toBe(assertion.type);
  }
}

// This function asserts the response body against the provided body assertions.
// Each assertion can specify a path, and rules like "equals", "contains", "type", and "exists".
// Examples
// assertions:
//     body:
//        - path: data.user.role
//        equals: "admin"
//        - path: data.items
//          length: 3
// param: body: The response body to be asserted, can be an object, array, string, number, boolean, or null.
// param: bodyAssertions: An array of body assertion objects, each containing a path and rules for validation.
function assertBody(body: unknown, bodyAssertions: BodyAssertion[]): void {
  logger.debug(`Asserting response body ${JSON.stringify(body)} with
    ${JSON.stringify(bodyAssertions)} assertions.`);
  for (const assertion of bodyAssertions) {
    const actualValue = resolvePath(body, assertion.path);
    assertBodyValue(actualValue, assertion);
  }
}

export function runAssertions(response: HttpResponse, assertions: AssertionsMap): void {
  if (assertions.status) {
    assertStatus(response.status, assertions.status);
  }

  if (assertions.headers) {
    assertHeaders(response.headers, assertions.headers);
  }

  if (assertions.body) {
    assertBody(response.body, assertions.body);
  }
}

export default runAssertions;