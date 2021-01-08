/**
 * @file	Translation Immigrating Script
 * @author	ngdangtu
 *
 * From the project root, run:
 * 		node scripts/immgration.js
 */

const { promises: fp } = require('fs')
const { join } = require('path')

const ROOT = join(__dirname, '..', 'App', 'localization')
const MAIN = join(ROOT, 'languages')
const OLD = join(ROOT, 'legacy_languages')


const MAP = {
	components: {
		box_footnote: 'about_box_footnote',
		box_per_day: 'about_box_per_day',
		btn_back: 'nav_btn_back',
		cigarette_count: null,
		cigarette_count_plural: null,
		cigarette_report: null,
		current_location_unknown_station: 'current_location_unknown_station',
		distance_unit: {
			long_km: 'distance_unit_long_km',
			long_mi: 'distance_unit_long_mi',
			short_km: 'distance_unit_short_km',
			short_mi: 'distance_unit_short_mi'
		},
		frequency: {
			daily: 'home_frequency_daily',
			monthly: 'home_frequency_monthly',
			never: 'home_frequency_never',
			weekly: 'home_frequency_weekly'
		},
		header: {
			change_location: 'home_header_change_location'
		},
		loading_cigarettes: null,
		swear_word_0: 'home_cigarettes_oh',
		swear_word_1: 'home_swear_word_shoot',
		swear_word_2: 'home_swear_word_dang',
		swear_word_3: 'home_swear_word_darn',
		swear_word_4: 'home_swear_word_geez',
		swear_word_5: 'home_swear_word_omg',
		swear_word_6: 'home_swear_word_crap',
		swear_word_7: 'home_swear_word_arrgh'
	},
	'screen_about': {
		credits: {
			concept_and_development: null,
			database: null,
			design_and_copywriting: null,
			source_code: null,
			title: 'about_credits_title'
		},
		'how_to_calculate_number_of_cigarettes': {
			message: null,
			title: 'about_how_do_you_calculate_the_number_of_cigarettes_title'
		},
		inaccurated_beta: {
			message: 'about_beta_inaccurate_message',
			title: 'about_beta_inaccurate_title'
		},
		settings: {
			distance_unit: {
				km: 'about_settings_distance_unit_km',
				label: 'about_settings_distance_unit',
				mile: 'about_settings_distance_unit_mile'
			},
			title: 'about_settings_title'
		},
		'weird_results': {
			message: null,
			title: 'about_weird_results_title'
		},
		'where_does_data_come_from': {
			message: null,
			title: 'about_where_does_data_come_from_title'
		},
		why_is_the_station_so_far: {
			message: 'about_why_is_the_station_so_far_message',
			title: 'about_why_is_the_station_so_far_title'
		}
	},
	screen_detail: {
		distance_label: 'details_distance_label',
		header: {
			latest_update: {
				ago: 'details_header_latest_update_ago',
				label: 'details_header_latest_update_label'
			},
			primary_pollutant_label: 'details_header_primary_pollutant_label'
		},
		marker: {
			air_quality_station: 'details_air_quality_station_marker',
			your_position: 'details_your_position_marker'
		}
	},
	screen_error: {
		cannot_load_cigarettes: 'error_screen_error_cannot_load_cigarettes',
		choose_other_location: 'error_screen_choose_other_location',
		description: 'error_screen_error_description',
		header: {
			sorry: 'error_screen_common_sorry'
		},
		message: 'error_screen_error_message',
		show_details: 'error_screen_show_details'
	},
	'screen_home': {
		beta_not_accurate: 'home_beta_not_accurate',
		btn: {
			see_detailed_info: 'home_btn_see_detailed_info',
			why_is_station_so_far: 'home_btn_why_is_station_so_far'
		},
		header: {
			air_quality_station_distance_from_detect: 'home_header_air_quality_station_distance',
			air_quality_station_distance_from_search: ['home_header_air_quality_station_distance', 'home_header_from_search']
		},
		notification: {
			allow: 'home_frequency_allow_notifications',
			cancel: 'home_frequency_notifications_cancel',
			notify_me: 'home_frequency_notify_me'
		},
		'sharing': {
			located_city: null,
			located_here: 'home_share_message_here',
			message: null,
			title: 'home_share_title'
		},
		station_too_far: 'home_station_too_far_message'
	},
	screen_loading: {
		cough: 'loading_title_cough',
		loading: 'loading_title_loading'
	},
	screen_search: {
		current_location: 'search_current_location',
		header: {
			input_placeholder: 'search_header_input_placeholder'
		}
	}
}


const save = async (dest, transObj) => {
	const transStr = JSON.stringify(transObj, null, 2)
	return fp.writeFile(dest, transStr)
}

const merge = (langs, address) => {
	if (address.old === null) return
	langs.main[address.main] = langs.old[address.old]
}

const travel = (map, trans) => {
	for (const key in map) {
		const val = map[key]

		if (typeof val === 'object' && val != null) {
			const cropTrans = {
				main: trans.main[key],
				old: trans.old
			}
			travel(val, cropTrans)
		}
		else merge(trans, { main: key, old: val })
	}
}

const load = async (path) => {
	const str = await fp.readFile(path, 'utf8')
	return JSON.parse(str)
};


(async () => {
	const list = await fp.readdir(MAIN, 'utf8')

	const msg = list.map(async (langFile) => {
		const main = await load(join(MAIN, langFile))
		const old = await load(join(OLD, langFile))
		travel(MAP, { main, old })
		return save(join(MAIN, langFile), main)
	})

	return Promise.allSettled(msg)
})()
	.catch(console.error);
