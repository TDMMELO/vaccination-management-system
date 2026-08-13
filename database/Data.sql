INSERT INTO patients (first_name, last_name, gender, date_of_birth, nationality, phone_number)
VALUES ('Ethar', 'Mostafa', 'F', TO_DATE('2004-09-15', 'YYYY-MM-DD'), 'Egyptian', '01212067850');

INSERT INTO patients (
    first_name,
    last_name,
    gender,
    date_of_birth,
    nationality,
    phone_number,
    passport_number
)
VALUES (
    'John',
    'Smith',
    'M',
    '2000-05-15',
    'British',
    '+201012345678',
    'TEST12345'
);

INSERT INTO users (first_name, last_name, username, password_hash, role)
VALUES
    ('Faten', 'Ezzat', 'reception1', 'TEMP_HASH', 'RECEPTIONIST'),
    ('Mostafa', 'Elsayed', 'doctor1', 'TEMP_HASH', 'DOCTOR');

INSERT INTO vaccinations (
    patient_id,
    vaccine,
    date_of_vaccination,
    next_booster_date,
    doctor_id,
	manufacturer
)
VALUES (
    1,
    'Hepatitis B',
    '2026-08-10',
    '2027-08-10',
    2,
	'Hello'
);