import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Navbar from '../components/Navbar';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'TalentLens — AI-Powered Internal Talent Discovery & Mobility',
  description:
    'Internal talent discovery platform by team 4D Developers. Discover hidden competencies from raw engineering work logs, chart directed career progression trees, and execute zero-bias blind matching.',
  authors: [{ name: '4D Developers' }],
};

/**
 * Root application layout establishing the dark editorial theme and persistent navigation.
 * @param {{children: React.ReactNode}} props - Layout properties.
 * @returns {JSX.Element}
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-talent-bg text-talent-text font-sans antialiased selection:bg-talent-teal/30 selection:text-white">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
              {children}
            </main>
            <footer className="border-t border-talent-border bg-talent-surface py-6 text-center text-xs text-talent-muted">
              <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-talent-text">TalentLens</span>
                  <span>•</span>
                  <span>Team: <strong className="text-talent-teal">4D Developers</strong></span>
                  <span>•</span>
                  <span>Hackathon MVP</span>
                </div>
                <div className="font-mono text-[11px] text-talent-subtext">
                  Own AI Engine: @xenova/transformers (all-MiniLM-L6-v2)
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
