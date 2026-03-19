insert into users (id, email, password, role) values
    ('11111111-1111-1111-1111-111111111111', 'admin@example.com', 'Admin123!', 'admin'),
    ('22222222-2222-2222-2222-222222222222', 'alice@example.com', 'alice123', 'user'),
    ('33333333-3333-3333-3333-333333333333', 'bob@example.com', 'bob123', 'user');

insert into notes (id, title, content, owner_id) values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Admin Note', 'Sensitive admin content', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Alice Note', 'Alice private note', '22222222-2222-2222-2222-222222222222'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bob Note', 'Bob private note', '33333333-3333-3333-3333-333333333333');