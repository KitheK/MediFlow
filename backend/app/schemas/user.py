from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from enum import Enum

from app.models.user import UserRole

# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole
    department_id: Optional[UUID] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role: Optional[UserRole] = None
    department_id: Optional[UUID] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: UUID
    last_login: Optional[date]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Authentication Schemas
class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=100)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[UUID] = None
    role: Optional[UserRole] = None

# Password Change Schema
class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=100)
    new_password: str = Field(..., min_length=8, max_length=100)



