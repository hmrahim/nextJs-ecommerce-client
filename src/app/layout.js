import './globals.css';

import Providers from '@/app/providers'

export const metadata = {
  title: 'Moom24',
  description: 'Your eCommerce store',
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}