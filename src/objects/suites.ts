export type RetryConfig = {
  attempts: number;
  delay_seconds: number;
};

export type Config = {
  environment: string;
  default_headers: Record<string, string>;
  timeout_seconds: number;
  retry: RetryConfig;
};

export type Suite = {
  name: string;
  description: string;
};

export type SuiteConfig = {
  suite: Suite;
  config: Config;
  variables: Record<string, string>;
};