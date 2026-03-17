import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = (documentId: string, userName: string) => {
    // 1. Swapped useRef for useState
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3001')
        
        // 2. Set the socket in state, which triggers the Editor to re-render
        setSocket(newSocket)

        newSocket.emit("join-document", documentId, userName)

        return () => {
            newSocket.disconnect()
        }
    }, [documentId, userName])

    return socket
}