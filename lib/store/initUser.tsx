'use client'
import type { User } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'
import { useUser } from './user';

const InitUser = ({ user }: {
    user: User | undefined
}) => {
    const initState = useRef(false);

    useEffect(() => {
        if(!initState.current){
            useUser.setState({user})
        }
        initState.current = true;
    }, [])

    return (
        <></>
    )
}

export default InitUser
