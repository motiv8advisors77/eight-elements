export interface LineItem {
  id: string
  name: string
  amount: number
  category?: string
}

export interface LongTermCareItem {
  id: string
  name: string
  amount: number
  years: number
  total: number
}

export interface BeneficiaryItem {
  id: string
  name: string
  amount: number
  taxRate: number
  taxAmount: number
}

export interface ProtectionItem {
  id: string
  name: string
  status: 'CONCERNED' | 'NOT CONCERNED' | 'ADDRESSED'
}

export interface StatusItem {
  id: string
  name: string
  status: 'FINISHED' | 'NOT FINISHED' | 'IN PROGRESS'
  /** ISO `YYYY-MM-DD` when this document was completed; empty if unknown. */
  completedOn: string
}

// Section data types - all using dynamic line items
export interface IncomeOptimizationData {
  incomeNeeded: number
  incomeSources: LineItem[]
  /** Monthly spouse/partner income (in addition to line-item sources). */
  spouseMonthlyIncome: number
  annuityPayoutPercent: number
  // Calculated
  totalIncome: number
  monthlyGap: number
  annualGap: number
  annuityNeeded: number
}

export interface EmergencyBuilderData {
  currentLiquidity: number
  liquidityDesired: number
  // Calculated from other sections
  immediateLiquidity: number
  delayedLiquidity: number
}

export interface RevenueReplacerData {
  futureAnnuityPayout: number
  incomeLossItems: LineItem[] // Items that represent income lost if someone passes
  // Calculated
  totalIncomeLoss: number
  lifeInsuranceNeeded: number
}

export interface AssetBuilderData {
  /** Primary client / household member (1–10). */
  riskTolerance: number
  /** Spouse or partner (1–10); meaningful when `ClientPlan.spouseName` is set. */
  spouseRiskTolerance: number
  assets: LineItem[] // Can be categorized as 'qualified' or 'non-qualified'
  maxLossDollars: number
  excessFees: number
  // Calculated
  qualifiedAssets: number
  nonQualifiedAssets: number
  totalAssets: number
}

export interface LegacyEnhancerData {
  goals: LineItem[] // Charity, College Funding, Family Growth, etc.
  totalGoals: number
}

export interface LegacyDefenderData {
  longTermCare: LongTermCareItem[]
  probateProtectionPercent: number
  protectionItems: ProtectionItem[]
  // Calculated
  totalLongTermCare: number
  probateProtectionTotal: number
}

export interface DynastyCreatorData {
  estateValue: number
  beneficiaries: BeneficiaryItem[]
  statusItems: StatusItem[]
  funeralTrust: number
  // Calculated
  totalTaxLiability: number
}

export interface TaxPlannerData {
  taxItems: LineItem[] // IRA Conversion, Tax Efficiency, etc.
  effectiveTaxRate: number
  // Calculated from dynasty creator
  taxUponDeath: number
}

export interface ClientPlan {
  id: string
  clientName: string
  spouseName: string
  createdAt: string
  updatedAt: string
  incomeOptimization: IncomeOptimizationData
  emergencyBuilder: EmergencyBuilderData
  revenueReplacer: RevenueReplacerData
  assetBuilder: AssetBuilderData
  legacyEnhancer: LegacyEnhancerData
  legacyDefender: LegacyDefenderData
  dynastyCreator: DynastyCreatorData
  taxPlanner: TaxPlannerData
}

// Default empty data
export const defaultIncomeOptimization: IncomeOptimizationData = {
  incomeNeeded: 0,
  incomeSources: [],
  spouseMonthlyIncome: 0,
  annuityPayoutPercent: 0.06,
  totalIncome: 0,
  monthlyGap: 0,
  annualGap: 0,
  annuityNeeded: 0,
}

export const defaultEmergencyBuilder: EmergencyBuilderData = {
  currentLiquidity: 0,
  liquidityDesired: 0,
  immediateLiquidity: 0,
  delayedLiquidity: 0,
}

