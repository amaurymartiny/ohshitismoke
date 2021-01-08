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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AsyncStorage } from 'react-native';

import { noop, DistanceUnit } from '@shootismoke/ui';
import { sentryError } from '../util/sentry';
import { useTranslation } from 'react-i18next';

type DistanceUnitFormat = 'short' | 'long';

const STORAGE_KEY = 'DISTANCE_UNIT';

interface ContextType {
	distanceUnit: DistanceUnit;
	setDistanceUnit: (distanceUnit: DistanceUnit) => void;
	localizedDistanceUnit: (format: DistanceUnitFormat) => string;
}

const Context = createContext<ContextType>({
	distanceUnit: 'km',
	localizedDistanceUnit: () => '',
	setDistanceUnit: noop,
});

export function DistanceUnitProvider({
	children,
}: {
	children: React.ReactNode;
}): React.ReactElement {
	const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
	const { t } = useTranslation('components');

	function localizedDistanceUnit(format: 'short' | 'long'): string {
		const unit = distanceUnit === 'km' ? 'km' : 'mi';
		return t(`distance_unit.${format}`, { context: unit });
	}

	useEffect(() => {
		async function getDistanceUnit(): Promise<void> {
			const unit = await AsyncStorage.getItem(STORAGE_KEY);

			if (unit === 'km' || unit === 'mile') {
				setDistanceUnit(unit);
			}
		}

		getDistanceUnit().catch(sentryError('DistanceUnitProvider'));
	}, []);

	useEffect(() => {
		AsyncStorage.setItem(STORAGE_KEY, distanceUnit).catch(
			sentryError('DistanceUnitProvider')
		);
	}, [distanceUnit]);

	return (
		<Context.Provider
			value={{ distanceUnit, setDistanceUnit, localizedDistanceUnit }}
		>
			{children}
		</Context.Provider>
	);
}

export const useDistanceUnit = (): ContextType => useContext(Context);

/**
 * I18NEXT-PARSER
 * https://github.com/i18next/i18next-parser#caveats
 *
 * > localizedDistanceUnit
 * t('distance_unit.long', 'kilometer', {context: 'km'})
 * t('distance_unit.long', 'mile', {context: 'mi'})
 * t('distance_unit.short', 'km', {context: 'km'})
 * t('distance_unit.short', 'mi', {context: 'mi'})
 */
