"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import type { ClientPlan } from "@/lib/types"

interface FinancialChartsProps {
  client: ClientPlan
}

const COLORS = {
  primary: "#1a1a1a",
  accent: "#14b8a6",
  warning: "#eab308",
  danger: "#ef4444",
  success: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  blue: "#3b82f6",
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`
  return `$${value.toLocaleString()}`
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
      {message}
    </div>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; payload?: { name?: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border/50 rounded-md px-2.5 py-1.5 shadow-sm text-xs">
        <p className="font-medium">{payload[0].payload?.name || payload[0].name}</p>
        <p className="text-muted-foreground">{formatCurrency(payload[0].value as number)}</p>
      </div>
    )
  }
  return null
}

export function AssetAllocationChart({ client }: FinancialChartsProps) {
  const data = [
    { name: "Qualified", value: client.assetBuilder.qualifiedAssets, fill: COLORS.primary },
    { name: "Non-Qualified", value: client.assetBuilder.nonQualifiedAssets, fill: COLORS.accent },
  ].filter(d => d.value > 0)

  if (data.length === 0) return <EmptyState message="No assets added" />

  return (
    <ChartContainer config={{}} className="h-48 w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={65}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ChartContainer>
  )
}

export function IncomeBreakdownChart({ client }: FinancialChartsProps) {
  const colors = [COLORS.accent, COLORS.primary, COLORS.blue, COLORS.purple, COLORS.orange]
  
  const data = client.incomeOptimization.incomeSources.map((source, index) => ({
    name: source.name || `Source ${index + 1}`,
    amount: source.amount,
    fill: colors[index % colors.length],
  }))

  if (data.length === 0) return <EmptyState message="No income sources" />

  return (
    <ChartContainer config={{}} className="h-48 w-full">
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
        <XAxis type="number" tickFormatter={formatCurrency} fontSize={10} stroke="var(--muted-foreground)" />
        <YAxis type="category" dataKey="name" width={70} fontSize={10} stroke="var(--muted-foreground)" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="amount" radius={[0, 3, 3, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function FinancialOverviewChart({ client }: FinancialChartsProps) {
  const data = [
    { name: "Assets", value: client.assetBuilder.totalAssets, fill: COLORS.accent },
    { name: "LTC", value: client.legacyDefender.totalLongTermCare, fill: COLORS.orange },
    { name: "Tax", value: client.dynastyCreator.totalTaxLiability, fill: COLORS.danger },
    { name: "Life Ins", value: Math.abs(client.revenueReplacer.lifeInsuranceNeeded), fill: COLORS.blue },
  ].filter(d => d.value > 0)

  if (data.length === 0) return <EmptyState message="Add data to see overview" />

  return (
    <ChartContainer config={{}} className="h-48 w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" fontSize={10} tickLine={false} stroke="var(--muted-foreground)" />
        <YAxis tickFormatter={formatCurrency} fontSize={10} stroke="var(--muted-foreground)" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function IncomeGapChart({ client }: FinancialChartsProps) {
  const income = client.incomeOptimization
  const gap = income.monthlyGap

  const data = [
    { name: "Needed", value: income.incomeNeeded, fill: COLORS.primary },
    { name: "Current", value: income.totalIncome, fill: gap >= 0 ? COLORS.success : COLORS.warning },
  ]

  if (income.incomeNeeded === 0 && income.totalIncome === 0) {
    return <EmptyState message="Add income data" />
  }

  return (
    <ChartContainer config={{}} className="h-48 w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="name" fontSize={10} tickLine={false} stroke="var(--muted-foreground)" />
        <YAxis tickFormatter={formatCurrency} fontSize={10} stroke="var(--muted-foreground)" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function LegacyPlanningChart({ client }: FinancialChartsProps) {
  const data = [
    { name: "Goals", value: client.legacyEnhancer.totalGoals, fill: COLORS.purple },
    { name: "LTC", value: client.legacyDefender.totalLongTermCare, fill: COLORS.orange },
    { name: "Probate", value: client.legacyDefender.probateProtectionTotal, fill: COLORS.blue },
    { name: "Tax", value: client.dynastyCreator.totalTaxLiability, fill: COLORS.danger },
  ].filter(d => d.value > 0)

  if (data.length === 0) return <EmptyState message="Add legacy data" />

  return (
    <ChartContainer config={{}} className="h-48 w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={65}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ChartContainer>
  )
}
