-- Run manually against the existing `his` database (no migration runner in this repo).
-- Adds support for: personalized premiums computed at medical-verification
-- approval time, monthly/yearly billing cycle choice at payment, and the
-- data needed to enforce a first-month claims block.

ALTER TABLE user_plans
    ADD COLUMN annual_premium BIGINT NOT NULL DEFAULT 0 AFTER monthly_premium,
    ADD COLUMN billing_cycle ENUM('monthly', 'yearly') NULL AFTER annual_premium;

-- Backfill annual_premium for any enrollments created before this column existed.
UPDATE user_plans up
JOIN insurance_plans p ON p.id = up.plan_id
SET up.annual_premium = p.annual_premium
WHERE up.annual_premium = 0;

ALTER TABLE medical_verifications
    ADD COLUMN age INT NOT NULL DEFAULT 30 AFTER user_plan_id;

ALTER TABLE payments
    ADD COLUMN billing_cycle ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly' AFTER amount;
