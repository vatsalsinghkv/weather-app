import dotenv from 'dotenv';
dotenv.config();

const API_GEOLOCATION = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
const API_FORECAST = 'https://api.openweathermap.org/data/2.5/onecall';

const { API_KEY } = process.env;
const { TOKEN } = process.env;
const TIMEOUT_SEC = 10;

export { API_KEY, API_FORECAST, API_GEOLOCATION, TIMEOUT_SEC, TOKEN };
