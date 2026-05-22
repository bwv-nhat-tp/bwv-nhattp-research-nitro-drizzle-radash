export interface MessageResponse {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: string[];
}
