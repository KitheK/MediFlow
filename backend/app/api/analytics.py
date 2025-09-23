from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, extract
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from uuid import UUID
from decimal import Decimal

from app.database import get_db
from app.models.patient import Patient, Admission, Discharge
from app.models.outcome import PatientOutcome, Readmission, SatisfactionScore
from app.models.resource import Department, Bed, Staff, Equipment
from app.models.analytics import AnalyticsEvent, CostAnalysis
from app.schemas.analytics import (
    DashboardMetrics, TrendData, DepartmentPerformance,
    PatientOutcomeSummary, ResourceUtilization
)
from app.core.security import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get key dashboard metrics"""
    
    # Total patients
    total_patients = db.query(Patient).filter(Patient.is_deleted == 0).count()
    
    # Total admissions
    total_admissions = db.query(Admission).filter(Admission.is_deleted == 0).count()
    
    # Current occupancy rate
    total_beds = db.query(Bed).filter(Bed.is_deleted == 0).count()
    occupied_beds = db.query(Bed).filter(
        and_(Bed.is_deleted == 0, Bed.status == "occupied")
    ).count()
    current_occupancy_rate = (occupied_beds / total_beds * 100) if total_beds > 0 else 0
    
    # Average length of stay
    avg_los_result = db.query(func.avg(Discharge.length_of_stay)).filter(
        Discharge.is_deleted == 0
    ).scalar()
    average_length_of_stay = float(avg_los_result) if avg_los_result else 0
    
    # Readmission rate (30-day)
    thirty_days_ago = date.today() - timedelta(days=30)
    total_discharges = db.query(Discharge).filter(
        and_(
            Discharge.is_deleted == 0,
            Discharge.discharge_date >= thirty_days_ago
        )
    ).count()
    
    readmissions_count = db.query(Readmission).filter(
        and_(
            Readmission.is_deleted == 0,
            Readmission.readmission_date >= thirty_days_ago,
            Readmission.days_since_discharge <= 30
        )
    ).count()
    
    readmission_rate = (readmissions_count / total_discharges * 100) if total_discharges > 0 else 0
    
    # Patient satisfaction score
    satisfaction_result = db.query(func.avg(SatisfactionScore.overall_satisfaction)).filter(
        SatisfactionScore.is_deleted == 0
    ).scalar()
    patient_satisfaction_score = float(satisfaction_result) if satisfaction_result else 0
    
    # Revenue and costs
    total_revenue_result = db.query(func.sum(Discharge.total_cost)).filter(
        Discharge.is_deleted == 0
    ).scalar()
    total_revenue = Decimal(str(total_revenue_result)) if total_revenue_result else Decimal('0')
    
    total_costs_result = db.query(func.sum(CostAnalysis.total_cost)).filter(
        CostAnalysis.is_deleted == 0
    ).scalar()
    total_costs = Decimal(str(total_costs_result)) if total_costs_result else Decimal('0')
    
    # Profit margin
    profit_margin = 0
    if total_revenue > 0:
        profit_margin = float((total_revenue - total_costs) / total_revenue * 100)
    
    return DashboardMetrics(
        total_patients=total_patients,
        total_admissions=total_admissions,
        current_occupancy_rate=round(current_occupancy_rate, 2),
        average_length_of_stay=round(average_length_of_stay, 2),
        readmission_rate=round(readmission_rate, 2),
        patient_satisfaction_score=round(patient_satisfaction_score, 2),
        total_revenue=total_revenue,
        total_costs=total_costs,
        profit_margin=round(profit_margin, 2)
    )

@router.get("/trends/occupancy", response_model=List[TrendData])
async def get_occupancy_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get bed occupancy trends over time"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    # This is a simplified version - in production, you'd want to track daily occupancy
    # For now, we'll calculate based on current admissions
    trends = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        
        # Count admissions on this date
        admissions_count = db.query(Admission).filter(
            and_(
                Admission.is_deleted == 0,
                Admission.admission_date <= current_date
            )
        ).count()
        
        # Count discharges on this date
        discharges_count = db.query(Discharge).filter(
            and_(
                Discharge.is_deleted == 0,
                Discharge.discharge_date <= current_date
            )
        ).count()
        
        # Calculate occupancy (simplified)
        total_beds = db.query(Bed).filter(Bed.is_deleted == 0).count()
        occupancy_rate = ((admissions_count - discharges_count) / total_beds * 100) if total_beds > 0 else 0
        
        trends.append(TrendData(
            date=current_date,
            value=round(occupancy_rate, 2),
            metric_name="occupancy_rate"
        ))
    
    return trends

@router.get("/trends/readmissions", response_model=List[TrendData])
async def get_readmission_trends(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get readmission trends over time"""
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    trends = []
    for i in range(days):
        current_date = start_date + timedelta(days=i)
        
        # Count readmissions on this date
        readmissions_count = db.query(Readmission).filter(
            and_(
                Readmission.is_deleted == 0,
                Readmission.readmission_date == current_date
            )
        ).count()
        
        trends.append(TrendData(
            date=current_date,
            value=float(readmissions_count),
            metric_name="readmissions"
        ))
    
    return trends

