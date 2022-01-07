/* 
CONTROLLER 
-> Application Logic (Events)
-> Interact with Model & Views
*/

import * as model from './model';
import backgroundView from './views/backgroundView';
import detailView from './views/detailView';
import searchView from './views/searchView';
import sidebarView from './views/sidebarView';

const { state } = model;

/**
 * It displays the forecast of given or user's current location
 * @param {String} [location=''] - Location which forecast should be displayed
 */

const controlForecast = async function (location = '') {
	try {
		sidebarView.renderSpinner();
		detailView.renderSpinner();
		searchView._clear();

		if (!location) {
			const { lat, lon } = model.getCurrentLocation();
			await model.forecast(lat, lon);
		} else {
			const { lat, lon } = await model.geocode(location);
			await model.forecast(lat, lon);
		}

		sidebarView.render({
			temp: state.forecast[0].current.temp,
			weather_status: state.forecast[0].current.weather[0].main,
			weather_id: state.forecast[0].current.weather[0].id,
			location: state.location.name,
		});

		detailView.render(state.forecast[0]);
		backgroundView.setTheme(state.forecast[0].current.weather[0].id);
	} catch (err) {
		console.error(err);
		detailView.clear();
		sidebarView.renderError();
	}
};

/**
 * Controls when user changes temp type
 * @param {Object | Node} clicked
 */

const controlTempTypes = function (clicked) {
	if (clicked.classList.contains('active')) return;

	$('.active').removeClass('active');
	clicked.classList.add('active');

	if (clicked.classList.contains('temp__type--f')) {
		sidebarView._updateTemp(state.forecast[1].current.temp);
		detailView.render(state.forecast[1]);
	} else {
		sidebarView._updateTemp(state.forecast[0].current.temp);
		detailView.render(state.forecast[0]);
	}
};

/**
 * Controls when user search for a location
 */

const controlSearch = async function () {
	try {
		const query = searchView.getQuery();

		if (!query) return;

		controlForecast(query);
	} catch (err) {
		console.error(err);
	}
};

controlForecast();

// EVENTS - Subscribers

// Init
(function () {
	searchView.addHandler(controlSearch);
	searchView.addHandlerMyLocation(controlForecast);
	sidebarView.addHandler(controlTempTypes);
})();
