import { Suspense } from 'react'
import MessagesList from './MessagesList'
import { createServerSideClient } from '@/lib/supabase/server'
import InitMessages from '@/lib/store/initMessages'
import type { Tables } from '@/lib/database.types'
import type { Imessage } from '@/lib/store/messages'

export const ChatMessages = async () => {
  const supabase = await createServerSideClient();

  const { data: user, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return <div>Please log in</div>;
  }

  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (messagesError) {
    return <div>Error loading messages</div>;
  }

  const sendByIds = Array.from(
    new Set((messagesData ?? []).map((message) => message.send_by).filter(Boolean))
  );

  let usersData: Tables<'users'>[] = [];
  if (sendByIds.length > 0) {
    const { data, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, created_at')
      .in('id', sendByIds);

    if (usersError) {
      console.error(usersError);
      return <div>Error loading users</div>;
    }

    usersData = data ?? [];
  }

  const usersById = new Map<string, Tables<'users'>>();
  usersData.forEach((user) => usersById.set(user.id, user));

  const messages: Imessage[] = (messagesData ?? []).map((message) => ({
    ...message,
    users: usersById.get(message.send_by) ?? null,
  }));

  return (
    <Suspense fallback={'loading...'}>
      <MessagesList />
      <InitMessages messages={messages} />
    </Suspense>
  );
}

export default ChatMessages;
