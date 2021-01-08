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

import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Api } from '@shootismoke/ui';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ApiContext, GpsLocationContext } from '../../stores';
import { Location } from '../../stores/util/fetchGpsPosition';
import { trackScreen } from '../../util/amplitude';
import * as theme from '../../util/theme';
import { Background } from './Background';

// The variable returned by setTimeout for longWaiting
let longWaitingTimeout: number | null = null;

const styles = StyleSheet.create({
	dots: {
		color: theme.primaryColor,
	},
	text: {
		...theme.title,
		fontSize: 18,
		textAlign: 'center',
	},
});

function renderCough(index: number, t: TFunction): React.ReactElement {
	return (
		<Text key={index}>
			{t('cough')}
			<Text style={styles.dots}>...</Text>
		</Text>
	);
}

function renderText(
	longWaiting: boolean,
	gps?: Location,
	api?: Api
): React.ReactElement {
	const { t } = useTranslation('screen_loading');
	let coughs = 0; // Number of times to show "Cough..."
	if (gps) ++coughs;
	if (longWaiting) ++coughs;
	if (api) ++coughs;

	return (
		<Text>
			{t('loading')}
			<Text style={styles.dots}>...</Text>
			{Array.from({ length: coughs }, (_, index) => index + 1).map(
				(value, index) => {
					// Create array 1..N and rendering Cough...
					renderCough(index, t);
				}
			)}
		</Text>
	);
}

function clearLongWaiting(): void {
	if (longWaitingTimeout) {
		clearTimeout(longWaitingTimeout);
		longWaitingTimeout = null;
	}
}

export function Loading(): React.ReactElement {
	const { api } = useContext(ApiContext);
	const gps = useContext(GpsLocationContext);

	const [longWaiting, setLongWaiting] = useState(false); // If api is taking a long time

	trackScreen('LOADING');

	useEffect(() => {
		// Set a 2s timer that will set `longWaiting` to true. Used to show an
		// additional "cough" message on the loading screen
		longWaitingTimeout = setTimeout(() => {
			setLongWaiting(true);
		}, 2000);

		return clearLongWaiting;
	}, []);

	useEffect(() => {
		if (api) {
			clearLongWaiting();
		}
	}, [api]);

	return (
		<Background style={theme.withPadding}>
			<Text style={styles.text}>{renderText(longWaiting, gps, api)}</Text>
		</Background>
	);
}
