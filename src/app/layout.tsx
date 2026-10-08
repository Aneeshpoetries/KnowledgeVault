import type { Metadata } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import './workspace.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { WorkspaceRoot } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'KnowledgeVault AI',
  description: 'Turn employee experience into a living, searchable organizational memory.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme script — runs before paint to prevent flash */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('vault_theme') || 'light';
                  var isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="bg-[var(--vault-bg)] text-vault-text antialiased font-sans">
        <ThemeProvider>
          <AuthProvider>
            <WorkspaceRoot>{children}</WorkspaceRoot>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
