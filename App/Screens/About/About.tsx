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

import Constants from 'expo-constants';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ConversionBox, DistanceUnit } from '@shootismoke/ui';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
	Picker,
	Linking,
} from 'react-native';
import { ScrollIntoView, wrapScrollView } from 'react-native-scroll-into-view';
import { scale } from 'react-native-size-matters';

import { BackButton } from '../../components';
import { useDistanceUnit } from '../../stores';
import { trackScreen, AmplitudeEvent, track } from '../../util/amplitude';
import * as theme from '../../util/theme';
import { sentryError } from '../../util/sentry';

import { RootStackParams } from '../routeParams';

function AboutLink(url: string): void {
	Linking.openURL(url).catch(sentryError('About'));
}

export function handleOpenWaqi(): void {
	AboutLink('https://aqicn.org');
}

export function handleOpenOpenAQ(): void {
	AboutLink('https://openaq.org');
}

export function handleOpenBerkeley(): void {
	AboutLink(
		'http://berkeleyearth.org/air-pollution-and-cigarette-equivalence/'
	);
}

export function handleOpenAmaury(): void {
	AboutLink('https://twitter.com/amaurymartiny');
}

export function handleOpenGithub(): void {
	AboutLink('https://github.com/amaurymartiny/shoot-i-smoke');
}

export function handleOpenMarcelo(): void {
	AboutLink('https://www.behance.net/marceloscoelho');
}

const CustomScrollView = wrapScrollView(ScrollView);
const scrollViewOptions = {
	align: 'top' as const,
	insets: {
		bottom: 0,
		top: scale(theme.spacing.normal),
	},
};

export const aboutSections = {
	aboutBetaInaccurate: 'aboutBetaInaccurate',
	aboutWhyIsTheStationSoFarTitle: 'aboutWhyIsTheStationSoFarTitle',
};

interface AboutProps {
	navigation: StackNavigationProp<RootStackParams, 'About'>;
	route: RouteProp<RootStackParams, 'About'>;
}

interface ProportionProps {
	size: string;
}

const styles = StyleSheet.create({
	credits: {
		borderTopColor: theme.iconBackgroundColor,
		borderTopWidth: 1,
		marginBottom: theme.spacing.normal,
		paddingTop: theme.spacing.big,
	},
	articleLink: {
		...theme.text,
		fontSize: scale(8),
	},
	backButton: {
		marginBottom: theme.spacing.normal,
		marginTop: theme.spacing.normal,
	},
	distance: {
		borderTopColor: theme.iconBackgroundColor,
		borderTopWidth: 1,
		marginBottom: theme.spacing.big,
		paddingTop: theme.spacing.big,
	},
	distanceText: {
		...theme.text,
		fontSize: scale(14),
		paddingLeft: theme.spacing.small,
		textTransform: 'capitalize',
	},
	h2: {
		...theme.title,
		fontSize: scale(20),
		letterSpacing: 0,
		lineHeight: scale(24),
		marginBottom: theme.spacing.small,
	},
	micro: {
		...Platform.select({
			ios: {
				fontFamily: 'Georgia',
			},
			android: {
				fontFamily: 'normal',
			},
		}),
	},
	section: {
		marginBottom: theme.spacing.big,
	},
	distancePicker: {
		...Platform.select({
			ios: {
				marginBottom: scale(-60),
				marginTop: scale(-40),
			},
		}),
	},
});

function Proportion(props: ProportionProps): React.ReactElement {
	const { size } = props;
	const note1 = '\u207D\u00B9\u207E';
	return (
		<>
			{size}
			<Text style={styles.micro}>&micro;</Text>g/m&sup3; {note1}
		</>
	);
}

