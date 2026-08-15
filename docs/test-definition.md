# Test Case Definition Structure

## Summary
A declarative JSON-based test framework for API testing without code. Organizes test suites into scenarios with ordered steps, supporting request/response validation, data extraction, conditional execution, and error handling.

## Components

| Component | Purpose |
|-----------|---------|
| **config** | Suite-level configuration (base URL, headers, timeouts, environment) |
| **variables** | Reusable suite-level test data |
| **scenarios** | Independent test cases; run in parallel or sequence |
| **steps** | Ordered API calls within a scenario |
| **request** | HTTP method, endpoint, headers, query params, body |
| **capture** | Extract response data for use in subsequent steps |
| **run_if** | Conditional step execution (skip if condition false) |
| **assertions** | Validate status codes, headers, response body |
| **on_failure** | Action on assertion failure: stop_scenario, continue, skip_remaining |

## Key Features

- **No-code approach**: Pure YAML configuration
- **Variable override**: Suite-level + scenario-level + step-level data
- **Response extraction**: Capture values for chaining API calls
- **Conditional logic**: Run steps based on previous results
- **Flexible error handling**: Per-step failure strategies

## File Organization

Tests are split into separate files for modularity:

```
tests/
 ├── suite-config.json         (shared suite configuration)
 ├── scenario-login.json        (login test scenario)
 ├── scenario-create-user.json  (create user scenario)
 └── scenario-delete-user.json  (delete user scenario)
```

### suite-config.json

Contains suite-level configuration and variables shared across all scenarios.

```json
{
  "config": {
    "base_url": "https://api.example.com",
    "timeout": 5000,
    "default_headers": {
      "Content-Type": "application/json"
    },
    "environment": "staging"
  },
  "variables": {
    "api_version": "v1",
    "default_user_role": "user"
  }
}
```

### scenario-*.json

Each scenario is an independent test file referencing the suite config.

```json
{
  "suite_ref": "suite-config.json",
  "name": "Login Success",
  "description": "Verify user can login with valid credentials",
  "variables": {
    "username": "testuser@example.com",
    "password": "secure_password"
  },
  "steps": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "/auth/login",
        "body": {
          "username": "${username}",
          "password": "${password}"
        }
      },
      "capture": [
        {
          "key": "auth_token",
          "path": "$.data.token"
        }
      ],
      "assertions": [
        {
          "type": "status",
          "expected": 200
        },
        {
          "type": "body",
          "path": "$.success",
          "expected": true
        }
      ],
      "on_failure": "stop_scenario"
    }
  ]
}
```

### Variable Resolution Order

1. Suite config variables
2. Scenario-level variables (override suite)
3. Step-level references (use `${variable_name}`)