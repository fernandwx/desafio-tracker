'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, MEMBERS, calcScore } from '../../lib/supabase';

const MEDALS = ['🥇', '🥈', '🥉'];
const FEELINGS = ['', '😞', '😕', '😐', '🙂', '😄'];

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [todayEntries, setTodayEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false });

    if (!data) { setLoading(false); return; }

    const todayData = data.filter(e => e.date === today);
    setTodayEntries(todayData);

    const totals = MEMBERS.map(name => {
      const entries = data.filter(e => e.user_name === name);
      const totalReels = entries.reduce((s, e) => s + (e.reels || 0), 0);
      const totalTasks = entries.reduce((s, e) => s + (e.tasks || 0), 0);
      const score = totalReels + totalTasks;
      const days = entries.length;
      const lastFeeling = entries[0]?.feeling || 0;
      return { name, score, totalReels, totalTasks, days, lastFeeling };
    });

    totals.sort((a, b) => b.score - a.score);
    setRanking(totals);
    setLoading(false);
  }

  const memberIndex = (name) => MEMBERS.indexOf(name);

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">🔥 Desafio Reta Final</span>
            <nav className="nav">
              <Link href="/">Início</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>

        <div className="hero">
          <h1>Ranking</h1>
          <p>Pontuação acumulada desde o início do desafio</p>
        </div>

        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            <div className="section-title">Placar geral</div>
            <div className="ranking-list">
              {ranking.map((member, i) => (
                <div key={member.name} className={`rank-card ${i === 0 ? 'first' : ''}`}>
                  <div className="rank-pos">{MEDALS[i] || i + 1}</div>
                  <div className={`avatar avatar-${memberIndex(member.name)}`} style={{width:46,height:46,fontSize:'1.1rem',flexShrink:0}}>
                    {member.name[0]}
                  </div>
                  <div className="rank-info">
                    <div className="rank-name">{member.name}</div>
                    <div className="stats-row">
                      <span className="stat-chip">🎬 {member.totalReels} reels</span>
                      <span className="stat-chip">✅ {member.totalTasks} tarefas</span>
                      <span className="stat-chip">📅 {member.days} dias</span>
                      {member.lastFeeling > 0 && (
                        <span className="stat-chip">{FEELINGS[member.lastFeeling]}</span>
                      )}
                    </div>
                  </div>
                  <div className="rank-score">{member.score}</div>
                </div>
              ))}
            </div>

            <div className="section-title">Registros de hoje</div>
            {todayEntries.length === 0 ? (
              <div className="empty">Ninguém registrou ainda hoje.</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:40}}>
                {todayEntries.map(entry => (
                  <div key={entry.id} className="rank-card">
                    <div className={`avatar avatar-${memberIndex(entry.user_name)}`} style={{width:40,height:40,fontSize:'1rem',flexShrink:0}}>
                      {entry.user_name[0]}
                    </div>
                    <div className="rank-info">
                      <div className="rank-name" style={{fontSize:'1rem'}}>{entry.user_name}</div>
                      <div className="rank-meta">{entry.what_did}</div>
                      <div className="stats-row" style={{marginTop:6}}>
                        <span className="stat-chip">🎬 {entry.reels}</span>
                        <span className="stat-chip">✅ {entry.tasks}</span>
                        <span className="stat-chip">{FEELINGS[entry.feeling]}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{textAlign:'center',marginBottom:40}}>
              <Link href="/" className="btn btn-ghost">
                Registrar meu dia
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
