-- Run manually against the existing `his` database (no migration runner in this repo).
-- Removes the hospitals directory feature. Claims now record a free-text
-- hospital name instead of referencing a managed hospitals table.

ALTER TABLE claims DROP FOREIGN KEY claims_ibfk_3;
ALTER TABLE claims CHANGE COLUMN hospital_id hospital_name VARCHAR(255) NULL;

-- Backfill the free-text name from the hospitals table before it's dropped.
UPDATE claims c
JOIN hospitals h ON h.id = c.hospital_name
SET c.hospital_name = h.name;

DROP TABLE IF EXISTS hospitals;
