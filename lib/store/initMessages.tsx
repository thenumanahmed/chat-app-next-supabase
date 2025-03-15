'use client'

import { useEffect, useRef } from 'react'
import { Imessage, useMessages } from './messages'

const InitMessages = ({ messages }: {
    messages: Imessage[]
}) => {
    const initState = useRef(false);

    useEffect(() => {
        if (!initState.current) {
            useMessages.setState({ messages })
        }
        initState.current = true;
    }, [])

    return (<></>)
}

export default InitMessages