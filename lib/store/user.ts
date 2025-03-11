import { User } from '@supabase/supabase-js'
import { create } from 'zustand'

// Define types for state & actions
interface UserState {
  user: User | undefined
}

// Create store using the curried form of `create`
export const useUser = create<UserState>()((set) => ({
    user:undefined
}))