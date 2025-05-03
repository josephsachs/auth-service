// src/types/form.ts
export type ValidationRule<T = string> = {
  validate: (value: T, formValues?: Record<string, any>) => boolean;
  errorMessage: string;
};

export type FieldConfig<T = string> = {
  initialValue: T;
  validationRules?: ValidationRule<T>[];
};

export type FormConfig<T = Record<string, any>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

export type FormState<T = Record<string, any>> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
};

export type UseFormReturn<T = Record<string, any>> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  resetForm: () => void;
  validateForm: () => boolean;
  handleSubmit: (onSubmit: (values: T) => Promise<any>) => (e: React.FormEvent) => Promise<void>;
};