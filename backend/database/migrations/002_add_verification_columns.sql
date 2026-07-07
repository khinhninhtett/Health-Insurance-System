-- Run manually against the existing `his` database (no migration runner in this repo).
ALTER TABLE users
    ADD COLUMN nrc_photo_path VARCHAR(255) NULL,
    ADD COLUMN profile_photo_path VARCHAR(255) NULL,
    ADD COLUMN verification_status ENUM('unverified', 'verified', 'rejected') NOT NULL DEFAULT 'unverified';
