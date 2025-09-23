from sqlalchemy import Column, Integer, String, Date, Enum, Text, ForeignKey, Numeric, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from enum import Enum as PyEnum

from .base import Base, TimestampMixin, SoftDeleteMixin

class BedStatus(PyEnum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    OUT_OF_ORDER = "out_of_order"

class StaffRole(PyEnum):
    DOCTOR = "doctor"
    NURSE = "nurse"
    TECHNICIAN = "technician"
    ADMINISTRATOR = "administrator"
    SUPPORT = "support"

class EquipmentStatus(PyEnum):
    AVAILABLE = "available"
    IN_USE = "in_use"
    MAINTENANCE = "maintenance"
    OUT_OF_ORDER = "out_of_order"

class DepartmentType(PyEnum):
    EMERGENCY = "emergency"
    SURGERY = "surgery"
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    ONCOLOGY = "oncology"
    PEDIATRICS = "pediatrics"
    ICU = "icu"
    GENERAL = "general"

class Department(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "departments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    department_type = Column(Enum(DepartmentType), nullable=False)
    description = Column(Text, nullable=True)
    head_of_department = Column(String(100), nullable=True)
    total_beds = Column(Integer, default=0)
    available_beds = Column(Integer, default=0)
    cost_per_day = Column(Numeric(10, 2), nullable=True)
    
    # Relationships
    beds = relationship("Bed", back_populates="department", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="department", cascade="all, delete-orphan")
    equipment = relationship("Equipment", back_populates="department", cascade="all, delete-orphan")
    admissions = relationship("Admission", back_populates="department")

class Bed(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "beds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bed_number = Column(String(20), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    room_number = Column(String(20), nullable=True)
    bed_type = Column(String(50), nullable=True)  # ICU, Standard, Private, etc.
    status = Column(Enum(BedStatus), default=BedStatus.AVAILABLE)
    last_cleaned = Column(DateTime, nullable=True)
    maintenance_due = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    department = relationship("Department", back_populates="beds")
    admissions = relationship("Admission", back_populates="bed")

class Staff(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "staff"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    role = Column(Enum(StaffRole), nullable=False)
    specialization = Column(String(100), nullable=True)
    license_number = Column(String(50), nullable=True)
    hire_date = Column(Date, nullable=False)
    salary = Column(Numeric(10, 2), nullable=True)
    shift_pattern = Column(String(50), nullable=True)  # Day, Night, Rotating
    is_active = Column(Boolean, default=True)
    
    # Relationships
    department = relationship("Department", back_populates="staff")

class Equipment(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "equipment"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    equipment_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    model = Column(String(100), nullable=True)
    manufacturer = Column(String(100), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    equipment_type = Column(String(100), nullable=False)  # MRI, X-Ray, Ventilator, etc.
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    purchase_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    last_maintenance = Column(Date, nullable=True)
    next_maintenance_due = Column(Date, nullable=True)
    maintenance_cost = Column(Numeric(10, 2), nullable=True)
    usage_hours = Column(Integer, default=0)
    max_usage_hours = Column(Integer, nullable=True)
    location = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    department = relationship("Department", back_populates="equipment")



