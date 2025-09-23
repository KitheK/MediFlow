from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime, timedelta
from uuid import UUID

from app.database import get_db
from app.models.patient import Patient, Admission, Discharge
from app.models.outcome import PatientOutcome, Readmission, SatisfactionScore
from app.schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse,
    AdmissionCreate, AdmissionResponse,
    DischargeCreate, DischargeResponse
)
from app.schemas.outcome import (
    PatientOutcomeCreate, PatientOutcomeResponse,
    ReadmissionCreate, ReadmissionResponse,
    SatisfactionScoreCreate, SatisfactionScoreResponse
)
from app.core.security import get_current_active_user, require_role
from app.models.user import User

router = APIRouter()

# Patient Management
@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new patient"""
    # Check if patient ID already exists
    if db.query(Patient).filter(Patient.patient_id == patient_data.patient_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient ID already exists"
        )
    
    db_patient = Patient(**patient_data.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    
    return db_patient

@router.get("/", response_model=List[PatientResponse])
async def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all patients with optional search"""
    query = db.query(Patient).filter(Patient.is_deleted == 0)
    
    if search:
        query = query.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%")) |
            (Patient.patient_id.ilike(f"%{search}%"))
        )
    
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific patient by ID"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: UUID,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Update patient information"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    update_data = patient_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    db.commit()
    db.refresh(patient)
    
    return patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Soft delete a patient"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    patient.is_deleted = 1
    patient.deleted_at = datetime.utcnow()
    db.commit()

# Admission Management
@router.post("/{patient_id}/admissions", response_model=AdmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_admission(
    patient_id: UUID,
    admission_data: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a new admission for a patient"""
    # Verify patient exists
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check if admission number already exists
    if db.query(Admission).filter(Admission.admission_number == admission_data.admission_number).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admission number already exists"
        )
    
    admission_dict = admission_data.dict()
    admission_dict["patient_id"] = patient_id
    
    db_admission = Admission(**admission_dict)
    db.add(db_admission)
    db.commit()
    db.refresh(db_admission)
    
    return db_admission

@router.get("/{patient_id}/admissions", response_model=List[AdmissionResponse])
async def get_patient_admissions(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all admissions for a specific patient"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    admissions = db.query(Admission).filter(
        Admission.patient_id == patient_id,
        Admission.is_deleted == 0
    ).order_by(Admission.admission_date.desc()).all()
    
    return admissions

# Discharge Management
@router.post("/admissions/{admission_id}/discharge", response_model=DischargeResponse, status_code=status.HTTP_201_CREATED)
async def create_discharge(
    admission_id: UUID,
    discharge_data: DischargeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a discharge record for an admission"""
    admission = db.query(Admission).filter(
        Admission.id == admission_id,
        Admission.is_deleted == 0
    ).first()
    
    if not admission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admission not found"
        )
    
    # Check if discharge already exists
    if db.query(Discharge).filter(Discharge.admission_id == admission_id).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Discharge record already exists for this admission"
        )
    
    # Calculate length of stay
    admission_date = datetime.combine(admission.admission_date, datetime.min.time())
    discharge_date = datetime.combine(discharge_data.discharge_date, datetime.min.time())
    length_of_stay = (discharge_date - admission_date).days
    
    discharge_dict = discharge_data.dict()
    discharge_dict["admission_id"] = admission_id
    discharge_dict["length_of_stay"] = length_of_stay
    
    db_discharge = Discharge(**discharge_dict)
    db.add(db_discharge)
    db.commit()
    db.refresh(db_discharge)
    
    return db_discharge

# Patient Outcomes
@router.post("/{patient_id}/outcomes", response_model=PatientOutcomeResponse, status_code=status.HTTP_201_CREATED)
async def create_patient_outcome(
    patient_id: UUID,
    outcome_data: PatientOutcomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a patient outcome record"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    outcome_dict = outcome_data.dict()
    outcome_dict["patient_id"] = patient_id
    
    db_outcome = PatientOutcome(**outcome_dict)
    db.add(db_outcome)
    db.commit()
    db.refresh(db_outcome)
    
    return db_outcome

@router.get("/{patient_id}/outcomes", response_model=List[PatientOutcomeResponse])
async def get_patient_outcomes(
    patient_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all outcomes for a specific patient"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    outcomes = db.query(PatientOutcome).filter(
        PatientOutcome.patient_id == patient_id,
        PatientOutcome.is_deleted == 0
    ).order_by(PatientOutcome.outcome_date.desc()).all()
    
    return outcomes

# Readmissions
@router.post("/{patient_id}/readmissions", response_model=ReadmissionResponse, status_code=status.HTTP_201_CREATED)
async def create_readmission(
    patient_id: UUID,
    readmission_data: ReadmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Create a readmission record"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    readmission_dict = readmission_data.dict()
    readmission_dict["patient_id"] = patient_id
    
    db_readmission = Readmission(**readmission_dict)
    db.add(db_readmission)
    db.commit()
    db.refresh(db_readmission)
    
    return db_readmission

# Satisfaction Scores
@router.post("/{patient_id}/satisfaction", response_model=SatisfactionScoreResponse, status_code=status.HTTP_201_CREATED)
async def create_satisfaction_score(
    patient_id: UUID,
    satisfaction_data: SatisfactionScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a patient satisfaction score"""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_deleted == 0
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    satisfaction_dict = satisfaction_data.dict()
    satisfaction_dict["patient_id"] = patient_id
    
    db_satisfaction = SatisfactionScore(**satisfaction_dict)
    db.add(db_satisfaction)
    db.commit()
    db.refresh(db_satisfaction)
    
    return db_satisfaction



