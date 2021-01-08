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

import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';

import { CigarettesBlock, CurrentLocation } from '../../../../../components';
import { ApiContext, CurrentLocationContext } from '../../../../../stores';
import * as theme from '../../../../../util/theme';

const styles = StyleSheet.create({
	cigaretteBlock: {
		marginBottom: theme.spacing.normal,
	},
	container: {
		alignItems: 'center',
		flexDirection: 'column',
		paddingBottom: theme.spacing.big,
		paddingTop: theme.spacing.normal,
		width: 480,
	},
	currentLocation: {
		textAlign: 'center',
	},
});

export function ShareImage(): React.ReactElement {
	const { api } = useContext(ApiContext);
	const { currentLocation } = useContext(CurrentLocationContext);

	if (!currentLocation) {
		throw new Error(
			'ShareScreen/ShareImage/ShareImage.tsx only render when `currentLocation` is defined.'
		);
	} else if (!api) {
		throw new Error(
			'ShareScreen/ShareImage/ShareImage.tsx only render when `api` is defined.'
		);
	}

	return (
		<View style={styles.container}>
			<CigarettesBlock
				cigarettes={api.shootismoke.dailyCigarettes}
				frequency="daily"
				style={styles.cigaretteBlock}
			/>
			<CurrentLocation
				currentLocation={currentLocation}
				measurement={api.pm25}
				numberOfLines={2}
				style={styles.currentLocation}
			/>
		</View>
	);
}
