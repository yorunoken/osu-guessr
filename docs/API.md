# osu!guessr API Documentation

This documentation describes the available endpoints for the osu!guessr API.

All requests require an API key provided in the `X-API-Key` header. You can obtain an API key from your account settings.

------------------------------------------------------------------------------------------

## Endpoints

### Get User
```http
GET /api/users/{userId}
```

Retrieves information about a specific user.

**Response Data:**
```typescript
{
    success: true,
    data: {
        bancho_id: number;
        username: string;
        avatar_url: string;
        badges: Array<{
            name: string;
            color: string;
            assigned_at: Date;
        }>;
        created_at: Date;
        achievements?: Array<{
            user_id: number;
            game_mode: "background" | "audio" | "skin";
            variant: "classic" | "death";
            total_score: bigint;
            games_played: number;
            highest_streak: number;
            highest_score: number;
            last_played: Date;
        }>;
        ranks?: {
            globalRank?: {
                classic?: number;
                death?: number;
            };
            modeRanks: {
                background: {
                    classic?: number;
                    death?: number;
                };
                audio: {
                    classic?: number;
                    death?: number;
                };
                skin: {
                    classic?: number;
                    death?: number;
                };
            };
        };
    }
}
```

### Get User's Games
```http
GET /api/users/{userId}/games
```

Retrieves a list of games played by a specific user.

Query Parameters:
- `mode` (optional): Filter by game mode ("background" | "audio" | "skin")
- `limit` (optional): Number of results to return (default: 20, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response Data:**
```typescript
{
    success: true,
    data: Array<{
        user_id: number;
        game_mode: "background" | "audio" | "skin";
        points: number;
        streak: number;
        variant: "classic" | "death";
        ended_at: Date;
    }>,
    meta: {
        total: number;
        offset: number;
        limit: number
    }
}
```

### Get User's Stats
```http
GET /api/users/{userId}/stats
```

Retrieves statistics for a specific user.

Query Parameters:
- `mode` (optional): Filter by game mode ("background" | "audio" | "skin")

**Response Data:**
```typescript
{
    success: true,
    data: {
        user_id: number;
        game_mode: "background" | "audio" | "skin";
        variant: "classic" | "death";
        total_score: bigint;
        games_played: number;
        highest_streak: number;
        highest_score: number;
        last_played: Date;
    }
}
```

### Search Users
```http
GET /api/users/search
```

Search for users by username.

Query Parameters:
- `query`: Search term (min length: 2, max length: 250)
- `limit` (optional): Number of results to return (default: 20, max: 100)

**Response Data:**
```typescript
{
    success: true,
    data: Array<{
        bancho_id: number;
        username: string;
        avatar_url: string;
        badges: Array<{
            name: string;
            color: string;
            assigned_at: Date;
        }>;
        created_at: Date;
    }>
}
```

### Get Leaderboard
```http
GET /api/games/leaderboard
```

Retrieves the global leaderboard.

Query Parameters:
- `mode`: Game mode ("background" | "audio" | "skin")
- `variant`: Game variant ("classic" | "death")
- `limit` (optional): Number of results to return (default: 100, max: 100)

**Response Data:**
```typescript
{
    success: true,
    data: Array<{
        bancho_id: number;
        username: string;
        avatar_url: string;
        total_score: bigint;
        games_played: number;
        highest_streak: number;
        highest_score: number;
        variant: "classic" | "death";
        badges: Array<{
            name: string;
            color: string;
            assigned_at: Date;
        }>;
    }>
}
```

### Get Global Stats
```http
GET /api/stats
```

Retrieves global game statistics.

Query Parameters:
- `variant`: Game variant ("classic" | "death")

**Response Data:**
```typescript
{
    success: true,
    data: {
        highest_points: number;
        total_games: number;
        total_users: number;
    }
}
```

## Response Format

All API responses follow this general structure:

**Success Response:**
```json
{
    "success": true,
    "data": {...}
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "Error message"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request
- 403: Invalid API key
- 404: Resource not found
- 500: Internal Server Error

------------------------------------------------------------------------------------------

## Rate Limits

No rate limits currently. Don't fuck it with it.

## Support

If you need help or have questions about the API, you can:
- Open an issue on our [GitHub repository](https://github.com/yorunoken/osu-guessr)
- Contact us on Discord: @yorunoken