export function About(props: AboutProps): React.ReactElement {
	const {
		navigation: { goBack },
		route,
	} = props;
	const { t } = useTranslation('screen_about');
	const { distanceUnit, setDistanceUnit } = useDistanceUnit();

	trackScreen('ABOUT');

	const appName = Constants.manifest.name;
	const appVer = Constants.manifest.revisionId || Constants.manifest.version;

	return (
		<CustomScrollView
			scrollIntoViewOptions={scrollViewOptions}
			style={theme.withPadding}
		>
			<BackButton onPress={goBack} style={styles.backButton} />

			<View style={styles.section}>
				<Text style={styles.h2}>
					{t('how_to_calculate_number_of_cigarettes.title')}
				</Text>
				<Text style={theme.text}>
					<Trans
						i18nKey="how_to_calculate_number_of_cigarettes.message"
						t={t}
					>
						This app was inspired by Berkeley Earth’s findings about
						the{' '}
						<Text onPress={handleOpenBerkeley} style={theme.link}>
							equivalence between air pollution and cigarette
							smoking
						</Text>
						. The rule of thumb is simple: one cigarette per day
						(24h) is the rough equivalent of a PM2.5 level of{' '}
						<Proportion size="22" />.
					</Trans>
				</Text>
				<ConversionBox showFootnote={true} t={t} />
				<Text style={styles.articleLink}>
					(1){' '}
					<Text onPress={handleOpenBerkeley} style={theme.link}>
						http://berkeleyearth.org/air-pollution-and-cigarette-equivalence/
					</Text>
				</Text>
			</View>

			<ScrollIntoView
				onMount={route.params?.scrollInto === 'aboutBetaInaccurate'}
				style={styles.section}
			>
				<Text style={styles.h2}>{t('inaccurated_beta.title')}</Text>
				<Text style={theme.text}>{t('inaccurated_beta.message')}</Text>
			</ScrollIntoView>

			<View style={styles.section}>
				<Text style={styles.h2}>
					{t('where_does_data_come_from.title')}
				</Text>
				<Text style={theme.text}>
					<Trans i18nKey="where_does_data_come_from.message" t={t}>
						Air quality data comes from{' '}
						<Text onPress={handleOpenWaqi} style={theme.link}>
							WAQI
						</Text>{' '}
						and{' '}
						<Text onPress={handleOpenOpenAQ} style={theme.link}>
							OpenAQ
						</Text>{' '}
						in the form of PM2.5 AQI levels which are usually
						updated every one hour and converted to direct PM2.5
						levels by the app.
					</Trans>
				</Text>
			</View>

			<ScrollIntoView
				onMount={
					route.params?.scrollInto ===
					'aboutWhyIsTheStationSoFarTitle'
				}
				style={styles.section}
			>
				<Text style={styles.h2}>
					{t('why_is_the_station_so_far.title')}
				</Text>
				<Text style={theme.text}>
					{t('why_is_the_station_so_far.message')}
				</Text>
			</ScrollIntoView>

			<View style={styles.section}>
				<Text style={styles.h2}>{t('weird_results.title')}</Text>
				<Text style={theme.text}>
					<Trans i18nKey="weird_results.message" t={t}>
						We have also encountered a few surprising results: large
						cities with better air than small villages; sudden huge
						increases in the number of cigarettes; stations of the
						same town showing significantly different numbers... The
						fact is air quality depends on several factors such as
						temperature, pressure, humidity and even wind direction
						and intensity. If the result seems weird for you, check{' '}
						<Text onPress={handleOpenWaqi} style={theme.link}>
							WAQI
						</Text>{' '}
						and{' '}
						<Text onPress={handleOpenOpenAQ} style={theme.link}>
							OpenAQ
						</Text>{' '}
						for more information and history on your station.
					</Trans>
				</Text>
			</View>

			<View style={styles.distance}>
				<Text style={styles.h2}>{t('settings.title')}</Text>
				<Text style={theme.text}>
					{t('settings.distance_unit.label')}
				</Text>
				<Picker
					onValueChange={(value: DistanceUnit): void => {
						track(
							`SCREEN_SETTINGS_${value.toUpperCase()}` as AmplitudeEvent
						);
						setDistanceUnit(value);
					}}
					selectedValue={distanceUnit}
					style={styles.distancePicker}
				>
					<Picker.Item
						label={t('settings.distance_unit.km', 'km')}
						value="km"
					/>
					<Picker.Item
						label={t('settings.distance_unit.mile', 'mile')}
						value="mile"
					/>
				</Picker>
				{/* TODO Add changing languages https://github.com/amaurymartiny/shoot-i-smoke/issues/73 */}
			</View>

			<View style={styles.credits}>
				<Text style={styles.h2}>{t('credits.title')}</Text>
				<Text style={theme.text}>
					<Trans
						i18nKey="credits.concept_and_development"
						values={{ author: 'Amaury Martiny' }}
						t={t}
					>
						Concept {'&'} Development by{' '}
						<Text style={theme.link} onPress={handleOpenAmaury}>
							{'{{author}}'}
						</Text>
						.
					</Trans>
					{'\n'}
					<Trans
						i18nKey="credits.design_and_copywriting"
						values={{ author: 'Marcelo S. Coelho' }}
						t={t}
					>
						Design {'&'} Copywriting by{' '}
						<Text style={theme.link} onPress={handleOpenMarcelo}>
							{'{{author}}'}
						</Text>
						.
					</Trans>
					{'\n'}
					{'\n'}
					<Trans i18nKey="credits.database" t={t}>
						Air quality data from{' '}
						<Text style={theme.link} onPress={handleOpenWaqi}>
							WAQI
						</Text>{' '}
						and{' '}
						<Text style={theme.link} onPress={handleOpenOpenAQ}>
							OpenAQ
						</Text>
						.
					</Trans>
					{'\n'}
					<Trans i18nKey="credits.source_code" t={t}>
						Source code{' '}
						<Text style={theme.link} onPress={handleOpenGithub}>
							available on Github
						</Text>
						.
					</Trans>
					{'\n'}
					{'\n'}
					{`${appName || ''} v${appVer || '?'}`}.
				</Text>
			</View>
		</CustomScrollView>
	);
}
