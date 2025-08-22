-- Migration to add requested_date and requested_time columns to consultations table
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS requested_date DATE;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS requested_time TIME; 