export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function errorResponse(error) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = status === 500 ? "An unexpected server error occurred" : error.message;

  return { message, status };
}
