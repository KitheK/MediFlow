from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum
from decimal import Decimal

from app.models.resource import BedStatus, StaffRole, EquipmentStatus, DepartmentType

# Department Schemas
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    department_type: DepartmentType
    description: Optional[str] = None
    head_of_department: Optional[str] = Field(None, max_length=100)
    total_beds: int = Field(0, ge=0)
    available_beds: int = Field(0, ge=0)
    cost_per_day: Optional[Decimal] = Field(None, ge=0)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    head_of_department: Optional[str] = Field(None, max_length=100)
    total_beds: Optional[int] = Field(None, ge=0)
    available_beds: Optional[int] = Field(None, ge=0)
    cost_per_day: Optional[Decimal] = Field(None, ge=0)

class DepartmentResponse(DepartmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Bed Schemas
class BedBase(BaseModel):
    bed_number: str = Field(..., min_length=1, max_length=20)
    room_number: Optional[str] = Field(None, max_length=20)
    bed_type: Optional[str] = Field(None, max_length=50)
    status: BedStatus = BedStatus.AVAILABLE
    last_cleaned: Optional[datetime] = None
    maintenance_due: Optional[date] = None
    notes: Optional[str] = None

class BedCreate(BedBase):
    department_id: UUID

class BedUpdate(BaseModel):
    bed_number: Optional[str] = Field(None, min_length=1, max_length=20)
    room_number: Optional[str] = Field(None, max_length=20)
    bed_type: Optional[str] = Field(None, max_length=50)
    status: Optional[BedStatus] = None
    last_cleaned: Optional[datetime] = None
    maintenance_due: Optional[date] = None
    notes: Optional[str] = None

class BedResponse(BedBase):
    id: UUID
    department_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Staff Schemas
class StaffBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    role: StaffRole
    specialization: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=50)
    hire_date: date
    salary: Optional[Decimal] = Field(None, ge=0)
    shift_pattern: Optional[str] = Field(None, max_length=50)
    is_active: bool = True

class StaffCreate(StaffBase):
    department_id: UUID

class StaffUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    specialization: Optional[str] = Field(None, max_length=100)
    license_number: Optional[str] = Field(None, max_length=50)
    salary: Optional[Decimal] = Field(None, ge=0)
    shift_pattern: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class StaffResponse(StaffBase):
    id: UUID
    department_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Equipment Schemas
class EquipmentBase(BaseModel):
    equipment_id: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=100)
    equipment_type: str = Field(..., min_length=1, max_length=100)
    status: EquipmentStatus = EquipmentStatus.AVAILABLE
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    last_maintenance: Optional[date] = None
    next_maintenance_due: Optional[date] = None
    maintenance_cost: Optional[Decimal] = Field(None, ge=0)
    usage_hours: int = Field(0, ge=0)
    max_usage_hours: Optional[int] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    department_id: UUID

class EquipmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    manufacturer: Optional[str] = Field(None, max_length=100)
    equipment_type: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[EquipmentStatus] = None
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    last_maintenance: Optional[date] = None
    next_maintenance_due: Optional[date] = None
    maintenance_cost: Optional[Decimal] = Field(None, ge=0)
    usage_hours: Optional[int] = Field(None, ge=0)
    max_usage_hours: Optional[int] = Field(None, ge=0)
    location: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class EquipmentResponse(EquipmentBase):
    id: UUID
    department_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True



