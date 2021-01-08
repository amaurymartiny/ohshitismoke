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

import Switch from '@dooboo-ui/native-switch-toggle';
import { FontAwesome } from '@expo/vector-icons';
import { Frequency } from '@shootismoke/graphql';
import * as Notifications from 'expo-notifications';
import * as Localization from 'expo-localization';
import * as Permissions from 'expo-permissions';
import * as C from 'fp-ts/lib/Console';
import { pipe } from 'fp-ts/lib/pipeable';
import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { scale } from 'react-native-size-matters';

import { ActionPicker } from '../../../../components';
import { ApiContext } from '../../../../stores';
import {
	useGetOrCreateUser,
	USER_VARIABLES,
	useUpdateUser,
} from '../../../../stores/util';
import { AmplitudeEvent, track } from '../../../../util/amplitude';
import { promiseToTE, retry, sideEffect } from '../../../../util/fp';
import { sentryError } from '../../../../util/sentry';
import * as theme from '../../../../util/theme';
import { useTranslation } from 'react-i18next';

const notificationsValues = ['never', 'daily', 'weekly', 'monthly'] as const;

/**
 * Capitalize a string.
 *
 * @param s - String to capitalize
 */
function capitalize(s: string): string {
	return s[0].toUpperCase() + s.slice(1);
}

/**
 * Convert hex to rgba.
 * @see https://stackoverflow.com/a/51564734
 */
function hex2rgba(hex: string, alpha = 1): string {
	const matches = hex.match(/\w\w/g);
	if (!matches) {
		throw new Error(`Invalid hex: ${hex}`);
	}

	const [r, g, b] = matches.map((x) => parseInt(x, 16));

	return `rgba(${r},${g},${b},${alpha})`;
}

type SelectNotificationsProps = ViewProps;

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	label: {
		...theme.text,
		textTransform: 'uppercase',
	},
	labelFrequency: {
		...theme.text,
		color: theme.primaryColor,
		fontFamily: theme.gothamBlack,
		fontWeight: '900',
		textTransform: 'uppercase',
	},
	switchCircle: {
		borderRadius: scale(11),
		height: scale(22),
		width: scale(22),
	},
	switchContainer: {
		borderRadius: scale(14),
		height: scale(28),
		marginRight: theme.spacing.small,
		padding: scale(3),
		width: scale(48),
	},
});

