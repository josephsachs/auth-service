/// <reference types="react-scripts" />

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
