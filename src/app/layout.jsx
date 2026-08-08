import { Inter, Montserrat, Lora, Germania_One } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

// To switch fonts, simply change which font object is assigned to `activeFont`
const inter = Inter({ subsets: ['latin'], variable: '--font-primary' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-primary' });
const lora = Lora({ subsets: ['latin'], variable: '--font-primary' });
const germaniaOne = Germania_One({ weight: '400', subsets: ['latin'], variable: '--font-primary' });

// CHANGE THIS VARIABLE TO TRY OUT DIFFERENT FONTS
const activeFont = inter; // Change to `montserrat` to test it out

export const metadata = {
  title: 'Islamic Learning Center of North Broward',
  description: 'May peace, mercy, and blessings of Allah be upon you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={activeFont.variable}>
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
