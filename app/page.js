'use client';
import Link from 'next/link';
import { MEMBERS } from '../lib/supabase';

export default function Home() {
  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">MKT <span>DOS SONHOS</span></span>
            <nav className="nav">
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>

        <div className="hero">
          <h1>Check-in <span>diário</span></h1>
          <p>Selecione seu nome para registrar o dia</p>
        </div>

        <div className="members-grid">
          {MEMBERS.map((name, i) => (
            <Link key={name} href={`/registro?nome=${name}`} className="member-card">
              <div className={`avatar avatar-${i}`}>{name[0]}</div>
              <h3>{name}</h3>
              <span>Registrar</span>
            </Link>
          ))}
        </div>

        <div className="admin-link">
          <Link href="/admin">acesso restrito</Link>
        </div>
      </div>
    </div>
  );
}