export const defaultRevenueReplacer: RevenueReplacerData = {
  futureAnnuityPayout: 0.06,
  incomeLossItems: [],
  totalIncomeLoss: 0,
  lifeInsuranceNeeded: 0,
}

export const defaultAssetBuilder: AssetBuilderData = {
  riskTolerance: 3,
  spouseRiskTolerance: 3,
  assets: [],
  maxLossDollars: 0,
  excessFees: 0,
  qualifiedAssets: 0,
  nonQualifiedAssets: 0,
  totalAssets: 0,
}

export const defaultLegacyEnhancer: LegacyEnhancerData = {
  goals: [],
  totalGoals: 0,
}

export const defaultLegacyDefender: LegacyDefenderData = {
  longTermCare: [],
  probateProtectionPercent: 0.06,
  protectionItems: [],
  totalLongTermCare: 0,
  probateProtectionTotal: 0,
}

export const defaultDynastyCreator: DynastyCreatorData = {
  estateValue: 0,
  beneficiaries: [],
  statusItems: [],
  funeralTrust: 0,
  totalTaxLiability: 0,
}

export const defaultTaxPlanner: TaxPlannerData = {
  taxItems: [],
  effectiveTaxRate: 0.2,
  taxUponDeath: 0,
}

// Calculation helpers
export function calculateIncomeOptimization(data: IncomeOptimizationData): IncomeOptimizationData {
  const fromSources = data.incomeSources.reduce((sum, item) => sum + item.amount, 0)
  const spouseIncome = data.spouseMonthlyIncome ?? 0
  const totalIncome = fromSources + spouseIncome
  const monthlyGap = totalIncome - data.incomeNeeded
  const annualGap = monthlyGap * 12
  const annuityNeeded = data.annuityPayoutPercent > 0 ? annualGap / data.annuityPayoutPercent : 0
  
  return {
    ...data,
    totalIncome,
    monthlyGap,
    annualGap,
    annuityNeeded,
  }
}

/** Merge DB jsonb with defaults so older rows get `spouseMonthlyIncome` and recalculated fields. */
export function parseStoredIncomeOptimization(raw: unknown): IncomeOptimizationData {
  const partial =
    typeof raw === 'object' && raw !== null ? (raw as Partial<IncomeOptimizationData>) : {}
  return calculateIncomeOptimization({
    ...defaultIncomeOptimization,
    ...partial,
    incomeSources: partial.incomeSources ?? defaultIncomeOptimization.incomeSources,
    spouseMonthlyIncome:
      typeof partial.spouseMonthlyIncome === 'number'
        ? partial.spouseMonthlyIncome
        : defaultIncomeOptimization.spouseMonthlyIncome,
  })
}

export function calculateRevenueReplacer(data: RevenueReplacerData): RevenueReplacerData {
  const totalIncomeLoss = data.incomeLossItems.reduce((sum, item) => sum + item.amount, 0)
  const payout = data.futureAnnuityPayout || 0.06
  const lifeInsuranceNeeded = payout > 0 ? (totalIncomeLoss * 12) / payout : 0
  
  return {
    ...data,
    totalIncomeLoss,
    lifeInsuranceNeeded,
  }
}

export function calculateAssetBuilder(data: AssetBuilderData): AssetBuilderData {
  const qualifiedAssets = data.assets
    .filter(a => a.category === 'qualified')
    .reduce((sum, a) => sum + a.amount, 0)
  
  const nonQualifiedAssets = data.assets
    .filter(a => a.category === 'non-qualified')
    .reduce((sum, a) => sum + a.amount, 0)
  
  const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0)
  
  return {
    ...data,
    qualifiedAssets,
    nonQualifiedAssets,
    totalAssets,
  }
}

