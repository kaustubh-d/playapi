import { APIRequestContext } from '@playwright/test';
import { HttpRequest, HttpResponse } from '../objects/http';
import { JsonObject, JsonArray, JsonPrimitive } from '../objects/json-types';
import { VariableMap } from '../objects/variables';
import { logger } from '../utils/logger';

// This function processes the body of an HTTP request, replacing any variable placeholders with their corresponding values from the provided variables map.
function processBodyVariables(
  body: JsonObject | JsonArray | JsonPrimitive,
  variables: VariableMap,
): JsonObject | JsonArray | JsonPrimitive {
  if (typeof body === 'string') {
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(String.raw`{{\s*${key}\s*}}`, 'g');
      body = body.replace(regex, String(value));
    }
  } else if (Array.isArray(body)) {
    return body.map(item => processBodyVariables(item, variables));
  } else if (typeof body === 'object' && body !== null) {
    const processedObject: JsonObject = {};
    for (const [key, value] of Object.entries(body)) {
      processedObject[key] = processBodyVariables(value, variables);
    }
    return processedObject;
  }

  return body;
}

// This function processes an HTTP request object, replacing any variable placeholders in the URL, headers, and body with their corresponding values from the provided variables map.
function processHttpRequestVariables(
  request: HttpRequest | undefined,
  variables: VariableMap,
): HttpRequest | undefined {
  let result = { ...request };

  // Process the URL
  if (result?.url) {
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(String.raw`{{\s*${key}\s*}}`, 'g');
      result.url = result.url.replace(regex, String(value));
    }
  }

  // Process headers
  if (result?.headers) {
    for (const [headerKey, headerValue] of Object.entries(result.headers)) {
      for (const [varKey, varValue] of Object.entries(variables)) {
        const regex = new RegExp(String.raw`{{\s*${varKey}\s*}}`, 'g');
        result.headers[headerKey] = headerValue.replace(regex, String(varValue));
      }
    }
  }

  // Process body if it's a string
  if (result.body) {
    result.body = processBodyVariables(result.body, variables);
  }

  return result;
}

// This function executes an HTTP request using the provided request object, variables map, and Playwright APIRequestContext. It processes the request to replace any variable placeholders with their corresponding values, sends the request, and returns a promise that resolves to an HttpResponse object containing the response details.
// param: request: The HTTP request object containing method, URL, headers, and body.
// param: variables: A map of variable names to their corresponding values, used for replacing placeholders in the request.
// param: apiRequestContext: The Playwright APIRequestContext used to send the HTTP request.
// return: A promise that resolves to an HttpResponse object containing the response status, headers, and body.
export async function executeHttpRequest(
  apiRequestContext: APIRequestContext,
  request: HttpRequest,
  variables: VariableMap,
): Promise<HttpResponse> {
  const requestObject = processHttpRequestVariables(request, variables);

  if (!requestObject?.url) {
    throw new Error('HTTP request URL is required.');
  }

  const method = (requestObject.method ?? 'GET').toUpperCase();
  const options: Parameters<APIRequestContext['fetch']>[1] = {
    method,
    headers: requestObject.headers,
  };

  if (requestObject.body !== undefined) {
    options.data = requestObject.body as any;
  }

  logger.debug(`Executing HTTP request: ${method} ${requestObject.url}`);
  logger.debug(`options: ${JSON.stringify(options, null, 2)}`);

  const httpResponse = 
    await apiRequestContext.fetch(requestObject.url, options).then(async response => {
    const body = await response.text();
    const jsonBody = body ? JSON.parse(body) : undefined;

    logger.debug(`Response status: ${response.status()} ${response.statusText()}`);
    logger.debug(`Response headers: ${JSON.stringify(response.headers(), null, 2)}`);
    logger.debug(`Response body: ${body}`);

    return {
      status: response.status(),
      statusText: response.statusText(),
      headers: response.headers(),
      body: jsonBody,
    } satisfies HttpResponse;
  });

  return httpResponse;
}

export default executeHttpRequest;

