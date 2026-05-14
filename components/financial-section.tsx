"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import type { FinancialCategory } from "@/lib/types"

interface FinancialSectionProps {
  title: string
  color: string
  categories: FinancialCategory[]
  onUpdate: (categories: FinancialCategory[]) => void
}

export function FinancialSection({ title, color, categories, onUpdate }: FinancialSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const formatValue = (value: number | string) => {
    if (typeof value === 'string') return value
    if (value === 0) return '$0.00'
    const isNegative = value < 0
    const formatted = Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return isNegative ? `$(${formatted})` : `$${formatted}`
  }

  const handleValueChange = (id: string, newValue: string) => {
    const updated = categories.map(cat => {
      if (cat.id === id) {
        // Try to parse as number, otherwise keep as string
        const numValue = parseFloat(newValue.replace(/[,$()]/g, ''))
        return { ...cat, value: isNaN(numValue) ? newValue : numValue }
      }
      return cat
    })
    onUpdate(updated)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm bg-card">
      <div 
        className="px-4 py-2.5 font-semibold text-sm tracking-wide"
        style={{ backgroundColor: color, color: 'white' }}
      >
        <span className="italic">{title}</span>
      </div>
      <div className="divide-y divide-border/50">
        <div className="grid grid-cols-2 px-3 py-2 text-xs font-semibold bg-muted/50 text-muted-foreground uppercase tracking-wider">
          <span className="italic">Category</span>
          <span className="text-right italic">Total Amount</span>
        </div>
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="grid grid-cols-2 px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
          >
            <span className="text-foreground font-medium">{category.name}</span>
            <div className="text-right">
              {editingId === category.id ? (
                <Input
                  type="text"
                  defaultValue={typeof category.value === 'number' ? category.value.toString() : category.value}
                  className="h-6 text-right text-sm w-28 ml-auto"
                  autoFocus
                  onBlur={(e) => {
                    handleValueChange(category.id, e.target.value)
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValueChange(category.id, e.currentTarget.value)
                      setEditingId(null)
                    }
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <span 
                  className={`cursor-pointer hover:underline ${
                    typeof category.value === 'number' && category.value < 0 
                      ? 'text-destructive' 
                      : 'text-foreground'
                  }`}
                  onClick={() => setEditingId(category.id)}
                >
                  {formatValue(category.value)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
