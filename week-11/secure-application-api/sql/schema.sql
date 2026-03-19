drop table if exists users;
drop table if exists notes;

create table users (
    id uuid primary key,
    email text unique not null,
    password text not null,
    role text not null default 'user'
);

create table notes (
    id uuid primary key,
    title text not null,
    content text not null,
    owner_id uuid not null references users(id) on delete cascade
);