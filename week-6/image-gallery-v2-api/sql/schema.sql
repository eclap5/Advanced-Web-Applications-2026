-- Note that while this is not actually application code, but rather database creation script, we are separating it from the /src directory.

create table if not exists uploads (
    id uuid primary key,
    filename text not null unique,
    original_name text not null,
    mime_type text not null,
    size integer not null,
    uploaded_at timestamptz not null default now()
);

create index if not exists uploads_uploaded_at_idx on uploads (uploaded_at desc);

commit;