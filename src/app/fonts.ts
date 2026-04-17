// app/fonts.ts
import localFont from 'next/font/local';
import { Petit_Formal_Script } from 'next/font/google';

export const formal_script = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: '--formal-script', preload: false });

export const dhyana = localFont({
  src: [
    {
      path: './fonts/dhyana/Dhyana-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/dhyana/Dhyana-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-dhyana',
});