@router.get("/departments/performance", response_model=List[DepartmentPerformance])
async def get_department_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get performance metrics by department"""
    departments = db.query(Department).filter(Department.is_deleted == 0).all()
    performance_data = []
    
    for dept in departments:
        # Occupancy rate
        dept_beds = db.query(Bed).filter(
            and_(Bed.department_id == dept.id, Bed.is_deleted == 0)
        ).count()
        occupied_beds = db.query(Bed).filter(
            and_(
                Bed.department_id == dept.id,
                Bed.is_deleted == 0,
                Bed.status == "occupied"
            )
        ).count()
        occupancy_rate = (occupied_beds / dept_beds * 100) if dept_beds > 0 else 0
        
        # Average length of stay
        avg_los_result = db.query(func.avg(Discharge.length_of_stay)).join(Admission).filter(
            and_(
                Admission.department_id == dept.id,
                Discharge.is_deleted == 0
            )
        ).scalar()
        avg_los = float(avg_los_result) if avg_los_result else 0
        
        # Readmission rate
        dept_discharges = db.query(Discharge).join(Admission).filter(
            and_(
                Admission.department_id == dept.id,
                Discharge.is_deleted == 0
            )
        ).count()
        
        dept_readmissions = db.query(Readmission).filter(
            and_(
                Readmission.readmission_department_id == dept.id,
                Readmission.is_deleted == 0
            )
        ).count()
        
        readmission_rate = (dept_readmissions / dept_discharges * 100) if dept_discharges > 0 else 0
        
        # Patient satisfaction
        satisfaction_result = db.query(func.avg(SatisfactionScore.overall_satisfaction)).join(Admission).filter(
            and_(
                Admission.department_id == dept.id,
                SatisfactionScore.is_deleted == 0
            )
        ).scalar()
        patient_satisfaction = float(satisfaction_result) if satisfaction_result else 0
        
        # Cost efficiency (simplified)
        total_costs = db.query(func.sum(CostAnalysis.total_cost)).filter(
            and_(
                CostAnalysis.department_id == dept.id,
                CostAnalysis.is_deleted == 0
            )
        ).scalar()
        cost_efficiency = float(total_costs) if total_costs else 0
        
        # Staff utilization
        total_staff = db.query(Staff).filter(
            and_(Staff.department_id == dept.id, Staff.is_deleted == 0)
        ).count()
        active_staff = db.query(Staff).filter(
            and_(
                Staff.department_id == dept.id,
                Staff.is_deleted == 0,
                Staff.is_active == True
            )
        ).count()
        staff_utilization = (active_staff / total_staff * 100) if total_staff > 0 else 0
        
        performance_data.append(DepartmentPerformance(
            department_id=dept.id,
            department_name=dept.name,
            occupancy_rate=round(occupancy_rate, 2),
            average_length_of_stay=round(avg_los, 2),
            readmission_rate=round(readmission_rate, 2),
            patient_satisfaction=round(patient_satisfaction, 2),
            cost_efficiency=round(cost_efficiency, 2),
            staff_utilization=round(staff_utilization, 2)
        ))
    
    return performance_data

@router.get("/patient-outcomes", response_model=PatientOutcomeSummary)
async def get_patient_outcome_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get patient outcome summary statistics"""
    
    # Total patients with outcomes
    total_patients = db.query(PatientOutcome).filter(PatientOutcome.is_deleted == 0).count()
    
    # Recovery rate
    recovery_count = db.query(PatientOutcome).filter(
        and_(
            PatientOutcome.is_deleted == 0,
            PatientOutcome.outcome_type == "recovery"
        )
    ).count()
    recovery_rate = (recovery_count / total_patients * 100) if total_patients > 0 else 0
    
    # Mortality rate
    mortality_count = db.query(PatientOutcome).filter(
        and_(
            PatientOutcome.is_deleted == 0,
            PatientOutcome.outcome_type == "deceased"
        )
    ).count()
    mortality_rate = (mortality_count / total_patients * 100) if total_patients > 0 else 0
    
    # Complication rate
    complication_count = db.query(PatientOutcome).filter(
        and_(
            PatientOutcome.is_deleted == 0,
            PatientOutcome.complications.isnot(None)
        )
    ).count()
    complication_rate = (complication_count / total_patients * 100) if total_patients > 0 else 0
    
    # Average recovery time
    avg_recovery_result = db.query(func.avg(PatientOutcome.recovery_time_days)).filter(
        and_(
            PatientOutcome.is_deleted == 0,
            PatientOutcome.recovery_time_days.isnot(None)
        )
    ).scalar()
    average_recovery_time = float(avg_recovery_result) if avg_recovery_result else 0
    
    # Treatment success rate
    success_count = db.query(PatientOutcome).filter(
        and_(
            PatientOutcome.is_deleted == 0,
            PatientOutcome.treatment_success == True
        )
    ).count()
    treatment_success_rate = (success_count / total_patients * 100) if total_patients > 0 else 0
    
    return PatientOutcomeSummary(
        total_patients=total_patients,
        recovery_rate=round(recovery_rate, 2),
        mortality_rate=round(mortality_rate, 2),
        complication_rate=round(complication_rate, 2),
        average_recovery_time=round(average_recovery_time, 2),
        treatment_success_rate=round(treatment_success_rate, 2)
    )

