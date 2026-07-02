import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'ILCNB - Islamic Learning Center of North Broward',
  description: 'Islamic Learning Center of North Broward. A welcoming place of worship, community growth, and learning.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col overflow-x-hidden">
        <Header />
        <main className="flex-grow flex flex-col relative w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
