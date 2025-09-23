from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import date, datetime
from uuid import UUID
from enum import Enum
from decimal import Decimal

from app.models.analytics import EventType

# Analytics Event Schemas
class AnalyticsEventBase(BaseModel):
    event_type: EventType
    event_date: date
    event_data: Dict[str, Any] = Field(..., description="Event data stored as JSON")
    metric_value: Optional[Decimal] = Field(None, description="Numeric metric value")
    metric_unit: Optional[str] = Field(None, max_length=50, description="Unit of measurement")

class AnalyticsEventCreate(AnalyticsEventBase):
    department_id: Optional[UUID] = None
    patient_id: Optional[UUID] = None
    admission_id: Optional[UUID] = None

class AnalyticsEventResponse(AnalyticsEventBase):
    id: UUID
    department_id: Optional[UUID]
    patient_id: Optional[UUID]
    admission_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Cost Analysis Schemas
class CostAnalysisBase(BaseModel):
    analysis_date: date
    total_cost: Decimal = Field(..., ge=0)
    staff_cost: Optional[Decimal] = Field(None, ge=0)
    equipment_cost: Optional[Decimal] = Field(None, ge=0)
    medication_cost: Optional[Decimal] = Field(None, ge=0)
    facility_cost: Optional[Decimal] = Field(None, ge=0)
    other_costs: Optional[Decimal] = Field(None, ge=0)
    insurance_revenue: Optional[Decimal] = Field(None, ge=0)
    patient_payment: Optional[Decimal] = Field(None, ge=0)
    total_revenue: Optional[Decimal] = Field(None, ge=0)
    profit_margin: Optional[Decimal] = Field(None, ge=-100, le=100, description="Profit margin percentage")
    cost_per_patient_day: Optional[Decimal] = Field(None, ge=0)
    period_start: date
    period_end: date
    patient_count: Optional[int] = Field(None, ge=0)
    average_length_of_stay: Optional[Decimal] = Field(None, ge=0)

class CostAnalysisCreate(CostAnalysisBase):
    department_id: Optional[UUID] = None
    admission_id: Optional[UUID] = None

class CostAnalysisResponse(CostAnalysisBase):
    id: UUID
    department_id: Optional[UUID]
    admission_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Analytics Dashboard Schemas
class DashboardMetrics(BaseModel):
    total_patients: int
    total_admissions: int
    current_occupancy_rate: float
    average_length_of_stay: float
    readmission_rate: float
    patient_satisfaction_score: float
    total_revenue: Decimal
    total_costs: Decimal
    profit_margin: float

class TrendData(BaseModel):
    date: date
    value: float
    metric_name: str

class DepartmentPerformance(BaseModel):
    department_id: UUID
    department_name: str
    occupancy_rate: float
    average_length_of_stay: float
    readmission_rate: float
    patient_satisfaction: float
    cost_efficiency: float
    staff_utilization: float

class PatientOutcomeSummary(BaseModel):
    total_patients: int
    recovery_rate: float
    mortality_rate: float
    complication_rate: float
    average_recovery_time: float
    treatment_success_rate: float

class ResourceUtilization(BaseModel):
    bed_occupancy_rate: float
    staff_utilization_rate: float
    equipment_utilization_rate: float
    maintenance_due_count: int
    equipment_out_of_order_count: int



