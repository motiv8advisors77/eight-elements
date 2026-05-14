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
}

// Section data types - all using dynamic line items
export interface IncomeOptimizationData {
  incomeNeeded: number
  incomeSources: LineItem[]
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
  riskTolerance: number
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
  const totalIncome = data.incomeSources.reduce((sum, item) => sum + item.amount, 0)
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

export function calculateTaxPlanner(
  data: TaxPlannerData,
  dynastyCreator: DynastyCreatorData
): TaxPlannerData {
  return {
    ...data,
    taxUponDeath: dynastyCreator.totalTaxLiability,
  }
}

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}
