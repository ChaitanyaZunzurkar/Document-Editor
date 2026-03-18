import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

// 1. Add userId to the hook parameters
export const useSocket = (documentId: string, userName: string, userId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3001')
        setSocket(newSocket)

        // 2. Send the userId in the join-document event
        newSocket.emit("join-document", documentId, userName, userId)

        return () => {
            newSocket.disconnect()
        }
    }, [documentId, userName, userId])

    return socket
}