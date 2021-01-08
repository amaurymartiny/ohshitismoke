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
import { StyleSheet, View, ViewProps } from 'react-native';
import { Button, isStationTooFar } from '@shootismoke/ui';

import { CircleButton } from '../../../components';
import { ApiContext, CurrentLocationContext } from '../../../stores';
import { track } from '../../../util/amplitude';
import * as theme from '../../../util/theme';
import { aboutSections } from '../../About';
import { RootStackParams } from '../../routeParams';
import { SelectNotifications } from './SelectNotifications';
import { ShareButton } from './ShareButton';
import { useTranslation } from 'react-i18next';

interface FooterProps extends ViewProps {
	navigation: StackNavigationProp<RootStackParams, 'Home'>;
}

const styles = StyleSheet.create({
	secondLine: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: theme.spacing.small,
	},
	share: {
		marginRight: theme.spacing.small,
	},
});

export function Footer(props: FooterProps): React.ReactElement {
	const { api } = useContext(ApiContext);
	const { currentLocation } = useContext(CurrentLocationContext);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { navigation, style, ...rest } = props;

	if (!currentLocation) {
		throw new Error(
			'Home/Footer/Footer.tsx only gets calculate the `distanceToStation` when `currentLocation` is defined.'
		);
	} else if (!api) {
		throw new Error(
			'Home/Footer/Footer.tsx only gets calculate the `distanceToStation` when `api` is defined.'
		);
	}

	const isTooFar = isStationTooFar(currentLocation, api);

	function goToAbout(): void {
		track('HOME_SCREEN_ABOUT_CLICK');
		navigation.navigate('About');
	}

	function goToAboutWhySoFar(): void {
		track('HOME_SCREEN_ABOUT_WHY_SO_FAR_CLICK');
		navigation.navigate('About', {
			scrollInto: aboutSections.aboutWhyIsTheStationSoFarTitle,
		});
	}

	function goToDetails(): void {
		track('HOME_SCREEN_DETAILS_CLICK');
		navigation.navigate('Details');
	}

	function renderBigButton(): React.ReactElement {
		const { t } = useTranslation('screen_home');
		return isTooFar ? (
			<Button onPress={goToAboutWhySoFar}>
				{t('btn.why_is_station_so_far').toUpperCase()}
			</Button>
		) : (
			<Button onPress={goToDetails}>
				{t('btn.see_detailed_info').toUpperCase()}
			</Button>
		);
	}

	function renderSmallButtons(): React.ReactElement {
		return (
			<>
				<ShareButton style={styles.share} />
				{isTooFar ? (
					<CircleButton onPress={goToDetails} text="DET" />
				) : (
					<CircleButton onPress={goToAbout} text="FAQ" />
				)}
			</>
		);
	}

	return (
		<View style={[theme.withPadding, style]} {...rest}>
			{renderBigButton()}
			<View style={styles.secondLine}>
				<SelectNotifications />
				<View style={{ flexGrow: 1 }} />
				{renderSmallButtons()}
			</View>
		</View>
	);
}
