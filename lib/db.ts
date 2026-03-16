import * as SQLite from 'expo-sqlite'
import type { CMMCDomain, CMMCLevel, ExamTrack, StudyMode } from '@/types'

let _db: SQLite.SQLiteDatabase | null = null

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db
  _db = await SQLite.openDatabaseAsync('cmmc_apex.db')
  await migrate(_db)
  return _db
}

// ─── Migrations ───────────────────────────────────────────────────────────────

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      track       TEXT NOT NULL,
      level       TEXT NOT NULL,
      mode        TEXT NOT NULL,
      domain      TEXT,
      started_at  INTEGER NOT NULL,
      ended_at    INTEGER NOT NULL,
      total_q     INTEGER NOT NULL DEFAULT 0,
      correct     INTEGER NOT NULL DEFAULT 0,
      score_pct   INTEGER NOT NULL DEFAULT 0,
      time_secs   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS answers (
      id              TEXT PRIMARY KEY,
      session_id      TEXT NOT NULL,
      question_id     TEXT NOT NULL,
      practice_id     TEXT NOT NULL,
      domain          TEXT NOT NULL,
      selected_letter TEXT NOT NULL,
      is_correct      INTEGER NOT NULL DEFAULT 0,
      time_secs       INTEGER NOT NULL DEFAULT 0,
      answered_at     INTEGER NOT NULL,
      FOREIGN KEY(session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
    CREATE INDEX IF NOT EXISTS idx_answers_domain  ON answers(domain);
    CREATE INDEX IF NOT EXISTS idx_answers_practice ON answers(practice_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_track  ON sessions(track);
  `)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbSession {
  id: string
  track: ExamTrack
  level: CMMCLevel
  mode: StudyMode
  domain: CMMCDomain | 'mixed' | null
  started_at: number
  ended_at: number
  total_q: number
  correct: number
  score_pct: number
  time_secs: number
}

export interface DbAnswer {
  id: string
  session_id: string
  question_id: string
  practice_id: string
  domain: CMMCDomain
  selected_letter: string
  is_correct: boolean
  time_secs: number
  answered_at: number
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function saveSession(
  session: Omit<DbSession, never>,
  answers: Omit<DbAnswer, 'session_id'>[],
): Promise<void> {
  const db = await getDb()
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT OR REPLACE INTO sessions
        (id, track, level, mode, domain, started_at, ended_at, total_q, correct, score_pct, time_secs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id, session.track, session.level, session.mode,
      session.domain ?? null, session.started_at, session.ended_at,
      session.total_q, session.correct, session.score_pct, session.time_secs,
    )
    for (const a of answers) {
      await db.runAsync(
        `INSERT OR REPLACE INTO answers
          (id, session_id, question_id, practice_id, domain, selected_letter, is_correct, time_secs, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        a.id, session.id, a.question_id, a.practice_id, a.domain,
        a.selected_letter, a.is_correct ? 1 : 0, a.time_secs, a.answered_at,
      )
    }
  })
}

// ─── Reads ────────────────────────────────────────────────────────────────────

/** Per-domain accuracy for a given track across all time */
export async function getDomainScores(track: ExamTrack): Promise<
  Record<string, { answered: number; correct: number; scorePercent: number }>
> {
  const db = await getDb()
  const rows = await db.getAllAsync<{ domain: string; answered: number; correct: number }>(
    `SELECT a.domain, COUNT(*) as answered, SUM(a.is_correct) as correct
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ?
     GROUP BY a.domain`,
    track,
  )
  const result: Record<string, { answered: number; correct: number; scorePercent: number }> = {}
  for (const row of rows) {
    const scorePercent = row.answered === 0 ? 0 : Math.round((row.correct / row.answered) * 100)
    result[row.domain] = { answered: row.answered, correct: row.correct, scorePercent }
  }
  return result
}

/** Per-practice accuracy for a given track across all time */
export async function getPracticeScores(track: ExamTrack): Promise<
  Record<string, { answered: number; correct: number; mastered: boolean }>
