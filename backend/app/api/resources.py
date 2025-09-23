from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

from app.database import get_db
from app.models.resource import Department, Bed, Staff, Equipment
from app.schemas.resource import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    BedCreate, BedUpdate, BedResponse,
    StaffCreate, StaffUpdate, StaffResponse,
    EquipmentCreate, EquipmentUpdate, EquipmentResponse
)
from app.core.security import get_current_active_user, require_role
from app.models.user import User

router = APIRouter()

# Department Management
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new department"""
    db_department = Department(**department_data.dict())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    
    return db_department

@router.get("/departments", response_model=List[DepartmentResponse])
async def get_departments(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all departments"""
    departments = db.query(Department).filter(Department.is_deleted == 0).offset(skip).limit(limit).all()
    return departments

@router.get("/departments/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific department"""
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    return department

@router.put("/departments/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: UUID,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update department information"""
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    update_data = department_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(department, field, value)
    
    db.commit()
    db.refresh(department)
    
    return department

# Bed Management
@router.post("/beds", response_model=BedResponse, status_code=status.HTTP_201_CREATED)
async def create_bed(
    bed_data: BedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new bed"""
    # Verify department exists
    department = db.query(Department).filter(
        Department.id == bed_data.department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    db_bed = Bed(**bed_data.dict())
    db.add(db_bed)
    db.commit()
    db.refresh(db_bed)
    
    return db_bed

@router.get("/beds", response_model=List[BedResponse])
async def get_beds(
    department_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all beds with optional filters"""
    query = db.query(Bed).filter(Bed.is_deleted == 0)
    
    if department_id:
        query = query.filter(Bed.department_id == department_id)
    
    if status:
        query = query.filter(Bed.status == status)
    
    beds = query.offset(skip).limit(limit).all()
    return beds

@router.get("/beds/{bed_id}", response_model=BedResponse)
async def get_bed(
    bed_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific bed"""
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.is_deleted == 0
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bed not found"
        )
    
    return bed

@router.put("/beds/{bed_id}", response_model=BedResponse)
async def update_bed(
    bed_id: UUID,
    bed_data: BedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update bed information"""
    bed = db.query(Bed).filter(
        Bed.id == bed_id,
        Bed.is_deleted == 0
    ).first()
    
    if not bed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bed not found"
        )
    
    update_data = bed_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bed, field, value)
    
    db.commit()
    db.refresh(bed)
    
    return bed

# Staff Management
@router.post("/staff", response_model=StaffResponse, status_code=status.HTTP_201_CREATED)
async def create_staff(
    staff_data: StaffCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new staff member"""
    # Verify department exists
    department = db.query(Department).filter(
        Department.id == staff_data.department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if employee ID already exists
    if db.query(Staff).filter(Staff.employee_id == staff_data.employee_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already exists"
        )
    
    # Check if email already exists
    if db.query(Staff).filter(Staff.email == staff_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    db_staff = Staff(**staff_data.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    
    return db_staff

@router.get("/staff", response_model=List[StaffResponse])
async def get_staff(
    department_id: Optional[UUID] = Query(None),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all staff with optional filters"""
    query = db.query(Staff).filter(Staff.is_deleted == 0)
    
    if department_id:
        query = query.filter(Staff.department_id == department_id)
    
    if role:
        query = query.filter(Staff.role == role)
    
    if is_active is not None:
        query = query.filter(Staff.is_active == is_active)
    
    staff = query.offset(skip).limit(limit).all()
    return staff

@router.get("/staff/{staff_id}", response_model=StaffResponse)
async def get_staff_member(
    staff_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific staff member"""
    staff = db.query(Staff).filter(
        Staff.id == staff_id,
        Staff.is_deleted == 0
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    return staff

@router.put("/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: UUID,
    staff_data: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update staff information"""
    staff = db.query(Staff).filter(
        Staff.id == staff_id,
        Staff.is_deleted == 0
    ).first()
    
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )
    
    update_data = staff_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(staff, field, value)
    
    db.commit()
    db.refresh(staff)
    
    return staff

# Equipment Management
@router.post("/equipment", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create new equipment"""
    # Verify department exists
    department = db.query(Department).filter(
        Department.id == equipment_data.department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Check if equipment ID already exists
    if db.query(Equipment).filter(Equipment.equipment_id == equipment_data.equipment_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Equipment ID already exists"
        )
    
    db_equipment = Equipment(**equipment_data.dict())
    db.add(db_equipment)
    db.commit()
    db.refresh(db_equipment)
    
    return db_equipment

@router.get("/equipment", response_model=List[EquipmentResponse])
async def get_equipment(
    department_id: Optional[UUID] = Query(None),
    equipment_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all equipment with optional filters"""
    query = db.query(Equipment).filter(Equipment.is_deleted == 0)
    
    if department_id:
        query = query.filter(Equipment.department_id == department_id)
    
    if equipment_type:
        query = query.filter(Equipment.equipment_type == equipment_type)
    
    if status:
        query = query.filter(Equipment.status == status)
    
    equipment = query.offset(skip).limit(limit).all()
    return equipment

@router.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment_item(
    equipment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific equipment item"""
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.is_deleted == 0
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    return equipment

@router.put("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: UUID,
    equipment_data: EquipmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update equipment information"""
    equipment = db.query(Equipment).filter(
        Equipment.id == equipment_id,
        Equipment.is_deleted == 0
    ).first()
    
    if not equipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipment not found"
        )
    
    update_data = equipment_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(equipment, field, value)
    
    db.commit()
    db.refresh(equipment)
    
    return equipment

# Resource Utilization Endpoints
@router.get("/departments/{department_id}/utilization")
async def get_department_utilization(
    department_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get utilization metrics for a specific department"""
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.is_deleted == 0
    ).first()
    
    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found"
        )
    
    # Bed utilization
    total_beds = db.query(Bed).filter(
        and_(Bed.department_id == department_id, Bed.is_deleted == 0)
    ).count()
    occupied_beds = db.query(Bed).filter(
        and_(
            Bed.department_id == department_id,
            Bed.is_deleted == 0,
            Bed.status == "occupied"
        )
    ).count()
    bed_utilization = (occupied_beds / total_beds * 100) if total_beds > 0 else 0
    
    # Staff utilization
    total_staff = db.query(Staff).filter(
        and_(Staff.department_id == department_id, Staff.is_deleted == 0)
    ).count()
    active_staff = db.query(Staff).filter(
        and_(
            Staff.department_id == department_id,
            Staff.is_deleted == 0,
            Staff.is_active == True
        )
    ).count()
    staff_utilization = (active_staff / total_staff * 100) if total_staff > 0 else 0
    
    # Equipment utilization
    total_equipment = db.query(Equipment).filter(
        and_(Equipment.department_id == department_id, Equipment.is_deleted == 0)
    ).count()
    in_use_equipment = db.query(Equipment).filter(
        and_(
            Equipment.department_id == department_id,
            Equipment.is_deleted == 0,
            Equipment.status == "in_use"
        )
    ).count()
    equipment_utilization = (in_use_equipment / total_equipment * 100) if total_equipment > 0 else 0
    
    return {
        "department_id": department_id,
        "department_name": department.name,
        "bed_utilization": round(bed_utilization, 2),
        "staff_utilization": round(staff_utilization, 2),
        "equipment_utilization": round(equipment_utilization, 2),
        "total_beds": total_beds,
        "occupied_beds": occupied_beds,
        "total_staff": total_staff,
        "active_staff": active_staff,
        "total_equipment": total_equipment,
        "in_use_equipment": in_use_equipment
    }



