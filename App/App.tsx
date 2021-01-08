// Sh**t! I Smoke
// Copyright (C) 2018-2020  Marcelo S. Coelho, Amaury Martiny

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

import { ApolloClient, ApolloProvider } from '@apollo/client';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as Font from 'expo-font';
import React, { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { FrequencyContextProvider } from '@shootismoke/ui';

import { Screens } from './Screens';
import { Background as LoadingBackground } from './Screens/Loading/Background';
import {
	ApiContextProvider,
	DistanceUnitProvider,
	ErrorContextProvider,
	getApolloClient,
	LocationContextProvider,
	TCacheShape,
} from './stores';
import { setupAmplitude, track } from './util/amplitude';
import { sentryError } from './util/sentry';

import './localization';

import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';
import { IS_SENTRY_SET_UP, RELEASE_CHANNEL } from './util/constants';

// Add Sentry if available
if (IS_SENTRY_SET_UP) {
	Sentry.init({
		dsn: Constants.manifest.extra.sentryPublicDsn as string,
		debug: true,
	});

	Sentry.setRelease(RELEASE_CHANNEL);
	if (Constants.manifest.revisionId) {
		Sentry.setExtra('sisRevisionId', Constants.manifest.revisionId);
	}
}

export function App(): React.ReactElement {
	const [ready, setReady] = useState(false);
	const [client, setClient] = useState<ApolloClient<TCacheShape>>();

	useEffect(() => {
		Promise.all([
			Font.loadAsync({
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				'gotham-black': require('@shootismoke/ui/assets/fonts/Gotham-Black.ttf') as Font.FontResource,
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				'gotham-book': require('@shootismoke/ui/assets/fonts/Gotham-Book.ttf') as Font.FontResource,
			}),
			// Add Amplitude if available
			setupAmplitude(),
		])
			.then(() => setReady(true))
			.catch(sentryError('App'));
	}, []);

	useEffect(() => {
		// Load the Offix client
		getApolloClient().then(setClient).catch(sentryError('App'));
	}, []);

	useEffect(() => {
		// Track user closing/re-opening the app
		AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				track('APP_REFOCUS');
			} else if (state === 'background') {
				track('APP_EXIT');
			}
		});
	}, []);

	return (
		<ErrorContextProvider>
			<LocationContextProvider>
				<ActionSheetProvider>
					<ApiContextProvider>
						<FrequencyContextProvider>
							<DistanceUnitProvider>
								{ready && client ? (
									<ApolloProvider client={client}>
										<Screens />
									</ApolloProvider>
								) : (
									<LoadingBackground />
								)}
							</DistanceUnitProvider>
						</FrequencyContextProvider>
					</ApiContextProvider>
				</ActionSheetProvider>
			</LocationContextProvider>
		</ErrorContextProvider>
	);
}

// TODO bug will be encounter until all the old translation is replaced
