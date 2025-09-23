-- Mediflow Healthcare Analytics Platform Database Initialization
-- This script creates the initial database structure and sample data

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial admin user (password: admin123)
INSERT INTO users (
    id, 
    username, 
    email, 
    hashed_password, 
    first_name, 
    last_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    uuid_generate_v4(),
    'admin',
    'admin@mediflow.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8Kz2', -- admin123
    'System',
    'Administrator',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (username) DO NOTHING;

-- Create sample departments
INSERT INTO departments (
    id,
    name,
    department_type,
    description,
    head_of_department,
    total_beds,
    available_beds,
    cost_per_day,
    created_at,
    updated_at
) VALUES 
    (uuid_generate_v4(), 'Emergency Department', 'emergency', 'Emergency medical services and trauma care', 'Dr. Sarah Johnson', 20, 15, 1500.00, NOW(), NOW()),
    (uuid_generate_v4(), 'Cardiology', 'cardiology', 'Heart and cardiovascular care', 'Dr. Michael Chen', 30, 25, 2000.00, NOW(), NOW()),
    (uuid_generate_v4(), 'Surgery', 'surgery', 'General and specialized surgical procedures', 'Dr. Emily Rodriguez', 40, 35, 2500.00, NOW(), NOW()),
    (uuid_generate_v4(), 'ICU', 'icu', 'Intensive care unit for critical patients', 'Dr. David Kim', 15, 12, 3000.00, NOW(), NOW()),
    (uuid_generate_v4(), 'Pediatrics', 'pediatrics', 'Medical care for children and infants', 'Dr. Lisa Thompson', 25, 20, 1800.00, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample beds
DO $$
DECLARE
    dept_record RECORD;
    i INTEGER;
BEGIN
    FOR dept_record IN SELECT id, name, total_beds FROM departments LOOP
        FOR i IN 1..dept_record.total_beds LOOP
            INSERT INTO beds (
                id,
                bed_number,
                department_id,
                room_number,
                bed_type,
                status,
                created_at,
                updated_at
            ) VALUES (
                uuid_generate_v4(),
                dept_record.name || '-' || LPAD(i::text, 3, '0'),
                dept_record.id,
                'Room ' || LPAD(i::text, 3, '0'),
                CASE 
                    WHEN dept_record.name = 'ICU' THEN 'ICU'
                    WHEN dept_record.name = 'Emergency Department' THEN 'Emergency'
                    ELSE 'Standard'
                END,
                CASE 
                    WHEN i <= (dept_record.total_beds - (dept_record.total_beds * 0.25)) THEN 'occupied'
                    ELSE 'available'
                END,
                NOW(),
                NOW()
            ) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create sample staff
DO $$
DECLARE
    dept_record RECORD;
    staff_names TEXT[] := ARRAY['John Smith', 'Jane Doe', 'Robert Johnson', 'Maria Garcia', 'James Wilson', 'Sarah Brown', 'David Lee', 'Jennifer Davis'];
    roles TEXT[] := ARRAY['doctor', 'nurse', 'technician', 'administrator'];
    i INTEGER;
BEGIN
    FOR dept_record IN SELECT id, name FROM departments LOOP
        FOR i IN 1..8 LOOP
            INSERT INTO staff (
                id,
                employee_id,
                first_name,
                last_name,
                email,
                phone,
                department_id,
                role,
                specialization,
                license_number,
                hire_date,
                salary,
                shift_pattern,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                uuid_generate_v4(),
                'EMP' || LPAD(i::text, 4, '0'),
                split_part(staff_names[i], ' ', 1),
                split_part(staff_names[i], ' ', 2),
                lower(split_part(staff_names[i], ' ', 1)) || '.' || lower(split_part(staff_names[i], ' ', 2)) || '@mediflow.com',
                '+1-555-' || LPAD((1000 + i)::text, 4, '0'),
                dept_record.id,
                roles[1 + (i % array_length(roles, 1))],
                CASE 
                    WHEN dept_record.name = 'Cardiology' THEN 'Cardiologist'
                    WHEN dept_record.name = 'Surgery' THEN 'Surgeon'
                    WHEN dept_record.name = 'ICU' THEN 'Intensivist'
                    WHEN dept_record.name = 'Pediatrics' THEN 'Pediatrician'
                    ELSE 'General Medicine'
                END,
                'LIC' || LPAD(i::text, 6, '0'),
                CURRENT_DATE - INTERVAL '1 year' * (i % 5),
                75000 + (i * 5000),
                CASE WHEN i % 2 = 0 THEN 'Day' ELSE 'Night' END,
                true,
                NOW(),
                NOW()
            ) ON CONFLICT (employee_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create sample equipment
DO $$
DECLARE
    dept_record RECORD;
    equipment_types TEXT[] := ARRAY['MRI', 'CT Scanner', 'X-Ray', 'Ultrasound', 'Ventilator', 'Defibrillator', 'ECG Machine', 'Blood Pressure Monitor'];
    i INTEGER;
BEGIN
    FOR dept_record IN SELECT id, name FROM departments LOOP
        FOR i IN 1..5 LOOP
            INSERT INTO equipment (
                id,
                equipment_id,
                name,
                model,
                manufacturer,
                department_id,
                equipment_type,
                status,
                purchase_date,
                warranty_expiry,
                last_maintenance,
                next_maintenance_due,
                maintenance_cost,
                usage_hours,
                max_usage_hours,
                location,
                created_at,
                updated_at
            ) VALUES (
                uuid_generate_v4(),
                'EQ' || LPAD(i::text, 4, '0'),
                equipment_types[i],
                'Model-' || LPAD(i::text, 3, '0'),
                'MedTech Corp',
                dept_record.id,
                equipment_types[i],
                CASE 
                    WHEN i = 1 THEN 'in_use'
                    WHEN i = 2 THEN 'maintenance'
                    ELSE 'available'
                END,
                CURRENT_DATE - INTERVAL '2 years',
                CURRENT_DATE + INTERVAL '1 year',
                CURRENT_DATE - INTERVAL '1 month',
                CURRENT_DATE + INTERVAL '2 months',
                500.00 + (i * 100),
                1000 + (i * 200),
                5000,
                dept_record.name || ' Room ' || LPAD(i::text, 2, '0'),
                NOW(),
                NOW()
            ) ON CONFLICT (equipment_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create sample patients
DO $$
DECLARE
    patient_names TEXT[] := ARRAY['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'];
    genders TEXT[] := ARRAY['male', 'female', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male'];
    i INTEGER;
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO patients (
            id,
            patient_id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            phone,
            email,
            address,
            emergency_contact,
            emergency_phone,
            insurance_provider,
            insurance_number,
            medical_record_number,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            'PAT' || LPAD(i::text, 6, '0'),
            split_part(patient_names[i], ' ', 1),
            split_part(patient_names[i], ' ', 2),
            CURRENT_DATE - INTERVAL '30 years' - (i * INTERVAL '1 year'),
            genders[i],
            '+1-555-' || LPAD((2000 + i)::text, 4, '0'),
            lower(split_part(patient_names[i], ' ', 1)) || '.' || lower(split_part(patient_names[i], ' ', 2)) || '@email.com',
            i || ' Main St, City, State 12345',
            'Emergency Contact ' || i,
            '+1-555-' || LPAD((3000 + i)::text, 4, '0'),
            CASE WHEN i % 2 = 0 THEN 'HealthPlus Insurance' ELSE 'MediCare' END,
            'INS' || LPAD(i::text, 8, '0'),
            'MRN' || LPAD(i::text, 8, '0'),
            NOW(),
            NOW()
        ) ON CONFLICT (patient_id) DO NOTHING;
    END LOOP;
END $$;

-- Create sample admissions
DO $$
DECLARE
    patient_record RECORD;
    dept_record RECORD;
    bed_record RECORD;
    admission_types TEXT[] := ARRAY['emergency', 'elective', 'urgent'];
    i INTEGER := 1;
BEGIN
    FOR patient_record IN SELECT id, patient_id FROM patients LIMIT 5 LOOP
        SELECT * INTO dept_record FROM departments ORDER BY RANDOM() LIMIT 1;
        SELECT * INTO bed_record FROM beds WHERE department_id = dept_record.id AND status = 'occupied' LIMIT 1;
        
        INSERT INTO admissions (
            id,
            patient_id,
            admission_number,
            admission_date,
            admission_time,
            admission_type,
            department_id,
            bed_id,
            primary_diagnosis,
            secondary_diagnoses,
            admission_notes,
            admitting_physician,
            expected_length_of_stay,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            patient_record.id,
            'ADM' || LPAD(i::text, 6, '0'),
            CURRENT_DATE - INTERVAL '1 day' * (i % 7),
            LPAD((8 + (i % 12))::text, 2, '0') || ':' || LPAD((i * 5)::text, 2, '0'),
            admission_types[1 + (i % array_length(admission_types, 1))],
            dept_record.id,
            bed_record.id,
            'Primary diagnosis for patient ' || i,
            'Secondary conditions if any',
            'Admission notes for patient ' || patient_record.patient_id,
            'Dr. ' || (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])[1 + (i % 5)],
            3 + (i % 7),
            NOW(),
            NOW()
        ) ON CONFLICT (admission_number) DO NOTHING;
        
        i := i + 1;
    END LOOP;
END $$;

-- Create sample discharges
DO $$
DECLARE
    admission_record RECORD;
    discharge_statuses TEXT[] := ARRAY['home', 'transfer', 'ama'];
    i INTEGER := 1;
BEGIN
    FOR admission_record IN SELECT id, admission_date, expected_length_of_stay FROM admissions LOOP
        INSERT INTO discharges (
            id,
            admission_id,
            discharge_date,
            discharge_time,
            discharge_status,
            discharge_diagnosis,
            discharge_instructions,
            discharge_physician,
            length_of_stay,
            total_cost,
            insurance_coverage,
            patient_payment,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            admission_record.id,
            admission_record.admission_date + INTERVAL '1 day' * (admission_record.expected_length_of_stay + (i % 3)),
            LPAD((10 + (i % 8))::text, 2, '0') || ':' || LPAD((i * 10)::text, 2, '0'),
            discharge_statuses[1 + (i % array_length(discharge_statuses, 1))],
            'Final diagnosis after treatment',
            'Follow-up care instructions',
            'Dr. ' || (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])[1 + (i % 5)],
            admission_record.expected_length_of_stay + (i % 3),
            5000.00 + (i * 1000),
            4000.00 + (i * 800),
            1000.00 + (i * 200),
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        i := i + 1;
    END LOOP;
END $$;

-- Create sample patient outcomes
DO $$
DECLARE
    patient_record RECORD;
    outcome_types TEXT[] := ARRAY['recovery', 'improvement', 'stable', 'deterioration'];
    i INTEGER := 1;
BEGIN
    FOR patient_record IN SELECT id FROM patients LIMIT 5 LOOP
        INSERT INTO patient_outcomes (
            id,
            patient_id,
            outcome_type,
            outcome_date,
            recovery_time_days,
            treatment_success,
            complications,
            follow_up_required,
            follow_up_date,
            notes,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            patient_record.id,
            outcome_types[1 + (i % array_length(outcome_types, 1))],
            CURRENT_DATE - INTERVAL '1 day' * (i % 30),
            5 + (i % 15),
            CASE WHEN i % 3 = 0 THEN false ELSE true END,
            CASE WHEN i % 4 = 0 THEN 'Minor complications noted' ELSE NULL END,
            CASE WHEN i % 2 = 0 THEN true ELSE false END,
            CASE WHEN i % 2 = 0 THEN CURRENT_DATE + INTERVAL '1 week' ELSE NULL END,
            'Outcome notes for patient ' || i,
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        i := i + 1;
    END LOOP;
END $$;

-- Create sample satisfaction scores
DO $$
DECLARE
    patient_record RECORD;
    i INTEGER := 1;
BEGIN
    FOR patient_record IN SELECT id FROM patients LIMIT 5 LOOP
        INSERT INTO satisfaction_scores (
            id,
            patient_id,
            survey_date,
            overall_satisfaction,
            care_quality,
            communication,
            cleanliness,
            food_quality,
            staff_friendliness,
            pain_management,
            discharge_process,
            would_recommend,
            comments,
            improvement_suggestions,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            patient_record.id,
            CURRENT_DATE - INTERVAL '1 day' * (i % 7),
            3 + (i % 3),
            3 + (i % 3),
            4 + (i % 2),
            4 + (i % 2),
            3 + (i % 3),
            4 + (i % 2),
            3 + (i % 3),
            4 + (i % 2),
            CASE WHEN i % 3 = 0 THEN false ELSE true END,
            'Overall good experience',
            'Could improve waiting times',
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        i := i + 1;
    END LOOP;
END $$;

-- Create sample cost analyses
DO $$
DECLARE
    dept_record RECORD;
    i INTEGER := 1;
BEGIN
    FOR dept_record IN SELECT id, name FROM departments LOOP
        INSERT INTO cost_analyses (
            id,
            analysis_date,
            department_id,
            total_cost,
            staff_cost,
            equipment_cost,
            medication_cost,
            facility_cost,
            other_costs,
            insurance_revenue,
            patient_payment,
            total_revenue,
            profit_margin,
            cost_per_patient_day,
            period_start,
            period_end,
            patient_count,
            average_length_of_stay,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            CURRENT_DATE - INTERVAL '1 day' * (i % 30),
            dept_record.id,
            100000.00 + (i * 10000),
            60000.00 + (i * 6000),
            15000.00 + (i * 1500),
            10000.00 + (i * 1000),
            10000.00 + (i * 1000),
            5000.00 + (i * 500),
            120000.00 + (i * 12000),
            8000.00 + (i * 800),
            128000.00 + (i * 12800),
            20.00 + (i * 2),
            500.00 + (i * 50),
            CURRENT_DATE - INTERVAL '1 month',
            CURRENT_DATE,
            20 + (i * 2),
            5.0 + (i * 0.5),
            NOW(),
            NOW()
        ) ON CONFLICT DO NOTHING;
        
        i := i + 1;
    END LOOP;
END $$;

-- Update department available beds based on occupied beds
UPDATE departments 
SET available_beds = total_beds - (
    SELECT COUNT(*) 
    FROM beds 
    WHERE beds.department_id = departments.id 
    AND beds.status = 'occupied'
);

COMMIT;



