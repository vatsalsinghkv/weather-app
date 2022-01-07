/* 
MODEl
-> Business Logic (Main Logic)
-> State (UI Data)
-> HTTP Requests (API Data)
*/

import { API_KEY, API_FORECAST, API_GEOLOCATION, TOKEN } from './config';
import { FETCH } from './helper';

const state = {
	location: {
		name: 'New Delhi',
		lat: 28.7,
		lon: 77.2,
	},
	forecast: [],
};

/**
 * Returns the data after removing irrelevant information
 * @param {Object} data - Forecast Data
 * @returns {Object} Refined Data
 */

const refineForecastData = data => {
	return {
		current: data.current,
		daily: data.daily,
		units: data.units,
	};
};

/**
 * Get current location coordinates of the user
 * @async
 * @returns {object} Latitude (lat) & Longitude (lon)
 */

const getCurrentLocation = function () {
	navigator.geolocation.getCurrentPosition(
		// Success
		location => {
			const {
				coords: { latitude: lat, longitude: lon },
			} = location;

			const data = await FETCH(
				`${API_GEOLOCATION}${lon},${lat}.json?access_token=${TOKEN}&limit=1`
			);

			const places = data.features[0].context;
			const place = places[0].text;

			state.location.name = place;
			state.location.lat = lat;
			state.location.lon = lon;
			return { lat, lon };
		},
		// Error
		() => {
			console.log(`Couldn't get the your location`);
			return { lat: state.location.lat, lon: state.location.lon };
		}
	);
};

/**
 * Returns the latitude & longitude of the given location
 * @async
 * @param {String} addr - Address | Location
 * @returns {Object} Latitude (lat) & Longitude (lon)
 */

const geocode = async function (addr) {
	try {
		const data = await FETCH(
			`${API_GEOLOCATION}${addr}.json?access_token=${TOKEN}&limit=1`
		);

		if (!data.features.length) throw new Error('Invalid Location');

		const location = data.features[0];
		const [lon, lat] = [...location.center];

		state.location.name = location.place_name;
		// state.location.name = location.text;
		state.location.lat = lat;
		state.location.lon = lon;

		return { lat, lon };
	} catch (err) {
		throw err;
	}
};

/**
 * Gets forecast of the given latitude & longitude
 * @param {Number} lat - Latitude of the location
 * @param {Number} lon - Longitude of the location
 */

const forecast = async function (lat, lon, units = 'metric') {
	try {
		// Can throw Error
		const data = await FETCH(
			`${API_FORECAST}?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${API_KEY}&units=${units}`
		);

		// Use Data
		data.units = units;
		if (state.forecast.length >= 2) state.forecast.length = 0;
		state.forecast.push(refineForecastData(data));

		if (units === 'metric') forecast(lat, lon, 'imperial');
	} catch (err) {
		throw err;
	}
};

export { getCurrentLocation, forecast, geocode, state };
