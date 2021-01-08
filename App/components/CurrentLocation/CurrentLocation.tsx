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

import { OpenAQFormat, stationName } from '@shootismoke/dataproviders';
import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

import { Location } from '../../stores/util/fetchGpsPosition';
import * as theme from '../../util/theme';
import { useTranslation } from 'react-i18next';

interface CurrentLocationProps extends TextProps {
	measurement: OpenAQFormat;
	currentLocation: Location;
}

const styles = StyleSheet.create({
	title: {
		...theme.title,
	},
});

export function CurrentLocation(
	props: CurrentLocationProps
): React.ReactElement {
	const { currentLocation, measurement, style, ...rest } = props;

	const { t } = useTranslation('components');
	const UNKNOWN_STATION = t('current_location_unknown_station');

	return (
		<Text style={[styles.title, style]} {...rest}>
			{(
				currentLocation.name ||
				stationName(measurement) ||
				UNKNOWN_STATION
			).toUpperCase()}
		</Text>
	);
}
