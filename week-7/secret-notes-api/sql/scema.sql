create table if not exists users (
    id uuid primary key,
    email text unique not null,
    password_hash text not null,
    created_at timestamptz default now()
);

create table if not exists notes (
    id uuid primary key,
    content text not null
);

insert into notes (id, content) values
    (gen_random_uuid(), 'Top secret: React hooks are just functions'),
    (gen_random_uuid(), 'Confidential: TypeScript saves lives'),
    (gen_random_uuid(), 'Classified: Console.log debugging is acceptable');