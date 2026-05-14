"use client"

import { APP_TITLE } from "@/lib/app-title"
import { Button } from "@/components/ui/button"
import { ElementsWheel } from "@/components/elements-wheel"
import { Download, ArrowLeft, Calculator } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AssetAllocationChart,
  IncomeBreakdownChart,
  FinancialOverviewChart,
  IncomeGapChart,
  LegacyPlanningChart,
} from "@/components/financial-charts"
import { Recommendations } from "@/components/recommendations"
import type { ClientPlan } from "@/lib/types"

interface ClientPlanViewProps {
  client: ClientPlan
  onUpdate: (client: ClientPlan) => void
  onBack: () => void
}

function formatCurrency(value: number): string {
  if (value < 0) return `-$${Math.abs(value).toLocaleString()}`
  return `$${value.toLocaleString()}`
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-lg bg-card border border-border/50">
      <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: color }} />
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-semibold ${value < 0 ? 'text-red-600' : ''}`}>
        {formatCurrency(value)}
      </p>
    </div>
  )
}

function SectionCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg overflow-hidden border border-border/50 bg-card">
      <div 
        className="px-4 py-2.5 text-sm font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      <div className="divide-y divide-border/30">
        {children}
      </div>
    </div>
  )
}

function DataRow({ label, value, isCalculated }: { label: string; value: string | number; isCalculated?: boolean }) {
  const displayValue = typeof value === 'number' ? formatCurrency(value) : value
  const isNegative = typeof value === 'number' && value < 0

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm hover:bg-secondary/30 transition-colors">
      <span className={`text-muted-foreground ${isCalculated ? 'flex items-center gap-1.5' : ''}`}>
        {isCalculated && <Calculator className="size-3" />}
        {label}
      </span>
      <span className={`font-medium ${isNegative ? 'text-red-600' : ''}`}>
        {displayValue}
      </span>
    </div>
  )
}

export function ClientPlanView({ client, onBack }: ClientPlanViewProps) {
  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <div className="h-4 w-px bg-border" />
            <div>
              <h1 className="text-sm font-medium">{client.clientName}</h1>
              {client.spouseName?.trim() ? (
                <p className="text-xs text-muted-foreground">
                  {`& ${client.spouseName.trim()}`}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Updated {new Date(client.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs"
          >
            <Download className="size-3 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Assets" value={client.assetBuilder.totalAssets} color="#991b1b" />
          <MetricCard label="Monthly Gap" value={client.incomeOptimization.monthlyGap} color="#16a34a" />
          <MetricCard label="Life Insurance Need" value={Math.abs(client.revenueReplacer.lifeInsuranceNeeded)} color="#7c3aed" />
          <MetricCard label="Tax Liability" value={client.dynastyCreator.totalTaxLiability} color="#1d4ed8" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6 bg-secondary/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="details">Full Details</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left - Wheel */}
              <div className="flex flex-col items-center justify-center p-6 bg-card border border-border/50 rounded-lg">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">{APP_TITLE}</h3>
                <ElementsWheel />
              </div>

              {/* Right - Summary Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SectionCard title="Income Optimization" color="#16a34a">
                  <DataRow label="Income Needed" value={client.incomeOptimization.incomeNeeded} />
                  {(client.incomeOptimization.spouseMonthlyIncome ?? 0) > 0 ? (
                    <DataRow
                      label={
                        client.spouseName?.trim()
                          ? `${client.spouseName.trim()} (monthly)`
                          : "Spouse / partner income (mo.)"
                      }
                      value={client.incomeOptimization.spouseMonthlyIncome ?? 0}
                    />
                  ) : null}
                  <DataRow label="Total Income" value={client.incomeOptimization.totalIncome} isCalculated />
                  <DataRow label="Monthly Gap" value={client.incomeOptimization.monthlyGap} isCalculated />
                  <DataRow label="Annuity Needed" value={client.incomeOptimization.annuityNeeded} isCalculated />
                </SectionCard>

                <SectionCard title="Asset Builder" color="#991b1b">
                  {client.spouseName?.trim() ? (
                    <>
                      <DataRow label={`${client.clientName.trim() || "Client"} — risk (1–10)`} value={`${client.assetBuilder.riskTolerance}/10`} />
                      <DataRow label={`${client.spouseName.trim()} — risk (1–10)`} value={`${client.assetBuilder.spouseRiskTolerance}/10`} />
                      <DataRow
                        label="Household (more conservative)"
                        value={`${Math.min(client.assetBuilder.riskTolerance, client.assetBuilder.spouseRiskTolerance)}/10`}
                        isCalculated
                      />
                    </>
                  ) : (
                    <DataRow label="Risk Tolerance" value={`${client.assetBuilder.riskTolerance}/10`} />
                  )}
                  <DataRow label="Qualified" value={client.assetBuilder.qualifiedAssets} isCalculated />
                  <DataRow label="Non-Qualified" value={client.assetBuilder.nonQualifiedAssets} isCalculated />
                  <DataRow label="Total Assets" value={client.assetBuilder.totalAssets} isCalculated />
                </SectionCard>

                <SectionCard title="Revenue Replacer" color="#7c3aed">
                  <DataRow label="Payout %" value={formatPercent(client.revenueReplacer.futureAnnuityPayout)} />
                  <DataRow label="Income Loss" value={client.revenueReplacer.totalIncomeLoss} isCalculated />
                  <DataRow label="Life Insurance Needed" value={client.revenueReplacer.lifeInsuranceNeeded} isCalculated />
                </SectionCard>

                <SectionCard title="Dynasty Creator" color="#ca8a04">
                  <DataRow label="Estate Value" value={client.dynastyCreator.estateValue} />
                  <DataRow label="Funeral Trust" value={client.dynastyCreator.funeralTrust} />
                  <DataRow label="Tax Liability" value={client.dynastyCreator.totalTaxLiability} isCalculated />
                </SectionCard>
              </div>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <Recommendations client={client} />
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Asset Allocation</h4>
                <AssetAllocationChart client={client} />
              </div>
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Income vs Need</h4>
                <IncomeGapChart client={client} />
              </div>
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Key Areas</h4>
                <FinancialOverviewChart client={client} />
              </div>
              <div className="bg-card border border-border/50 rounded-lg p-4">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Income Sources</h4>
                <IncomeBreakdownChart client={client} />
              </div>
              <div className="bg-card border border-border/50 rounded-lg p-4 md:col-span-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Legacy Planning</h4>
                <LegacyPlanningChart client={client} />
              </div>
            </div>
          </TabsContent>

          {/* Full Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income Optimization */}
              <SectionCard title="Income Optimization" color="#16a34a">
                <DataRow label="Income Needed" value={client.incomeOptimization.incomeNeeded} />
                {client.incomeOptimization.incomeSources.map(item => (
                  <DataRow key={item.id} label={item.name || 'Income Source'} value={item.amount} />
                ))}
                {(client.incomeOptimization.spouseMonthlyIncome ?? 0) > 0 ? (
                  <DataRow
                    label={
                      client.spouseName?.trim()
                        ? `${client.spouseName.trim()} (monthly)`
                        : "Spouse / partner income (monthly)"
                    }
                    value={client.incomeOptimization.spouseMonthlyIncome ?? 0}
                  />
                ) : null}
                <DataRow label="Annuity Payout %" value={formatPercent(client.incomeOptimization.annuityPayoutPercent)} />
                <DataRow label="Total Income" value={client.incomeOptimization.totalIncome} isCalculated />
                <DataRow label="Monthly Gap" value={client.incomeOptimization.monthlyGap} isCalculated />
                <DataRow label="Annual Gap" value={client.incomeOptimization.annualGap} isCalculated />
                <DataRow label="Annuity Needed" value={client.incomeOptimization.annuityNeeded} isCalculated />
              </SectionCard>

              {/* Emergency Builder */}
              <SectionCard title="Emergency Builder" color="#2563eb">
                <DataRow label="Current Liquidity" value={client.emergencyBuilder.currentLiquidity} />
                <DataRow label="Liquidity Desired" value={client.emergencyBuilder.liquidityDesired} />
                <DataRow label="Immediate Liquidity" value={client.emergencyBuilder.immediateLiquidity} isCalculated />
                <DataRow label="Delayed Liquidity" value={client.emergencyBuilder.delayedLiquidity} isCalculated />
              </SectionCard>

              {/* Asset Builder */}
              <SectionCard title="Asset Builder" color="#991b1b">
                {client.spouseName?.trim() ? (
                  <>
                    <DataRow label={`${client.clientName.trim() || "Client"} — risk (1–10)`} value={`${client.assetBuilder.riskTolerance}/10`} />
                    <DataRow label={`${client.spouseName.trim()} — risk (1–10)`} value={`${client.assetBuilder.spouseRiskTolerance}/10`} />
                    <DataRow
                      label="Household (more conservative)"
                      value={`${Math.min(client.assetBuilder.riskTolerance, client.assetBuilder.spouseRiskTolerance)}/10`}
                      isCalculated
                    />
                  </>
                ) : (
                  <DataRow label="Risk Tolerance" value={`${client.assetBuilder.riskTolerance}/10`} />
                )}
                {client.assetBuilder.assets.map(item => (
                  <DataRow 
                    key={item.id} 
                    label={`${item.name || 'Asset'} (${item.category === 'qualified' ? 'Q' : 'NQ'})`} 
                    value={item.amount} 
                  />
                ))}
                <DataRow label="Max Loss $" value={client.assetBuilder.maxLossDollars} />
                <DataRow label="Excess Fees" value={client.assetBuilder.excessFees} />
                <DataRow label="Qualified Assets" value={client.assetBuilder.qualifiedAssets} isCalculated />
                <DataRow label="Non-Qualified Assets" value={client.assetBuilder.nonQualifiedAssets} isCalculated />
                <DataRow label="Total Assets" value={client.assetBuilder.totalAssets} isCalculated />
              </SectionCard>

              {/* Revenue Replacer */}
              <SectionCard title="Revenue Replacer" color="#7c3aed">
                <DataRow label="Annuity Payout %" value={formatPercent(client.revenueReplacer.futureAnnuityPayout)} />
                {client.revenueReplacer.incomeLossItems.map(item => (
                  <DataRow key={item.id} label={item.name || 'Income Loss'} value={item.amount} />
                ))}
                <DataRow label="Total Income Loss" value={client.revenueReplacer.totalIncomeLoss} isCalculated />
                <DataRow label="Life Insurance Needed" value={client.revenueReplacer.lifeInsuranceNeeded} isCalculated />
              </SectionCard>

              {/* Legacy Enhancer */}
              <SectionCard title="Legacy Enhancer" color="#0d9488">
                {client.legacyEnhancer.goals.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No goals added</div>
                ) : (
                  <>
                    {client.legacyEnhancer.goals.map(item => (
                      <DataRow key={item.id} label={item.name || 'Goal'} value={item.amount} />
                    ))}
                    <DataRow label="Total Goals" value={client.legacyEnhancer.totalGoals} isCalculated />
                  </>
                )}
              </SectionCard>

              {/* Legacy Defender */}
              <SectionCard title="Legacy Defender" color="#0891b2">
                {client.legacyDefender.longTermCare.map(item => (
                  <DataRow 
                    key={item.id} 
                    label={`${item.name || 'LTC'} (${item.years} yrs)`} 
                    value={item.total} 
                  />
                ))}
                <DataRow label="Probate Protection %" value={formatPercent(client.legacyDefender.probateProtectionPercent)} />
                {client.legacyDefender.protectionItems.map(item => (
                  <DataRow key={item.id} label={item.name || 'Protection'} value={item.status} />
                ))}
                <DataRow label="Total LTC" value={client.legacyDefender.totalLongTermCare} isCalculated />
                <DataRow label="Probate Protection" value={client.legacyDefender.probateProtectionTotal} isCalculated />
              </SectionCard>

              {/* Dynasty Creator */}
              <SectionCard title="Dynasty Creator" color="#ca8a04">
                <DataRow label="Estate Value" value={client.dynastyCreator.estateValue} />
                {client.dynastyCreator.beneficiaries.map(item => (
                  <DataRow 
                    key={item.id} 
                    label={`${item.name || 'Beneficiary'} @ ${formatPercent(item.taxRate)}`} 
                    value={item.taxAmount} 
                  />
                ))}
                {client.dynastyCreator.statusItems.map(item => (
                  <DataRow key={item.id} label={item.name || 'Status'} value={item.status} />
                ))}
                <DataRow label="Funeral Trust" value={client.dynastyCreator.funeralTrust} />
                <DataRow label="Total Tax Liability" value={client.dynastyCreator.totalTaxLiability} isCalculated />
              </SectionCard>

              {/* Tax Planner */}
              <SectionCard title="Tax Planner" color="#1d4ed8">
                <DataRow label="Effective Tax Rate" value={formatPercent(client.taxPlanner.effectiveTaxRate)} />
                {client.taxPlanner.taxItems.map(item => (
                  <DataRow key={item.id} label={item.name || 'Tax Item'} value={item.amount} />
                ))}
                <DataRow label="Tax Upon Death" value={client.taxPlanner.taxUponDeath} isCalculated />
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
