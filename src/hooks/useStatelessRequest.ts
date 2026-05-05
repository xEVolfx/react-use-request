import { useEffect, useRef, useState } from 'react';

import type { UseRequestOptions, UseStatelessRequestResult } from '../types';
import { RequestStatus } from '../types';

export const useStatelessRequest = <Err extends Error = Error, Var = void>(
  { queryFn, onError }: UseRequestOptions<void, Err, Var>
): UseStatelessRequestResult<Var> => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.Idle);
  const cancelRef = useRef<AbortController | undefined>(undefined);

  useEffect(() => {
    return () => {
      cancelRef.current?.abort();
    };
  }, []);

  const request = async (vars: Var): Promise<void> => {
    let signal: AbortSignal | undefined;

    try {
      cancelRef.current?.abort();
      cancelRef.current = new AbortController();
      signal = cancelRef.current.signal;

      setIsLoading(true);
      setStatus(RequestStatus.Loading);

      await queryFn(signal, vars);

      setStatus(RequestStatus.Success);
      cancelRef.current = undefined;
    } catch (e: unknown) {
      if (signal?.aborted) return;
      setStatus(RequestStatus.Error);
      if (onError) {
        onError(e as Err);
      } else {
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { request, isLoading, status };
};
