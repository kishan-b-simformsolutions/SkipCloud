export interface AsyncFormState<TFields extends string = string> {
  status: "idle" | "invalid" | "validated";
  message: string;
  fieldErrors: Partial<Record<TFields, string>>;
  submissionId: string;
  normalizedEmail?: string;
}

export const emptyAsyncFormState: AsyncFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  submissionId: "",
};