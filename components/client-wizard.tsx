"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  User, 
  TrendingUp,
  Shield,
  PiggyBank,
  Heart,
  Crown,
  Calculator,
  Plus,
  Trash2,
  X
} from "lucide-react"
import type { 
  ClientPlan, 
  LineItem,
  LongTermCareItem,
  BeneficiaryItem,
  ProtectionItem,
  StatusItem,
  IncomeOptimizationData,
  EmergencyBuilderData,
  RevenueReplacerData,
  AssetBuilderData,
  LegacyEnhancerData,
  LegacyDefenderData,
  DynastyCreatorData,
  TaxPlannerData,
} from "@/lib/types"
import {
  defaultIncomeOptimization,
  defaultEmergencyBuilder,
  defaultRevenueReplacer,
  defaultAssetBuilder,
  defaultLegacyEnhancer,
  defaultLegacyDefender,
  defaultDynastyCreator,
  defaultTaxPlanner,
  calculateIncomeOptimization,
  calculateRevenueReplacer,
  calculateAssetBuilder,
  calculateEmergencyBuilder,
  calculateLegacyEnhancer,
  calculateLegacyDefender,
  calculateDynastyCreator,
  calculateTaxPlanner,
  generateId,
} from "@/lib/types"

interface ClientWizardProps {
  onComplete: (client: ClientPlan) => void
  onCancel: () => void
}

type WizardStep = {
  id: string
  title: string
  subtitle: string
  color: string
}

const wizardSteps: WizardStep[] = [
  { id: 'clientInfo', title: 'Client Information', subtitle: 'Client, spouse or partner, and household name', color: '#1a1a1a' },
  { id: 'incomeOptimization', title: 'Income Optimization', subtitle: 'Document income sources', color: '#16a34a' },
  { id: 'assetBuilder', title: 'Asset Builder', subtitle: 'Assets, risk tolerance, and allocation', color: '#991b1b' },
  { id: 'emergencyBuilder', title: 'Emergency Builder', subtitle: 'Plan for liquidity', color: '#2563eb' },
  { id: 'revenueReplacer', title: 'Revenue Replacer', subtitle: 'Calculate life insurance needs', color: '#7c3aed' },
  { id: 'legacyEnhancer', title: 'Legacy Enhancer', subtitle: 'Plan for giving', color: '#0d9488' },
  { id: 'legacyDefender', title: 'Legacy Defender', subtitle: 'Long-term care planning', color: '#0891b2' },
  { id: 'dynastyCreator', title: 'Dynasty Creator', subtitle: 'Estate planning', color: '#ca8a04' },
  { id: 'taxPlanner', title: 'Tax Planner', subtitle: 'Optimize tax efficiency', color: '#1d4ed8' },
]

function formatCurrency(value: number): string {
  if (value < 0) return `-$${Math.abs(value).toLocaleString()}`
  return `$${value.toLocaleString()}`
}

function CurrencyInput({ value, onChange, placeholder = "0", className = "" }: { 
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}) {
  const [display, setDisplay] = useState(value === 0 ? '' : value.toString())
  
  useEffect(() => {
    setDisplay(value === 0 ? '' : value.toString())
  }, [value])
  
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
      <Input
        type="text"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.-]/g, '')
          setDisplay(raw)
          onChange(parseFloat(raw) || 0)
        }}
        placeholder={placeholder}
        className="pl-7 text-right h-10 bg-secondary/30 border-border/50 focus:border-foreground/30 focus:bg-background transition-colors"
      />
    </div>
  )
}

function PercentInput({ value, onChange, className = "" }: { 
  value: number
  onChange: (value: number) => void
  className?: string
}) {
  const [display, setDisplay] = useState(value === 0 ? '' : (value * 100).toString())
  
  useEffect(() => {
    setDisplay(value === 0 ? '' : (value * 100).toString())
  }, [value])
  
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        value={display}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '')
          setDisplay(raw)
          onChange((parseFloat(raw) || 0) / 100)
        }}
        placeholder="0"
        className="pr-7 text-right h-10 bg-secondary/30 border-border/50 focus:border-foreground/30 focus:bg-background transition-colors"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
    </div>
  )
}

