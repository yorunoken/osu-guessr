Client-Server-Database communication flow

```mermaid
sequenceDiagram
    actor User
    participant Client as GameClient
    participant Server as Server Actions
    participant DB as Database

    User->>Client: Start Game
    Client->>Server: startGameAction()
    Server->>DB: Create game session
    Server->>DB: Get game-related data
    DB-->>Server: Return game-related data
    Server-->>Client: Initial GameState
    Client-->>User: Show game screen

    loop Each Round
        alt User Makes Guess
            User->>Client: Submit guess
            Client->>Server: submitGuessAction(guess)
            Server->>DB: Validate session
            Server->>DB: Check answer
            Server->>DB: Update score & streak
            Server-->>Client: Updated GameState
            Client-->>User: Show result
        else User Skips
            User->>Client: Skip round
            Client->>Server: submitGuessAction(null)
            Server->>DB: Apply skip penalty
            Server-->>Client: Updated GameState
            Client-->>User: Show answer
        end

        User->>Client: Next Round
        Client->>Server: submitGuessAction(undefined)
        Server->>DB: Get new game-related data
        DB-->>Server: Return game-related data
        Server->>DB: Update session
        Server-->>Client: New GameState
        Client-->>User: Show new round
    end

    User->>Client: End Game
    Client->>Server: endGameAction()
    Server->>DB: Save final score
    Server->>DB: Update achievements
    Server->>DB: Delete session
    Server-->>Client: Game ended
    Client-->>User: Show final results
```
