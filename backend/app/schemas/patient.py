from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from enum import Enum

from app.models.patient import Gender, AdmissionType, DischargeStatus

# Patient Schemas
class PatientBase(BaseModel):
    patient_id: str = Field(..., description="Unique patient identifier")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    gender: Gender
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)
    medical_record_number: Optional[str] = Field(None, max_length=50)

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=100)
    emergency_phone: Optional[str] = Field(None, max_length=20)
    insurance_provider: Optional[str] = Field(None, max_length=100)
    insurance_number: Optional[str] = Field(None, max_length=50)

class PatientResponse(PatientBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Admission Schemas
class AdmissionBase(BaseModel):
    admission_number: str = Field(..., description="Unique admission identifier")
    admission_date: date
    admission_time: str = Field(..., pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description="Time in HH:MM format")
    admission_type: AdmissionType
    department_id: UUID
    bed_id: Optional[UUID] = None
    primary_diagnosis: Optional[str] = None
    secondary_diagnoses: Optional[str] = None
    admission_notes: Optional[str] = None
    admitting_physician: Optional[str] = Field(None, max_length=100)
    expected_length_of_stay: Optional[int] = Field(None, ge=1, description="Expected stay in days")

class AdmissionCreate(AdmissionBase):
    patient_id: UUID

class AdmissionResponse(AdmissionBase):
    id: UUID
    patient_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Discharge Schemas
class DischargeBase(BaseModel):
    discharge_date: date
    discharge_time: str = Field(..., pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description="Time in HH:MM format")
    discharge_status: DischargeStatus
    discharge_diagnosis: Optional[str] = None
    discharge_instructions: Optional[str] = None
    discharge_physician: Optional[str] = Field(None, max_length=100)
    total_cost: Optional[float] = Field(None, ge=0)
    insurance_coverage: Optional[float] = Field(None, ge=0)
    patient_payment: Optional[float] = Field(None, ge=0)

class DischargeCreate(DischargeBase):
    admission_id: UUID

class DischargeResponse(DischargeBase):
    id: UUID
    admission_id: UUID
    length_of_stay: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



