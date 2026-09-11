import { FinancingRequest, FinancialPartnerProfile, FinancingProduct, FinancialPartnerMatch, PartnerMatchEligibility } from '../types/financing.js';
import { EnergyProject } from '../types/project.js';

export const financialPartnerMatchingService = {
  matchRequestWithPartners: (
    request: FinancingRequest,
    project: EnergyProject | null,
    partners: FinancialPartnerProfile[],
    products: FinancingProduct[]
  ): FinancialPartnerMatch[] => {
    return partners.map(partner => {
      const partnerProducts = products.filter(p => p.financialPartnerProfileId === partner.id && p.status === 'ACTIVE');
      const matchedProduct = partnerProducts.find(p => p.type === request.financingType) || partnerProducts[0];

      const reasons: string[] = [];
      let isHardExcluded = false;

      // 1. Amount Fit (max 20)
      let amountFit = 0;
      if (request.requestedAmount < partner.minimumFinancingAmount) {
        amountFit = 0;
        isHardExcluded = true;
        reasons.push(`مبلغ درخواستی کمتر از کف مجاز تأمین‌کننده (${(partner.minimumFinancingAmount / 10000000).toLocaleString('fa-IR')} میلیون تومان) است.`);
      } else if (request.requestedAmount > partner.maximumFinancingAmount) {
        amountFit = 0;
        isHardExcluded = true;
        reasons.push(`مبلغ درخواستی بیشتر از سقف تسهیلات این نهاد (${(partner.maximumFinancingAmount / 10000000).toLocaleString('fa-IR')} میلیون تومان) است.`);
      } else {
        amountFit = 20;
        reasons.push('میزان سرمایه درخواستی کاملاً در بازه مصوب این نهاد مالی قرار دارد.');
      }

      // 2. Project Type Fit (max 15)
      let projectTypeFit = 0;
      const projType = project?.projectType || 'SOLAR';
      if (partner.supportedProjectTypes.length === 0 || partner.supportedProjectTypes.includes(projType) || partner.supportedProjectTypes.includes('ALL')) {
        projectTypeFit = 15;
        reasons.push(`پشتیبانی کامل از پروژه‌های ${projType}.`);
      } else {
        projectTypeFit = 5;
        reasons.push(`پروژه‌های نوع ${projType} اولویت تخصصی این نهاد مالی نیست.`);
      }

      // 3. Technology Fit (max 10)
      let technologyFit = 0;
      if (partner.supportedTechnologies.length === 0 || partner.supportedTechnologies.includes('SOLAR_PV') || partner.supportedTechnologies.includes('ALL')) {
        technologyFit = 10;
        reasons.push('فناوری فتوولتائیک خورشیدی در دستورالعمل تسهیلات سبز این نهاد پذیرفته شده است.');
      } else {
        technologyFit = 3;
      }

      // 4. Location Fit (max 10)
      let locationFit = 0;
      const province = project?.location?.province;
      if (!province || partner.supportedProvinces.length === 0 || partner.supportedProvinces.includes('ALL') || partner.supportedProvinces.includes(province)) {
        locationFit = 10;
        reasons.push('پوشش سرتاسری یا فعالیت مستقیم در استان محل احداث پروژه.');
      } else {
        locationFit = 2;
        reasons.push(`استان ${province} در حوزه استانی منتخب این نهاد قرار ندارد.`);
      }

      // 5. Stage Fit (max 10)
      let stageFit = 10;
      if (project?.status === 'CONTRACTING' || project?.status === 'FINANCING' || project?.status === 'READY_FOR_RFQ') {
        stageFit = 10;
        reasons.push('مرحله آمادگی و فاز اجرایی پروژه منطبق با الزامات ورود نهاد مالی است.');
      } else {
        stageFit = 6;
      }

      // 6. Readiness Fit (max 15)
      let readinessFit = 0;
      const currentReadiness = request.readinessScore || 50;
      if (currentReadiness >= partner.minimumProjectReadiness) {
        readinessFit = 15;
        reasons.push(`شاخص آمادگی پروژه (${currentReadiness}) بالاتر از کف موردنیاز (${partner.minimumProjectReadiness}) است.`);
      } else {
        const gap = partner.minimumProjectReadiness - currentReadiness;
        readinessFit = Math.max(0, 15 - gap);
        reasons.push(`شاخص آمادگی پروژه (${currentReadiness}) از حداقل مدنظر (${partner.minimumProjectReadiness}) کمتر است.`);
      }

      // 7. Tenor Fit (max 10)
      let tenorFit = 10;
      if (partner.maximumTenorMonths && request.requestedTenorMonths > partner.maximumTenorMonths) {
        tenorFit = 4;
        reasons.push(`دوره بازپرداخت درخواستی (${request.requestedTenorMonths} ماه) از سقف نهاد (${partner.maximumTenorMonths} ماه) بیشتر است.`);
      } else {
        tenorFit = 10;
        reasons.push('مدت تنفس و بازپرداخت درخواستی با سیاست‌های اعتباری همخوانی دارد.');
      }

      // 8. Revenue Model Fit (max 5)
      let revenueModelFit = 5;
      if (request.projectRevenueModel === 'PPA' || request.projectRevenueModel === 'SELF_CONSUMPTION') {
        revenueModelFit = 5;
        reasons.push('مدل درآمدی (PPA/خودمصرفی) دارای رتبه ریسک پایین نزد این نهاد است.');
      } else {
        revenueModelFit = 3;
      }

      // 9. Collateral Fit (max 5)
      let collateralFit = 5;
      if (request.collateralAvailable) {
        collateralFit = 5;
        reasons.push('وثایق و تضامین متقاضی متناسب با الزامات این نهاد است.');
      } else {
        collateralFit = 2;
        reasons.push('نیاز به تضامین معتبرتر جهت اخذ تصویب نهایی.');
      }

      const totalScore = isHardExcluded ? Math.min(30, amountFit + projectTypeFit + technologyFit + locationFit + stageFit + readinessFit + tenorFit + revenueModelFit + collateralFit) :
        (amountFit + projectTypeFit + technologyFit + locationFit + stageFit + readinessFit + tenorFit + revenueModelFit + collateralFit);

      let eligibilityStatus: PartnerMatchEligibility = 'NOT_ELIGIBLE';
      if (isHardExcluded) {
        eligibilityStatus = 'NOT_ELIGIBLE';
      } else if (totalScore >= 80) {
        eligibilityStatus = 'ELIGIBLE';
      } else if (totalScore >= 60) {
        eligibilityStatus = 'POTENTIALLY_ELIGIBLE';
      } else {
        eligibilityStatus = 'REQUIRES_REVIEW';
      }

      return {
        id: `MATCH-${request.id}-${partner.id}`,
        financingRequestId: request.id,
        financialPartnerProfileId: partner.id,
        financingProductId: matchedProduct?.id,
        matchScore: Math.round(totalScore),
        scoreBreakdown: {
          amountFit,
          projectTypeFit,
          technologyFit,
          locationFit,
          stageFit,
          readinessFit,
          tenorFit,
          revenueModelFit,
          collateralFit
        },
        eligibilityStatus,
        reasons,
        algorithmVersion: 'v1.0.0-deterministic',
        status: 'PROPOSED' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
};
