from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    patient_id = Column(Integer, primary_key=True)

    first_name = Column(String(200), nullable=False)
    last_name = Column(String(200), nullable=False)
    gender = Column(String(1), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    nationality = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    passport_number = Column(String(50), nullable=True)

    vaccinations = relationship(
        "Vaccination",
        back_populates="patient"
    )


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)

    first_name = Column(String(200), nullable=False)
    last_name = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False)
    username = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)

    vaccinations = relationship(
        "Vaccination",
        back_populates="user"
    )


class Vaccination(Base):
    __tablename__ = "vaccinations"

    vaccination_id = Column(Integer, primary_key=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.patient_id"),
        nullable=False
    )

    doctor_id = Column(
        Integer,
        ForeignKey("users.user_id"),
        nullable=False
    )

    vaccine = Column(String(100), nullable=False)
    date_of_vaccination = Column(Date, nullable=False)
    manufacturer = Column(String(100), nullable=False)
    next_booster_date = Column(Date, nullable=True)

    patient = relationship(
        "Patient",
        back_populates="vaccinations"
    )

    user = relationship(
        "User",
        back_populates="vaccinations"
    )