import { useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = (documentId: string) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:3001')

        socketRef.current.emit("join-document", documentId)

        return () => {
            socketRef?.current?.disconnect()
        }
    }, [documentId])

    return socketRef.current
}