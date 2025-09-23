from sqlalchemy import Column, Integer, String, Date, Enum, Text, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from pydantic import Field
from enum import Enum as PyEnum

from .base import Base, TimestampMixin, SoftDeleteMixin

class Gender(PyEnum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNKNOWN = "unknown"

class AdmissionType(PyEnum):
    EMERGENCY = "emergency"
    ELECTIVE = "elective"
    URGENT = "urgent"
    TRANSFER = "transfer"

class DischargeStatus(PyEnum):
    HOME = "home"
    TRANSFER = "transfer"
    AMA = "ama"  # Against Medical Advice
    DECEASED = "deceased"
    OTHER = "other"

class Patient(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(100), nullable=True)
    emergency_phone = Column(String(20), nullable=True)
    insurance_provider = Column(String(100), nullable=True)
    insurance_number = Column(String(50), nullable=True)
    medical_record_number = Column(String(50), unique=True, nullable=True)
    
    # Relationships
    admissions = relationship("Admission", back_populates="patient", cascade="all, delete-orphan")
    outcomes = relationship("PatientOutcome", back_populates="patient", cascade="all, delete-orphan")
    readmissions = relationship("Readmission", back_populates="patient", cascade="all, delete-orphan")
    satisfaction_scores = relationship("SatisfactionScore", back_populates="patient", cascade="all, delete-orphan")

class Admission(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "admissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    admission_number = Column(String(50), unique=True, nullable=False, index=True)
    admission_date = Column(Date, nullable=False)
    admission_time: str = Field(..., pattern=r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', description="Time in HH:MM format")
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    bed_id = Column(UUID(as_uuid=True), ForeignKey("beds.id"), nullable=True)
    primary_diagnosis = Column(Text, nullable=True)
    secondary_diagnoses = Column(Text, nullable=True)
    admission_notes = Column(Text, nullable=True)
    admitting_physician = Column(String(100), nullable=True)
    expected_length_of_stay = Column(Integer, nullable=True)  # in days
    
    # Relationships
    patient = relationship("Patient", back_populates="admissions")
    department = relationship("Department", back_populates="admissions")
    bed = relationship("Bed", back_populates="admissions")
    discharge = relationship("Discharge", back_populates="admission", uselist=False, cascade="all, delete-orphan")

class Discharge(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "discharges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admission_id = Column(UUID(as_uuid=True), ForeignKey("admissions.id"), nullable=False)
    discharge_date = Column(Date, nullable=False)
    discharge_time = Column(String(10), nullable=False)  # HH:MM format
    discharge_status = Column(Enum(DischargeStatus), nullable=False)
    discharge_diagnosis = Column(Text, nullable=True)
    discharge_instructions = Column(Text, nullable=True)
    discharge_physician = Column(String(100), nullable=True)
    length_of_stay = Column(Integer, nullable=False)  # calculated in days
    total_cost = Column(Numeric(10, 2), nullable=True)
    insurance_coverage = Column(Numeric(10, 2), nullable=True)
    patient_payment = Column(Numeric(10, 2), nullable=True)
    
    # Relationships
    admission = relationship("Admission", back_populates="discharge")

