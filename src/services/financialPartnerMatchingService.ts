import { FinancingRequest, FinancingApplication, FinancialPartnerProfile, FinancingPartner, FinancingProduct, FinancialPartnerMatch, PartnerMatchingResult, PartnerMatchEligibility } from '../types/financing.js';
import { EnergyProject } from '../types/project.js';

export const financialPartnerMatchingService = {
  /**
   * Deterministic Partner Matching Engine
   * Evaluates project & application against partner's explicit criteria:
   * 1. financing amount
   * 2. project capacity
   * 3. project location
   * 4. project stage
   * 5. financing type
   * 6. equity requirement
   * 7. active status
   */
  matchApplicationWithPartners: (
    app: Partial<FinancingApplication> | Partial<FinancingRequest>,
    project: EnergyProject | null,
    partners: (FinancingPartner | FinancialPartnerProfile)[]
  ): PartnerMatchingResult[] => {
    const requestedAmount = (app as any).financingRequested || (app as any).requestedAmount || 0;
    const totalCost = app.totalProjectCost || 0;
    const ownerEquity = app.ownerEquity !== undefined ? app.ownerEquity : 0;
    const equityPercent = totalCost > 0 ? (ownerEquity / totalCost) * 100 : 0;
    const capacityKw = project?.targetCapacityKw || (project as any)?.capacityKw || 0;
    const province = project?.location?.province;
    const stage = project?.status || 'DRAFT';
    const financingType = app.financingType || 'PROJECT_LOAN';

    return partners.map(partner => {
      const partnerName = (partner as any).name || (partner as any).displayName || 'نهاد مالی';
      const partnerCategory = (partner as any).category || (partner as any).partnerType || 'OTHER';
      const minAmount = (partner as any).minimumAmount || (partner as any).minimumFinancingAmount || 0;
      const maxAmount = (partner as any).maximumAmount || (partner as any).maximumFinancingAmount || 0;
      const supportedLocations = (partner as any).supportedLocations || (partner as any).supportedProvinces || ['ALL'];
      const supportedStages = (partner as any).supportedProjectStages || (partner as any).supportedProjectTypes || ['ALL'];
      const supportedTypes = (partner as any).financingTypes || (partner as any).supportedFinancingProducts || ['PROJECT_LOAN'];
      const minEquity = (partner as any).minimumEquityPercent !== undefined 
        ? (partner as any).minimumEquityPercent 
        : ((partner as any).minimumEquityContributionPercent || 20);
      const minCapacity = (partner as any).minimumProjectCapacityKw || 0;
      const maxCapacity = (partner as any).maximumProjectCapacityKw || 0;
      const isActive = (partner as any).activeStatus === 'ACTIVE' || (partner as any).status === 'ACTIVE';

      const reasons: string[] = [];
      let isEligible = true;
      let isPotentiallyEligible = false;

      // 0. Active Status
      if (!isActive) {
        isEligible = false;
        reasons.push('نهاد مالی در حال حاضر غیرفعال است یا پذیرش پرونده جدید ندارد');
      }

      // 1. Financing Amount
      let amountEligible = true;
      let amountMsg = '';
      if (minAmount > 0 && requestedAmount < minAmount) {
        amountEligible = false;
        isEligible = false;
        amountMsg = `مبلغ درخواستی (${(requestedAmount / 10000000).toLocaleString('fa-IR')} م.ت) کمتر از حداقل پذیرش (${(minAmount / 10000000).toLocaleString('fa-IR')} م.ت) است`;
        reasons.push(amountMsg);
      } else if (maxAmount > 0 && requestedAmount > maxAmount) {
        amountEligible = false;
        isEligible = false;
        amountMsg = `مبلغ درخواستی (${(requestedAmount / 10000000).toLocaleString('fa-IR')} م.ت) بیشتر از سقف تسهیلات (${(maxAmount / 10000000).toLocaleString('fa-IR')} م.ت) است`;
        reasons.push(amountMsg);
      } else {
        amountMsg = 'میزان سرمایه درخواستی در محدوده مجاز این نهاد مالی است';
        reasons.push(amountMsg);
      }

      // 2. Project Capacity
      let capacityEligible = true;
      let capacityMsg = '';
      if (minCapacity > 0 && capacityKw < minCapacity) {
        capacityEligible = false;
        isEligible = false;
        capacityMsg = `ظرفیت نیروگاه (${capacityKw} kW) کمتر از حداقل مجاز این نهاد (${minCapacity} kW) است`;
        reasons.push(capacityMsg);
      } else if (maxCapacity > 0 && capacityKw > maxCapacity) {
        capacityEligible = false;
        isEligible = false;
        capacityMsg = `ظرفیت نیروگاه (${capacityKw} kW) بیشتر از سقف مجاز این نهاد (${maxCapacity} kW) است`;
        reasons.push(capacityMsg);
      } else {
        capacityMsg = 'ظرفیت نامی پروژه با ضوابط نهاد مالی همخوانی دارد';
        reasons.push(capacityMsg);
      }

      // 3. Project Location
      let locationEligible = true;
      let locationMsg = '';
      if (province && supportedLocations.length > 0 && !supportedLocations.includes('ALL') && !supportedLocations.includes(province)) {
        locationEligible = false;
        isEligible = false;
        locationMsg = `استان ${province} در حوزه جغرافیایی تحت پوشش این نهاد مالی نیست`;
        reasons.push(locationMsg);
      } else {
        locationMsg = 'محل اجرای پروژه در محدوده جغرافیایی تحت پوشش قرار دارد';
        reasons.push(locationMsg);
      }

      // 4. Project Stage
      let stageEligible = true;
      let stageMsg = '';
      if (supportedStages.length > 0 && !supportedStages.includes('ALL') && !supportedStages.includes(stage)) {
        stageEligible = false;
        isEligible = false;
        stageMsg = `مرحله فعلی پروژه (${stage}) در لیست مراحل مورد پذیرش این نهاد قرار ندارد`;
        reasons.push(stageMsg);
      } else {
        stageMsg = 'مرحله آمادگی پروژه منطبق با الزامات ورود نهاد مالی است';
        reasons.push(stageMsg);
      }

      // 5. Financing Type
      let typeEligible = true;
      let typeMsg = '';
      if (supportedTypes.length > 0 && !supportedTypes.includes('ALL') && !supportedTypes.includes(financingType)) {
        typeEligible = false;
        isEligible = false;
        typeMsg = `نوع تأمین مالی (${financingType}) توسط این نهاد مالی ارائه نمی‌شود`;
        reasons.push(typeMsg);
      } else {
        typeMsg = `محصول تأمین مالی (${financingType}) در سبد خدمات این نهاد فعال است`;
        reasons.push(typeMsg);
      }

      // 6. Equity Requirement
      let equityEligible = true;
      let equityMsg = '';
      if (minEquity > 0) {
        if (equityPercent < minEquity) {
          if (equityPercent >= minEquity - 5) {
            equityEligible = false;
            isPotentiallyEligible = true;
            equityMsg = `سهم آورده کارفرما (${equityPercent.toFixed(1)}٪) اندکی کمتر از حداقل موردنیاز (${minEquity}٪) است (قابل مذاکره مشروط)`;
            reasons.push(equityMsg);
          } else {
            equityEligible = false;
            isEligible = false;
            equityMsg = `سهم آورده کارفرما (${equityPercent.toFixed(1)}٪) کمتر از کف الزامی نهاد (${minEquity}٪) است`;
            reasons.push(equityMsg);
          }
        } else {
          equityMsg = `سهم آورده کارفرما (${equityPercent.toFixed(1)}٪) حداقل سهم مصوب (${minEquity}٪) را پوشش می‌دهد`;
          reasons.push(equityMsg);
        }
      } else {
        equityMsg = 'الزام خاصی برای سهم آورده متقاضی تعریف نشده است';
        reasons.push(equityMsg);
      }

      let eligibilityStatus: 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' = 'NOT_ELIGIBLE';
      if (isEligible && amountEligible && capacityEligible && locationEligible && stageEligible && typeEligible && equityEligible) {
        eligibilityStatus = 'ELIGIBLE';
      } else if (isPotentiallyEligible && amountEligible && locationEligible && typeEligible) {
        eligibilityStatus = 'POTENTIALLY_ELIGIBLE';
      } else {
        eligibilityStatus = 'NOT_ELIGIBLE';
      }

      return {
        partnerId: partner.id,
        partnerName,
        category: partnerCategory as any,
        eligibilityStatus,
        reasons,
        details: {
          amountFit: { eligible: amountEligible, message: amountMsg },
          capacityFit: { eligible: capacityEligible, message: capacityMsg },
          locationFit: { eligible: locationEligible, message: locationMsg },
          stageFit: { eligible: stageEligible, message: stageMsg },
          financingTypeFit: { eligible: typeEligible, message: typeMsg },
          equityFit: { eligible: equityEligible, message: equityMsg }
        }
      };
    });
  },

  /**
   * Backward-compatibility wrapper for legacy matchRequestWithPartners
   */
  matchRequestWithPartners: (
    request: FinancingRequest,
    project: EnergyProject | null,
    partners: (FinancialPartnerProfile | FinancingPartner)[],
    products: FinancingProduct[]
  ): FinancialPartnerMatch[] => {
    const modernResults = financialPartnerMatchingService.matchApplicationWithPartners(request, project, partners);

    return modernResults.map(res => {
      const partner = partners.find(p => p.id === res.partnerId);
      const partnerProducts = products.filter(p => p.financialPartnerProfileId === res.partnerId && p.status === 'ACTIVE');
      const matchedProduct = partnerProducts[0];

      let matchScore = 50;
      if (res.eligibilityStatus === 'ELIGIBLE') matchScore = 90;
      else if (res.eligibilityStatus === 'POTENTIALLY_ELIGIBLE') matchScore = 70;
      else matchScore = 30;

      return {
        id: `MATCH-${request.id}-${res.partnerId}`,
        financingRequestId: request.id,
        financialPartnerProfileId: res.partnerId,
        financingProductId: matchedProduct?.id,
        matchScore,
        scoreBreakdown: {
          amountFit: res.details.amountFit.eligible ? 20 : 0,
          projectTypeFit: 15,
          technologyFit: 10,
          locationFit: res.details.locationFit.eligible ? 10 : 0,
          stageFit: res.details.stageFit.eligible ? 10 : 0,
          readinessFit: 15,
          tenorFit: 10,
          revenueModelFit: 5,
          collateralFit: 5
        },
        eligibilityStatus: res.eligibilityStatus,
        reasons: res.reasons,
        algorithmVersion: '2.0-deterministic',
        status: 'PROPOSED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
  }
};
