import type { ClientPlan } from "./types"

function householdConservativeRisk(client: ClientPlan): number {
  const ab = client.assetBuilder
  const primary = ab.riskTolerance
  if (!client.spouseName?.trim()) return primary
  return Math.min(primary, ab.spouseRiskTolerance)
}

function riskToleranceNarrative(client: ClientPlan): string {
  const ab = client.assetBuilder
  if (!client.spouseName?.trim()) {
    return `${ab.riskTolerance}/10`
  }
  return `${ab.riskTolerance}/10 (primary) and ${ab.spouseRiskTolerance}/10 (spouse); using ${householdConservativeRisk(client)}/10 as the more conservative for planning`
}

export type RecommendationPriority = "high" | "medium" | "low"
export type RecommendationCategory = 
  | "annuity" 
  | "life-insurance" 
  | "long-term-care" 
  | "investment" 
  | "tax" 
  | "estate" 
  | "emergency" 
  | "income"

export interface Recommendation {
  id: string
  category: RecommendationCategory
  priority: RecommendationPriority
  title: string
  description: string
  action: string
  impact: string
  estimatedValue?: number
}

export function generateRecommendations(client: ClientPlan): Recommendation[] {
  const recommendations: Recommendation[] = []
  const { 
    incomeOptimization, 
    emergencyBuilder, 
    revenueReplacer, 
    assetBuilder, 
    legacyDefender, 
    dynastyCreator,
    taxPlanner
  } = client

  // === ANNUITY RECOMMENDATIONS ===
  
  // Income gap analysis - recommend FIA with income rider if there's an income shortfall
  if (incomeOptimization.annualGap < 0) {
    const monthlyShortfall = Math.abs(incomeOptimization.monthlyGap)
    const annuityNeeded = Math.abs(incomeOptimization.annuityNeeded)
    
    recommendations.push({
      id: "annuity-income-gap",
      category: "annuity",
      priority: monthlyShortfall > 2000 ? "high" : monthlyShortfall > 500 ? "medium" : "low",
      title: "Fixed Indexed Annuity with Income Rider Recommended",
      description: `Client has a monthly income shortfall of $${monthlyShortfall.toLocaleString()}. A Fixed Indexed Annuity with an income rider can provide guaranteed lifetime income to close this gap while offering growth potential.`,
      action: `Consider a Fixed Indexed Annuity (FIA) with approximately $${annuityNeeded.toLocaleString()} in premium. The income rider can generate the needed income at ${(incomeOptimization.annuityPayoutPercent * 100).toFixed(1)}% payout rate while principal remains protected.`,
      impact: `Eliminates $${Math.abs(incomeOptimization.annualGap).toLocaleString()} annual income gap with principal protection`,
      estimatedValue: annuityNeeded,
    })
  }

  const conservativeRisk = householdConservativeRisk(client)

  // Fixed indexed annuity for growth potential (separate from income need)
  if (assetBuilder.qualifiedAssets > 100000 && conservativeRisk <= 5 && incomeOptimization.annualGap >= 0) {
    recommendations.push({
      id: "annuity-fia-growth",
      category: "annuity",
      priority: "medium",
      title: "Fixed Indexed Annuity for Safe Growth",
      description: `With $${assetBuilder.qualifiedAssets.toLocaleString()} in qualified assets and risk tolerance ${riskToleranceNarrative(client)}, a Fixed Indexed Annuity can provide market-linked growth with principal protection.`,
      action: `Allocate a portion of qualified assets to a FIA. Consider adding an income rider for future guaranteed income flexibility.`,
      impact: "Tax-deferred growth with downside protection and optional future income guarantees",
      estimatedValue: Math.round(assetBuilder.qualifiedAssets * 0.3),
    })
  }

  // === LIFE INSURANCE RECOMMENDATIONS ===
  
  // Life insurance need based on income loss
  if (revenueReplacer.lifeInsuranceNeeded > 0) {
    const needed = revenueReplacer.lifeInsuranceNeeded
    const priority = needed > 500000 ? "high" : needed > 200000 ? "medium" : "low"
    
    recommendations.push({
      id: "life-insurance-income-replacement",
      category: "life-insurance",
      priority,
      title: "Life Insurance for Income Replacement",
      description: `Based on potential income loss of $${revenueReplacer.totalIncomeLoss.toLocaleString()}/month, coverage of $${needed.toLocaleString()} is recommended to protect surviving family members.`,
      action: `Evaluate term life insurance for pure protection or permanent life for added benefits. Consider coverage split if there are multiple income earners.`,
      impact: `Protects against $${(revenueReplacer.totalIncomeLoss * 12).toLocaleString()} annual income loss`,
      estimatedValue: needed,
    })
  }

  // IUL for tax-efficient wealth transfer
  if (dynastyCreator.totalTaxLiability > 100000 && assetBuilder.totalAssets > 500000) {
    recommendations.push({
      id: "life-insurance-iul",
      category: "life-insurance",
      priority: "medium",
      title: "Indexed Universal Life for Tax-Free Wealth Transfer",
      description: `With an estate tax liability of $${dynastyCreator.totalTaxLiability.toLocaleString()}, an IUL policy can provide tax-free death benefit to offset these taxes and maximize inheritance.`,
      action: `Consider an IUL with a face amount of at least $${dynastyCreator.totalTaxLiability.toLocaleString()} to cover projected estate taxes.`,
      impact: "Tax-free death benefit, potential living benefits, and cash value accumulation",
      estimatedValue: dynastyCreator.totalTaxLiability,
    })
  }

  // Final expense / burial insurance
  if (dynastyCreator.funeralTrust === 0) {
    recommendations.push({
      id: "life-insurance-final-expense",
      category: "life-insurance",
      priority: "low",
      title: "Final Expense Coverage",
      description: `No funeral trust is currently established. Final expense insurance can cover burial costs and immediate expenses without burdening family.`,
      action: `Consider a small whole life policy ($15,000-$25,000) for final expenses.`,
      impact: "Covers funeral costs and immediate expenses for family",
      estimatedValue: 20000,
    })
  }

  // === LONG-TERM CARE RECOMMENDATIONS ===
  
  // LTC coverage gap
  if (legacyDefender.totalLongTermCare > 0) {
    const ltcNeed = legacyDefender.totalLongTermCare
    
    recommendations.push({
      id: "ltc-coverage",
      category: "long-term-care",
      priority: "high",
      title: "Long-Term Care Planning Required",
      description: `Client has identified $${ltcNeed.toLocaleString()} in potential long-term care costs. Without proper coverage, this could significantly deplete assets.`,
      action: `Evaluate traditional LTC insurance, hybrid life/LTC products, or asset-based LTC solutions. Consider inflation protection.`,
      impact: `Protects $${ltcNeed.toLocaleString()} in potential LTC expenses`,
      estimatedValue: ltcNeed,
    })
  } else if (assetBuilder.totalAssets > 200000) {
    recommendations.push({
      id: "ltc-planning",
      category: "long-term-care",
      priority: "medium",
      title: "Consider Long-Term Care Planning",
      description: `No LTC planning identified. Average LTC costs can exceed $90,000/year. With $${assetBuilder.totalAssets.toLocaleString()} in assets, LTC planning is important.`,
      action: `Discuss LTC options: traditional insurance, hybrid products, or self-insuring strategy.`,
      impact: "Protects retirement assets from extended care costs",
    })
  }

  // Hybrid life/LTC product
  if (assetBuilder.nonQualifiedAssets > 100000 && legacyDefender.longTermCare.length > 0) {
    recommendations.push({
      id: "ltc-hybrid",
      category: "long-term-care",
      priority: "medium",
      title: "Hybrid Life/LTC Product",
      description: `With non-qualified assets of $${assetBuilder.nonQualifiedAssets.toLocaleString()}, a hybrid life/LTC product can reposition low-yielding assets while providing both death benefit and LTC coverage.`,
      action: `Consider repositioning $${Math.min(100000, assetBuilder.nonQualifiedAssets).toLocaleString()} into a linked-benefit product.`,
      impact: "Dual protection: LTC coverage if needed, death benefit if not",
      estimatedValue: Math.min(100000, assetBuilder.nonQualifiedAssets),
    })
  }

  // === INVESTMENT / BROKERAGE RECOMMENDATIONS ===
  
  // Asset allocation review
  const qualifiedRatio = assetBuilder.totalAssets > 0 
    ? assetBuilder.qualifiedAssets / assetBuilder.totalAssets 
    : 0
  
  if (qualifiedRatio > 0.8 && assetBuilder.totalAssets > 100000) {
    recommendations.push({
      id: "investment-diversification",
      category: "investment",
      priority: "medium",
      title: "Tax Diversification Recommended",
      description: `${(qualifiedRatio * 100).toFixed(0)}% of assets are in qualified (pre-tax) accounts. Consider diversifying for tax flexibility in retirement.`,
      action: `Open a taxable brokerage account for tax-efficient investments or consider Roth conversions to create tax-free income bucket.`,
      impact: "Greater tax flexibility in retirement, potentially lower lifetime taxes",
    })
  }

  // Risk tolerance mismatch
  if (householdConservativeRisk(client) <= 3 && assetBuilder.maxLossDollars > assetBuilder.totalAssets * 0.1) {
    recommendations.push({
      id: "investment-risk-review",
      category: "investment",
      priority: "high",
      title: "Risk Tolerance Review Needed",
      description: `Maximum acceptable loss ($${assetBuilder.maxLossDollars.toLocaleString()}) exceeds 10% of total assets while at least one household risk score is low (${riskToleranceNarrative(client)}). The portfolio may need adjustment.`,
      action: `Review current investment allocation and consider more conservative options or principal-protected products.`,
      impact: "Better alignment between risk tolerance and portfolio volatility",
    })
  }

  // Excess fees
  if (assetBuilder.excessFees > 0) {
    const feeSavings = assetBuilder.excessFees
    recommendations.push({
      id: "investment-fee-reduction",
      category: "investment",
      priority: feeSavings > 5000 ? "high" : "medium",
      title: "Reduce Investment Fees",
      description: `Client is paying $${feeSavings.toLocaleString()} in excess fees. Fee reduction directly improves returns.`,
      action: `Review current investment fees and consider lower-cost alternatives such as index funds, ETFs, or fee-only advisory.`,
      impact: `Potential savings of $${feeSavings.toLocaleString()}/year, compounding over time`,
      estimatedValue: feeSavings,
    })
  }

  // === TAX RECOMMENDATIONS ===
  
  // Roth conversion opportunity
  if (assetBuilder.qualifiedAssets > 100000 && taxPlanner.effectiveTaxRate < 0.24) {
    const conversionAmount = Math.min(50000, assetBuilder.qualifiedAssets * 0.2)
    recommendations.push({
      id: "tax-roth-conversion",
      category: "tax",
      priority: "medium",
      title: "Roth Conversion Opportunity",
      description: `With an effective tax rate of ${(taxPlanner.effectiveTaxRate * 100).toFixed(1)}% and $${assetBuilder.qualifiedAssets.toLocaleString()} in qualified assets, strategic Roth conversions can reduce future tax burden.`,
      action: `Consider converting $${conversionAmount.toLocaleString()} to Roth IRA annually while staying within current tax bracket.`,
      impact: "Tax-free growth and withdrawals, no RMDs, potentially lower lifetime taxes",
      estimatedValue: conversionAmount,
    })
  }

  // High estate tax liability
  if (taxPlanner.taxUponDeath > 100000) {
    recommendations.push({
      id: "tax-estate-planning",
      category: "tax",
      priority: "high",
      title: "Estate Tax Mitigation Strategy Needed",
      description: `Projected tax upon death is $${taxPlanner.taxUponDeath.toLocaleString()}. Without planning, heirs will receive significantly less.`,
      action: `Consider gifting strategies, irrevocable life insurance trusts (ILITs), charitable remainder trusts, or qualified personal residence trusts.`,
      impact: `Potential to reduce $${taxPlanner.taxUponDeath.toLocaleString()} tax burden on heirs`,
      estimatedValue: taxPlanner.taxUponDeath,
    })
  }

  // === EMERGENCY FUND RECOMMENDATIONS ===
  
  // Liquidity gap
  if (emergencyBuilder.liquidityDesired > emergencyBuilder.currentLiquidity) {
    const gap = emergencyBuilder.liquidityDesired - emergencyBuilder.currentLiquidity
    recommendations.push({
      id: "emergency-liquidity",
      category: "emergency",
      priority: gap > 20000 ? "high" : "medium",
      title: "Emergency Fund Gap",
      description: `Client desires $${emergencyBuilder.liquidityDesired.toLocaleString()} in liquidity but only has $${emergencyBuilder.currentLiquidity.toLocaleString()}. Gap of $${gap.toLocaleString()}.`,
      action: `Build emergency fund in high-yield savings or money market. Consider a home equity line of credit as backup liquidity.`,
      impact: "Financial security and ability to handle unexpected expenses",
      estimatedValue: gap,
    })
  }

  // === ESTATE PLANNING RECOMMENDATIONS ===
  
  // Check for incomplete estate documents
  const incompleteStatusItems = dynastyCreator.statusItems.filter(
    item => item.status !== "FINISHED"
  )
  
  if (incompleteStatusItems.length > 0) {
    const documents = incompleteStatusItems.map(i => i.name).join(", ")
    recommendations.push({
      id: "estate-documents",
      category: "estate",
      priority: "high",
      title: "Complete Estate Documents",
      description: `The following estate documents need attention: ${documents}. Incomplete estate planning can lead to probate delays and unintended distributions.`,
      action: `Work with estate attorney to complete all necessary documents including wills, trusts, powers of attorney, and healthcare directives.`,
      impact: "Ensures assets pass according to client wishes, avoids probate",
    })
  }

  // Protection concerns
  const concerns = legacyDefender.protectionItems.filter(
    item => item.status === "CONCERNED"
  )
  
  if (concerns.length > 0) {
    const concernsList = concerns.map(c => c.name).join(", ")
    recommendations.push({
      id: "estate-protection",
      category: "estate",
      priority: "medium",
      title: "Address Protection Concerns",
      description: `Client has concerns about: ${concernsList}. These issues should be addressed in the estate plan.`,
      action: `Discuss asset protection trusts, umbrella insurance, and entity structuring with estate attorney.`,
      impact: "Protection against creditors, lawsuits, and other claims",
    })
  }

  // Probate protection
  if (legacyDefender.probateProtectionTotal > 0 && legacyDefender.probateProtectionPercent > 0) {
    recommendations.push({
      id: "estate-probate-avoidance",
      category: "estate",
      priority: "medium",
      title: "Probate Avoidance Strategy",
      description: `Estimated probate costs are $${legacyDefender.probateProtectionTotal.toLocaleString()} (${(legacyDefender.probateProtectionPercent * 100).toFixed(1)}% of estate). Proper planning can avoid these costs.`,
      action: `Review beneficiary designations, consider revocable living trust, and ensure proper titling of assets.`,
      impact: `Avoid $${legacyDefender.probateProtectionTotal.toLocaleString()} in probate costs and delays`,
      estimatedValue: legacyDefender.probateProtectionTotal,
    })
  }

  // Sort recommendations by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

export function getCategoryLabel(category: RecommendationCategory): string {
  const labels: Record<RecommendationCategory, string> = {
    "annuity": "Annuity",
    "life-insurance": "Life Insurance",
    "long-term-care": "Long-Term Care",
    "investment": "Investment",
    "tax": "Tax Planning",
    "estate": "Estate Planning",
    "emergency": "Emergency Fund",
    "income": "Income Planning",
  }
  return labels[category]
}

export function getCategoryColor(category: RecommendationCategory): string {
  const colors: Record<RecommendationCategory, string> = {
    "annuity": "#eab308",
    "life-insurance": "#16a34a",
    "long-term-care": "#ea580c",
    "investment": "#0891b2",
    "tax": "#7c3aed",
    "estate": "#2563eb",
    "emergency": "#dc2626",
    "income": "#059669",
  }
  return colors[category]
}

export function getPriorityLabel(priority: RecommendationPriority): string {
  const labels: Record<RecommendationPriority, string> = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  }
  return labels[priority]
}
