from sqlalchemy import Column, Integer, String, Date, Enum, Text, ForeignKey, Numeric, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from enum import Enum as PyEnum

from .base import Base, TimestampMixin, SoftDeleteMixin

class EventType(PyEnum):
    PATIENT_ADMISSION = "patient_admission"
    PATIENT_DISCHARGE = "patient_discharge"
    READMISSION = "readmission"
    BED_OCCUPANCY = "bed_occupancy"
    STAFF_UTILIZATION = "staff_utilization"
    EQUIPMENT_USAGE = "equipment_usage"
    COST_ANALYSIS = "cost_analysis"
    SATISFACTION_SURVEY = "satisfaction_survey"
    OUTCOME_TRACKING = "outcome_tracking"

class AnalyticsEvent(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "analytics_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(Enum(EventType), nullable=False)
    event_date = Column(Date, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)
    admission_id = Column(UUID(as_uuid=True), ForeignKey("admissions.id"), nullable=True)
    
    # Event data stored as JSON for flexibility
    event_data = Column(JSON, nullable=False)
    
    # Metrics
    metric_value = Column(Numeric(15, 4), nullable=True)
    metric_unit = Column(String(50), nullable=True)
    
    # Relationships
    department = relationship("Department")
    patient = relationship("Patient")
    admission = relationship("Admission")

class CostAnalysis(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "cost_analyses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_date = Column(Date, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    admission_id = Column(UUID(as_uuid=True), ForeignKey("admissions.id"), nullable=True)
    
    # Cost breakdown
    total_cost = Column(Numeric(10, 2), nullable=False)
    staff_cost = Column(Numeric(10, 2), nullable=True)
    equipment_cost = Column(Numeric(10, 2), nullable=True)
    medication_cost = Column(Numeric(10, 2), nullable=True)
    facility_cost = Column(Numeric(10, 2), nullable=True)
    other_costs = Column(Numeric(10, 2), nullable=True)
    
    # Revenue
    insurance_revenue = Column(Numeric(10, 2), nullable=True)
    patient_payment = Column(Numeric(10, 2), nullable=True)
    total_revenue = Column(Numeric(10, 2), nullable=True)
    
    # Profitability
    profit_margin = Column(Numeric(5, 2), nullable=True)  # percentage
    cost_per_patient_day = Column(Numeric(10, 2), nullable=True)
    
    # Analysis period
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Additional metrics
    patient_count = Column(Integer, nullable=True)
    average_length_of_stay = Column(Numeric(5, 2), nullable=True)
    
    # Relationships
    department = relationship("Department")
    admission = relationship("Admission")



