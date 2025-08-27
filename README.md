💎 Karats – Live Precious Metals Prices

This is a React Native (Expo) app that displays live prices for Gold, Silver, Platinum, and Palladium, with caching, refresh quotas, and a modern UI.
Built with Expo Router, designed for cross-platform (Android, iOS, Web).

⸻

✨ Features
	•	📊 Live prices via GoldAPI.io
	•	💾 Local caching using AsyncStorage (works offline)
	•	🔄 Refresh quota → only 2 manual refreshes per day, with prompts to prevent API abuse
	•	🎨 Modern UI → gradient headers, metal tiles, user-friendly names (Gold instead of XAU)
	•	🌐 Web deployment → hosted easily on Vercel with SPA routing

⸻

🚀 Getting Started

1. Clone & Install

git clone https://github.com/alishapriyadarshi/karats.git
cd karats
npm install

2. Configure Environment

Create a .env file in the project root:

EXPO_PUBLIC_GOLDAPI_IO_API_KEY=your-goldapi-key

3. Run the app

# Start dev server (pick Android, iOS, or Web)
npx expo start

Android
	•	Use Expo Go app, or a development build with Android Studio Emulator.
	•	Or run:

npm run android -- --tunnel



iOS
	•	Open in Expo Go or Simulator (requires macOS + Xcode).

Web
	•	Run:

npm run web


	•	Or build static export:

npx expo export --platform web
npx serve dist



⸻

📦 Project Structure

app/               # Expo Router pages (index, details)
components/        # Reusable UI components (MetalTile, etc.)
hooks/             # Custom hooks (api.ts, useMetals.ts)
constants/         # Theme, types, formatting utils


⸻

🌐 Deployment (Web on Vercel)
	1.	Add vercel.json to project root:

{
  "rewrites": [{ "source": "/(.*)", "destination": "/200.html" }]
}


	2.	Set build settings in Vercel:
	•	Build Command: npx expo export --platform web
	•	Output Directory: dist
	3.	Set environment variables in Vercel project:
	•	EXPO_PUBLIC_GOLDAPI_IO_API_KEY = your key
	•	EXPO_PUBLIC_USE_MOCK=1 (recommended for web to save quota)
	4.	Deploy → your app will be live at https://yourproject.vercel.app

⸻

🧠 Notes & Challenges
	•	GoldAPI free tier has very strict limits → solved with caching + refresh limits + mock mode
	•	Replaced deprecated RN shadow* props with modern boxShadow and gradients
	•	Ensured cross-platform header styling (native-stack quirks handled in _layout.tsx)
	•	Added SPA rewrite for proper deep linking on Vercel

⸻

📚 Learn More
	•	Expo Docs – fundamentals & advanced guides
	•	Expo Router – file-based navigation
	•	AsyncStorage – local storage

⸻

👥 Community
	•	Expo on GitHub
	•	Expo Discord
