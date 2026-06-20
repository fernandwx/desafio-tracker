'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, MEMBERS, ADMIN_PASSWORD } from '../../lib/supabase';

const FEELINGS = ['', '😞', '😕', '😐', '🙂', '😄'];
const MEMBER_COLORS = ['badge-0', 'badge-1', 'badge-2'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});

  function login(e) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      loadData();
    } else {
      setPwdError(true);
      setPwd('');
    }
  }

  async function loadData() {
    setLoading(true);
    const { data } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (data) {
      setEntries(data);
      const s = {};
      MEMBERS.forEach(name => {
        const memberEntries = data.filter(e => e.user_name === name);
        s[name] = {
          days: memberEntries.length,
          reels: memberEntries.reduce((acc, e) => acc + (e.reels || 0), 0),
          tasks: memberEntries.reduce((acc, e) => acc + (e.tasks || 0), 0),
          avgFeeling: memberEntries.length
            ? (memberEntries.reduce((acc, e) => acc + (e.feeling || 0), 0) / memberEntries.length).toFixed(1)
            : '-',
        };
      });
      setStats(s);
    }
    setLoading(false);
  }

  async function deleteEntry(id) {
    if (!confirm('Excluir este registro?')) return;
    await supabase.from('entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.user_name === filter);

  if (!authed) {
    return (
      <div className="page">
        <div className="container">
          <header className="header">
            <div className="header-inner">
              <span className="logo">🔥 Desafio Reta Final</span>
              <nav className="nav"><Link href="/">Início</Link></nav>
            </div>
          </header>
          <div className="gate">
            <div style={{fontSize:'2.5rem'}}>🔐</div>
            <div style={{fontWeight:700,fontSize:'1.2rem'}}>Acesso Admin</div>
            <form onSubmit={login} style={{display:'flex',flexDirection:'column',gap:12,alignItems:'center'}}>
              <input
                type="password"
                placeholder="Senha"
                value={pwd}
                onChange={e => { setPwd(e.target.value); setPwdError(false); }}
                autoFocus
              />
              {pwdError && <div className="alert alert-error" style={{margin:0,padding:'8px 14px'}}>Senha incorreta</div>}
              <button type="submit" className="btn btn-primary" style={{width:260,marginTop:0}}>
                Entrar
              </button>
            </form>
            <Link href="/" style={{fontSize:'0.8rem',color:'var(--muted)'}}>← Voltar</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">🔥 Admin</span>
            <nav className="nav">
              <Link href="/ranking">Ranking</Link>
              <Link href="/">Início</Link>
            </nav>
          </div>
        </header>

        {/* Stats cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:32}}>
          {MEMBERS.map((name, i) => (
            <div key={name} className="form-card" style={{padding:'18px 20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div className={`avatar avatar-${i}`} style={{width:36,height:36,fontSize:'1rem',margin:0}}>{name[0]}</div>
                <span style={{fontWeight:700}}>{name}</span>
              </div>
              {stats[name] && (
                <div style={{fontSize:'0.8rem',color:'var(--muted)',display:'flex',flexDirection:'column',gap:4}}>
                  <span>📅 {stats[name].days} dias registrados</span>
                  <span>🎬 {stats[name].reels} reels</span>
                  <span>✅ {stats[name].tasks} tarefas</span>
                  <span>💭 Humor médio: {stats[name].avgFeeling} {FEELINGS[Math.round(stats[name].avgFeeling)] || ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
          {['all', ...MEMBERS].map(f => (
            <button
              key={f}
              className={`btn btn-ghost ${filter === f ? 'active' : ''}`}
              style={{padding:'6px 14px',fontSize:'0.8rem',borderColor: filter===f ? 'var(--accent)' : undefined,color: filter===f ? 'var(--text)' : undefined}}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Nenhum registro encontrado.</div>
        ) : (
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Pessoa</th>
                  <th>Reels</th>
                  <th>Tarefas</th>
                  <th>Total</th>
                  <th>Humor</th>
                  <th>Atividades</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td style={{whiteSpace:'nowrap',color:'var(--muted)',fontSize:'0.8rem'}}>
                      {new Date(entry.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <span className={`badge ${MEMBER_COLORS[MEMBERS.indexOf(entry.user_name)]}`}>
                        {entry.user_name}
                      </span>
                    </td>
                    <td style={{textAlign:'center'}}>{entry.reels}</td>
                    <td style={{textAlign:'center'}}>{entry.tasks}</td>
                    <td style={{textAlign:'center',fontWeight:700}}>{(entry.reels||0)+(entry.tasks||0)}</td>
                    <td style={{textAlign:'center'}}>{FEELINGS[entry.feeling]}</td>
                    <td style={{maxWidth:240,fontSize:'0.8rem',color:'var(--muted)'}}>{entry.what_did}</td>
                    <td>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.8rem',padding:'4px 8px',borderRadius:6,transition:'color .2s'}}
                        title="Excluir"
                        onMouseOver={e=>e.target.style.color='var(--red)'}
                        onMouseOut={e=>e.target.style.color='var(--muted)'}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{marginTop:16,color:'var(--muted)',fontSize:'0.8rem'}}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
