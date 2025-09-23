from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum

from app.models.outcome import OutcomeType, ReadmissionReason

# Patient Outcome Schemas
class PatientOutcomeBase(BaseModel):
    outcome_type: OutcomeType
    outcome_date: date
    recovery_time_days: Optional[int] = Field(None, ge=0)
    treatment_success: Optional[bool] = None
    complications: Optional[str] = None
    follow_up_required: bool = False
    follow_up_date: Optional[date] = None
    notes: Optional[str] = None

class PatientOutcomeCreate(PatientOutcomeBase):
    patient_id: UUID
    admission_id: Optional[UUID] = None

class PatientOutcomeResponse(PatientOutcomeBase):
    id: UUID
    patient_id: UUID
    admission_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Readmission Schemas
class ReadmissionBase(BaseModel):
    readmission_date: date
    days_since_discharge: int = Field(..., ge=0)
    readmission_reason: ReadmissionReason
    readmission_department_id: UUID
    severity_score: Optional[int] = Field(None, ge=1, le=10, description="Severity score 1-10")
    preventable: Optional[bool] = None
    notes: Optional[str] = None

class ReadmissionCreate(ReadmissionBase):
    patient_id: UUID
    original_admission_id: UUID

class ReadmissionResponse(ReadmissionBase):
    id: UUID
    patient_id: UUID
    original_admission_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Satisfaction Score Schemas
class SatisfactionScoreBase(BaseModel):
    survey_date: date
    overall_satisfaction: int = Field(..., ge=1, le=5, description="Overall satisfaction rating 1-5")
    care_quality: Optional[int] = Field(None, ge=1, le=5)
    communication: Optional[int] = Field(None, ge=1, le=5)
    cleanliness: Optional[int] = Field(None, ge=1, le=5)
    food_quality: Optional[int] = Field(None, ge=1, le=5)
    staff_friendliness: Optional[int] = Field(None, ge=1, le=5)
    pain_management: Optional[int] = Field(None, ge=1, le=5)
    discharge_process: Optional[int] = Field(None, ge=1, le=5)
    would_recommend: Optional[bool] = None
    comments: Optional[str] = None
    improvement_suggestions: Optional[str] = None

class SatisfactionScoreCreate(SatisfactionScoreBase):
    patient_id: UUID
    admission_id: Optional[UUID] = None

class SatisfactionScoreResponse(SatisfactionScoreBase):
    id: UUID
    patient_id: UUID
    admission_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



