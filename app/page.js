'use client';
import Link from 'next/link';
import { MEMBERS } from '../lib/supabase';

const EMOJIS = ['🌟', '🔥', '⚡'];
const AVATARS = ['G', 'A', 'Y'];

export default function Home() {
  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">🔥 Desafio Reta Final</span>
            <nav className="nav">
              <Link href="/ranking">Ranking</Link>
            </nav>
          </div>
        </header>

        <div className="hero">
          <h1>Quem é você hoje?</h1>
          <p>Selecione seu nome para registrar o dia</p>
        </div>

        <div className="members-grid">
          {MEMBERS.map((name, i) => (
            <Link key={name} href={`/registro?nome=${name}`} className="member-card">
              <div className={`avatar avatar-${i}`}>{AVATARS[i]}</div>
              <h3>{name}</h3>
              <span>Registrar dia {EMOJIS[i]}</span>
            </Link>
          ))}
        </div>

        <div className="admin-link">
          <Link href="/admin">acesso admin</Link>
        </div>
      </div>
    </div>
  );
}
