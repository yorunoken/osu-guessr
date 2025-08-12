# osu!guessr

Test your knowledge of osu! beatmaps in this engaging guessing game. Challenge yourself to identify songs from their background images, music snippets, or skin elements.

## How to Play

1. Sign in with your osu! account
2. Choose a game mode (currently Background Guessr)
3. Try to guess the song title from the displayed information
4. Earn points based on:
   - Correct answers (+100 base points)
   - Quick responses (time bonus)
   - Consecutive correct answers (streak bonus)

## Documentation

- [Sequence Diagram](./docs/game-flow.md) - Visual representation of the game flow
- [API Documentation](./docs/API.md) - API endpoints and usage

## Translations

We welcome translations to make osu!guessr accessible to more players! Check our [Translation Guide](./docs/Translating.md) to help translate the game into your language.

Currently supported languages:
- English
- Turkish

Want to add your language? Follow the guide and submit a PR!

## Features

- **Background Guessr**: Identify songs from their beatmap backgrounds
- **Audio Guessr** *(Coming Soon)*: Test your music recognition skills
- **Skin Guessr** *(Coming Soon)*: Challenge yourself to recognize popular osu! skins

## Getting Started

1. **Prerequisites**
   - Node.js 18+
   - MySQL database
   - osu! API key

2. **Installation**
   ```bash
   git clone https://github.com/yorunoken/osu-guessr.git
   cd osu-guessr
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables:
   ```env
   # Server Configuration
   PORT=3000
   SERVER_PORT=4000

   # osu! API Configuration
   OSU_CLIENT_ID=your_client_id
   OSU_CLIENT_SECRET=your_client_secret
   OSU_API_KEY=your_api_key

   # NextAuth Configuration
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your_secret_key
   ```

   You'll need to:
   - Register an osu! OAuth application at https://osu.ppy.sh/home/account/edit#oauth
   - Get an osu! API key from https://osu.ppy.sh/p/api
   - Set your `NEXTAUTH_URL` to your domain (use `http://localhost:3000` for local development)
   - Generate a random string for `NEXTAUTH_SECRET`

4. **Database Setup**
   ```bash
   npm run db:migrate
   ```

5. **Development**
   ```bash
   npm run dev
   ```

## Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [MySQL](https://www.mysql.com/) - Database
- [TypeScript](https://www.typescriptlang.org/) - Language

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3) - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the osu! team for providing the API
- All beatmap creators for their amazing work
- The osu! community for their support

## Contact

- GitHub Issues: [Create an issue](https://github.com/yorunoken/osu-guessr/issues)
- Twitter: [@yorunoken727](https://twitter.com/yorunoken727)
