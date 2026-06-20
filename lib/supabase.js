import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const MEMBERS = ['Geovanna', 'Augusta', 'Yan'];

export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'mktdossonhos';

export function calcScore(entry) {
  let score = 0;

  // PRODUCAO
  score += (entry.reels || 0) * 10;
  score += (entry.sprints || 0) * 1;
  score += (entry.carrosseis || 0) * 6;

  // EXECUCAO
  if (entry.deadline_status === 'all') score += 15;
  else if (entry.deadline_status === 'partial') score -= 10;
  else if (entry.deadline_status === 'none') score -= 20;

  // PROATIVIDADE
  if (entry.new_idea) score += 15;
  if (entry.solved_problem) score += 20;
  if (entry.helped_team && entry.helped_team.trim().length > 0) score += 15;

  return score;
}

export function scoreBreakdown(entry) {
  const items = [];
  if (entry.reels > 0) items.push({ label: `${entry.reels} reel(s)`, pts: entry.reels * 10 });
  if (entry.sprints > 0) items.push({ label: `${entry.sprints} sprint(s)`, pts: entry.sprints * 1 });
  if (entry.carrosseis > 0) items.push({ label: `${entry.carrosseis} carrossel(is)`, pts: entry.carrosseis * 6 });
  if (entry.deadline_status === 'all') items.push({ label: 'Tudo no prazo', pts: 15 });
  if (entry.deadline_status === 'partial') items.push({ label: 'Prazo parcial', pts: -10 });
  if (entry.deadline_status === 'none') items.push({ label: 'Fora do prazo', pts: -20 });
  if (entry.new_idea) items.push({ label: 'Ideia nova', pts: 15 });
  if (entry.solved_problem) items.push({ label: 'Problema resolvido', pts: 20 });
  if (entry.helped_team && entry.helped_team.trim()) items.push({ label: 'Ajudou colega', pts: 15 });
  return items;
}
