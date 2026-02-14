

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export interface CreateFeedbackDto {
  name: string;
  message: string;
}