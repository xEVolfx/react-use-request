import { useEffect } from 'react';

import type { UseRequestOptions, UseRequestResult } from '../types';
import { useRequest } from './useRequest';

export const useRequestEffect = <Data = unknown, Err extends Error = Error>(
  params: UseRequestOptions<Data, Err, void>,
  deps: ReadonlyArray<unknown>
): UseRequestResult<Data, void> => {
  const query = useRequest<Data, Err, void>(params);

  useEffect(() => {
    query.request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return query;
};
