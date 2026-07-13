-- Run manually against an existing `his` database (no migration runner in this repo).
-- Identity verification now requires admin approval: submissions become
-- 'pending' until an admin marks them verified or rejected.

ALTER TABLE users
    MODIFY COLUMN verification_status ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified';
