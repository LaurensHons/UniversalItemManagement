export interface ActionBase<T> {
  callback?: (value: T) => void;
  error?: (error: Error) => void;
}