/** Merge DB jsonb with defaults (including `spouseRiskTolerance` for older rows). */
export function parseStoredAssetBuilder(raw: unknown): AssetBuilderData {
  const partial =
    typeof raw === 'object' && raw !== null ? (raw as Partial<AssetBuilderData>) : {}
  const riskTolerance =
    typeof partial.riskTolerance === 'number'
      ? partial.riskTolerance
      : defaultAssetBuilder.riskTolerance
  const spouseRiskTolerance =
    typeof partial.spouseRiskTolerance === 'number'
      ? partial.spouseRiskTolerance
      : riskTolerance
  return calculateAssetBuilder({
    ...defaultAssetBuilder,
    ...partial,
    assets: Array.isArray(partial.assets) ? partial.assets : defaultAssetBuilder.assets,
    riskTolerance,
    spouseRiskTolerance,
  })
}

export function calculateEmergencyBuilder(
  data: EmergencyBuilderData,
  incomeOpt: IncomeOptimizationData,
  assetBuilder: AssetBuilderData
): EmergencyBuilderData {
  return {
    ...data,
    immediateLiquidity: incomeOpt.annuityNeeded,
    delayedLiquidity: assetBuilder.qualifiedAssets,
  }
}

export function calculateLegacyEnhancer(data: LegacyEnhancerData): LegacyEnhancerData {
  return {
    ...data,
    totalGoals: data.goals.reduce((sum, g) => sum + g.amount, 0),
  }
}

export function calculateLegacyDefender(
  data: LegacyDefenderData,
  estateValue: number
): LegacyDefenderData {
  const longTermCare = data.longTermCare.map(item => ({
    ...item,
    total: item.amount * item.years,
  }))
  
  const totalLongTermCare = longTermCare.reduce((sum, item) => sum + item.total, 0)
  const probateProtectionTotal = data.probateProtectionPercent * estateValue
  
  return {
    ...data,
    longTermCare,
    totalLongTermCare,
    probateProtectionTotal,
  }
}

export function calculateDynastyCreator(data: DynastyCreatorData): DynastyCreatorData {
  const beneficiaries = data.beneficiaries.map(b => ({
    ...b,
    taxAmount: b.amount * b.taxRate,
  }))
  
  const totalTaxLiability = beneficiaries.reduce((sum, b) => sum + b.taxAmount, 0)
  
  return {
    ...data,
    beneficiaries,
    totalTaxLiability,
  }
}

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function normalizeStoredStatusItem(raw: unknown): StatusItem {
  const item = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  const status =
    item.status === 'FINISHED' || item.status === 'NOT FINISHED' || item.status === 'IN PROGRESS'
      ? item.status
      : 'NOT FINISHED'
  return {
    id: typeof item.id === 'string' ? item.id : generateId(),
    name: typeof item.name === 'string' ? item.name : '',
    status,
    completedOn: typeof item.completedOn === 'string' ? item.completedOn : '',
  }
}

/** Merge DB jsonb with defaults so older rows get `completedOn` on each document and recalculated fields. */
export function parseStoredDynastyCreator(raw: unknown): DynastyCreatorData {
  const partial =
    typeof raw === 'object' && raw !== null ? (raw as Partial<DynastyCreatorData> & { estateDocumentCompletedOn?: unknown }) : {}
  const { estateDocumentCompletedOn: _removed, ...rest } = partial
  void _removed
  const statusItems = Array.isArray(rest.statusItems)
    ? rest.statusItems.map(normalizeStoredStatusItem)
    : defaultDynastyCreator.statusItems
  return calculateDynastyCreator({
    ...defaultDynastyCreator,
    ...rest,
    beneficiaries: Array.isArray(rest.beneficiaries)
      ? rest.beneficiaries
      : defaultDynastyCreator.beneficiaries,
    statusItems,
  })
}

export function calculateTaxPlanner(
  data: TaxPlannerData,
  dynastyCreator: DynastyCreatorData
): TaxPlannerData {
  return {
    ...data,
    taxUponDeath: dynastyCreator.totalTaxLiability,
  }
}
