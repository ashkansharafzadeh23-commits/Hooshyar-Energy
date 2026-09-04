import { CITY_COORDINATES } from '../../data/cityCoordinates.js';
import { db } from '../../src/db/index.js'; // Note: api/analyze.js is compiled or runs in node context, but imports of ts files might be tricky in pure js, wait, the project uses esbuild for server.ts which includes everything, wait, api/analyze.js is loaded dynamically or bundled?

const CACHE_MAX_AGE_DAYS = 180;

export async function getSunHoursForCity(city) {
  const cached = db.getCityIrradianceCache(city);
  if (cached) {
    const ageDays = (Date.now() - cached.fetchedAt) / (1000 * 60 * 60 * 24);
    if (ageDays < CACHE_MAX_AGE_DAYS) {
      return { sunHours: cached.sunHours, monthlySunHours: cached.monthlySunHours, source: 'nasa_power_api_cached' };
    }
  }

  const coords = CITY_COORDINATES[city];
  if (!coords) {
    console.warn(`مختصات شهر "${city}" در جدول موجود نیست، از تخمین تقریبی استفاده می‌شود`);
    const fallback = fallbackRegionalEstimate(city);
    return { sunHours: fallback, monthlySunHours: generateFallbackMonthly(fallback), source: 'regional_estimate_fallback' };
  }

  try {
    const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${coords.lon}&latitude=${coords.lat}&format=JSON`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`NASA POWER API status ${response.status}`);
    const json = await response.json();
    const dataObj = json.properties.parameter.ALLSKY_SFC_SW_DWN;
    const sunHours = dataObj.ANN;
    const monthlySunHours = {
      JAN: dataObj.JAN, FEB: dataObj.FEB, MAR: dataObj.MAR,
      APR: dataObj.APR, MAY: dataObj.MAY, JUN: dataObj.JUN,
      JUL: dataObj.JUL, AUG: dataObj.AUG, SEP: dataObj.SEP,
      OCT: dataObj.OCT, NOV: dataObj.NOV, DEC: dataObj.DEC
    };

    db.setCityIrradianceCache({
      city,
      sunHours,
      fetchedAt: Date.now(),
      coords,
      monthlySunHours
    });

    return { sunHours, monthlySunHours, source: 'nasa_power_api' };
  } catch (err) {
    console.error('خطا در دریافت داده NASA POWER:', err.message);
    const fallback = fallbackRegionalEstimate(city);
    return { sunHours: fallback, monthlySunHours: generateFallbackMonthly(fallback), source: 'regional_estimate_fallback_after_error' };
  }
}

function fallbackRegionalEstimate(city) {
  const desertCities = ['یزد', 'کرمان', 'اصفهان', 'اراک', 'قم', 'سمنان', 'کاشان', 'اهواز', 'بندرعباس'];
  const northCities = ['رشت', 'ساری', 'بابل', 'آمل'];
  if (desertCities.includes(city)) return 5.75;
  if (northCities.includes(city)) return 4.0;
  return 5.0;
}


function generateFallbackMonthly(ann) {
  // Rough estimate shaping a bell curve around summer
  return {
    JAN: +(ann * 0.6).toFixed(2),
    FEB: +(ann * 0.7).toFixed(2),
    MAR: +(ann * 0.9).toFixed(2),
    APR: +(ann * 1.1).toFixed(2),
    MAY: +(ann * 1.3).toFixed(2),
    JUN: +(ann * 1.4).toFixed(2),
    JUL: +(ann * 1.4).toFixed(2),
    AUG: +(ann * 1.3).toFixed(2),
    SEP: +(ann * 1.1).toFixed(2),
    OCT: +(ann * 0.9).toFixed(2),
    NOV: +(ann * 0.7).toFixed(2),
    DEC: +(ann * 0.6).toFixed(2)
  };
}
