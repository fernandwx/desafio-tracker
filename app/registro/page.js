'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, MEMBERS, calcScore } from '../../lib/supabase';

function RadioGroup({ options, value, onChange }) {
  return (
    <div className="options-list">
      {options.map(opt => (
        <label key={opt.value} className={`option-item ${value === opt.value ? 'selected' : ''}`}>
          <input type="radio" value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} />
          <span className="option-dot"></span>
          <span className="option-text">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="yn-row">
      <button type="button" className={`yn-btn ${value === true ? 'active-yes' : ''}`} onClick={() => onChange(true)}>Sim</button>
      <button type="button" className={`yn-btn ${value === false ? 'active-no' : ''}`} onClick={() => onChange(false)}>Não</button>
    </div>
  );
}

function RegistroForm() {
  const params = useSearchParams();
  const router = useRouter();
  const nome = params.get('nome');

  const [loading, setLoading] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // PRODUCAO
  const [reels, setReels] = useState(0);
  const [didSprints, setDidSprints] = useState(null);
  const [sprints, setSprints] = useState(0);
  const [carrosseis, setCarrosseis] = useState(0);
  const [whatDid, setWhatDid] = useState('');

  // EXECUCAO
  const [deadlineStatus, setDeadlineStatus] = useState('');
  const [extraDemand, setExtraDemand] = useState(null);
  const [extraDemandDesc, setExtraDemandDesc] = useState('');

  // PROATIVIDADE
  const [newIdea, setNewIdea] = useState(null);
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [helpedTeam, setHelpedTeam] = useState('');
  const [solvedProblem, setSolvedProblem] = useState(null);
  const [solvedProblemDesc, setSolvedProblemDesc] = useState('');

  // COMPROMETIMENTO
  const [effortScore, setEffortScore] = useState(5);
  const [redoWhat, setRedoWhat] = useState('');
  const [gaveMax, setGaveMax] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!nome || !MEMBERS.includes(nome)) { router.replace('/'); return; }
    checkToday();
  }, [nome]);

  async function checkToday() {
    const { data } = await supabase.from('entries').select('id').eq('user_name', nome).eq('date', today).single();
    setAlreadyDone(!!data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!deadlineStatus) { setError('Responda se entregou tudo no prazo.'); return; }
    if (newIdea === null) { setError('Responda sobre a ideia nova.'); return; }
    if (solvedProblem === null) { setError('Responda sobre problema resolvido.'); return; }
    if (!gaveMax) { setError('Responda se deu o seu máximo hoje.'); return; }
    if (didSprints === null) { setError('Responda se fez sprints de tráfego.'); return; }
    if (extraDemand === null) { setError('Responda sobre demanda extra.'); return; }
    setError('');
    setSubmitting(true);

    const entry = {
      user_name: nome,
      date: today,
      reels: parseInt(reels) || 0,
      sprints: didSprints ? (parseInt(sprints) || 0) : 0,
      carrosseis: parseInt(carrosseis) || 0,
      what_did: whatDid.trim(),
      deadline_status: deadlineStatus,
      extra_demand: extraDemand,
      extra_demand_desc: extraDemand ? extraDemandDesc.trim() : '',
      new_idea: newIdea,
      new_idea_desc: newIdea ? newIdeaDesc.trim() : '',
      helped_team: helpedTeam.trim(),
      solved_problem: solvedProblem,
      solved_problem_desc: solvedProblem ? solvedProblemDesc.trim() : '',
      effort_score: effortScore,
      redo_what: redoWhat.trim(),
      gave_max: gaveMax,
    };

    entry.score = calcScore(entry);

    const { error: err } = await supabase.from('entries').insert(entry);
    if (err) { setError('Erro ao salvar. Tente novamente.'); setSubmitting(false); return; }

    setSuccess(true);
    setTimeout(() => router.push('/'), 2500);
  }

  const idx = MEMBERS.indexOf(nome);

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="header-inner">
            <span className="logo">MKT <span>DOS SONHOS</span></span>
          </div>
        </header>

        <Link href="/" className="back-link">← Voltar</Link>

        {alreadyDone ? (
          <div className="done-banner">
            <h3>Check-in já realizado</h3>
            <p>Você já registrou o dia de hoje. Volte amanhã.</p>
            <br />
            <Link href="/" className="btn btn-ghost" style={{display:'inline-flex',width:'auto',marginTop:8}}>Voltar ao início</Link>
          </div>
        ) : (
          <div className="form-card">
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:28,paddingBottom:24,borderBottom:'1px solid var(--border)'}}>
              <div className={`avatar avatar-${idx}`} style={{width:48,height:48,fontSize:'1.1rem',margin:0}}>{nome?.[0]}</div>
              <div>
                <div style={{fontWeight:800,fontSize:'1.1rem',letterSpacing:'-.01em'}}>{nome}</div>
                <div style={{fontSize:'0.8rem',color:'var(--muted)',marginTop:2}}>{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</div>
              </div>
            </div>

            {success && <div className="alert alert-success">Check-in registrado. Redirecionando...</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* PRODUCAO */}
              <div className="form-section">
                <div className="section-label">Producao</div>

                <div className="field">
                  <label>Quantos Reels você produziu hoje?</label>
                  <input type="number" min="0" max="99" value={reels} onChange={e=>setReels(e.target.value)} placeholder="0" />
                </div>

                <div className="field">
                  <label>Você fez sprints de tráfego?</label>
                  <YesNo value={didSprints} onChange={setDidSprints} />
                  {didSprints && (
                    <div className="conditional-field">
                      <label>Quantos sprints?</label>
                      <input type="number" min="0" max="99" value={sprints} onChange={e=>setSprints(e.target.value)} placeholder="0" />
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>Quantos Carrosseis você produziu hoje?</label>
                  <input type="number" min="0" max="99" value={carrosseis} onChange={e=>setCarrosseis(e.target.value)} placeholder="0" />
                </div>

                <div className="field">
                  <label>O que você fez hoje?</label>
                  <textarea value={whatDid} onChange={e=>setWhatDid(e.target.value)} placeholder="Descreva suas principais atividades..." required />
                </div>
              </div>

              {/* EXECUCAO */}
              <div className="form-section">
                <div className="section-label">Execucao</div>

                <div className="field">
                  <label>Entregou tudo dentro do prazo?</label>
                  <RadioGroup
                    value={deadlineStatus}
                    onChange={setDeadlineStatus}
                    options={[
                      { value: 'all', label: 'Sim' },
                      { value: 'partial', label: 'Algumas coisas sim, outras não' },
                      { value: 'none', label: 'Não' },
                    ]}
                  />
                </div>

                <div className="field">
                  <label>Teve alguma demanda extra que você resolveu hoje?</label>
                  <YesNo value={extraDemand} onChange={setExtraDemand} />
                  {extraDemand && (
                    <div className="conditional-field">
                      <label>Qual?</label>
                      <textarea value={extraDemandDesc} onChange={e=>setExtraDemandDesc(e.target.value)} placeholder="Descreva a demanda..." style={{minHeight:60}} />
                    </div>
                  )}
                </div>
              </div>

              {/* PROATIVIDADE */}
              <div className="form-section">
                <div className="section-label">Proatividade</div>

                <div className="field">
                  <label>Você trouxe alguma ideia nova hoje?</label>
                  <YesNo value={newIdea} onChange={setNewIdea} />
                  {newIdea && (
                    <div className="conditional-field">
                      <label>Qual?</label>
                      <textarea value={newIdeaDesc} onChange={e=>setNewIdeaDesc(e.target.value)} placeholder="Descreva a ideia..." style={{minHeight:60}} />
                    </div>
                  )}
                </div>

                <div className="field">
                  <label>Você ajudou alguém da equipe? Quem e com o que?</label>
                  <textarea value={helpedTeam} onChange={e=>setHelpedTeam(e.target.value)} placeholder="Deixe em branco se não ajudou ninguém..." style={{minHeight:60}} />
                </div>

                <div className="field">
                  <label>Houve algum problema que você identificou e resolveu sozinho?</label>
                  <YesNo value={solvedProblem} onChange={setSolvedProblem} />
                  {solvedProblem && (
                    <div className="conditional-field">
                      <label>Qual?</label>
                      <textarea value={solvedProblemDesc} onChange={e=>setSolvedProblemDesc(e.target.value)} placeholder="Descreva o problema e como resolveu..." style={{minHeight:60}} />
                    </div>
                  )}
                </div>
              </div>

              {/* COMPROMETIMENTO */}
              <div className="form-section">
                <div className="section-label">Comprometimento</div>

                <div className="field">
                  <label>De 0 a 10, quanto você acha que se esforçou hoje?</label>
                  <div className="effort-wrap">
                    <div className="effort-value">{effortScore}</div>
                    <input type="range" min="0" max="10" step="1" value={effortScore} onChange={e=>setEffortScore(parseInt(e.target.value))} />
                    <div className="effort-labels"><span>0 — Nenhum esforço</span><span>10 — Máximo</span></div>
                  </div>
                </div>

                <div className="field">
                  <label>Se pudesse refazer algo hoje, o que seria?</label>
                  <textarea value={redoWhat} onChange={e=>setRedoWhat(e.target.value)} placeholder="Seja honesto..." required />
                </div>

                <div className="field">
                  <label>Agora no final do dia, você sente que deu o seu máximo?</label>
                  <RadioGroup
                    value={gaveMax}
                    onChange={setGaveMax}
                    options={[
                      { value: 'yes', label: 'Sim' },
                      { value: 'could_more', label: 'Sinto que poderia ter dado mais...' },
                    ]}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting} style={{marginTop:8}}>
                {submitting ? 'Salvando...' : 'Enviar check-in'}
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
