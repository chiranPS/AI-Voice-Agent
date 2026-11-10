-- ====================================================================
-- PHASE 2: SELECTIVE MIGRATION & TRANSITION TO APIIT SRI LANKA
-- File: backend/transition_to_apiit.sql
-- ====================================================================

BEGIN;

-- 1. Verify target organisation exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM organisations 
        WHERE id = 'c0e954d5-1e9f-4d10-8493-3553c873c204'
    ) THEN
        RAISE EXCEPTION 'Target organisation c0e954d5-1e9f-4d10-8493-3553c873c204 does not exist!';
    END IF;
END $$;

-- 2. Update organisation details to APIIT Sri Lanka in-place
UPDATE organisations
SET 
    name = 'Asia Pacific Institute of Information Technology (APIIT) Sri Lanka',
    slug = 'apiit-sri-lanka'
WHERE id = 'c0e954d5-1e9f-4d10-8493-3553c873c204';

-- 3. Update existing Administrator user (Preserving password_hash and role)
UPDATE admin_users
SET 
    full_name = 'APIIT Administrator',
    email = 'admin@apiit.lk',
    updated_at = NOW()
WHERE organisation_id = 'c0e954d5-1e9f-4d10-8493-3553c873c204';

-- 4. Clean up old test conversations and messages
DELETE FROM conversation_messages;
DELETE FROM conversation_sessions;

-- 5. Clean up old knowledge documents and vector chunks
DELETE FROM knowledge_document_chunks;
DELETE FROM knowledge_documents;

-- 6. Clean up old fictional Northstar FAQs and Embeddings
DELETE FROM faq_embeddings;
DELETE FROM faq_documents;
DELETE FROM faq_categories;

-- 7. Clean up old fictional university contacts
DELETE FROM university_contacts;

-- 8. Seed verified APIIT Sri Lanka Department Contacts
INSERT INTO university_contacts (
    id, 
    organisation_id, 
    department, 
    phone_number, 
    email, 
    office_location, 
    office_hours, 
    is_active, 
    created_at
) VALUES
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Admissions & Marketing Office',
    '+94 11 767 5100',
    'info@apiit.lk',
    'APIIT City Campus, Access Towers II, Union Place, Colombo 02',
    'Monday to Friday: 8:30 AM - 5:00 PM | Saturday: 8:30 AM - 1:00 PM',
    true,
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'School of Computing & Technology',
    '+94 11 767 5100',
    'computing@apiit.lk',
    'Level 4, APIIT City Campus, Colombo 02',
    'Monday to Friday: 8:30 AM - 4:30 PM',
    true,
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'APIIT Business School',
    '+94 11 767 5100',
    'business@apiit.lk',
    'Level 3, APIIT City Campus, Colombo 02',
    'Monday to Friday: 8:30 AM - 4:30 PM',
    true,
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Student Services & Career Guidance',
    '+94 11 767 5102',
    'studentservices@apiit.lk',
    'Ground Floor, APIIT City Campus, Colombo 02',
    'Monday to Friday: 8:30 AM - 5:00 PM',
    true,
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'IT Services & Technical Support',
    '+94 11 767 5105',
    'itsupport@apiit.lk',
    'Computer Centre, Level 2, APIIT City Campus',
    'Monday to Saturday: 8:00 AM - 6:00 PM',
    true,
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'General Enquiries Hotline',
    '+94 76 578 8788',
    'info@apiit.lk',
    'Main Reception, APIIT City Campus',
    'Available 7 Days: 8:00 AM - 6:00 PM',
    true,
    NOW()
);

-- 9. Seed Core Knowledge Categories for APIIT
INSERT INTO faq_categories (
    id,
    organisation_id,
    name,
    description,
    created_at
) VALUES
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Institutional Profile & Staffordshire Partnership',
    'Overview of APIIT Sri Lanka, campus facilities, and Staffordshire University UK partnership',
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Computing & Technology Programmes',
    'Software Engineering, Computer Science, Cyber Security, and Cloud Computing degrees',
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Business & Management Programmes',
    'Business Management, Accounting & Finance, and International Business degrees',
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Entry Requirements & Academic Pathways',
    'A/L, O/L, APIIT Foundation certificate, and international qualification criteria',
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Tuition Fees & Financial Options',
    'Fee schedules, payment instalment plans, and financial advisory',
    NOW()
),
(
    gen_random_uuid(),
    'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'Career Opportunities & Graduate Employability',
    'Industry placement year, career outcomes, and UK academic progression',
    NOW()
);

COMMIT;