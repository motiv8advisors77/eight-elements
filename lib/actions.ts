"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ClientPlan } from "@/lib/types"

export async function getClientPlans() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  // Transform database rows to ClientPlan format
  const plans: ClientPlan[] = data.map((row) => ({
    id: row.id,
    clientName: row.client_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    incomeOptimization: row.income_optimization,
    emergencyBuilder: row.emergency_builder,
    revenueReplacer: row.revenue_replacer,
    assetBuilder: row.asset_builder,
    legacyEnhancer: row.legacy_enhancer,
    legacyDefender: row.legacy_defender,
    dynastyCreator: row.dynasty_creator,
    taxPlanner: row.tax_planner,
  }))

  return { data: plans, error: null }
}

export async function createClientPlan(plan: ClientPlan) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .insert({
      user_id: user.id,
      client_name: plan.clientName,
      income_optimization: plan.incomeOptimization,
      emergency_builder: plan.emergencyBuilder,
      revenue_replacer: plan.revenueReplacer,
      asset_builder: plan.assetBuilder,
      legacy_enhancer: plan.legacyEnhancer,
      legacy_defender: plan.legacyDefender,
      dynasty_creator: plan.dynastyCreator,
      tax_planner: plan.taxPlanner,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  
  return { 
    data: {
      ...plan,
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }, 
    error: null 
  }
}

export async function updateClientPlan(plan: ClientPlan) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .update({
      client_name: plan.clientName,
      income_optimization: plan.incomeOptimization,
      emergency_builder: plan.emergencyBuilder,
      revenue_replacer: plan.revenueReplacer,
      asset_builder: plan.assetBuilder,
      legacy_enhancer: plan.legacyEnhancer,
      legacy_defender: plan.legacyDefender,
      dynasty_creator: plan.dynastyCreator,
      tax_planner: plan.taxPlanner,
    })
    .eq("id", plan.id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  
  return { 
    data: {
      ...plan,
      updatedAt: data.updated_at,
    }, 
    error: null 
  }
}

export async function deleteClientPlan(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("client_plans")
    .delete()
    .eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/")
  
  return { error: null }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
}
