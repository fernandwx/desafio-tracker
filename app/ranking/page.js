'use client';
import Link from 'next/link';

export default function RankingPage() {
  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">MKT <span>DOS SONHOS</span></span>
            <nav className="nav">
              <Link href="/">Inicio</Link>
            </nav>
          </div>
        </header>
        <div style={{textAlign:'center',paddingTop:80}}>
          <div style={{fontSize:'2rem',marginBottom:16}}>🔒</div>
          <div style={{fontWeight:700,fontSize:'1.1rem',marginBottom:8}}>Acesso restrito</div>
          <div style={{color:'var(--muted)',fontSize:'0.9rem',marginBottom:24}}>O ranking é visível apenas para a administração.</div>
          <Link href="/admin" className="btn btn-ghost" style={{display:'inline-flex',width:'auto'}}>Ir para o admin</Link>
        </div>
      </div>
    </div>
  );
}
