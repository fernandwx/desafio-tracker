'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, MEMBERS, ADMIN_PASSWORD, calcScore, scoreBreakdown } from '../../lib/supabase';

const DEADLINE_LABELS = { all: 'Sim', partial: 'Parcial', none: 'Não' };
const DEADLINE_BADGES = { all: 'badge-ok', partial: 'badge-partial', none: 'badge-fail' };
const MEDALS = ['1°', '2°', '3°'];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('ranking');
  const [filter, setFilter] = useState('all');
  const [ranking, setRanking] = useState([]);
  const [todayEntries, setTodayEntries] = useState([]);

  const today = new Date().toISOString().split('T')[0];

  function login(e) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { setAuthed(true); loadData(); }
    else { setPwdError(true); setPwd(''); }
  }

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from('entries').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });

    if (!data) { setLoading(false); return; }

    // Recalculate scores for all entries
    const enriched = data.map(e => ({ ...e, score: calcScore(e) }));
    setEntries(enriched);
    setTodayEntries(enriched.filter(e => e.date === today));

    // Build ranking
    const totals = MEMBERS.map(name => {
      const memberEntries = enriched.filter(e => e.user_name === name);
      const totalScore = memberEntries.reduce((s, e) => s + (e.score || 0), 0);
      const totalReels = memberEntries.reduce((s, e) => s + (e.reels || 0), 0);
      const totalSprints = memberEntries.reduce((s, e) => s + (e.sprints || 0), 0);
      const totalCarrosseis = memberEntries.reduce((s, e) => s + (e.carrosseis || 0), 0);
      const days = memberEntries.length;
      const avgEffort = days ? (memberEntries.reduce((s, e) => s + (e.effort_score || 0), 0) / days).toFixed(1) : '-';
      const ideas = memberEntries.filter(e => e.new_idea).length;
      const problems = memberEntries.filter(e => e.solved_problem).length;
      const helps = memberEntries.filter(e => e.helped_team && e.helped_team.trim()).length;
      return { name, totalScore, totalReels, totalSprints, totalCarrosseis, days, avgEffort, ideas, problems, helps };
    });
    totals.sort((a, b) => b.totalScore - a.totalScore);
    setRanking(totals);
    setLoading(false);
  }

  async function deleteEntry(id) {
    if (!confirm('Excluir este registro?')) return;
    await supabase.from('entries').delete().eq('id', id);
    setEntries(prev => prev.filter(e => e.id !== id));
    setTodayEntries(prev => prev.filter(e => e.id !== id));
  }

  const filtered = filter === 'all' ? entries : entries.filter(e => e.user_name === filter);
  const memberIdx = name => MEMBERS.indexOf(name);

  if (!authed) {
    return (
      <div className="page">
        <div className="container">
          <header className="header">
            <div className="header-inner">
              <span className="logo">MKT <span>DOS SONHOS</span></span>
              <nav className="nav"><Link href="/">Inicio</Link></nav>
            </div>
          </header>
          <div className="gate">
            <div className="gate-icon">🔐</div>
            <h2>Acesso Restrito</h2>
            <form onSubmit={login} style={{display:'flex',flexDirection:'column',gap:10,alignItems:'center'}}>
              <input type="password" placeholder="Senha" value={pwd} onChange={e=>{setPwd(e.target.value);setPwdError(false);}} autoFocus />
              {pwdError && <div className="alert alert-error" style={{margin:0,padding:'8px 14px'}}>Senha incorreta</div>}
              <button type="submit" className="btn btn-primary" style={{width:240,marginTop:4}}>Entrar</button>
            </form>
            <Link href="/" style={{fontSize:'0.75rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>Voltar</Link>
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
            <span className="logo">MKT <span>DOS SONHOS</span></span>
            <nav className="nav"><Link href="/">Inicio</Link></nav>
          </div>
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab==='ranking'?'active':''}`} onClick={()=>setTab('ranking')}>Ranking</button>
          <button className={`tab-btn ${tab==='hoje'?'active':''}`} onClick={()=>setTab('hoje')}>Hoje</button>
          <button className={`tab-btn ${tab==='historico'?'active':''}`} onClick={()=>setTab('historico')}>Historico</button>
        </div>

        {loading ? <div className="loading">Carregando...</div> : (
          <>
            {/* RANKING */}
            {tab === 'ranking' && (
              <>
                <div className="divider-label">Pontuacao acumulada</div>
                <div className="rank-list">
                  {ranking.map((m, i) => (
                    <div key={m.name} className={`rank-card ${i===0?'first':''}`}>
                      <div className="rank-pos">{MEDALS[i]}</div>
                      <div className={`avatar avatar-${memberIdx(m.name)}`} style={{width:42,height:42,fontSize:'1rem',flexShrink:0}}>{m.name[0]}</div>
                      <div className="rank-info">
                        <div className="rank-name">{m.name}</div>
                        <div className="stat-chips">
                          <span className="chip">{m.days} dias</span>
                          <span className="chip">{m.totalReels} reels</span>
                          <span className="chip">{m.totalSprints} sprints</span>
                          <span className="chip">{m.totalCarrosseis} carrosseis</span>
                          <span className="chip">Esforco medio {m.avgEffort}/10</span>
                          {m.ideas > 0 && <span className="chip">{m.ideas} ideias</span>}
                          {m.problems > 0 && <span className="chip">{m.problems} prob. resolvidos</span>}
                          {m.helps > 0 && <span className="chip">{m.helps}x ajudou</span>}
                        </div>
                      </div>
                      <div className="rank-score">{m.totalScore} pts</div>
                    </div>
                  ))}
                </div>

                {/* Detalhes de pontuacao */}
                <div className="divider-label" style={{marginTop:32}}>Detalhamento de pontos por dia</div>
                {ranking.map(m => {
                  const memberEntries = entries.filter(e => e.user_name === m.name);
                  if (!memberEntries.length) return null;
                  return (
                    <div key={m.name} style={{marginBottom:24}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                        <div className={`avatar avatar-${memberIdx(m.name)}`} style={{width:32,height:32,fontSize:'0.85rem',margin:0}}>{m.name[0]}</div>
                        <span style={{fontWeight:700,fontSize:'0.9rem'}}>{m.name}</span>
                      </div>
                      {memberEntries.slice(0,5).map(e => {
                        const items = scoreBreakdown(e);
                        return (
                          <div key={e.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px',marginBottom:6,display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}>
                            <div>
                              <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:4}}>{new Date(e.date+'T12:00:00').toLocaleDateString('pt-BR')}</div>
                              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                                {items.map((it,idx)=>(
                                  <span key={idx} className="chip" style={{color: it.pts>0?'var(--gold-light)':'#f87171',borderColor: it.pts>0?'rgba(245,158,11,.3)':'rgba(239,68,68,.3)'}}>
                                    {it.label}: {it.pts>0?'+':''}{it.pts}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div style={{fontWeight:800,fontSize:'1.1rem',color: e.score>=0?'var(--accent-light)':'#f87171',flexShrink:0}}>
                              {e.score>=0?'+':''}{e.score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}

            {/* HOJE */}
            {tab === 'hoje' && (
              <>
                <div className="divider-label">Check-ins de hoje</div>
                {todayEntries.length === 0 ? (
                  <div className="empty">Nenhum check-in registrado hoje.</div>
                ) : todayEntries.map(e => (
                  <div key={e.id} style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:'20px 22px',marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className={`avatar avatar-${memberIdx(e.user_name)}`} style={{width:36,height:36,fontSize:'0.9rem',margin:0}}>{e.user_name[0]}</div>
                        <span style={{fontWeight:700}}>{e.user_name}</span>
                      </div>
                      <span style={{fontWeight:800,fontSize:'1.1rem',color:'var(--gold)'}}>{e.score >= 0 ? '+' : ''}{e.score} pts</span>
                    </div>
                    <div style={{fontSize:'0.82rem',color:'var(--muted)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 16px'}}>
                      <div><strong style={{color:'var(--text)'}}>Reels:</strong> {e.reels}</div>
                      <div><strong style={{color:'var(--text)'}}>Sprints:</strong> {e.sprints}</div>
                      <div><strong style={{color:'var(--text)'}}>Carrosseis:</strong> {e.carrosseis}</div>
                      <div><strong style={{color:'var(--text)'}}>Prazo:</strong> <span className={`badge ${DEADLINE_BADGES[e.deadline_status]}`}>{DEADLINE_LABELS[e.deadline_status]}</span></div>
                      <div><strong style={{color:'var(--text)'}}>Esforco:</strong> {e.effort_score}/10</div>
                      <div><strong style={{color:'var(--text)'}}>Deu o maximo:</strong> {e.gave_max==='yes'?'Sim':'Poderia mais'}</div>
                    </div>
                    {e.what_did && <div style={{marginTop:10,fontSize:'0.82rem'}}><strong style={{color:'var(--muted)',display:'block',marginBottom:2}}>O que fez:</strong>{e.what_did}</div>}
                    {e.new_idea && e.new_idea_desc && <div style={{marginTop:8,fontSize:'0.82rem'}}><strong style={{color:'var(--gold)',display:'block',marginBottom:2}}>Ideia nova:</strong>{e.new_idea_desc}</div>}
                    {e.helped_team && <div style={{marginTop:8,fontSize:'0.82rem'}}><strong style={{color:'var(--muted)',display:'block',marginBottom:2}}>Ajudou:</strong>{e.helped_team}</div>}
                    {e.solved_problem && e.solved_problem_desc && <div style={{marginTop:8,fontSize:'0.82rem'}}><strong style={{color:'var(--muted)',display:'block',marginBottom:2}}>Problema resolvido:</strong>{e.solved_problem_desc}</div>}
                    {e.redo_what && <div style={{marginTop:8,fontSize:'0.82rem'}}><strong style={{color:'var(--muted)',display:'block',marginBottom:2}}>Refaria:</strong>{e.redo_what}</div>}
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:10}}>
                      {scoreBreakdown(e).map((it,idx)=>(
                        <span key={idx} className="chip" style={{color:it.pts>0?'var(--gold-light)':'#f87171',borderColor:it.pts>0?'rgba(245,158,11,.3)':'rgba(239,68,68,.3)'}}>
                          {it.label}: {it.pts>0?'+':''}{it.pts}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* HISTORICO */}
            {tab === 'historico' && (
              <>
                <div className="tabs" style={{marginBottom:16}}>
                  {['all',...MEMBERS].map(f=>(
                    <button key={f} className={`tab-btn ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
                      {f==='all'?'Todos':f}
                    </button>
                  ))}
                </div>
                {filtered.length === 0 ? <div className="empty">Nenhum registro.</div> : (
                  <div className="admin-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Pessoa</th>
                          <th>Pts</th>
                          <th>Reels</th>
                          <th>Sprints</th>
                          <th>Carrosseis</th>
                          <th>Prazo</th>
                          <th>Esforco</th>
                          <th>Maximo</th>
                          <th>Ideia</th>
                          <th>Problema</th>
                          <th>Ajudou</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(e=>(
                          <tr key={e.id}>
                            <td style={{whiteSpace:'nowrap',color:'var(--muted)'}}>{new Date(e.date+'T12:00:00').toLocaleDateString('pt-BR')}</td>
                            <td><span className={`badge badge-${memberIdx(e.user_name)}`}>{e.user_name}</span></td>
                            <td><span className={e.score>=0?'score-pos':'score-neg'}>{e.score>=0?'+':''}{e.score}</span></td>
                            <td style={{textAlign:'center'}}>{e.reels}</td>
                            <td style={{textAlign:'center'}}>{e.sprints}</td>
                            <td style={{textAlign:'center'}}>{e.carrosseis}</td>
                            <td><span className={`badge ${DEADLINE_BADGES[e.deadline_status]}`}>{DEADLINE_LABELS[e.deadline_status]}</span></td>
                            <td style={{textAlign:'center'}}>{e.effort_score}/10</td>
                            <td style={{fontSize:'0.75rem',color:'var(--muted)'}}>{e.gave_max==='yes'?'Sim':'Poderia mais'}</td>
                            <td style={{textAlign:'center'}}>{e.new_idea?'Sim':'—'}</td>
                            <td style={{textAlign:'center'}}>{e.solved_problem?'Sim':'—'}</td>
                            <td style={{textAlign:'center'}}>{e.helped_team?'Sim':'—'}</td>
                            <td>
                              <button onClick={()=>deleteEntry(e.id)} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.8rem',padding:'2px 6px',borderRadius:4}} onMouseOver={ev=>ev.target.style.color='var(--red)'} onMouseOut={ev=>ev.target.style.color='var(--muted)'}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{marginTop:10,color:'var(--muted)',fontSize:'0.75rem',textTransform:'uppercase',letterSpacing:'.05em'}}>{filtered.length} registro{filtered.length!==1?'s':''}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
