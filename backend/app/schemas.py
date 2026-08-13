from datetime import date

from pydantic import BaseModel, Field, field_validator


class PatientCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=200)
    last_name: str = Field(min_length=1, max_length=200)
    gender: str
    date_of_birth: date
    nationality: str = Field(min_length=1, max_length=100)
    phone_number: str = Field(min_length=1, max_length=20)
    passport_number: str | None = Field(default=None, max_length=50)

    @field_validator(
    "first_name",
    "last_name",
    "nationality",
    "phone_number"
)
    @classmethod
    def validate_not_blank(cls, value: str):
        value = value.strip()

        if not value:
            raise ValueError("Field cannot be blank")

        return value

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, value: str):
        value = value.upper()

        if value not in ("M", "F"):
            raise ValueError("Gender must be M or F")

        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value: date):
        if value > date.today():
            raise ValueError("Date of birth cannot be in the future")

        return value


class PatientResponse(BaseModel):
    patient_id: int
    first_name: str
    last_name: str
    gender: str
    date_of_birth: date
    nationality: str
    phone_number: str
    passport_number: str | None

    model_config = {
        "from_attributes": True
    }

class VaccinationCreate(BaseModel):
    patient_id: int
    vaccine: str
    date_of_vaccination: date
    manufacturer: str
    next_booster_date: date | None = None

    @field_validator("date_of_vaccination")
    @classmethod
    def validate_vaccination_date(cls, value: date):
        if value > date.today():
            raise ValueError(
                "Vaccination date cannot be in the future"
            )

        return value

    @field_validator("next_booster_date")
    @classmethod
    def validate_booster_date(
        cls,
        value: date | None,
        info
    ):
        if value is not None:
            vaccination_date = info.data.get(
                "date_of_vaccination"
            )

            if (
                vaccination_date is not None
                and value < vaccination_date
            ):
                raise ValueError(
                    "Next booster date cannot be before "
                    "the vaccination date"
                )

        return value


class VaccinationResponse(BaseModel):
    vaccination_id: int
    patient_id: int
    doctor_id: int
    vaccine: str
    date_of_vaccination: date
    manufacturer: str
    next_booster_date: date | None

    model_config = {
        "from_attributes": True
    }

class UserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=200)
    last_name: str = Field(min_length=1, max_length=200)
    role: str
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=8, max_length=100)

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str):
        value = value.upper()

        if value not in ("DOCTOR", "RECEPTIONIST"):
            raise ValueError(
                "Role must be DOCTOR or RECEPTIONIST"
            )

        return value


class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    role: str
    username: str

    model_config = {
        "from_attributes": True
    }

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class PatientSearchResponse(BaseModel):
    patient_id: int
    first_name: str
    last_name: str
    gender: str
    date_of_birth: date
    nationality: str
    phone_number: str
    passport_number: str | None

    model_config = {
        "from_attributes": True
    }