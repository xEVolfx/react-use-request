export enum RequestStatus {
  Idle = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

export interface UseRequestOptions<Data, Err, Var> {
  queryFn: (signal: AbortSignal, vars: Var) => Promise<Data>;
  onError?: (err: Err) => void;
}

export interface UseRequestResult<Data, Var> {
  data: Data | undefined;
  isLoading: boolean;
  request: (vars: Var) => Promise<void>;
  status: RequestStatus;
  setData: (value: Data) => void;
}

export interface UseStatelessRequestResult<Var> {
  isLoading: boolean;
  request: (vars: Var) => Promise<void>;
  status: RequestStatus;
}
