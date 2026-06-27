-- ============================================================================
-- 習慣トラッカー: スキーマ + RLS 初期マイグレーション（Issue #D / #34）
-- 設計: research/01-supabase-auth-sync.md §2
--
-- このファイルは「DB をこの形にする」という宣言。Supabase に適用すると
-- テーブル・ポリシー・インデックスが作られる。適用手順は README を参照。
-- ============================================================================

-- 習慣テーブル。1行＝1つの習慣。
create table if not exists public.habits (
  id          uuid        primary key default gen_random_uuid(),
  -- user_id: 所有者。auth.users（Supabase が管理するログインユーザー表）を参照。
  -- default auth.uid() なので、挿入時にログイン中ユーザーの id が自動で入る。
  user_id     uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  name        text        not null,
  created_at  timestamptz not null default now(),
  -- sort_order: 一覧の並び順。将来の並べ替え用。
  sort_order  integer     not null default 0
);

-- 達成記録テーブル。1行＝「ある習慣をある日やった」。
-- 既存の completedDates: string[] を行に正規化したもの（トグル = 行の insert/delete）。
create table if not exists public.completions (
  habit_id  uuid not null references public.habits (id) on delete cascade,
  date_key  date not null,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- 同じ習慣・同じ日は1行だけ（PK で重複を物理的に防ぐ）。
  primary key (habit_id, date_key)
);

-- ----------------------------------------------------------------------------
-- インデックス
-- RLS は user_id で行を絞り込む。SELECT が user_id 条件を多用するので索引を張る。
-- ----------------------------------------------------------------------------
create index if not exists habits_user_id_idx      on public.habits (user_id);
create index if not exists completions_user_id_idx on public.completions (user_id);

-- ----------------------------------------------------------------------------
-- RLS（Row Level Security）: 「自分の行だけ」をDB側で強制する。
-- これを有効化しないと、公開鍵を持つ誰でも全行を読めてしまう（最重要）。
-- ----------------------------------------------------------------------------
alter table public.habits      enable row level security;
alter table public.completions enable row level security;

-- using:      読み取り/更新/削除で「見える行」を auth.uid() = user_id に限定。
-- with check: 挿入/更新で「書ける行」も限定。他人の user_id を詐称した行は弾く。
create policy "own habits" on public.habits
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "own completions" on public.completions
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
