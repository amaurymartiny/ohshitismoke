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

import backIcon from '@shootismoke/ui/assets/images/back.png';
import React from 'react';
import {
	GestureResponderEvent,
	Image,
	ImageRequireSource,
	StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';

import * as theme from '../../util/theme';
import { useTranslation } from 'react-i18next';

interface BackButtonProps {
	onPress: (event: GestureResponderEvent) => void;
	style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create({
	backButton: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	backText: {
		...theme.text,
		marginLeft: 9,
	},
});

export function BackButton(props: BackButtonProps): React.ReactElement {
	const { style } = props;
	const { t } = useTranslation('components');

	return (
		<View style={style}>
			<TouchableOpacity
				hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
				onPress={props.onPress}
				style={styles.backButton}
			>
				<Image source={backIcon as ImageRequireSource} />
				<Text style={styles.backText}>{t('btn_back', 'Back')}</Text>
			</TouchableOpacity>
		</View>
	);
}
