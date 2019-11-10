// Sh**t! I Smoke
// Copyright (C) 2018-2019  Marcelo S. Coelho, Amaury Martiny

// Sh**t! I Smoke is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Sh**t! I Smoke is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Sh**t! I Smoke.  If not, see <http://www.gnu.org/licenses/>.

import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { logFpError, sideEffect } from '../util/fp';
import { noop } from '../util/noop';
import { ErrorContext } from './error';
import { CurrentLocationContext } from './location';
import { Api, createHistoryItem, fetchApi } from './util';

interface Context {
  api?: Api;
  reloadApp: () => void;
}

export const ApiContext = createContext<Context>({ reloadApp: noop });

interface ApiContextProviderProps {
  children: JSX.Element;
}

export function ApiContextProvider({ children }: ApiContextProviderProps) {
  const { currentLocation, isGps, setCurrentLocation } = useContext(
    CurrentLocationContext
  );
  const { setError } = useContext(ErrorContext);
  const [api, setApi] = useState<Api | undefined>(undefined);

  const { latitude, longitude } = currentLocation || {};

  useEffect(() => {
    setApi(undefined);
    setError(undefined);

    if (!currentLocation || !latitude || !longitude) {
      return;
    }

    pipe(
      fetchApi(currentLocation),
      TE.chain(
        sideEffect(api =>
          isGps ? createHistoryItem(api) : TE.right(void undefined)
        )
      ),
      TE.fold(
        error => {
          setError(error);

          return T.of(void undefined);
        },
        newApi => {
          setApi(newApi);
          return T.of(void undefined);
        }
      )
    )().catch(logFpError('ApiContextProvider'));
  }, [latitude, longitude]);

  return (
    <ApiContext.Provider
      value={{
        api,
        // eslint-disable-next-line
        reloadApp: () => setCurrentLocation({ ...currentLocation! }) // Small trick to re-run effect
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}
