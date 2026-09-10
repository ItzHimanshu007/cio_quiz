import { createClient, type Client } from '@libsql/client';

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS participants (
  id text PRIMARY KEY NOT NULL,
  full_name text NOT NULL,
  mobile text NOT NULL,
  company text NOT NULL,
  designation text,
  email text,
  enabled integer DEFAULT 1 NOT NULL,
  created_at integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_mobile ON participants (mobile);
CREATE INDEX IF NOT EXISTS idx_participants_name_company ON participants (full_name, company);

CREATE TABLE IF NOT EXISTS participant_sessions (
  token text PRIMARY KEY NOT NULL,
  participant_id text NOT NULL,
  expires_at integer NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS idx_participant_sessions_participant ON participant_sessions (participant_id);

CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY NOT NULL,
  session_number integer NOT NULL,
  name text NOT NULL,
  speaker text NOT NULL,
  description text,
  starts_at integer NOT NULL,
  ends_at integer NOT NULL,
  status text DEFAULT 'UPCOMING' NOT NULL,
  attendance_open integer DEFAULT 0 NOT NULL,
  feedback_open integer DEFAULT 0 NOT NULL,
  quiz_open integer DEFAULT 0 NOT NULL,
  attendance_points integer DEFAULT 10 NOT NULL,
  feedback_points integer DEFAULT 5 NOT NULL,
  quiz_points integer DEFAULT 10 NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_number ON sessions (session_number);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions (status);

CREATE TABLE IF NOT EXISTS session_codes (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  code_hash text NOT NULL,
  display_code text DEFAULT '' NOT NULL,
  expires_at integer NOT NULL,
  created_at integer NOT NULL,
  revoked_at integer,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS idx_session_codes_active ON session_codes (session_id, expires_at);

CREATE TABLE IF NOT EXISTS attendance (
  id text PRIMARY KEY NOT NULL,
  participant_id text NOT NULL,
  session_id text NOT NULL,
  points integer NOT NULL,
  verified_at integer NOT NULL,
  source text DEFAULT 'code' NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique ON attendance (participant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance (session_id);

CREATE TABLE IF NOT EXISTS feedback (
  id text PRIMARY KEY NOT NULL,
  participant_id text NOT NULL,
  session_id text NOT NULL,
  rating integer NOT NULL,
  relevance integer NOT NULL,
  takeaway text,
  points integer NOT NULL,
  created_at integer NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_unique ON feedback (participant_id, session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_session ON feedback (session_id);

CREATE TABLE IF NOT EXISTS scores (
  participant_id text PRIMARY KEY NOT NULL,
  attendance_points integer DEFAULT 0 NOT NULL,
  feedback_points integer DEFAULT 0 NOT NULL,
  quiz_points integer DEFAULT 0 NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  sessions_attended integer DEFAULT 0 NOT NULL,
  updated_at integer NOT NULL,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS idx_scores_leaderboard ON scores (total_points);

CREATE TABLE IF NOT EXISTS draws (
  id text PRIMARY KEY NOT NULL,
  prize text NOT NULL,
  winner_participant_id text,
  eligible_json text NOT NULL,
  status text NOT NULL,
  created_at integer NOT NULL,
  completed_at integer,
  FOREIGN KEY (winner_participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS draw_participants (
  draw_id text NOT NULL,
  participant_id text NOT NULL,
  FOREIGN KEY (draw_id) REFERENCES draws(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_draw_participants_unique ON draw_participants (draw_id, participant_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id text PRIMARY KEY NOT NULL,
  actor_id text NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  detail_json text NOT NULL,
  created_at integer NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs (created_at);

CREATE TABLE IF NOT EXISTS code_attempts (
  id text PRIMARY KEY NOT NULL,
  participant_id text NOT NULL,
  session_id text NOT NULL,
  attempted_at integer NOT NULL,
  success integer NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_code_attempts_rate ON code_attempts (participant_id, attempted_at);

CREATE TABLE IF NOT EXISTS quizzes (
  id text PRIMARY KEY NOT NULL,
  session_id text NOT NULL,
  title text NOT NULL,
  time_limit_seconds integer DEFAULT 60 NOT NULL,
  enabled integer DEFAULT 1 NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id text PRIMARY KEY NOT NULL,
  quiz_id text NOT NULL,
  prompt text NOT NULL,
  options_json text NOT NULL,
  correct_index integer NOT NULL,
  points integer DEFAULT 10 NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id text PRIMARY KEY NOT NULL,
  question_id text NOT NULL,
  participant_id text NOT NULL,
  answer_index integer NOT NULL,
  correct integer NOT NULL,
  points integer NOT NULL,
  created_at integer NOT NULL,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_response_unique ON quiz_responses (question_id, participant_id);
`;

let _client: Client | null = null;
let _schemaPromise: Promise<void> | null = null;

export function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:local.db';
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _client = createClient({ url, authToken });
  }
  return _client;
}

export async function ensureSchema(): Promise<void> {
  if (!_schemaPromise) {
    _schemaPromise = (async () => {
      const client = getClient();
      try {
        await client.executeMultiple(SCHEMA_SQL);
      } catch (err) {
        console.error('Failed to auto-initialize schema:', err);
      }
    })();
  }
  return _schemaPromise;
}

export class PreparedStatement {
  constructor(
    public client: Client,
    public sql: string,
    public args: any[] = []
  ) {}

  bind(...args: any[]): PreparedStatement {
    return new PreparedStatement(this.client, this.sql, args);
  }

  async first<T = any>(): Promise<T | null> {
    await ensureSchema();
    const res = await this.client.execute({ sql: this.sql, args: this.args });
    return (res.rows[0] as unknown as T) ?? null;
  }

  async all<T = any>(): Promise<{ results: T[] }> {
    await ensureSchema();
    const res = await this.client.execute({ sql: this.sql, args: this.args });
    return { results: res.rows as unknown as T[] };
  }

  async run(): Promise<{ success: boolean; meta: any }> {
    await ensureSchema();
    const res = await this.client.execute({ sql: this.sql, args: this.args });
    return { success: true, meta: res };
  }
}

export interface D1CompatDatabase {
  prepare(sql: string): PreparedStatement;
  batch(statements: PreparedStatement[]): Promise<any[]>;
}

export function getDatabase(): D1CompatDatabase {
  const client = getClient();
  return {
    prepare(sql: string): PreparedStatement {
      return new PreparedStatement(client, sql);
    },
    async batch(statements: PreparedStatement[]): Promise<any[]> {
      await ensureSchema();
      const stmts = statements.map((s) => ({ sql: s.sql, args: s.args }));
      return await client.batch(stmts, 'write');
    },
  };
}