@router.get("/resource-utilization", response_model=ResourceUtilization)
async def get_resource_utilization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get resource utilization metrics"""
    
    # Bed occupancy rate
    total_beds = db.query(Bed).filter(Bed.is_deleted == 0).count()
    occupied_beds = db.query(Bed).filter(
        and_(Bed.is_deleted == 0, Bed.status == "occupied")
    ).count()
    bed_occupancy_rate = (occupied_beds / total_beds * 100) if total_beds > 0 else 0
    
    # Staff utilization
    total_staff = db.query(Staff).filter(Staff.is_deleted == 0).count()
    active_staff = db.query(Staff).filter(
        and_(Staff.is_deleted == 0, Staff.is_active == True)
    ).count()
    staff_utilization_rate = (active_staff / total_staff * 100) if total_staff > 0 else 0
    
    # Equipment utilization
    total_equipment = db.query(Equipment).filter(Equipment.is_deleted == 0).count()
    in_use_equipment = db.query(Equipment).filter(
        and_(Equipment.is_deleted == 0, Equipment.status == "in_use")
    ).count()
    equipment_utilization_rate = (in_use_equipment / total_equipment * 100) if total_equipment > 0 else 0
    
    # Maintenance due
    maintenance_due_count = db.query(Equipment).filter(
        and_(
            Equipment.is_deleted == 0,
            Equipment.next_maintenance_due <= date.today()
        )
    ).count()
    
    # Equipment out of order
    out_of_order_count = db.query(Equipment).filter(
        and_(Equipment.is_deleted == 0, Equipment.status == "out_of_order")
    ).count()
    
    return ResourceUtilization(
        bed_occupancy_rate=round(bed_occupancy_rate, 2),
        staff_utilization_rate=round(staff_utilization_rate, 2),
        equipment_utilization_rate=round(equipment_utilization_rate, 2),
        maintenance_due_count=maintenance_due_count,
        equipment_out_of_order_count=out_of_order_count
    )

@router.get("/cost-analysis")
async def get_cost_analysis(
    start_date: date = Query(...),
    end_date: date = Query(...),
    department_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get cost analysis for a specific period"""
    
    query = db.query(CostAnalysis).filter(
        and_(
            CostAnalysis.is_deleted == 0,
            CostAnalysis.period_start >= start_date,
            CostAnalysis.period_end <= end_date
        )
    )
    
    if department_id:
        query = query.filter(CostAnalysis.department_id == department_id)
    
    cost_analyses = query.all()
    
    # Calculate totals
    total_cost = sum(ca.total_cost for ca in cost_analyses)
    total_revenue = sum(ca.total_revenue for ca in cost_analyses if ca.total_revenue)
    total_profit = total_revenue - total_cost
    profit_margin = (total_profit / total_revenue * 100) if total_revenue > 0 else 0
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_cost": float(total_cost),
        "total_revenue": float(total_revenue),
        "total_profit": float(total_profit),
        "profit_margin": round(profit_margin, 2),
        "cost_analyses": cost_analyses
    }



