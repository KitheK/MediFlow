from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class OutcomeType(str, enum.Enum):
    RECOVERED = "recovered"
    IMPROVED = "improved"
    UNCHANGED = "unchanged"
    WORSENED = "worsened"
    DECEASED = "deceased"

class ReadmissionReason(str, enum.Enum):
    INFECTION = "infection"
    COMPLICATION = "complication"
    RELAPSE = "relapse"
    OTHER = "other"

# THEN DEFINE MODELS THAT USE THE ENUMS
class PatientOutcome(Base):
    __tablename__ = "patient_outcomes"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    outcome_type = Column(Enum(OutcomeType))  # Now this will work
    # ... other columns

class Readmission(Base):
    __tablename__ = "readmissions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    reason = Column(Enum(ReadmissionReason))  # This will also work
    # ... other columns

class SatisfactionScore(Base):
    __tablename__ = "satisfaction_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    # ... other columns