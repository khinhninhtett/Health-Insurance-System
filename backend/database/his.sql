CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    nrc VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'hospital', 'admin') DEFAULT 'customer',
    nrc_front_photo_path VARCHAR(255) NULL,
    nrc_back_photo_path VARCHAR(255) NULL,
    profile_photo_path VARCHAR(255) NULL,
    date_of_birth DATE NULL,
    address VARCHAR(500) NULL,
    verification_status ENUM('unverified', 'pending', 'verified', 'rejected') NOT NULL DEFAULT 'unverified',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin account so the admin panel is reachable on a fresh install.
-- Login: admin@his.com / Admin@123 (password stored as a bcrypt hash below).
INSERT INTO users (name, email, phone, nrc, password, role, verification_status)
SELECT * FROM (SELECT
    'Admin' AS name, 'admin@his.com' AS email, '09123456789' AS phone,
    '1/PaTaMa(N)000001' AS nrc,
    '$2b$10$C.VMpplCv3DhHIfeyeEwX.Lm9Gbz1sD5apPq7Wfdz1dHDmmDrXRKy' AS password,
    'admin' AS role, 'verified' AS verification_status
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@his.com');

CREATE TABLE IF NOT EXISTS insurance_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    coverage_amount BIGINT NOT NULL,
    monthly_premium BIGINT NOT NULL,
    annual_premium BIGINT NOT NULL,
    benefits JSON NOT NULL,
    color VARCHAR(20) DEFAULT 'blue',
    popular BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'archived') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('pending_medical', 'pending_payment', 'active', 'suspended', 'rejected', 'expired') NOT NULL DEFAULT 'pending_medical',
    policy_number VARCHAR(50) UNIQUE,
    monthly_premium BIGINT NOT NULL,
    annual_premium BIGINT NOT NULL DEFAULT 0,
    -- Payment method for the 1-year policy: 'yearly' = single annual payment,
    -- 'monthly' = annual premium split into 12 installments. Coverage is 1 year either way.
    billing_cycle ENUM('monthly', 'yearly') NULL,
    coverage_amount BIGINT NOT NULL,
    coverage_used BIGINT NOT NULL DEFAULT 0,
    start_date DATE NULL,
    end_date DATE NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES insurance_plans(id)
);

CREATE TABLE IF NOT EXISTS medical_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_plan_id INT NOT NULL,
    age INT NOT NULL DEFAULT 30,
    height_cm INT NOT NULL,
    weight_kg INT NOT NULL,
    bmi DECIMAL(4,1) NOT NULL,
    blood_pressure VARCHAR(20),
    heart_rate INT,
    blood_group VARCHAR(5),
    has_chronic_disease BOOLEAN DEFAULT FALSE,
    smoker BOOLEAN DEFAULT FALSE,
    medical_record_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    admin_note VARCHAR(500),
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_plan_id INT NOT NULL,
    installment_id INT NULL,
    method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL,
    billing_cycle ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
    receipt_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reason VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id)
);

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

CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_plan_id INT NOT NULL,
    hospital_name VARCHAR(255) NULL,
    type VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    document_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reason VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id)
);

INSERT INTO insurance_plans (name, description, coverage_amount, monthly_premium, annual_premium, benefits, color, popular)
SELECT * FROM (SELECT
    'Basic Care' AS name,
    'Essential coverage for individuals with basic healthcare needs.' AS description,
    5000000 AS coverage_amount, 25000 AS monthly_premium, 280000 AS annual_premium,
    JSON_ARRAY('Outpatient consultations', 'Emergency care', 'Basic lab tests', 'Generic medications') AS benefits,
    'blue' AS color, FALSE AS popular
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM insurance_plans WHERE name = 'Basic Care');

INSERT INTO insurance_plans (name, description, coverage_amount, monthly_premium, annual_premium, benefits, color, popular)
SELECT * FROM (SELECT
    'Standard Plus', 'Comprehensive coverage for families with broader healthcare needs.',
    15000000, 55000, 620000,
    JSON_ARRAY('All Basic benefits', 'Specialist consultations', 'Surgery coverage', 'Dental & Vision', 'Mental health support'),
    'teal', TRUE
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM insurance_plans WHERE name = 'Standard Plus');

INSERT INTO insurance_plans (name, description, coverage_amount, monthly_premium, annual_premium, benefits, color, popular)
SELECT * FROM (SELECT
    'Premium Elite', 'Premium tier with full coverage including international care.',
    50000000, 120000, 1350000,
    JSON_ARRAY('All Standard benefits', 'International coverage', 'Private room hospitalization', 'Cancer treatment', 'Chronic disease management', 'Annual health screening'),
    'purple', FALSE
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM insurance_plans WHERE name = 'Premium Elite');

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    audience ENUM('customer', 'admin') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    link VARCHAR(255) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);