export function SelectNotifications(
	props: SelectNotificationsProps
): React.ReactElement {
	const { style, ...rest } = props;
	const { api } = useContext(ApiContext);

	// Data from backend
	const { createUser, getUser } = useGetOrCreateUser();
	const [updateUser, { data: updateUserData }] = useUpdateUser();

	// This state is used for optimistic UI: right after the user clicks, we set
	// this state to what the user clicked. When the actual mutation resolves, we
	// populate with the real data.
	const [optimisticNotif, setOptimisticNotif] = useState<Frequency>();

	const notif =
		// If we have optimistic UI, show it
		optimisticNotif ||
		// If we have up-to-date data from backend, take that
		updateUserData?.updateUser?.notifications?.frequency ||
		createUser.data?.createUser?.notifications?.frequency ||
		// At the beginning, before anything happens, query from backend
		getUser.data?.getUser?.notifications?.frequency ||
		// If the getUserData is still loading, just show `never`
		'never';

	const { t } = useTranslation(['screen_home', 'components']);

	// Optimistic UI
	useEffect(() => {
		// If we receive new updateUserData, then our optimistic UI is obsolete
		if (updateUserData) {
			setOptimisticNotif(undefined);
		}
	}, [updateUserData]);

	/**
	 * Handler for changing notification frequency
	 *
	 * @param buttonIndex - The button index in the ActionSheet
	 */
	function handleChangeNotif(frequency: Frequency): void {
		setOptimisticNotif(frequency);

		track(
			`HOME_SCREEN_NOTIFICATIONS_${frequency.toUpperCase()}` as AmplitudeEvent
		);

		if (!api) {
			throw new Error(
				'Home/SelectNotifications/SelectNotifications.tsx only gets displayed when `api` is defined.'
			);
		}

		pipe(
			promiseToTE(
				() => Permissions.askAsync(Permissions.NOTIFICATIONS),
				'SelectNotifications'
			),
			TE.chain(({ status }) => {
				if (status === 'granted') {
					return TE.right(undefined);
				} else {
					track('HOME_SCREEN_NOTIFICATIONS_PERMISSIONS_DENIED');

					return TE.left(
						new Error(
							'Permission to access notifications was denied'
						)
					);
				}
			}),
			TE.chain(() =>
				// Retry 3 times to get the Expo push token, sometimes we get an Error
				// "Couldn't get GCM token for device" on 1st try
				retry(
					() =>
						promiseToTE(
							() => Notifications.getExpoPushTokenAsync(),
							'SelectNotifications'
						),
					{
						retries: 3,
					}
				)
			),
			TE.map((expoPushToken) => ({
				expoPushToken: expoPushToken.data,
				frequency,
				timezone: Localization.timezone,
				universalId: api.pm25.location,
			})),
			TE.chain(
				sideEffect((notifications) =>
					TE.rightIO(
						C.log(
							`<SelectNotifications> - Update user ${JSON.stringify(
								notifications
							)}`
						)
					)
				)
			),
			TE.chain((notifications) =>
				promiseToTE(
					() =>
						updateUser({
							variables: {
								...USER_VARIABLES,
								input: { notifications },
							},
						}),
					'SelectNotifications'
				)
			),
			TE.fold(
				(error) => {
					sentryError('SelectNotifications')(error);
					setOptimisticNotif('never');

					track('HOME_SCREEN_NOTIFICATIONS_ERROR');

					return T.of(undefined);
				},
				() => T.of(undefined)
			)
		)().catch(sentryError('SelectNotifications'));
	}

	// Is the switch on or off?
	const isSwitchOn = notif !== 'never';

	return (
		<ActionPicker
			actionSheetOptions={{
				cancelButtonIndex: 4,
				options: notificationsValues
					.map((f) => t(`components:frequency.${f}`))
					.map(capitalize)
					.concat(
						capitalize(
							t('screen_home:notification.cancel', 'cancel')
						)
					),
			}}
			amplitudeOpenEvent="HOME_SCREEN_NOTIFICATIONS_OPEN_PICKER"
			callback={(buttonIndex): void => {
				if (buttonIndex === 4) {
					// 4 is cancel

					track('HOME_SCREEN_NOTIFICATIONS_CANCEL');
					return;
				}

				handleChangeNotif(notificationsValues[buttonIndex]); // +1 because we skipped neve
			}}
		>
			{(open): React.ReactElement => (
				<View style={[styles.container, style]} {...rest}>
					<Switch
						backgroundColorOn={theme.primaryColor}
						backgroundColorOff={hex2rgba(
							theme.secondaryTextColor,
							theme.disabledOpacity
						)}
						circleColorOff="white"
						circleColorOn="white"
						circleStyle={styles.switchCircle}
						containerStyle={styles.switchContainer}
						switchOn={isSwitchOn}
						onPress={open}
						duration={500}
					/>

					{isSwitchOn ? (
						<View>
							<Text style={styles.label}>
								{t('screen_home:notification.notify_me')}
							</Text>
							<Text style={styles.labelFrequency}>
								{t(`components:frequency.${notif}`)}{' '}
								<FontAwesome name="caret-down" />
							</Text>
						</View>
					) : (
						<Text style={styles.label}>
							{t('screen_home:notification.allow')}
						</Text>
					)}
				</View>
			)}
		</ActionPicker>
	);
}

/**
 * I18NEXT-PARSER
 * https://github.com/i18next/i18next-parser#caveats
 *
 * > 'notification.frequency'
 * t('components:frequency.never', 'never')
 * More frequency at SelectFrequency.tsx
 */
