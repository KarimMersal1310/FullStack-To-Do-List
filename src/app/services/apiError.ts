import type { ProblemDetails } from './apiTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractValidationMessages(problem: ProblemDetails): string[] {
  const messages: string[] = [];

  // Standard ASP.NET Core ValidationProblemDetails: { errors: { field: [msg...] } }
  if (isRecord(problem.errors)) {
    for (const [field, errs] of Object.entries(problem.errors)) {
      if (Array.isArray(errs)) {
        for (const msg of errs) {
          if (typeof msg === 'string') messages.push(field ? `${field}: ${msg}` : msg);
        }
      }
    }
  }

  // Custom factory: ProblemDetails with Extensions["Errors"] serialized as "Errors": [ [field, [msg...]], ... ]
  const extErrors = (problem.Errors ?? (problem as any).errors) as unknown;
  if (Array.isArray(extErrors)) {
    for (const entry of extErrors) {
      if (
        Array.isArray(entry) &&
        typeof entry[0] === 'string' &&
        Array.isArray(entry[1])
      ) {
        const field = entry[0];
        for (const msg of entry[1]) {
          if (typeof msg === 'string') messages.push(field ? `${field}: ${msg}` : msg);
        }
      }
    }
  }

  return messages;
}

export function formatApiError(input: unknown, fallback = 'Request failed'): string {
  if (!input) return fallback;
  if (typeof input === 'string') return input;

  // fetch/network errors
  if (input instanceof Error) return input.message || fallback;

  if (!isRecord(input)) return fallback;
  const problem = input as ProblemDetails;

  const validationMessages = extractValidationMessages(problem);
  if (validationMessages.length > 0) return validationMessages.join('\n');

  // Generic ProblemDetails
  if (typeof problem.detail === 'string' && problem.detail.trim()) return problem.detail;
  if (typeof problem.title === 'string' && problem.title.trim()) return problem.title;

  return fallback;
}

