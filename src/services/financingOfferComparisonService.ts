import { FinancingOffer, FinancingRequest } from '../types/financing.js';
import { debtServiceCalculator } from './debtServiceCalculator.js';

export interface OfferComparisonSummary {
  offer: FinancingOffer;
  requestedAmount: number;
  coveragePercent: number;
  effectiveRateLabel: string;
  monthlyPayment: number;
  totalFees: number;
  totalInterest: number;
  totalFinancingCost: number;
  totalRepayment: number;
  comparisonScore: number;
  keyStrengths: string[];
  keyTradeoffs: string[];
}

export const financingOfferComparisonService = {
  enrichAndScoreOffer: (offer: FinancingOffer, request: FinancingRequest): OfferComparisonSummary => {
    const requested = request.requestedAmount || 1;
    const coveragePercent = Math.min(100, Math.round((offer.offeredAmount / requested) * 100));

    const totalFees = (offer.fees || []).reduce((sum, f) => {
      if (f.percentage) {
        return sum + (offer.offeredAmount * f.percentage) / 100;
      }
      return sum + (f.amount || 0);
    }, 0);

    const rate = offer.interestRate || 0;
    const debtCalc = debtServiceCalculator.calculateSchedule(
      offer.offeredAmount,
      rate,
      offer.tenorMonths,
      offer.gracePeriodMonths,
      offer.repaymentType
    );

    const totalInterest = debtCalc.totalInterest;
    const totalFinancingCost = totalInterest + totalFees;
    const totalRepayment = offer.offeredAmount + totalFinancingCost;

    // Deterministic Comparison Scoring (max 100)
    // 1. Coverage (max 20)
    const coverageScore = Math.round((coveragePercent / 100) * 20);

    // 2. Financing Cost (max 25) - baseline comparison
    let costScore = 25;
    if (rate > 28) costScore = 12;
    else if (rate > 24) costScore = 17;
    else if (rate > 20) costScore = 21;
    else if (rate > 0) costScore = 25;
    else costScore = 18; // Partner declared later

    // 3. Tenor (max 15)
    let tenorScore = 10;
    if (offer.tenorMonths >= 48) tenorScore = 15;
    else if (offer.tenorMonths >= 36) tenorScore = 13;
    else if (offer.tenorMonths >= 24) tenorScore = 10;
    else tenorScore = 6;

    // 4. Grace Period (max 10)
    let graceScore = 5;
    if (offer.gracePeriodMonths >= 6) graceScore = 10;
    else if (offer.gracePeriodMonths >= 3) graceScore = 7;
    else graceScore = 3;

    // 5. Collateral Burden (max 10)
    let collateralScore = 7;
    const colCount = (offer.collateralRequirements || []).length;
    if (colCount === 0) collateralScore = 10;
    else if (colCount <= 2) collateralScore = 8;
    else collateralScore = 5;

    // 6. Conditions (max 10)
    let conditionScore = 8;
    const condCount = (offer.conditionsPrecedent || []).length;
    if (condCount <= 1) conditionScore = 10;
    else if (condCount <= 3) conditionScore = 8;
    else conditionScore = 5;

    // 7. Repayment Fit (max 10)
    let repScore = 8;
    if (offer.repaymentType === request.repaymentPreference) {
      repScore = 10;
    }

    const comparisonScore = Math.min(100, coverageScore + costScore + tenorScore + graceScore + collateralScore + conditionScore + repScore);

    const keyStrengths: string[] = [];
    const keyTradeoffs: string[] = [];

    if (coveragePercent >= 100) keyStrengths.push('پوشش ۱۰۰ درصدی سرمایه درخواستی');
    if (offer.gracePeriodMonths >= 6) keyStrengths.push(`دوره تنفس مناسب (${offer.gracePeriodMonths} ماه) منطبق بر زمان ساخت`);
    if (rate > 0 && rate <= 20) keyStrengths.push(`نرخ ترجیحی یا سبز (${rate}٪)`);
    if (offer.tenorMonths >= 36) keyStrengths.push(`دوره بازپرداخت مناسب (${offer.tenorMonths} ماه)`);

    if (colCount > 2) keyTradeoffs.push('تعداد وثایق و تضامین درخواستی بالاست');
    if (condCount > 3) keyTradeoffs.push('شروط مقدماتی متعدد قبل از انعقاد قرارداد تسهیلات');
    if (coveragePercent < 90) keyTradeoffs.push(`پوشش کسری (${coveragePercent}٪)؛ نیاز به تأمین باقیمانده از منابع دیگر`);

    return {
      offer: {
        ...offer,
        estimatedPeriodicPayment: debtCalc.monthlyPayment,
        estimatedTotalFinancingCost: totalFinancingCost,
        estimatedTotalRepayment: totalRepayment,
        comparisonScore
      },
      requestedAmount: requested,
      coveragePercent,
      effectiveRateLabel: rate > 0 ? `${rate}٪ سالانه` : 'اعلام با بررسی اعتباری',
      monthlyPayment: debtCalc.monthlyPayment,
      totalFees,
      totalInterest,
      totalFinancingCost,
      totalRepayment,
      comparisonScore,
      keyStrengths,
      keyTradeoffs
    };
  }
};
