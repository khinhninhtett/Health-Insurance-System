-- Run manually against an existing `his` database (no migration runner in this repo).
-- One-year policies with two payment methods (annual / monthly installment),
-- installment schedules, and automatic payment & renewal reminders.

-- Policies can now be suspended when an installment stays unpaid past the grace period.
ALTER TABLE user_plans
    MODIFY COLUMN status ENUM('pending_medical', 'pending_payment', 'active', 'suspended', 'rejected', 'expired') NOT NULL DEFAULT 'pending_medical';

-- Link a payment to the installment it settles (NULL for the initial activation payment).
ALTER TABLE payments
    ADD COLUMN installment_id INT NULL AFTER user_plan_id;

-- Monthly-installment schedule for a 1-year policy. Twelve rows are generated
-- when a policy paying by installment is activated; installment 1 is the
-- activation payment itself.
CREATE TABLE IF NOT EXISTS installments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_plan_id INT NOT NULL,
    installment_no INT NOT NULL,
    amount BIGINT NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
    payment_id INT NULL,
    paid_at TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_installment (user_plan_id, installment_no),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id)
);

-- Log of automatic reminders already sent, so the scheduler never sends the
-- same reminder twice. installment_id is 0 for policy-level (renewal) reminders.
CREATE TABLE IF NOT EXISTS reminder_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_plan_id INT NOT NULL,
    installment_id INT NOT NULL DEFAULT 0,
    reminder_type VARCHAR(50) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_reminder (user_plan_id, installment_id, reminder_type),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id)
);

-- Existing active monthly policies were activated with a 1-month end_date under
-- the old logic. Extend them to a full policy year from their start date.
UPDATE user_plans
SET end_date = DATE_ADD(start_date, INTERVAL 1 YEAR)
WHERE status = 'active' AND start_date IS NOT NULL
  AND (end_date IS NULL OR end_date < DATE_ADD(start_date, INTERVAL 1 YEAR));
