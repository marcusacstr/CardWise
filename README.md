# CardWise

A white-labeled SaaS platform for financial advisors, travel gurus, and influencers to help their audience optimize credit card rewards based on spending habits.

## Tech Stack

- Next.js 14
- Supabase
- Vercel
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Supabase Setup

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Add these to your `.env.local` file

## Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel project settings
4. Deploy!

## Project Structure

```
src/
├── app/          # Next.js app router pages
├── components/   # React components
├── lib/          # Utility functions and configurations
└── styles/       # Global styles and Tailwind config
``` 