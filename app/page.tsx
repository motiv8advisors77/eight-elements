"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ClientsList } from "@/components/clients-list"
import { ClientPlanView } from "@/components/client-plan-view"
import { ClientWizard } from "@/components/client-wizard"
import { createClient } from "@/lib/supabase/client"
import {
  insertClientPlan,
  patchClientPlan,
  queryClientPlans,
  removeClientPlan,
} from "@/lib/client-plans-queries"
import type { ClientPlan } from "@/lib/types"

type ViewMode = 'list' | 'wizard' | 'detail'

export default function FinancialPlannerApp() {
  const router = useRouter()
  const [clients, setClients] = useState<ClientPlan[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientPlan | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)

  // Check authentication and load clients
  const loadData = useCallback(async () => {
    const supabase = createClient()

    // After client-side sign-in, cookies/session can lag one tick behind navigation; retry before sending user back to login.
    let user = (await supabase.auth.getUser()).data.user
    if (!user) {
      for (let attempt = 0; attempt < 6 && !user; attempt++) {
        await new Promise((r) => setTimeout(r, 80 * (attempt + 1)))
        user = (await supabase.auth.getUser()).data.user
      }
    }

    if (!user) {
      router.push("/auth/login")
      return
    }
    
    setUser(user)
    
    const { data, error } = await queryClientPlans(supabase)
    if (error) {
      console.error("Error loading clients:", error)
    } else if (data) {
      setClients(data)
    }
    
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStartWizard = () => {
    setViewMode('wizard')
  }

  const handleWizardComplete = async (client: ClientPlan) => {
    const supabase = createClient()
    const { data, error } = await insertClientPlan(supabase, client)
    if (error) {
      console.error("Error creating client:", error)
      return
    }
    if (data) {
      setClients(prev => [data, ...prev])
      setSelectedClient(data)
      setViewMode('detail')
    }
  }

  const handleWizardCancel = () => {
    setViewMode('list')
  }

  const handleDeleteClient = async (id: string) => {
    const supabase = createClient()
    const { error } = await removeClientPlan(supabase, id)
    if (error) {
      console.error("Error deleting client:", error)
      return
    }
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const handleUpdateClient = async (updatedClient: ClientPlan) => {
    const supabase = createClient()
    const { data, error } = await patchClientPlan(supabase, updatedClient)
    if (error) {
      console.error("Error updating client:", error)
      return
    }
    if (data) {
      setClients(prev => prev.map(c => c.id === data.id ? data : c))
      setSelectedClient(data)
    }
  }

  const handleSelectClient = (client: ClientPlan) => {
    setSelectedClient(client)
    setViewMode('detail')
  }

  const handleBack = () => {
    setSelectedClient(null)
    setViewMode('list')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show wizard view
  if (viewMode === 'wizard') {
    return (
      <ClientWizard
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    )
  }

  // Show client plan view if a client is selected
  if (viewMode === 'detail' && selectedClient) {
    return (
      <ClientPlanView
        client={selectedClient}
        onUpdate={handleUpdateClient}
        onBack={handleBack}
      />
    )
  }

  // Show clients list
  return (
    <ClientsList
      clients={clients}
      onSelectClient={handleSelectClient}
      onCreateClient={handleStartWizard}
      onDeleteClient={handleDeleteClient}
      user={user}
      onSignOut={handleSignOut}
    />
  )
}
