-- Run manually against an existing `his` database (no migration runner in this repo).
-- Adds the full purchase flow: plans, hospitals, enrollment, medical verification, payments, claims.

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

CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    operating_hours VARCHAR(100),
    specialties JSON,
    rating DECIMAL(2,1) DEFAULT 4.5,
    total_beds INT DEFAULT 0,
    verified BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('pending_medical', 'pending_payment', 'active', 'rejected', 'expired') NOT NULL DEFAULT 'pending_medical',
    policy_number VARCHAR(50) UNIQUE,
    monthly_premium BIGINT NOT NULL,
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
    method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    amount BIGINT NOT NULL,
    receipt_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reason VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id)
);

CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_plan_id INT NOT NULL,
    hospital_id INT NULL,
    type VARCHAR(50) NOT NULL,
    service_date DATE NOT NULL,
    amount BIGINT NOT NULL,
    description TEXT,
    document_path VARCHAR(255),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    reason VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (user_plan_id) REFERENCES user_plans(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
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

INSERT INTO hospitals (name, address, phone, email, operating_hours, specialties, rating, total_beds)
SELECT * FROM (SELECT
    'Yangon General Hospital', 'Bogyoke Aung San Road, Pabedan Township, Yangon', '+95 1 256 100', 'info@ygh.com.mm',
    '24/7', JSON_ARRAY('Cardiology', 'Oncology', 'Neurology'), 4.8, 500
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Yangon General Hospital');

INSERT INTO hospitals (name, address, phone, email, operating_hours, specialties, rating, total_beds)
SELECT * FROM (SELECT
    'Asia Royal Hospital', 'No. 14, Baho Road, Sanchaung, Yangon', '+95 1 538 040', 'contact@asiaroyal.com.mm',
    'Mon-Sun: 6:00AM - 10:00PM', JSON_ARRAY('Orthopedics', 'Dermatology', 'Pediatrics'), 4.6, 300
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Asia Royal Hospital');

INSERT INTO hospitals (name, address, phone, email, operating_hours, specialties, rating, total_beds)
SELECT * FROM (SELECT
    'Pun Hlaing Siloam Hospital', 'Pun Hlaing Estate, Hlaing Tharyar, Yangon', '+95 1 684 081', 'info@punhlaing.com.mm',
    '24/7', JSON_ARRAY('Maternity', 'General Surgery', 'Ophthalmology'), 4.7, 250
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Pun Hlaing Siloam Hospital');

INSERT INTO hospitals (name, address, phone, email, operating_hours, specialties, rating, total_beds)
SELECT * FROM (SELECT
    'Parami General Hospital', 'No. 20, Shwe Taung Gyar, Bahan, Yangon', '+95 1 559 444', 'info@parami.com.mm',
    'Mon-Sat: 7:00AM - 9:00PM', JSON_ARRAY('Cardiology', 'Internal Medicine', 'Endocrinology'), 4.5, 200
) AS tmp WHERE NOT EXISTS (SELECT 1 FROM hospitals WHERE name = 'Parami General Hospital');