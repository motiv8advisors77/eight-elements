"use server"

import { createClient } from "@/lib/supabase/server"
import {
  insertClientPlan,
  patchClientPlan,
  queryClientPlans,
  removeClientPlan,
} from "@/lib/client-plans-queries"
import { revalidatePath } from "next/cache"
import type { ClientPlan } from "@/lib/types"

export async function getClientPlans() {
  const supabase = await createClient()
  return queryClientPlans(supabase)
}

export async function createClientPlan(plan: ClientPlan) {
  const supabase = await createClient()
  const result = await insertClientPlan(supabase, plan)
  if (!result.error) {
    revalidatePath("/")
  }
  return result
}

export async function updateClientPlan(plan: ClientPlan) {
  const supabase = await createClient()
  const result = await patchClientPlan(supabase, plan)
  if (!result.error) {
    revalidatePath("/")
  }
  return result
}

export async function deleteClientPlan(id: string) {
  const supabase = await createClient()
  const result = await removeClientPlan(supabase, id)
  if (!result.error) {
    revalidatePath("/")
  }
  return result
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
}
