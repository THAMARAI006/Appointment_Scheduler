from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.application.dto.user_dto import (
    UserLoginDTO,
    UserProfileUpdateDTO,
    UserRegisterDTO,
    UserResponseDTO,
)
from app.application.services.user_application_service import (
    get_user_use_case,
    list_users_use_case,
    login_user_use_case,
    register_user_use_case,
    update_user_profile_use_case,
)
from app.core.database import get_db
from app.infrastructure.repositories import UserRepositoryImplementation

router = APIRouter()


@router.post("/register", response_model=UserResponseDTO)
def register(user: UserRegisterDTO, db: Session = Depends(get_db)):
    repository = UserRepositoryImplementation(db)
    return register_user_use_case(repository, user)


@router.post("/login", response_model=UserResponseDTO)
def login(login_data: UserLoginDTO, db: Session = Depends(get_db)):
    repository = UserRepositoryImplementation(db)
    user = login_user_use_case(repository, login_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=List[UserResponseDTO])
def list_users(db: Session = Depends(get_db)):
    repository = UserRepositoryImplementation(db)
    return list_users_use_case(repository)


@router.get("/{user_id}", response_model=UserResponseDTO)
def get_user(user_id: int, db: Session = Depends(get_db)):
    repository = UserRepositoryImplementation(db)
    user = get_user_use_case(repository, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}/profile", response_model=UserResponseDTO)
def update_profile(user_id: int, profile: UserProfileUpdateDTO, db: Session = Depends(get_db)):
    repository = UserRepositoryImplementation(db)
    updated_user = update_user_profile_use_case(repository, user_id, profile)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user
