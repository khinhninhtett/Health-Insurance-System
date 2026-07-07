-- Run manually against the existing `his` database (no migration runner in this repo).
-- Expands identity verification to collect NRC front + back photos (previously
-- a single combined photo), date of birth, and address.

ALTER TABLE users
    CHANGE COLUMN nrc_photo_path nrc_front_photo_path VARCHAR(255) NULL,
    ADD COLUMN nrc_back_photo_path VARCHAR(255) NULL AFTER nrc_front_photo_path,
    ADD COLUMN date_of_birth DATE NULL AFTER profile_photo_path,
    ADD COLUMN address VARCHAR(500) NULL AFTER date_of_birth;
