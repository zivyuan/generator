export interface IPCResult<T> {
  code: number
  message: string
  data?: T
}
