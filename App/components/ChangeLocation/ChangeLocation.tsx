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

import React from 'react';
import {
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
} from 'react-native';
import { scale } from 'react-native-size-matters';

import * as theme from '../../util/theme';
import { CircleButton } from '../CircleButton';
import { useTranslation } from 'react-i18next';

type ChangeLocationProps = TouchableOpacityProps;

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		justifyContent: 'center',
	},
	icon: {
		alignSelf: 'center',
		paddingTop: scale(2), // Empirically looks most centered
		marginBottom: theme.spacing.tiny,
	},
	label: {
		color: theme.primaryColor,
		fontFamily: theme.gothamBlack,
		fontSize: scale(8),
		letterSpacing: 0,
		lineHeight: scale(10),
		textAlign: 'center',
		textTransform: 'uppercase',
	},
});

export function ChangeLocation(props: ChangeLocationProps): React.ReactElement {
	const { style, ...rest } = props;
	const { t } = useTranslation('components');
	return (
		<TouchableOpacity style={[styles.container, style]} {...rest}>
			<CircleButton
				as={View}
				icon="md-pin"
				inverted
				style={styles.icon}
			/>
			<Text style={styles.label}>{t('header.change_location')}</Text>
		</TouchableOpacity>
	);
}