> {
  const db = await getDb()
  const rows = await db.getAllAsync<{ practice_id: string; answered: number; correct: number }>(
    `SELECT a.practice_id, COUNT(*) as answered, SUM(a.is_correct) as correct
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ?
     GROUP BY a.practice_id`,
    track,
  )
  const result: Record<string, { answered: number; correct: number; mastered: boolean }> = {}
  for (const row of rows) {
    result[row.practice_id] = {
      answered: row.answered,
      correct: row.correct,
      mastered: row.correct >= 2,
    }
  }
  return result
}

/** IDs of questions answered incorrectly at least once for a given track */
export async function getMissedQuestionIds(track: ExamTrack): Promise<string[]> {
  const db = await getDb()
  const rows = await db.getAllAsync<{ question_id: string }>(
    `SELECT DISTINCT a.question_id
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ? AND a.is_correct = 0`,
    track,
  )
  return rows.map(r => r.question_id)
}

/** Domain with the lowest score (min 5 questions answered) — for weakDomain mode */
export async function getWeakestDomain(track: ExamTrack): Promise<CMMCDomain | null> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ domain: string }>(
    `SELECT a.domain,
            CAST(SUM(a.is_correct) AS REAL) / COUNT(*) AS accuracy
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ?
     GROUP BY a.domain
     HAVING COUNT(*) >= 5
     ORDER BY accuracy ASC
     LIMIT 1`,
    track,
  )
  return (row?.domain as CMMCDomain) ?? null
}

/** Recent sessions (most recent first) */
export async function getRecentSessions(track: ExamTrack, limit = 10): Promise<DbSession[]> {
  const db = await getDb()
  return db.getAllAsync<DbSession>(
    `SELECT * FROM sessions WHERE track = ? ORDER BY ended_at DESC LIMIT ?`,
    track, limit,
  )
}

/** Per-day question counts for the past N days (for weekly chart) */
export async function getDailyActivity(
  track: ExamTrack,
  days = 7,
): Promise<Array<{ date: string; count: number; correct: number }>> {
  const db = await getDb()
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const rows = await db.getAllAsync<{ date: string; count: number; correct: number }>(
    `SELECT date(a.answered_at / 1000, 'unixepoch') as date,
            COUNT(*) as count,
            SUM(a.is_correct) as correct
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ? AND a.answered_at >= ?
     GROUP BY date
     ORDER BY date ASC`,
    track, since,
  )
  return rows
}

/** Score per session in chronological order — for readiness trend line */
export async function getSessionScores(track: ExamTrack, limit = 20): Promise<Array<{ session: number; score: number }>> {
  const db = await getDb()
  const rows = await db.getAllAsync<{ score_pct: number }>(
    `SELECT score_pct FROM sessions
     WHERE track = ? AND total_q >= 5
     ORDER BY ended_at ASC
     LIMIT ?`,
    track, limit,
  )
  return rows.map((r, i) => ({ session: i + 1, score: r.score_pct }))
}

/** Total questions answered and overall accuracy for a track */
export async function getOverallStats(track: ExamTrack): Promise<{
  totalAnswered: number
  totalCorrect: number
  scorePercent: number
  totalSessions: number
}> {
  const db = await getDb()
  const row = await db.getFirstAsync<{ total: number; correct: number; sessions: number }>(
    `SELECT COUNT(a.id) as total,
            SUM(a.is_correct) as correct,
            COUNT(DISTINCT a.session_id) as sessions
     FROM answers a
     JOIN sessions s ON s.id = a.session_id
     WHERE s.track = ?`,
    track,
  )
  const total = row?.total ?? 0
  const correct = row?.correct ?? 0
  return {
    totalAnswered: total,
    totalCorrect: correct,
    scorePercent: total === 0 ? 0 : Math.round((correct / total) * 100),
    totalSessions: row?.sessions ?? 0,
  }
}
