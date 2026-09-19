import { CITY_COORDINATES } from '../../data/cityCoordinates.js';
import { db } from '../../src/db/index.js';
import { externalCircuitBreakers } from '../../src/reliability/circuitBreaker.js';
import { executeWithTimeout } from '../../src/reliability/externalClient.js';
import { logger } from '../../src/observability/logger.js';

const CACHE_MAX_AGE_DAYS = 180;
const NASA_TIMEOUT_MS = Number(process.env.NASA_POWER_TIMEOUT_MS) || 10000;

export async function getSunHoursForCity(city) {
  const cached = db.getCityIrradianceCache(city);
  if (cached) {
    const ageDays = (Date.now() - cached.fetchedAt) / (1000 * 60 * 60 * 24);
    if (ageDays < CACHE_MAX_AGE_DAYS) {
      return {
        sunHours: cached.sunHours,
        monthlySunHours: cached.monthlySunHours,
        source: 'nasa_power_api_cached',
        isVerifiedSource: true,
        isReferenceOnly: false,
        status: 'READY'
      };
    }
  }

  const coords = CITY_COORDINATES[city];
  if (!coords) {
    logger.warn(`Coordinates for city "${city}" not found in atlas; using regional reference estimate`, {
      service: 'SOLAR_IRRADIANCE',
      event: 'CITY_COORDS_MISSING',
      metadata: { city }
    });
    const fallback = fallbackRegionalEstimate(city);
    return {
      sunHours: fallback,
      monthlySunHours: generateFallbackMonthly(fallback),
      source: 'REGIONAL_REFERENCE_ESTIMATE',
      isVerifiedSource: false,
      isReferenceOnly: true,
      status: 'DEGRADED'
    };
  }

  try {
    return await externalCircuitBreakers.nasaPower.execute(async () => {
      const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${coords.lon}&latitude=${coords.lat}&format=JSON`;

      const response = await executeWithTimeout(
        (signal) => fetch(url, { signal }),
        'NASA_POWER',
        NASA_TIMEOUT_MS
      );

      if (!response.ok) throw new Error(`NASA POWER API status ${response.status}`);
      const json = await response.json();
      const dataObj = json.properties?.parameter?.ALLSKY_SFC_SW_DWN;
      if (!dataObj || !dataObj.ANN) {
        throw new Error('NASA POWER response missing required solar parameter ALLSKY_SFC_SW_DWN');
      }

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

      return {
        sunHours,
        monthlySunHours,
        source: 'nasa_power_api',
        isVerifiedSource: true,
        isReferenceOnly: false,
        status: 'READY'
      };
    });
  } catch (err) {
    logger.warn(`NASA POWER fetch failed or circuit open: ${err.message}. Using marked regional reference values.`, {
      service: 'NASA_POWER',
      event: 'NASA_FETCH_FALLBACK',
      metadata: { city, errorMessage: err.message }
    });
    const fallback = fallbackRegionalEstimate(city);
    return {
      sunHours: fallback,
      monthlySunHours: generateFallbackMonthly(fallback),
      source: 'REGIONAL_REFERENCE_ESTIMATE',
      isVerifiedSource: false,
      isReferenceOnly: true,
      status: 'DEGRADED',
      error: 'NASA_POWER_UNAVAILABLE'
    };
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
