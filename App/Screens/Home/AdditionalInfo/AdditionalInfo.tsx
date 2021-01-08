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

import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewProps,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { Frequency, isStationTooFar } from '@shootismoke/ui';

import { ApiContext, CurrentLocationContext } from '../../../stores';
import { track } from '../../../util/amplitude';
import * as theme from '../../../util/theme';
import { aboutSections } from '../../About';
import { RootStackParams } from '../../routeParams';
import { useTranslation } from 'react-i18next';

interface AdditionalInfoProps extends ViewProps {
	/**
	 * Whether the currently shown cigarettes are caculated exactly
	 */
	exactCount: boolean;
	frequency: Frequency;
	navigation: StackNavigationProp<RootStackParams, 'Home'>;
}

const styles = StyleSheet.create({
	linkToAbout: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	tag: {
		backgroundColor: '#C4C4C4',
		borderRadius: scale(10),
		marginRight: theme.spacing.mini,
		paddingHorizontal: scale(6),
		paddingVertical: scale(3),
	},
	tagLabel: {
		color: 'white',
		fontSize: scale(10),
		letterSpacing: scale(1),
		marginLeft: scale(2),
		textAlign: 'center',
	},
});

export function AdditionalInfo(
	props: AdditionalInfoProps
): React.ReactElement | null {
	const { api } = useContext(ApiContext);
	const { currentLocation } = useContext(CurrentLocationContext);
	const { exactCount, frequency, navigation, style, ...rest } = props;
	const { t } = useTranslation('screen_home');

	if (!currentLocation) {
		throw new Error(
			'Home/AdditionalInfo/AdditionalInfo.tsx only gets calculate the `distanceToStation` when `currentLocation` is defined.'
		);
	} else if (!api) {
		throw new Error(
			'Home/AdditionalInfo/AdditionalInfo.tsx only gets calculate the `distanceToStation` when `api` is defined.'
		);
	}

	const isTooFar = isStationTooFar(currentLocation, api);

	// Render a "station too far" warning
	if (isTooFar) {
		return (
			<View style={[theme.withPadding, style]} {...rest}>
				<Text style={theme.text}>{t('station_too_far')}</Text>
			</View>
		);
	}

	// Render a "beta" tag
	if (frequency !== 'daily' && !exactCount) {
		return (
			<View style={[theme.withPadding, style]} {...rest}>
				<TouchableOpacity
					onPress={(): void => {
						track('HOME_SCREEN_BETA_INACCURATE_CLICK');
						// eslint-disable-next-line
						navigation.navigate('About', {
							scrollInto: aboutSections.aboutBetaInaccurate,
						});
					}}
					style={styles.linkToAbout}
				>
					<View style={styles.tag}>
						<Text style={styles.tagLabel}>BETA</Text>
					</View>
					<Text style={theme.text}>{t('beta_not_accurate')}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return null;
}
