import './globals.css';

export const metadata = {
  title: 'Desafio Reta Final 🔥',
  description: 'Acompanhamento diário da equipe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
