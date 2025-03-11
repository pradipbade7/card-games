import React, { useRef, useEffect } from 'react';

/**
 * GameLog component displays a scrollable log of game messages
 * @param {Object} props
 * @param {Array} props.messages - Array of log messages to display
 */
export default function GameLog({ messages = [] }) {
    const logContainerRef = useRef(null);
    
    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [messages]);
    
    // Safely handle the case where messages is undefined or not an array
    if (!messages || !Array.isArray(messages)) {
        return (
            <div className="game-log" ref={logContainerRef}>
                <p>No game activity to display.</p>
            </div>
        );
    }
    
    return (
        <div className="game-log" ref={logContainerRef}>
            {messages.length === 0 ? (
                <p>Game starting...</p>
            ) : (
                messages.map((message, index) => (
                    <p key={`log-${index}`}>{message}</p>
                ))
            )}
        </div>
    );
}