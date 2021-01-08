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

import * as Localization from 'expo-localization';
import i18next, { LanguageDetectorAsyncModule } from 'i18next';
import { initReactI18next } from 'react-i18next';

// TODO make a script loader >> react-i18next-expo-backend
import en from './languages/en.json';

const languageDetector: LanguageDetectorAsyncModule = {
	type: 'languageDetector',
	async: true,
	detect: (cb: (lng: string) => void) =>
		cb(Localization.locale.split('-')[0]),
	init: () => {
		/* Do nothing */
	},
	cacheUserLanguage: () => {
		/* Do nothing */
	},
};

i18next
	.use(languageDetector)
	.use(initReactI18next)
	.init({
		debug: true,
		resources: { en },
		lng: 'en',
		ns: [
			'screen_about',
			'screen_detail',
			'screen_error',
			'screen_home',
			'screen_loading',
			'screen_search',
			'components',
		],
		fallbackLng: 'en',
	})
	.catch(console.error);

export default i18next;
