import './globals.css';
import SiteHeader from '@/components/SiteHeader';

export const metadata = {
  title: 'Story Wall of Hope',
  description:
    'An anonymous wall where people share short stories of help they gave or received during a crisis.'
};

export const viewport = {
  themeColor: '#0F3B4C'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to the stories
        </a>

        <SiteHeader />

        <main id="main">{children}</main>

        <footer className="site-footer">
          <div className="wrap footer-inner">
            <p>
              Student humanitarian project · From Preparedness to Humanity &ndash; Building Resilient
              Communities.
            </p>
            <p className="footer-note">
              Stories are stored as JSON on the server, and every submission is reviewed before it
              appears.
            </p>
            <p>
              <a className="back-link" href="/moderate">
                Moderator access
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
