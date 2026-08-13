CREATE TABLE patients (
    patient_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    gender VARCHAR(1) NOT NULL
        CHECK (gender IN ('M', 'F')),

    date_of_birth DATE NOT NULL,

    nationality VARCHAR(100) NOT NULL,

    phone_number VARCHAR(20) NOT NULL,

    passport_number VARCHAR(50)
);

CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    username VARCHAR(100) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('RECEPTIONIST', 'DOCTOR'))
);

CREATE TABLE vaccinations (
    vaccination_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    patient_id INTEGER NOT NULL,

    vaccine VARCHAR(100) NOT NULL,

    date_of_vaccination DATE NOT NULL,

    next_booster_date DATE,

    doctor_id INTEGER NOT NULL,

	manufacturer VARCHAR(100) NOT NULL,

    CONSTRAINT fk_vaccination_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id),

    CONSTRAINT fk_vaccination_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES users(user_id),

    CONSTRAINT chk_booster_date
        CHECK (
            next_booster_date IS NULL
            OR next_booster_date >= date_of_vaccination
        )
);