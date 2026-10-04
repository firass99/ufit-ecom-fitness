const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_JWT_SECRET',
  'SESSION_SECRET',
  'API_BASE_URL',
  'UFITPAL_FRONT',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'FACEBOOK_CLIENT_ID',
  'FACEBOOK_CLIENT_SECRET',
  'FACEBOOK_CALLBACK_URL',
  'MAIL_HOST',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASSWORD',
  'MEILI_ADMIN_API_KEY',
] as const;

const MIN_SECRET_LENGTH = 32;

const SECRET_ENV_VARS = [
  'JWT_SECRET',
  'REFRESH_JWT_SECRET',
  'SESSION_SECRET',
] as const;

export function validateEnv(config: Record<string, unknown>) {
  const missing = REQUIRED_ENV_VARS.filter((key) => {
    const value = config[key];
    return typeof value !== 'string' || value.trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((key) => `  - ${key}`)
        .join('\n')}\nSet them in apps/api/.env before starting the API.`,
    );
  }

  const weak = SECRET_ENV_VARS.filter(
    (key) => String(config[key]).length < MIN_SECRET_LENGTH,
  );

  if (weak.length > 0) {
    throw new Error(
      `These secrets are shorter than ${MIN_SECRET_LENGTH} characters and must be regenerated:\n${weak
        .map((key) => `  - ${key}`)
        .join('\n')}`,
    );
  }

  return config;
}
