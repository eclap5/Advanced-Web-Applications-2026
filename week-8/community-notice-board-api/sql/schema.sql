create table if not exists users (
    id uuid primary key,
    email text unique not null,
    password_hash text not null,
    role text not null check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table if not exists notifications (
    id uuid primary key,
    title text not null,
    content text not null,
    created_at timestamptz not null default now(),
    created_by uuid not null references users(id) on delete cascade
);