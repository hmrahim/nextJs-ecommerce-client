import './globals.css';

import Providers from '@/app/providers'

export const metadata = {
  title: 'Moom24',
  description: 'Your eCommerce store',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          Google Translate widget styles — applied as early as possible
          so the translated DOM doesn't flash the "translated by Google"
          banner or shift the page down by 40px on first paint.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .goog-te-banner-frame.skiptranslate { display: none !important; }
              body { top: 0 !important; }
              .goog-tooltip, .goog-tooltip:hover { display: none !important; }
              .goog-text-highlight { background: none !important; box-shadow: none !important; }
              #google_translate_element { display: none !important; }
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
