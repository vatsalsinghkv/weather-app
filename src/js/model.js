/* 
MODEl
-> Business Logic (Main Logic)
-> State (UI Data)
-> HTTP Requests (API Data)
*/

import { API_KEY, API_FORECAST, API_INITIAL_FORECAST } from './config';
import { FETCH } from './helper';

const state = {
	location: {
		name: 'New Delhi',
		lat: 28.7,
		lon: 77.2,
	},
	forecast: [],
	currentDay: 0,
};

let tempMin = 0;
let tempMax = 0;

/**
 * Returns the data after removing irrelevant information
 * @param {Object} data - Forecast Data
 * @returns {Object} Refined Data
 */

const refineForecastData = data => {
	const temp = {
		day: data.current.temp,
		min: tempMin,
		max: tempMax,
	};

	data.current.temp = temp;

	return {
		current: data.current,
		daily: [data.current, ...data.daily],
		units: data.units,
	};
};

/**
 * Get current location coordinates of the user
 * @async
 * @returns {object} Latitude (lat) & Longitude (lon)
 */

const getCurrentLocation = async function () {
	try {
		const {
			coords: { latitude: lat, longitude: lon },
		} = await new Promise((res, rej) => {
			navigator.geolocation.getCurrentPosition(res, rej);
		});

		const data = await FETCH(
			`${API_INITIAL_FORECAST}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
		);

		tempMin = data.main.temp_min;
		tempMax = data.main.temp_max;

		state.location.lat = lat;
		state.location.lon = lon;
		state.location.name = data.name;
		return { lat, lon };
	} catch (err) {
		console.error(err);

		const data = await FETCH(
			`${API_INITIAL_FORECAST}?lat=${state.location.lat}&lon=${state.location.lon}&units=metric&appid=${API_KEY}`
		);

		tempMin = data.main.temp_min;
		tempMax = data.main.temp_max;

		return { lat: state.location.lat, lon: state.location.lon };
	}
};

/**
 * Sets min & max temp of imperial type in state
 * @async
 * @param {String} [units='imperial'] imperial
 */

const setTemp = async function setCurrMinMaxTemp(units = 'imperial') {
	try {
		const { lat, lon } = state.location;
		const data = await FETCH(
			`${API_INITIAL_FORECAST}?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
		);

		const { temp_min, temp_max } = data.main;

		// await forecast(lat, lon, 'imperial');

		const temp = {
			day: state.forecast[1].current.temp.day,
			min: temp_min,
			max: temp_max,
		};

		state.forecast[1].current.temp = temp;
	} catch (err) {
		console.error(err);
	}
};

/**
 * Returns the lat & lon of the given location and also fetch min & max temp
 * @async
 * @param {String} addr Location | City Name
 * @param {String} [units="metric"] imperial | metric
 * @returns {Object} Latitude (lat) & Longitude (lon)
 */

const initForecast = async function initialForecast(addr, units = 'metric') {
	try {
		const data = await FETCH(
			`${API_INITIAL_FORECAST}?q=${addr}&units=${units}&appid=${API_KEY}`
		);

		const { lat, lon } = data.coord;
		tempMin = data.main.temp_min;
		tempMax = data.main.temp_max;

		state.location.lat = lat;
		state.location.lon = lon;
		state.location.name = data.name;

		return { lat, lon };
	} catch (err) {
		throw err;
	}
};

/**
 * Gets forecast of the given latitude & longitude
 * @async
 * @param {Number} lat Latitude of the location
 * @param {Number} lon Longitude of the location
 * @param {String} [units="metric"] metric | imperial
 */

const forecast = async function (lat, lon, units = 'metric') {
	try {
		state.currentDay = 0;

		// Can throw Error
		const data = await FETCH(
			`${API_FORECAST}?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${API_KEY}&units=${units}`
		);

		// Use Data
		data.units = units;
		if (state.forecast.length >= 2) state.forecast.length = 0;
		state.forecast.push(refineForecastData(data));

		if (units === 'metric') await forecast(lat, lon, 'imperial');
	} catch (err) {
		throw err;
	}
};

export { getCurrentLocation, forecast, initForecast, setTemp, state };
