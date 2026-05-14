"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, Trash2, ArrowRight, Info, LogOut } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ElementsWheel } from "@/components/elements-wheel"
import type { ClientPlan } from "@/lib/types"

interface ClientsListProps {
  clients: ClientPlan[]
  onSelectClient: (client: ClientPlan) => void
  onCreateClient: () => void
  onDeleteClient: (id: string) => void
  user?: { id: string; email?: string } | null
  onSignOut?: () => void
}

const elementsData = [
  {
    name: "Income Optimization",
    color: "#16a34a",
    description: "Maximizes your retirement income from all sources including Social Security, pensions, and investments. Creates a sustainable withdrawal strategy to ensure you never outlive your money.",
    whatToPrepare: [
      "Social Security benefit statements for all household members",
      "Pension benefit summaries and survivor options",
      "Expected monthly retirement income needs",
      "Part-time work or consulting income projections",
      "Current annuity contracts (if any)"
    ]
  },
  {
    name: "Emergency Builder",
    color: "#2563eb",
    description: "Ensures you have adequate liquid reserves for unexpected expenses and emergencies. This creates a financial safety net before pursuing other goals.",
    whatToPrepare: [
      "Current savings and checking account balances",
      "Money market account statements",
      "Monthly expense breakdown (fixed vs variable)",
      "Desired emergency fund target (typically 3-6 months expenses)",
      "Access to credit lines (for reference)"
    ]
  },
  {
    name: "Revenue Replacer",
    color: "#7c3aed",
    description: "Plans for income replacement if a primary earner passes away or becomes disabled. Protects your family's lifestyle and financial security during difficult times.",
    whatToPrepare: [
      "Current life insurance policies and coverage amounts",
      "Disability insurance coverage details",
      "Social Security survivor benefit estimates",
      "Pension survivor benefit information",
      "Monthly income contribution for each household earner"
    ]
  },
  {
    name: "Asset Builder",
    color: "#991b1b",
    description: "Focuses on growing and protecting your investment portfolio based on your risk tolerance and time horizon. Balances growth potential with downside protection.",
    whatToPrepare: [
      "All investment account statements (401k, IRA, Roth, brokerage)",
      "Current asset allocation breakdown",
      "Risk tolerance assessment or questionnaire",
      "Investment fees and expense ratios",
      "Target retirement date and income needs"
    ]
  },
  {
    name: "Legacy Enhancer",
    color: "#0d9488",
    description: "Helps you give strategically to causes and people you care about, including charitable giving, family support, and educational funding for children or grandchildren.",
    whatToPrepare: [
      "Charitable giving goals and preferred organizations",
      "529 plan or education savings balances",
      "Family gifting intentions and recipients",
      "Donor-advised fund information (if applicable)",
      "Annual gifting budget considerations"
    ]
  },
  {
    name: "Legacy Defender",
    color: "#0891b2",
    description: "Protects your estate from long-term care costs, creditors, and probate expenses. Ensures your assets pass efficiently to your heirs without unnecessary erosion.",
    whatToPrepare: [
      "Long-term care insurance policies (if any)",
      "Estimated long-term care costs in your area",
      "Property ownership details and titles",
      "Current creditor protection strategies",
      "State probate rules and estimated costs"
    ]
  },
  {
    name: "Dynasty Creator",
    color: "#ca8a04",
    description: "Establishes a lasting legacy through proper estate planning, trusts, and beneficiary designations. Minimizes estate taxes and ensures your wishes are followed.",
    whatToPrepare: [
      "Current will and trust documents",
      "Beneficiary designations for all accounts",
      "Total estate value estimate",
      "Funeral and burial preferences or pre-planning",
      "Family tree and heir information"
    ]
  },
  {
    name: "Tax Planner",
    color: "#1d4ed8",
    description: "Optimizes your tax situation through strategic planning, including Roth conversions, tax-loss harvesting, and efficient withdrawal strategies in retirement.",
    whatToPrepare: [
      "Last 2-3 years of tax returns",
      "Current marginal tax bracket",
      "Expected retirement tax bracket",
      "State income tax considerations",
      "Planned Roth conversion amounts (if any)"
    ]
  }
]

function ElementsDetailedGuide() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {elementsData.map((element) => (
        <div 
          key={element.name}
          className="p-5 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div 
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: element.color }}
            />
            <h4 className="font-semibold text-foreground text-sm">{element.name}</h4>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            {element.description}
          </p>
          
          <div>
            <p className="text-[10px] font-medium text-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Info className="size-3" />
              What to Prepare
            </p>
            <ul className="space-y-1">
              {element.whatToPrepare.map((item, i) => (
                <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground/50 mt-px">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ClientsList({ clients, onSelectClient, onCreateClient, onDeleteClient, user, onSignOut }: ClientsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredClients = clients.filter(client =>
    client.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }

  const getTotalAssets = (client: ClientPlan) => {
    return client.assetBuilder?.totalAssets || 0
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {user && (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button 
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={onCreateClient}
              >
                <Plus className="size-4 mr-1.5" />
                New Client
              </Button>
              {onSignOut && (
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimal */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Comprehensive Planning</p>
          <h1 className="text-3xl md:text-4xl font-light text-foreground leading-tight tracking-tight mb-4">
            Eight Elements of
            <span className="block font-medium">Financial Control</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Generate personalized financial plans with intelligent product recommendations.
          </p>
        </div>
      </section>

      {/* Elements Wheel with Tabs */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Guide</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="flex justify-center">
              <ElementsWheel />
            </TabsContent>
            
            <TabsContent value="details">
              <ElementsDetailedGuide />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      {/* Clients Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your Clients</p>
              <h2 className="text-xl font-medium text-foreground">Financial Plans</h2>
            </div>
            {clients.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48 h-9 text-sm bg-transparent border-border"
                />
              </div>
            )}
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-sm mb-6">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={onCreateClient}
                  variant="outline"
                  className="h-10"
                >
                  Create First Client
                  <ArrowRight className="size-3.5 ml-2" />
                </Button>
              )}
            </div>
          ) : (
            /* Client List - Clean Table Style */
            <div className="space-y-px">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="group flex items-center justify-between py-5 px-4 -mx-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => onSelectClient(client)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
                      {client.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                        {client.clientName}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="size-3" />
                        {new Date(client.updatedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-lg font-medium text-foreground tabular-nums">
                      {formatCurrency(getTotalAssets(client))}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteClient(client.id)
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                      <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Client CTA */}
          {clients.length > 0 && (
            <div className="mt-10 pt-10 border-t border-border">
              <button
                onClick={onCreateClient}
                className="w-full py-4 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="size-4" />
                Add New Client
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            Eight Elements of Financial Control
          </p>
        </div>
      </footer>
    </div>
  )
}
