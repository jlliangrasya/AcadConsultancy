-- ============================================================
-- Seed Data — Run AFTER creating auth users in Supabase Dashboard
-- ============================================================
-- IMPORTANT: Before running this, create 3 users in Supabase Auth Dashboard:
--   1. owner@acad.com   (password: your choice)
--   2. fm@acad.com      (password: your choice)
--   3. ops@acad.com     (password: your choice)
-- Then replace the UUIDs below with the actual auth.users UUIDs.

-- ========================
-- System Users (replace UUIDs with real auth.users IDs)
-- ========================
-- INSERT INTO user_profiles (id, full_name, role) VALUES
--   ('REPLACE-WITH-OWNER-UUID', 'Owner Admin', 'owner'),
--   ('REPLACE-WITH-FM-UUID', 'Finance Manager', 'fm'),
--   ('REPLACE-WITH-OPS-UUID', 'Operations Manager', 'ops');

-- ========================
-- Writers
-- ========================
INSERT INTO writers (id, name, email, contact, status) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Juan dela Cruz', 'juan@email.com', '09171234567', 'active'),
  ('a2222222-2222-2222-2222-222222222222', 'Ana Gomez', 'ana@email.com', '09182345678', 'active'),
  ('a3333333-3333-3333-3333-333333333333', 'Mark Reyes', 'mark@email.com', '09193456789', 'active');

-- ========================
-- Sales Agents
-- ========================
INSERT INTO sales_agents (id, name, email, contact, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'Carlo Santos', 'carlo@email.com', '09201234567', 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'Bea Reyes', 'bea@email.com', '09212345678', 'active'),
  ('b3333333-3333-3333-3333-333333333333', 'David Cruz', 'david@email.com', '09223456789', 'active');

-- ========================
-- Sample Clients (10 clients — mix of Regular and Package)
-- Triggers will auto-create: installments, payroll, paper_releases, sales_agent_cuts
-- ========================

-- Client 1: Package, 4 gives, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Maria Clara', '09171111111', 'Package', 'Thesis - Educational Psychology', 'Education', 'PUP', 40000, 4, 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 2026, '2026-01-15', '2026-06-30', 'Active');

-- Client 2: Regular, 2 gives, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Jose Rizal Jr.', '09172222222', 'Regular', 'Research Paper - Philippine History', 'History', 'UST', 15000, 2, 'a2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 2026, '2026-02-01', '2026-04-15', 'Active');

-- Client 3: Package, 3 gives, no agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, year_batch, start_date, due_date, status)
VALUES ('Andres Bonifacio III', '09173333333', 'Package', 'Capstone Project - IT Management', 'Information Technology', 'FEU', 50000, 3, 'a3333333-3333-3333-3333-333333333333', 2026, '2026-01-20', '2026-07-31', 'Active');

-- Client 4: Regular, 1 give, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Gabriela Silang', '09174444444', 'Regular', 'Case Study - Business Ethics', 'Business', 'DLSU', 8000, 1, 'a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 2026, '2026-03-01', '2026-03-30', 'Active');

-- Client 5: Package, 2 gives, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Emilio Aguinaldo', '09175555555', 'Package', 'Thesis - Public Administration', 'Political Science', 'UP Diliman', 60000, 2, 'a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 2026, '2026-01-10', '2026-08-30', 'Active');

-- Client 6: Regular, 2 gives, no agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, year_batch, start_date, due_date, status)
VALUES ('Apolinario Mabini', '09176666666', 'Regular', 'Term Paper - Constitutional Law', 'Law', 'Ateneo', 12000, 2, 'a3333333-3333-3333-3333-333333333333', 2026, '2026-02-15', '2026-04-30', 'Active');

-- Client 7: Package, 4 gives, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Tandang Sora', '09177777777', 'Package', 'Dissertation Chapter 1-3', 'Nursing', 'CEU', 45000, 4, 'a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 2026, '2026-02-01', '2026-09-30', 'Active');

-- Client 8: Regular, 1 give, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Lapu-Lapu Jr.', '09178888888', 'Regular', 'Reaction Paper - Filipino Literature', 'Filipino', 'Mapua', 5000, 1, 'a2222222-2222-2222-2222-222222222222', 'b3333333-3333-3333-3333-333333333333', 2026, '2026-03-10', '2026-03-25', 'Active');

-- Client 9: Package, 3 gives, no agent — carry-over
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, year_batch, start_date, due_date, status, is_carry_over)
VALUES ('Sultan Kudarat', '09179999999', 'Package', 'Thesis - Agricultural Science', 'Agriculture', 'UPLB', 35000, 3, 'a3333333-3333-3333-3333-333333333333', 2025, '2025-09-01', '2026-05-31', 'Carry-over', true);

-- Client 10: Regular, 2 gives, with agent
INSERT INTO clients (name, contact, type, project_name, subject, school, total_amount, gives, writer_id, sales_agent_id, year_batch, start_date, due_date, status)
VALUES ('Diego Silang', '09170000000', 'Regular', 'Feasibility Study - Small Business', 'Entrepreneurship', 'TIP', 18000, 2, 'a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 2026, '2026-03-05', '2026-05-15', 'Active');
