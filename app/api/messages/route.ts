import { NextResponse } from 'next/server'
import { createSupabaseServerObject } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = Math.max(Number(url.searchParams.get('page') ?? '1'), 1)
  const pageSize = Math.max(Number(url.searchParams.get('pageSize') ?? '20'), 1)
  const direction = url.searchParams.get('direction') === 'desc' ? 'desc' : 'asc'
  const start = (page - 1) * pageSize
  const end = page * pageSize - 1

  const supabase = await createSupabaseServerObject()

  const { data: user, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const ascending = direction === 'asc'
  const { data: messagesData, count, error: messagesError } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending })
    .range(start, end)

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 })
  }

  const sendByIds = Array.from(
    new Set((messagesData ?? []).map((message) => message.send_by).filter(Boolean))
  )

  let usersData: Tables<'users'>[] = []
  if (sendByIds.length > 0) {
    const { data, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, created_at')
      .in('id', sendByIds)

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    usersData = data ?? []
  }

  const usersById = new Map<string, Tables<'users'>>()
  usersData.forEach((user) => usersById.set(user.id, user))

  const messages = (messagesData ?? []).map((message) => ({
    ...message,
    users: usersById.get(message.send_by) ?? null,
  }))

  return NextResponse.json({
    messages,
    totalCount: count ?? 0,
    page,
    pageSize,
  })
}
