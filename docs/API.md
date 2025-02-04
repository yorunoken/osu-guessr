# osu!guessr API Documentation

This documentation describes the available endpoints for the osu!guessr API.

All requests require an API key provided in the `X-API-Key` header. You can obtain an API key from your account settings.

------------------------------------------------------------------------------------------

## Global Statistics

<details>
 <summary><code>GET</code> <code><b>/api/stats</b></code> <code>(retrieves global game statistics)</code></summary>

##### Parameters

> | name     | type     | data type | description                    |
> |----------|----------|-----------|--------------------------------|
> | `variant`| optional | string    | Game variant (classic or death) |

##### Headers

> | name        |  type     | data type | description                    |
> |-------------|-----------|-----------|--------------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key       |

##### Responses

> | http code | content-type           | response                                   |
> |-----------|------------------------|---------------------------------------------|
> | `200`     | `application/json`     | [Stats Object](#stats-object)              |
> | `403`     | `application/json`     | `{"success":false,"error":"Invalid API key"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" /api/stats?variant=classic
> ```

##### Stats Object

> ```json
> {
>   "success": true,
>   "data": {
>     "total_users": 1000,
>     "total_games": 5000,
>     "highest_points": 10000
>   }
> }
> ```

</details>

------------------------------------------------------------------------------------------

## User Endpoints

<details>
 <summary><code>GET</code> <code><b>/api/users/{userId}</b></code> <code>(get detailed user information)</code></summary>

##### Parameters

> | name     | type     | data type | description          |
> |----------|----------|-----------|----------------------|
> | `userId` | required | number    | The user's Bancho ID |

##### Headers

> | name        |  type     | data type | description              |
> |-------------|-----------|-----------|--------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key |

##### Responses

> | http code | content-type       | response                                   |
> |-----------|-------------------|---------------------------------------------|
> | `200`     | `application/json` | [User Detail Result](#user-detail-result)  |
> | `403`     | `application/json` | `{"success":false,"error":"Invalid API key"}` |
> | `404`     | `application/json` | `{"success":false,"error":"User not found"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" "/api/users/12345"
> ```

##### User Detail Result

> ```json
> {
>   "success": true,
>   "data": {
>     "bancho_id": 12345,
>     "username": "yorunoken",
>     "avatar_url": "https://...",
>     "created_at": "2024-01-28T12:00:00Z",
>     "achievements": [
>       {
>         "user_id": 12345,
>         "game_mode": "background",
>         "variant": "classic",
>         "total_score": 10000,
>         "games_played": 50,
>         "highest_streak": 15,
>         "highest_score": 1000,
>         "last_played": "2024-01-28T12:00:00Z"
>       }
>     ],
>     "ranks": {
>       "globalRank": 42,
>       "modeRanks": {
>         "background": { "globalRank": 24 },
>         "audio": { "globalRank": 56 },
>         "skin": { "globalRank": 89 }
>       }
>     }
>   }
> }
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/api/users/search</b></code> <code>(search for users)</code></summary>

##### Parameters

> | name    | type     | data type | description                                |
> |---------|----------|-----------|--------------------------------------------|
> | `query` | required | string    | Search term (minimum 2 characters)         |
> | `limit` | optional | number    | Maximum number of results (default: 20)    |

##### Headers

> | name        |  type     | data type | description                    |
> |-------------|-----------|-----------|--------------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key       |

##### Responses

> | http code | content-type       | response                                   |
> |-----------|-------------------|---------------------------------------------|
> | `200`     | `application/json` | [User Search Result](#user-search-result)  |
> | `403`     | `application/json` | `{"success":false,"error":"Invalid API key"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" "/api/users/search?query=yorunoken&limit=10"
> ```

##### User Search Result

> ```json
> {
>   "success": true,
>   "data": [
>     {
>       "bancho_id": 12345,
>       "username": "yorunoken",
>       "avatar_url": "https://..."
>     }
>   ]
> }
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/api/users/{userId}/stats</b></code> <code>(get user statistics)</code></summary>

##### Parameters

> | name     | type     | data type | description                                          |
> |----------|----------|-----------|------------------------------------------------------|
> | `userId` | required | number    | The user's Bancho ID                                 |
> | `mode`   | optional | string    | Game mode filter (background, audio, or skin)        |

##### Headers

> | name        |  type     | data type | description                    |
> |-------------|-----------|-----------|--------------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key       |

##### Responses

> | http code | content-type       | response                                   |
> |-----------|-------------------|---------------------------------------------|
> | `200`     | `application/json` | [User Stats Result](#user-stats-result)    |
> | `403`     | `application/json` | `{"success":false,"error":"Invalid API key"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" "/api/users/12345/stats?mode=background"
> ```

##### User Stats Result

> ```json
> {
>   "success": true,
>   "data": [
>     {
>       "user_id": 12345,
>       "game_mode": "background",
>       "total_score": 10000,
>       "games_played": 50,
>       "highest_streak": 15,
>       "highest_score": 1000,
>       "last_played": "2024-01-28T12:00:00Z"
>     }
>   ]
> }
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/api/users/{userId}/games</b></code> <code>(get user's game history)</code></summary>

##### Parameters

> | name     | type     | data type | description                                          |
> |----------|----------|-----------|------------------------------------------------------|
> | `userId` | required | number    | The user's Bancho ID                                 |
> | `mode`   | optional | string    | Game mode filter (background, audio, or skin)        |
> | `limit`  | optional | number    | Maximum number of results (default: 20, max: 100)    |
> | `offset` | optional | number    | Number of results to skip (default: 0)               |

##### Headers

> | name        |  type     | data type | description                    |
> |-------------|-----------|-----------|--------------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key       |

##### Responses

> | http code | content-type       | response                                   |
> |-----------|-------------------|---------------------------------------------|
> | `200`     | `application/json` | [Game History Result](#game-history-result) |
> | `403`     | `application/json` | `{"success":false,"error":"Invalid API key"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" "/api/users/12345/games?mode=background&limit=10"
> ```

##### Game History Result

> ```json
> {
>   "success": true,
>   "data": [
>     {
>       "user_id": 12345,
>       "game_mode": "background",
>       "points": 1000,
>       "streak": 5,
>       "variant": "classic",
>       "ended_at": "2024-01-28T12:00:00Z"
>     }
>   ],
>   "meta": {
>     "total": 50,
>     "offset": 0,
>     "limit": 10
>   }
> }
> ```

</details>

------------------------------------------------------------------------------------------

## Leaderboard

<details>
 <summary><code>GET</code> <code><b>/api/games/leaderboard</b></code> <code>(get global leaderboard)</code></summary>

##### Parameters

> | name    | type     | data type | description                                          |
> |---------|----------|-----------|------------------------------------------------------|
> | `mode`  | optional | string    | Game mode (background, audio, or skin)               |
> | `variant` | optional | string    | Game variant (classic or death)                      |
> | `limit` | optional | number    | Maximum number of results (default: 100, max: 100)   |

##### Headers

> | name        |  type     | data type | description                    |
> |-------------|-----------|-----------|--------------------------------|
> | `X-API-Key` |  required | string    | Your osu!guessr API key       |

##### Responses

> | http code | content-type       | response                                      |
> |-----------|-------------------|-----------------------------------------------|
> | `200`     | `application/json` | [Leaderboard Result](#leaderboard-result)    |
> | `403`     | `application/json` | `{"success":false,"error":"Invalid API key"}` |

##### Example cURL

> ```javascript
> curl -X GET -H "X-API-Key: your-api-key" "/api/games/leaderboard?mode=background&variant=classic&limit=10"
> ```

##### Leaderboard Result

> ```json
> {
>   "success": true,
>   "data": [
>     {
>       "username": "yorunoken",
>       "avatar_url": "https://...",
>       "bancho_id": 12345,
>       "total_score": 50000,
>       "games_played": 100,
>       "highest_streak": 25,
>       "highest_score": 1000,
>       "variant": "classic"
>     }
>   ]
> }
> ```

</details>

------------------------------------------------------------------------------------------

## Rate Limits

No rate limits currently. Don't fuck it with it.

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common error codes:
- `400`: Bad Request - Your request is invalid
- `403`: Forbidden - Invalid or missing API key
- `404`: Not Found - The specified resource could not be found
- `429`: Too Many Requests - You've hit the rate limit
- `500`: Internal Server Error - We had a problem with our server

## Support

If you need help or have questions about the API, you can:
- Open an issue on our [GitHub repository](https://github.com/yorunoken/osu-guessr)
- Contact us on Discord: @yorunoken
