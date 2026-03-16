import { supabase } from './supabase'
import type { DbSession, DbAnswer } from './db'

/**
 * Best-effort sync of a completed session to Supabase.
 * Called after the local SQLite write succeeds. Failures are silently swallowed
 * — local data is the source of truth.
 */
export async function syncSession(
  userId: string,
  session: DbSession,
  answers: Omit<DbAnswer, 'session_id'>[],
): Promise<void> {
  // Upsert session row
  const { error: sessionError } = await supabase
    .from('sessions')
    .upsert({
      id: session.id,
      user_id: userId,
      track: session.track,
      level: session.level,
      mode: session.mode,
      domain: session.domain ?? null,
      started_at: session.started_at,
      ended_at: session.ended_at,
      total_q: session.total_q,
      correct: session.correct,
      score_pct: session.score_pct,
      time_secs: session.time_secs,
    })

  if (sessionError) return // abort answers sync if session failed

  if (answers.length === 0) return

  // Upsert all answers in one call
  const { error: answersError } = await supabase
    .from('answers')
    .upsert(
      answers.map(a => ({
        id: a.id,
        session_id: session.id,
        user_id: userId,
        question_id: a.question_id,
        practice_id: a.practice_id,
        domain: a.domain,
        selected_letter: a.selected_letter,
        is_correct: a.is_correct,
        time_secs: a.time_secs,
        answered_at: a.answered_at,
      })),
    )

  if (answersError) {
    // Non-fatal — session row is already synced
  }
}

/**
 * Sync user profile (active_track, exam_date) to Supabase.
 * Called when the user changes their track or exam date.
 */
export async function syncProfile(
  userId: string,
  activeTrack: string,
  examDate: string | null,
): Promise<void> {
  await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      active_track: activeTrack,
      exam_date: examDate,
      updated_at: new Date().toISOString(),
    })
}
