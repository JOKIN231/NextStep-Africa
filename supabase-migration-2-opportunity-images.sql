-- ============================================================
-- Migration: add image support to opportunities
-- Your opportunities table was already created without an image column.
-- Paste this into Supabase SQL Editor -> New query -> Run. Safe to run
-- once; it only adds a column, it doesn't touch existing rows or policies.
-- ============================================================

alter table public.opportunities
  add column if not exists image_url text;
