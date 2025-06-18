// app/fonts.ts
import localFont from 'next/font/local';

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