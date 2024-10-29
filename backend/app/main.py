from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import shutil
import os
import secrets
from passlib.context import CryptContext
from app.models.models import Base, User as DBUser, File as DBFile, Permission
from app.models.schemas import PermissionCreate, UserCreate, User, Token, AccessType
from app.utils.connection import SessionLocal


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = secrets.token_urlsafe(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

TOKEN_URL = "/S3/auth/oauth/login"
app = FastAPI()
origins = [
    "http://localhost:3000",  # frontend URL
    "http://localhost:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST)
    allow_headers=["*"],
)

# OAuth2 scheme for password flow
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=TOKEN_URL)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme)):
    print(token)
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(payload)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Check for expiration
        if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            raise credentials_exception
        
    except JWTError:
        raise credentials_exception
    
    db = SessionLocal()
    user = db.query(DBUser).filter(DBUser.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/S3/auth/oauth/register", response_model=Token)
async def register(user: UserCreate):
    try:
        db = SessionLocal()
        db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
        if db_user: raise HTTPException(status_code=400, detail="Username already registered")
    
        db_user = DBUser(
	    email=user.email,
	    username=user.username,
	    password_hash=get_password_hash(user.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        access_token = create_access_token(data={"sub": db_user.username})
        return {"access_token": access_token, "token_type": "bearer"}
    except (Exception, HTTPException) as exception:
        return JSONResponse(status_code=400, content = {"Error":str(exception)})

@app.post(TOKEN_URL, response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    db_user = db.query(DBUser).filter(DBUser.username == form_data.username).first()
    if not db_user or not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/S3/auth/profile", response_model=User)
async def get_profile(current_user: DBUser = Depends(get_current_user)):
    return current_user

@app.post("/S3/files/upload")
async def upload_file(file: UploadFile = File(...), current_user: DBUser = Depends(get_current_user)):
    db = SessionLocal()

    os.makedirs("files", exist_ok=True)
    file_location = f"files/{file.filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_record = DBFile(
        user_id=current_user.id,
        file_name=file.filename,
        file_size=os.path.getsize(file_location),
        file_type=file.content_type
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    return {"filename": file.filename, "file_id": file_record.id}

@app.get("/S3/files/download/{file_id}")
async def download_file(file_id: int, current_user: DBUser = Depends(get_current_user)):
    db = SessionLocal()
    
    # Check if the file is owned by the current user
    file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()

    # If not found, check if the file is shared with the current user
    if file_record is None:
        file_record = (
            db.query(DBFile)
            .join(Permission)
            .filter(DBFile.id == file_id, Permission.user_id == current_user.id)
            .first()
        )

    if file_record is None:
        raise HTTPException(status_code=404, detail="File not found")

    file_location = f"files/{file_record.file_name}"
    return FileResponse(
        path=file_location,
        media_type=file_record.file_type,
        filename=file_record.file_name,
        headers={"Content-Disposition": f"attachment; filename={file_record.file_name}"}
    )


@app.get("/S3/files")
async def list_files(current_user: DBUser = Depends(get_current_user)):
    db = SessionLocal()

    # Fetch files owned by the current user
    owned_files = db.query(DBFile).filter(DBFile.user_id == current_user.id).all()

    # Fetch files shared with the current user
    shared_files = (
        db.query(DBFile)
        .join(Permission)
        .filter(Permission.user_id == current_user.id)
        .all()
    )

    all_files = owned_files + shared_files

    # Return a unique list of files, avoiding duplicates
    unique_files = {file.id: file for file in all_files}.values()

    return [{"file_id": file.id, "filename": file.file_name} for file in unique_files]


@app.delete("/S3/files/{file_id}")
async def delete_file(file_id: int, current_user: DBUser = Depends(get_current_user)):
    db = SessionLocal()
    file_record = db.query(DBFile).filter(DBFile.id == file_id, DBFile.user_id == current_user.id).first()
    
    if file_record is None:
        raise HTTPException(status_code=404, detail="File not found")

    db.delete(file_record)
    db.commit()

    return {"detail": "File deleted"}


@app.post("/S3/share_file/{file_id}")
def share_file(file_id: int, share_request: PermissionCreate):
    db = SessionLocal()
    
    user = db.query(DBUser).filter(DBUser.username == share_request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    file = db.query(DBFile).filter(DBFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Create the permission instance correctly
    permission = Permission(
        user_id=user.id,
        file_id=file.id,
        access_type="shared"
    )
    
    db.add(permission)
    db.commit()
    return {"message": "File shared successfully"}
