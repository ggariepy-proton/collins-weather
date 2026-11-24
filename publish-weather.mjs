import { mkdir, writeFile } from 'node:fs/promises';
const { AWN_API_KEY, AWN_APPLICATION_KEY, AWN_DEVICE_MAC } = process.env;
if (!AWN_API_KEY || !AWN_APPLICATION_KEY) throw new Error('Missing AWN credentials');
const url = new URL('https://rt.ambientweather.net/v1/devices');
url.search = new URLSearchParams({apiKey: AWN_API_KEY, applicationKey: AWN_APPLICATION_KEY});
let devices;
try {
  const response = await fetch(url, {signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  devices = await response.json();
} catch { throw new Error('Ambient Weather request failed'); }
if (!Array.isArray(devices)) throw new Error('Unexpected API response');
const normalize = s => String(s ?? '').replace(/[^a-f0-9]/gi, '').toLowerCase();
const device = AWN_DEVICE_MAC ? devices.find(d => normalize(d.macAddress) === normalize(AWN_DEVICE_MAC)) : devices.length === 1 ? devices[0] : undefined;
if (!device?.lastData) throw new Error('No unique station found; configure AWN_DEVICE_MAC if necessary');
const d = device.lastData;
if (!Number.isFinite(d.dateutc) || !Number.isFinite(d.tempf)) throw new Error('Missing observation timestamp or temperature');
const fields = 'tempf humidity dewPoint feelsLike baromabsin baromrelin winddir windspeedmph windgustmph maxdailygust hourlyrainin dailyrainin weeklyrainin monthlyrainin eventrainin totalrainin solarradiation uv'.split(' ');
const observations = Object.fromEntries(fields.filter(k => Number.isFinite(d[k])).map(k => [k,d[k]]));
const result = {station:'Collins Avenue Weather Authority', observed_at:new Date(d.dateutc).toISOString(), fetched_at:new Date().toISOString(), units:{temperature:'F', pressure:'inHg', wind_speed:'mph', wind_direction:'degrees', rain:'in', solar_radiation:'W/m²', humidity:'percent'}, observations};
await mkdir('public',{recursive:true});
await writeFile('public/weather.json', JSON.stringify(result,null,2)+'\n');
await writeFile('public/index.html','<!doctype html><meta charset="utf-8"><title>Collins Avenue Weather Authority</title><h1>Collins Avenue Weather Authority</h1><p><a href="weather.json">Latest weather observations (JSON)</a></p>');
