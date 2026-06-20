'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, MEMBERS } from '../../lib/supabase';

const FEELINGS = ['😞', '😕', '😐', '🙂', '😄'];
const FEELING_LABELS = ['Péssimo', '', '', '', 'Ótimo'];

function RegistroForm() {
  const params = useSearchParams();
  const router = useRouter();
  const nome = params.get('nome');

  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [reels, setReels] = useState('');
  const [tasks, setTasks] = useState('');
  const [whatDid, setWhatDid] = useState('');
  const [feeling, setFeeling] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!nome || !MEMBERS.includes(nome)) {
      router.replace('/');
      return;
    }
    checkToday();
  }, [nome]);

  async function checkToday() {
    const { data } = await supabase
      .from('entries')
      .select('id')
      .eq('user_name', nome)
      .eq('date', today)
      .single();
    setAlreadyDone(!!data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!feeling) { setError('Selecione como está se sentindo'); return; }
    setError('');
    setSubmitting(true);

    const { error: err } = await supabase.from('entries').insert({
      user_name: nome,
      date: today,
      reels: parseInt(reels) || 0,
      tasks: parseInt(tasks) || 0,
      what_did: whatDid.trim(),
      feeling,
    });

    if (err) {
      setError('Erro ao salvar. Tente novamente.');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/ranking'), 2000);
  }

  const idx = MEMBERS.indexOf(nome);

  if (loading) return <div className="loading">Carregando...</div>;

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

        <Link href="/" className="back-link">← Voltar</Link>

        {alreadyDone ? (
          <div className="done-banner">
            <h3>✅ Você já registrou hoje!</h3>
            <p>Volte amanhã para um novo registro.</p>
            <br />
            <Link href="/ranking" className="btn btn-primary" style={{display:'inline-flex',width:'auto',marginTop:8}}>
              Ver ranking
            </Link>
          </div>
        ) : (
          <div className="form-card">
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:24}}>
              <div className={`avatar avatar-${idx}`} style={{width:52,height:52,fontSize:'1.3rem',margin:0}}>{['G','A','Y'][idx]}</div>
              <div>
                <div className="form-title">{nome}</div>
                <div className="form-sub">{new Date().toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'long'})}</div>
              </div>
            </div>

            {success && <div className="alert alert-success">✅ Registro salvo! Redirecionando para o ranking...</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div className="field">
                  <label>🎬 Reels gravados</label>
                  <input
                    type="number" min="0" max="99"
                    value={reels}
                    onChange={e => setReels(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="field">
                  <label>✅ Tarefas concluídas</label>
                  <input
                    type="number" min="0" max="99"
                    value={tasks}
                    onChange={e => setTasks(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>📝 O que você fez hoje?</label>
                <textarea
                  value={whatDid}
                  onChange={e => setWhatDid(e.target.value)}
                  placeholder="Descreva suas principais atividades do dia..."
                  required
                />
              </div>

              <div className="field">
                <label>💭 Como você está se sentindo?</label>
                <div className="feeling-row">
                  {FEELINGS.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`feeling-btn ${feeling === i + 1 ? 'active' : ''}`}
                      onClick={() => setFeeling(i + 1)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="feeling-labels">
                  <span>{FEELING_LABELS[0]}</span>
                  <span>{FEELING_LABELS[4]}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Registrar dia 🚀'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="loading">Carregando...</div>}>
      <RegistroForm />
    </Suspense>
  );
}
