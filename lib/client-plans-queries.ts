import type { SupabaseClient } from "@supabase/supabase-js"
import {
  type ClientPlan,
  parseStoredAssetBuilder,
  parseStoredDynastyCreator,
  parseStoredIncomeOptimization,
} from "@/lib/types"

type ClientPlanRow = {
  id: string
  client_name: string
  spouse_name?: string
  created_at: string
  updated_at: string
  income_optimization: ClientPlan["incomeOptimization"]
  emergency_builder: ClientPlan["emergencyBuilder"]
  revenue_replacer: ClientPlan["revenueReplacer"]
  asset_builder: ClientPlan["assetBuilder"]
  legacy_enhancer: ClientPlan["legacyEnhancer"]
  legacy_defender: ClientPlan["legacyDefender"]
  dynasty_creator: ClientPlan["dynastyCreator"]
  tax_planner: ClientPlan["taxPlanner"]
}

function rowToClientPlan(row: ClientPlanRow): ClientPlan {
  return {
    id: row.id,
    clientName: row.client_name,
    spouseName: row.spouse_name ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    incomeOptimization: parseStoredIncomeOptimization(row.income_optimization),
    emergencyBuilder: row.emergency_builder,
    revenueReplacer: row.revenue_replacer,
    assetBuilder: parseStoredAssetBuilder(row.asset_builder),
    legacyEnhancer: row.legacy_enhancer,
    legacyDefender: row.legacy_defender,
    dynastyCreator: parseStoredDynastyCreator(row.dynasty_creator),
    taxPlanner: row.tax_planner,
  }
}

export async function queryClientPlans(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null as ClientPlan[] | null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  const plans = (data as ClientPlanRow[]).map(rowToClientPlan)
  return { data: plans, error: null as string | null }
}

export async function insertClientPlan(
  supabase: SupabaseClient,
  plan: ClientPlan,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null as ClientPlan | null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .insert({
      user_id: user.id,
      client_name: plan.clientName,
      spouse_name: plan.spouseName,
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

  const row = data as ClientPlanRow
  return {
    data: {
      ...plan,
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    error: null as string | null,
  }
}

export async function patchClientPlan(
  supabase: SupabaseClient,
  plan: ClientPlan,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null as ClientPlan | null, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("client_plans")
    .update({
      client_name: plan.clientName,
      spouse_name: plan.spouseName,
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

  const row = data as ClientPlanRow
  return {
    data: {
      ...plan,
      updatedAt: row.updated_at,
    },
    error: null as string | null,
  }
}

export async function removeClientPlan(supabase: SupabaseClient, id: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase.from("client_plans").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  return { error: null as string | null }
}
