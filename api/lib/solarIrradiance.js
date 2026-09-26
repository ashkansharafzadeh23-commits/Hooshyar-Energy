import { CITY_COORDINATES } from '../../data/cityCoordinates.js';
import { monitoringRepository } from '../../src/repositories/monitoringRepository.js';
import { externalCircuitBreakers } from '../../src/reliability/circuitBreaker.js';
import { executeWithTimeout } from '../../src/reliability/externalClient.js';
import { extractSafeExternalErrorMetadata } from '../../src/reliability/errorRedaction.js';
import { logger } from '../../src/observability/logger.js';

const CACHE_MAX_AGE_DAYS = 180;
const NASA_TIMEOUT_MS = Number(process.env.NASA_POWER_TIMEOUT_MS) || 10000;

export async function getSunHoursForCity(city) {
  const cached = monitoringRepository.getCityIrradianceCache(city);
  if (cached && cached.sunHours && cached.sunHours > 0) {
    const ageDays = (Date.now() - cached.fetchedAt) / (1000 * 60 * 60 * 24);
    if (ageDays < CACHE_MAX_AGE_DAYS) {
      return {
        sunHours: cached.sunHours,
        monthlySunHours: cached.monthlySunHours,
        source: 'nasa_power_api_cached',
        dataClassification: 'VERIFIED_SOURCE',
        isVerifiedSource: true,
        isReferenceOnly: false,
        status: 'READY'
      };
    }
  }

  const coords = CITY_COORDINATES[city];
  if (!coords) {
    const supportedFallback = fallbackRegionalEstimate(city);
    if (supportedFallback !== null) {
      logger.warn(`Coordinates for city "${city}" not found in atlas; using supported regional reference estimate`, {
        service: 'SOLAR_IRRADIANCE',
        event: 'CITY_COORDS_MISSING_FALLBACK_TO_REFERENCE',
        metadata: { city, provider: 'NASA_POWER', errorCategory: 'DATA_UNAVAILABLE' }
      });
      return {
        sunHours: supportedFallback,
        monthlySunHours: generateFallbackMonthly(supportedFallback),
        source: 'REGIONAL_REFERENCE_ESTIMATE',
        dataClassification: 'REFERENCE_ESTIMATE',
        isVerifiedSource: false,
        isReferenceOnly: true,
        status: 'DEGRADED',
        warning: 'Regional estimate for reference only; not verified measured engineering input'
      };
    }

    logger.warn(`Coordinates and solar reference data for city "${city}" not available; returning insufficient data state`, {
      service: 'SOLAR_IRRADIANCE',
      event: 'INSUFFICIENT_SOLAR_RESOURCE_DATA',
      metadata: { city }
    });
    return {
      sunHours: null,
      monthlySunHours: null,
      source: 'UNAVAILABLE',
      dataClassification: 'INSUFFICIENT_DATA',
      isVerifiedSource: false,
      isReferenceOnly: true,
      status: 'INSUFFICIENT_DATA',
      error: 'INSUFFICIENT_SOLAR_RESOURCE_DATA',
      message: 'داده‌های تابش خورشیدی و موقعیت مکانی برای این شهر در دسترس نیست.'
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

      monitoringRepository.setCityIrradianceCache({
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
        dataClassification: 'VERIFIED_SOURCE',
        isVerifiedSource: true,
        isReferenceOnly: false,
        status: 'READY'
      };
    });
  } catch (err) {
    const safeMeta = extractSafeExternalErrorMetadata('NASA_POWER', err);
    logger.warn(`NASA POWER fetch failed; checking supported regional reference estimate`, {
      service: 'NASA_POWER',
      event: 'NASA_FETCH_FALLBACK',
      metadata: {
        city,
        provider: safeMeta.provider,
        httpStatus: safeMeta.httpStatus,
        errorCategory: safeMeta.errorCategory,
        isTransient: safeMeta.isTransient
      }
    });
    const fallback = fallbackRegionalEstimate(city);
    if (fallback !== null) {
      return {
        sunHours: fallback,
        monthlySunHours: generateFallbackMonthly(fallback),
        source: 'REGIONAL_REFERENCE_ESTIMATE',
        dataClassification: 'REFERENCE_ESTIMATE',
        isVerifiedSource: false,
        isReferenceOnly: true,
        status: 'DEGRADED',
        warning: 'Regional estimate for reference only; not verified measured engineering input',
        error: 'NASA_POWER_UNAVAILABLE'
      };
    }
    return {
      sunHours: null,
      monthlySunHours: null,
      source: 'UNAVAILABLE',
      dataClassification: 'INSUFFICIENT_DATA',
      isVerifiedSource: false,
      isReferenceOnly: true,
      status: 'INSUFFICIENT_DATA',
      error: 'INSUFFICIENT_SOLAR_RESOURCE_DATA',
      message: 'سرویس تابش ماهواره‌ای در دسترس نبوده و داده مرجع اقلیمی برای این نقطه ثبت نشده است.'
    };
  }
}

export function fallbackRegionalEstimate(city) {
  if (!city || typeof city !== 'string') return null;
  const desertCities = ['یزد', 'کرمان', 'اصفهان', 'اراک', 'قم', 'سمنان', 'کاشان', 'اهواز', 'بندرعباس', 'بوشهر', 'زاهدان', 'بیرجند', 'کیش', 'قشم', 'طبس'];
  const northCities = ['رشت', 'ساری', 'بابل', 'آمل', 'گرگان', 'لاهیجان', 'انزلی', 'چالوس'];
  const centralMountainCities = ['تهران', 'کرج', 'شیراز', 'تبریز', 'مشهد', 'ارومیه', 'کرمانشاه', 'همدان', 'سنندج', 'اردبیل', 'قزوین', 'زنجان', 'خرم‌آباد', 'بجنورد', 'ایلام', 'شهرکرد', 'یاسوج', 'ساوه', 'نیشابور'];

  if (desertCities.includes(city)) return 5.75;
  if (northCities.includes(city)) return 4.0;
  if (centralMountainCities.includes(city)) return 5.0;
  return null;
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
