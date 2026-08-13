from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    PatientCreate,
    PatientResponse,
    VaccinationResponse,
    PatientSearchResponse
)
from app.dependencies import require_receptionist, get_current_user


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


@router.post(
    "",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
def create_patient(
    patient: PatientCreate,
    current_user: models.User = Depends(require_receptionist),
    db: Session = Depends(get_db)
):
    new_patient = models.Patient(
        first_name=patient.first_name,
        last_name=patient.last_name,
        gender=patient.gender,
        date_of_birth=patient.date_of_birth,
        nationality=patient.nationality,
        phone_number=patient.phone_number,
        passport_number=patient.passport_number
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient

@router.get(
    "",
    response_model=list[PatientResponse]
)
def get_patients(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    patients = db.query(models.Patient).all()

    return patients

@router.get(
    "/search",
    response_model=list[PatientSearchResponse]
)
def search_patients(
    phone: str | None = None,
    passport: str | None = None,
    name: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.Patient)

    if phone:
        query = query.filter(
            models.Patient.phone_number == phone
        )

    if passport:
        query = query.filter(
            models.Patient.passport_number == passport
        )

    if name:
        query = query.filter(
            (models.Patient.first_name.ilike(f"%{name}%")) |
            (models.Patient.last_name.ilike(f"%{name}%"))
        )

    patients = query.all()

    return patients

@router.get(
    "/{patient_id}/vaccinations",
    response_model=list[VaccinationResponse]
)
def get_patient_vaccinations(
    patient_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.patient_id == patient_id
        )
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    return patient.vaccinations

@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    patient = (
        db.query(models.Patient)
        .filter(models.Patient.patient_id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    return patient