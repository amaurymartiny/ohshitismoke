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
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { Banner } from '../../../components';
import { useDistanceUnit } from '../../../stores/distanceUnit';
import * as theme from '../../../util/theme';

interface DistanceProps {
	distance: number;
}

const styles = StyleSheet.create({
	banner: {
		flexDirection: 'row',
		justifyContent: 'center',
	},
	distance: {
		...theme.title,
		color: 'white',
	},
});

export function Distance(props: DistanceProps): React.ReactElement {
	const { localizedDistanceUnit } = useDistanceUnit();
	const distanceUnit = localizedDistanceUnit('short');
	const { t } = useTranslation('screen_detail');

	return (
		<Banner elevated shadowPosition="top" style={styles.banner}>
			<Text style={styles.distance}>
				{t('distance_label', {
					distanceToStation: props.distance,
					distanceUnit,
				}).toUpperCase()}
			</Text>
		</Banner>
	);
}
