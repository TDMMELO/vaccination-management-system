from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    VaccinationCreate,
    VaccinationResponse
)
from app.dependencies import require_doctor


router = APIRouter(
    prefix="/vaccinations",
    tags=["Vaccinations"]
)


@router.post(
    "",
    response_model=VaccinationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_vaccination(
    vaccination: VaccinationCreate,
    current_user: models.User = Depends(require_doctor),
    db: Session = Depends(get_db)
):
    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.patient_id
            == vaccination.patient_id
        )
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {vaccination.patient_id} was not found"
        )

    new_vaccination = models.Vaccination(
        patient_id=vaccination.patient_id,
        doctor_id=current_user.user_id,
        vaccine=vaccination.vaccine,
        date_of_vaccination=vaccination.date_of_vaccination,
        manufacturer=vaccination.manufacturer,
        next_booster_date=vaccination.next_booster_date
    )

    db.add(new_vaccination)
    db.commit()
    db.refresh(new_vaccination)

    return new_vaccination