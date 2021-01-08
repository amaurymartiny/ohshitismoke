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
import { Picker, StyleSheet, Text, View } from 'react-native';

import i18n from '../../../localization'; // TODO language picker
import { ApiContext } from '../../../stores';
import * as theme from '../../../util/theme';
import * as names from './names.json';

const styles = StyleSheet.create({
	container: {
		borderWidth: 0,
	},
	picker: {
		height: 1000,
		position: 'absolute',
		top: 0,
		width: 1000,
	},
});

export function Language(): React.ReactElement {
	const { reloadApp } = useContext(ApiContext);

	const handleValueChange = async (itemValue: string): Promise<void> => {
		await i18n.changeLanguage(itemValue);

		// Reload app for changes to take effect
		reloadApp();
	};

	// Using this hack to show custom picker style
	// https://github.com/facebook/react-native/issues/7817#issuecomment-264851951
	return (
		<View style={styles.container}>
			<Text style={theme.link}>
				{names[i18n.language as keyof typeof names].nativeName}
			</Text>
			<Picker
				itemStyle={theme.text}
				onValueChange={handleValueChange}
				selectedValue={i18n.language}
				style={styles.picker}
			>
				{i18n.languages.map((lang) => (
					<Picker.Item
						key={lang}
						label={names[lang as keyof typeof names].nativeName}
						value={lang}
					/>
				))}
			</Picker>
		</View>
	);
}