function NumberInput({ value, onChange, placeholder = "0", className = "" }: { 
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}) {
  const [display, setDisplay] = useState(value === 0 ? '' : value.toString())
  
  useEffect(() => {
    setDisplay(value === 0 ? '' : value.toString())
  }, [value])
  
  return (
    <Input
      type="text"
      value={display}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '')
        setDisplay(raw)
        onChange(parseInt(raw) || 0)
      }}
      placeholder={placeholder}
      className={`text-right h-10 bg-secondary/30 border-border/50 focus:border-foreground/30 focus:bg-background transition-colors ${className}`}
    />
  )
}

function CalculatedField({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-secondary/50 rounded-md">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Calculator className="size-3" />
        {label}
      </span>
      <span className={`text-sm font-medium ${value < 0 ? 'text-red-600' : 'text-foreground'}`}>
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function LineItemRow({ item, onUpdate, onRemove, showCategory = false, categories = [] }: { 
  item: LineItem
  onUpdate: (item: LineItem) => void
  onRemove: () => void
  showCategory?: boolean
  categories?: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center gap-2 py-2 group">
      <Input
        placeholder="Name"
        value={item.name}
        onChange={(e) => onUpdate({ ...item, name: e.target.value })}
        className="flex-1 h-9 bg-secondary/30 border-border/50 text-sm"
      />
      {showCategory && categories.length > 0 && (
        <Select value={item.category || ''} onValueChange={(v) => onUpdate({ ...item, category: v })}>
          <SelectTrigger className="w-28 h-9 bg-secondary/30 border-border/50 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <CurrencyInput
        value={item.amount}
        onChange={(amount) => onUpdate({ ...item, amount })}
        className="w-28"
      />
      <button 
        type="button" 
        onClick={onRemove} 
        className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

export function ClientWizard({ onComplete, onCancel }: ClientWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [clientName, setClientName] = useState("")
  const [spouseName, setSpouseName] = useState("")
  
  const [incomeOpt, setIncomeOpt] = useState<IncomeOptimizationData>({ ...defaultIncomeOptimization })
  const [assetBuilder, setAssetBuilder] = useState<AssetBuilderData>({ ...defaultAssetBuilder })
  const [emergencyBuilder, setEmergencyBuilder] = useState<EmergencyBuilderData>({ ...defaultEmergencyBuilder })
  const [revenueReplacer, setRevenueReplacer] = useState<RevenueReplacerData>({ ...defaultRevenueReplacer })
  const [legacyEnhancer, setLegacyEnhancer] = useState<LegacyEnhancerData>({ ...defaultLegacyEnhancer })
  const [legacyDefender, setLegacyDefender] = useState<LegacyDefenderData>({ ...defaultLegacyDefender })
  const [dynastyCreator, setDynastyCreator] = useState<DynastyCreatorData>({ ...defaultDynastyCreator })
  const [taxPlanner, setTaxPlanner] = useState<TaxPlannerData>({ ...defaultTaxPlanner })

  // Stable dependency keys
  const incomeSourcesKey = JSON.stringify(incomeOpt.incomeSources.map(s => ({ id: s.id, amount: s.amount })))
  const assetsKey = JSON.stringify(assetBuilder.assets.map(a => ({ id: a.id, amount: a.amount, category: a.category })))
  const incomeLossKey = JSON.stringify(revenueReplacer.incomeLossItems.map(i => ({ id: i.id, amount: i.amount })))
  const goalsKey = JSON.stringify(legacyEnhancer.goals.map(g => ({ id: g.id, amount: g.amount })))
  const beneficiariesKey = JSON.stringify(dynastyCreator.beneficiaries.map(b => ({ id: b.id, amount: b.amount, taxRate: b.taxRate })))
  const ltcKey = JSON.stringify(legacyDefender.longTermCare.map(l => ({ id: l.id, amount: l.amount, years: l.years })))

  useEffect(() => {
    setIncomeOpt(prev => calculateIncomeOptimization(prev))
  }, [incomeOpt.incomeNeeded, incomeSourcesKey, incomeOpt.annuityPayoutPercent, incomeOpt.spouseMonthlyIncome])

  useEffect(() => {
    setAssetBuilder(prev => calculateAssetBuilder(prev))
  }, [assetsKey])

  useEffect(() => {
    setEmergencyBuilder(prev => calculateEmergencyBuilder(prev, incomeOpt, assetBuilder))
  }, [incomeOpt.annuityNeeded, assetBuilder.qualifiedAssets])

  useEffect(() => {
    setRevenueReplacer(prev => calculateRevenueReplacer(prev))
  }, [incomeLossKey, revenueReplacer.futureAnnuityPayout])

  useEffect(() => {
    setLegacyEnhancer(prev => calculateLegacyEnhancer(prev))
  }, [goalsKey])

  useEffect(() => {
    setDynastyCreator(prev => calculateDynastyCreator(prev))
  }, [beneficiariesKey])

  useEffect(() => {
    setLegacyDefender(prev => calculateLegacyDefender(prev, dynastyCreator.estateValue))
  }, [ltcKey, legacyDefender.probateProtectionPercent, dynastyCreator.estateValue])

  useEffect(() => {
    setTaxPlanner(prev => calculateTaxPlanner(prev, dynastyCreator))
  }, [dynastyCreator.totalTaxLiability])

  const step = wizardSteps[currentStep]

  const handleNext = () => {
    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      const newClient: ClientPlan = {
        id: Date.now().toString(),
        clientName: clientName.trim(),
        spouseName: spouseName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        incomeOptimization: incomeOpt,
        assetBuilder,
        emergencyBuilder,
        revenueReplacer,
        legacyEnhancer,
        legacyDefender,
        dynastyCreator,
        taxPlanner,
      }
      onComplete(newClient)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1)
    else onCancel()
  }

  const canProceed = () => {
    if (currentStep === 0) return clientName.trim().length > 0
    return true
  }

  // Item management functions
  const addItem = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<{ [key: string]: T[] } & Record<string, unknown>>>,
    key: string,
    newItem: T
  ) => {
    setter(prev => ({ ...prev, [key]: [...(prev[key] as T[]), newItem] }))
  }

  const updateItem = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<{ [key: string]: T[] } & Record<string, unknown>>>,
    key: string,
    updated: T
  ) => {
    setter(prev => ({
      ...prev,
      [key]: (prev[key] as T[]).map(item => item.id === updated.id ? updated : item)
    }))
  }

  const removeItem = <T extends { id: string }>(
    setter: React.Dispatch<React.SetStateAction<{ [key: string]: T[] } & Record<string, unknown>>>,
    key: string,
    id: string
  ) => {
    setter(prev => ({
      ...prev,
      [key]: (prev[key] as T[]).filter(item => item.id !== id)
    }))
  }

  const renderStepContent = () => {
    switch (step.id) {
      case 'clientInfo':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enter the client or household name for this financial plan. Add a spouse or partner if applicable.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Client Name</label>
              <Input
                placeholder="e.g., John Smith, Smith Family"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="h-12 text-lg bg-secondary/30 border-border/50"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Spouse / partner</label>
              <Input
                placeholder="Optional — e.g., Jane Smith"
                value={spouseName}
                onChange={(e) => setSpouseName(e.target.value)}
                className="h-12 text-lg bg-secondary/30 border-border/50"
              />
            </div>
          </div>
        )

      case 'incomeOptimization':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Enter monthly income needed and all household income. Add the client&apos;s sources below; add spouse or partner income separately if you entered a spouse on the previous step.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Monthly Income Needed</label>
                <CurrencyInput
                  value={incomeOpt.incomeNeeded}
                  onChange={(v) => setIncomeOpt(prev => ({ ...prev, incomeNeeded: v }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Annuity Payout %</label>
                <PercentInput
                  value={incomeOpt.annuityPayoutPercent}
                  onChange={(v) => setIncomeOpt(prev => ({ ...prev, annuityPayoutPercent: v }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Income Sources (Monthly)</label>
              <div className="space-y-1">
                {incomeOpt.incomeSources.map(item => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => setIncomeOpt(prev => ({
                      ...prev,
                      incomeSources: prev.incomeSources.map(i => i.id === updated.id ? updated : i)
                    }))}
                    onRemove={() => setIncomeOpt(prev => ({
                      ...prev,
                      incomeSources: prev.incomeSources.filter(i => i.id !== item.id)
                    }))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setIncomeOpt(prev => ({
                    ...prev,
                    incomeSources: [...prev.incomeSources, { id: generateId(), name: '', amount: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Income Source
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-4 space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
                {spouseName.trim()
                  ? `${spouseName.trim()} — monthly income`
                  : "Spouse / partner income (monthly)"}
              </label>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Optional. Counts toward total household income in addition to the line items above. You can also add spouse pay as a line item instead—do not enter both for the same income.
              </p>
              <CurrencyInput
                value={incomeOpt.spouseMonthlyIncome}
                onChange={(v) =>
                  setIncomeOpt((prev) => ({ ...prev, spouseMonthlyIncome: v }))
                }
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Total Income" value={incomeOpt.totalIncome} />
              <CalculatedField label="Monthly Gap" value={incomeOpt.monthlyGap} />
              <CalculatedField label="Annual Gap" value={incomeOpt.annualGap} />
              <CalculatedField label="Annuity Needed" value={incomeOpt.annuityNeeded} />
            </div>
          </div>
        )

      case 'assetBuilder':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {spouseName.trim()
                ? "Add all household assets. Capture each person’s risk tolerance (1–10) when both spouses participate in investment decisions."
                : "Add all client assets. Mark each as Qualified (IRA, 401k) or Non-Qualified (taxable)."}
            </p>
            {spouseName.trim() ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                      {clientName.trim() ? `${clientName.trim()} — risk tolerance (1–10)` : "Client — risk tolerance (1–10)"}
                    </label>
                    <NumberInput
                      value={assetBuilder.riskTolerance}
                      onChange={(v) =>
                        setAssetBuilder((prev) => ({
                          ...prev,
                          riskTolerance: Math.min(10, Math.max(1, v)),
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                      {`${spouseName.trim()} — risk tolerance (1–10)`}
                    </label>
                    <NumberInput
                      value={assetBuilder.spouseRiskTolerance}
                      onChange={(v) =>
                        setAssetBuilder((prev) => ({
                          ...prev,
                          spouseRiskTolerance: Math.min(10, Math.max(1, v)),
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Max Loss $</label>
                  <p className="text-[11px] text-muted-foreground mb-2">Household maximum acceptable portfolio loss (one figure).</p>
                  <CurrencyInput
                    value={assetBuilder.maxLossDollars}
                    onChange={(v) => setAssetBuilder((prev) => ({ ...prev, maxLossDollars: v }))}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Risk Tolerance (1-10)</label>
                  <NumberInput
                    value={assetBuilder.riskTolerance}
                    onChange={(v) =>
                      setAssetBuilder((prev) => ({
                        ...prev,
                        riskTolerance: Math.min(10, Math.max(1, v)),
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Max Loss $</label>
                  <CurrencyInput
                    value={assetBuilder.maxLossDollars}
                    onChange={(v) => setAssetBuilder((prev) => ({ ...prev, maxLossDollars: v }))}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Assets</label>
              <div className="space-y-1">
                {assetBuilder.assets.map(item => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => setAssetBuilder(prev => ({
                      ...prev,
                      assets: prev.assets.map(i => i.id === updated.id ? updated : i)
                    }))}
                    onRemove={() => setAssetBuilder(prev => ({
                      ...prev,
                      assets: prev.assets.filter(i => i.id !== item.id)
                    }))}
                    showCategory
                    categories={[{ value: 'qualified', label: 'Qualified' }, { value: 'non-qualified', label: 'Non-Qual' }]}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setAssetBuilder(prev => ({
                    ...prev,
                    assets: [...prev.assets, { id: generateId(), name: '', amount: 0, category: 'qualified' }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Asset
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Qualified Assets" value={assetBuilder.qualifiedAssets} />
              <CalculatedField label="Non-Qualified Assets" value={assetBuilder.nonQualifiedAssets} />
              <CalculatedField label="Total Assets" value={assetBuilder.totalAssets} />
            </div>
          </div>
        )

      case 'emergencyBuilder':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Plan for emergency funds and liquidity needs.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Current Liquidity</label>
                <CurrencyInput
                  value={emergencyBuilder.currentLiquidity}
                  onChange={(v) => setEmergencyBuilder(prev => ({ ...prev, currentLiquidity: v }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Liquidity Desired</label>
                <CurrencyInput
                  value={emergencyBuilder.liquidityDesired}
                  onChange={(v) => setEmergencyBuilder(prev => ({ ...prev, liquidityDesired: v }))}
                />
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Immediate Liquidity (Annuity Needed)" value={emergencyBuilder.immediateLiquidity} />
              <CalculatedField label="Delayed Liquidity (Qualified Assets)" value={emergencyBuilder.delayedLiquidity} />
            </div>
          </div>
        )

      case 'revenueReplacer':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Calculate life insurance needs based on income that would be lost.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Future Annuity Payout %</label>
              <PercentInput
                value={revenueReplacer.futureAnnuityPayout}
                onChange={(v) => setRevenueReplacer(prev => ({ ...prev, futureAnnuityPayout: v }))}
                className="max-w-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Income Loss Items (Monthly)</label>
              <div className="space-y-1">
                {revenueReplacer.incomeLossItems.map(item => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => setRevenueReplacer(prev => ({
                      ...prev,
                      incomeLossItems: prev.incomeLossItems.map(i => i.id === updated.id ? updated : i)
                    }))}
                    onRemove={() => setRevenueReplacer(prev => ({
                      ...prev,
                      incomeLossItems: prev.incomeLossItems.filter(i => i.id !== item.id)
                    }))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setRevenueReplacer(prev => ({
                    ...prev,
                    incomeLossItems: [...prev.incomeLossItems, { id: generateId(), name: '', amount: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Income Loss Item
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Total Income Loss" value={revenueReplacer.totalIncomeLoss} />
              <CalculatedField label="Life Insurance Needed" value={revenueReplacer.lifeInsuranceNeeded} />
            </div>
          </div>
        )

      case 'legacyEnhancer':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Plan for charitable giving, family support, and educational funding.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Legacy Goals</label>
              <div className="space-y-1">
                {legacyEnhancer.goals.map(item => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => setLegacyEnhancer(prev => ({
                      ...prev,
                      goals: prev.goals.map(i => i.id === updated.id ? updated : i)
                    }))}
                    onRemove={() => setLegacyEnhancer(prev => ({
                      ...prev,
                      goals: prev.goals.filter(i => i.id !== item.id)
                    }))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setLegacyEnhancer(prev => ({
                    ...prev,
                    goals: [...prev.goals, { id: generateId(), name: '', amount: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Goal
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Total Goals" value={legacyEnhancer.totalGoals} />
            </div>
          </div>
        )

      case 'legacyDefender':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Plan for long-term care costs and asset protection.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Probate Protection %</label>
              <PercentInput
                value={legacyDefender.probateProtectionPercent}
                onChange={(v) => setLegacyDefender(prev => ({ ...prev, probateProtectionPercent: v }))}
                className="max-w-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Long-Term Care Plans</label>
              <div className="space-y-2">
                {legacyDefender.longTermCare.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-2 group">
                    <Input
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => setLegacyDefender(prev => ({
                        ...prev,
                        longTermCare: prev.longTermCare.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                      }))}
                      className="flex-1 h-9 bg-secondary/30 border-border/50 text-sm"
                    />
                    <CurrencyInput
                      value={item.amount}
                      onChange={(amount) => setLegacyDefender(prev => ({
                        ...prev,
                        longTermCare: prev.longTermCare.map(i => i.id === item.id ? { ...i, amount, total: amount * i.years } : i)
                      }))}
                      className="w-24"
                    />
                    <NumberInput
                      value={item.years}
                      onChange={(years) => setLegacyDefender(prev => ({
                        ...prev,
                        longTermCare: prev.longTermCare.map(i => i.id === item.id ? { ...i, years, total: i.amount * years } : i)
                      }))}
                      placeholder="Yrs"
                      className="w-16"
                    />
                    <span className="text-xs text-muted-foreground w-24 text-right">{formatCurrency(item.total)}</span>
                    <button 
                      type="button" 
                      onClick={() => setLegacyDefender(prev => ({
                        ...prev,
                        longTermCare: prev.longTermCare.filter(i => i.id !== item.id)
                      }))}
                      className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setLegacyDefender(prev => ({
                    ...prev,
                    longTermCare: [...prev.longTermCare, { id: generateId(), name: '', amount: 0, years: 0, total: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Long-Term Care Plan
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Protection Concerns</label>
              <div className="space-y-2">
                {legacyDefender.protectionItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-2 group">
                    <Input
                      placeholder="Protection type"
                      value={item.name}
                      onChange={(e) => setLegacyDefender(prev => ({
                        ...prev,
                        protectionItems: prev.protectionItems.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                      }))}
                      className="flex-1 h-9 bg-secondary/30 border-border/50 text-sm"
                    />
                    <Select 
                      value={item.status} 
                      onValueChange={(v: 'CONCERNED' | 'ADDRESSED') => setLegacyDefender(prev => ({
                        ...prev,
                        protectionItems: prev.protectionItems.map(i => i.id === item.id ? { ...i, status: v } : i)
                      }))}
                    >
                      <SelectTrigger className="w-32 h-9 bg-secondary/30 border-border/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CONCERNED">Concerned</SelectItem>
                        <SelectItem value="ADDRESSED">Addressed</SelectItem>
                      </SelectContent>
                    </Select>
                    <button 
                      type="button" 
                      onClick={() => setLegacyDefender(prev => ({
                        ...prev,
                        protectionItems: prev.protectionItems.filter(i => i.id !== item.id)
                      }))}
                      className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setLegacyDefender(prev => ({
                    ...prev,
                    protectionItems: [...prev.protectionItems, { id: generateId(), name: '', status: 'CONCERNED' as const }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Protection Concern
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Total Long-Term Care" value={legacyDefender.totalLongTermCare} />
              <CalculatedField label="Probate Protection" value={legacyDefender.probateProtectionTotal} />
            </div>
          </div>
        )

      case 'dynastyCreator':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Establish estate planning and beneficiary designations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Estate Value</label>
                <CurrencyInput
                  value={dynastyCreator.estateValue}
                  onChange={(v) => setDynastyCreator(prev => ({ ...prev, estateValue: v }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Funeral Trust</label>
                <CurrencyInput
                  value={dynastyCreator.funeralTrust}
                  onChange={(v) => setDynastyCreator(prev => ({ ...prev, funeralTrust: v }))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Beneficiaries & Tax Rates</label>
              <div className="space-y-2">
                {dynastyCreator.beneficiaries.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-2 group">
                    <Input
                      placeholder="Beneficiary"
                      value={item.name}
                      onChange={(e) => setDynastyCreator(prev => ({
                        ...prev,
                        beneficiaries: prev.beneficiaries.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                      }))}
                      className="flex-1 h-9 bg-secondary/30 border-border/50 text-sm"
                    />
                    <CurrencyInput
                      value={item.amount}
                      onChange={(amount) => setDynastyCreator(prev => ({
                        ...prev,
                        beneficiaries: prev.beneficiaries.map(i => i.id === item.id ? { ...i, amount } : i)
                      }))}
                      className="w-28"
                    />
                    <PercentInput
                      value={item.taxRate}
                      onChange={(taxRate) => setDynastyCreator(prev => ({
                        ...prev,
                        beneficiaries: prev.beneficiaries.map(i => i.id === item.id ? { ...i, taxRate } : i)
                      }))}
                      className="w-20"
                    />
                    <button 
                      type="button" 
                      onClick={() => setDynastyCreator(prev => ({
                        ...prev,
                        beneficiaries: prev.beneficiaries.filter(i => i.id !== item.id)
                      }))}
                      className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDynastyCreator(prev => ({
                    ...prev,
                    beneficiaries: [...prev.beneficiaries, { id: generateId(), name: '', amount: 0, taxRate: 0.2, taxAmount: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Beneficiary
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Estate Documents</label>
              <div className="space-y-2">
                {dynastyCreator.statusItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-2 group">
                    <Input
                      placeholder="Document"
                      value={item.name}
                      onChange={(e) => setDynastyCreator(prev => ({
                        ...prev,
                        statusItems: prev.statusItems.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                      }))}
                      className="flex-1 h-9 bg-secondary/30 border-border/50 text-sm"
                    />
                    <Select 
                      value={item.status} 
                      onValueChange={(v: 'FINISHED' | 'NOT FINISHED') => setDynastyCreator(prev => ({
                        ...prev,
                        statusItems: prev.statusItems.map(i => i.id === item.id ? { ...i, status: v } : i)
                      }))}
                    >
                      <SelectTrigger className="w-32 h-9 bg-secondary/30 border-border/50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FINISHED">Finished</SelectItem>
                        <SelectItem value="NOT FINISHED">Not Finished</SelectItem>
                      </SelectContent>
                    </Select>
                    <button 
                      type="button" 
                      onClick={() => setDynastyCreator(prev => ({
                        ...prev,
                        statusItems: prev.statusItems.filter(i => i.id !== item.id)
                      }))}
                      className="p-1.5 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDynastyCreator(prev => ({
                    ...prev,
                    statusItems: [...prev.statusItems, { id: generateId(), name: '', status: 'NOT FINISHED' as const }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Document
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Total Tax Liability" value={dynastyCreator.totalTaxLiability} />
            </div>
          </div>
        )

      case 'taxPlanner':
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Optimize tax efficiency through strategic planning.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Effective Tax Rate</label>
              <PercentInput
                value={taxPlanner.effectiveTaxRate}
                onChange={(v) => setTaxPlanner(prev => ({ ...prev, effectiveTaxRate: v }))}
                className="max-w-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Tax Planning Items</label>
              <div className="space-y-1">
                {taxPlanner.taxItems.map(item => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(updated) => setTaxPlanner(prev => ({
                      ...prev,
                      taxItems: prev.taxItems.map(i => i.id === updated.id ? updated : i)
                    }))}
                    onRemove={() => setTaxPlanner(prev => ({
                      ...prev,
                      taxItems: prev.taxItems.filter(i => i.id !== item.id)
                    }))}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setTaxPlanner(prev => ({
                    ...prev,
                    taxItems: [...prev.taxItems, { id: generateId(), name: '', amount: 0 }]
                  }))}
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/50 rounded-md hover:border-foreground/30 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="size-3" /> Add Tax Item
                </button>
              </div>
            </div>
            <div className="space-y-2 pt-4 border-t border-border/50">
              <CalculatedField label="Tax Upon Death (from Estate)" value={taxPlanner.taxUponDeath} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
          >
            <X className="size-4" />
            Cancel
          </button>
          <div className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {wizardSteps.length}
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <div className="flex gap-1">
          {wizardSteps.map((s, i) => (
            <div
              key={s.id}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{
                backgroundColor: i <= currentStep ? s.color : 'var(--border)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div 
            className="inline-block w-2 h-2 rounded-full mb-3"
            style={{ backgroundColor: step.color }}
          />
          <h1 className="text-2xl font-light text-foreground mb-1">{step.title}</h1>
          <p className="text-sm text-muted-foreground">{step.subtitle}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-lg p-6">
          {renderStepContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="size-4 mr-2" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {currentStep === wizardSteps.length - 1 ? (
              <>
                Complete
                <Check className="size-4 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}
