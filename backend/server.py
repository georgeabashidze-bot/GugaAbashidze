from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from seed_products import seed_products_if_empty


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="SmartPaw Food API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ------------- Models -------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=4, max_length=40)
    pet_type: str = Field(min_length=1, max_length=40)  # dog | cat | both
    pet_name: Optional[str] = Field(default=None, max_length=80)
    pet_breed: Optional[str] = Field(default=None, max_length=120)
    pet_age: Optional[str] = Field(default=None, max_length=40)
    notes: Optional[str] = Field(default=None, max_length=1000)


class Lead(LeadCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class LeadResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: datetime


# ---- Products ----
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    name: str
    brand: str
    category: str  # 'catalogue' | 'specials'
    sub_category: str  # 'food' | 'hygiene' | 'vitamins' | 'toys' | 'tech' | 'services'
    pet_type: str = 'both'  # 'dog' | 'cat' | 'both'
    image: str
    description: str
    size: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    featured: bool = False
    status: str = 'published'  # 'draft' | 'published'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ------------- Routes -------------
@api_router.get("/")
async def root():
    return {"message": "SmartPaw Food API is running"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


@api_router.post("/leads", response_model=LeadResponse, status_code=201)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.leads.insert_one(doc)
    return LeadResponse(
        id=lead.id,
        name=lead.name,
        email=lead.email,
        created_at=lead.created_at,
    )


@api_router.get("/leads", response_model=List[LeadResponse])
async def list_leads():
    items = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    result: List[LeadResponse] = []
    for it in items:
        created = it.get('created_at')
        if isinstance(created, str):
            created = datetime.fromisoformat(created)
        result.append(LeadResponse(
            id=it['id'],
            name=it['name'],
            email=it['email'],
            created_at=created,
        ))
    return result


# ---- Products ----
def _serialize_product(doc: dict) -> Product:
    created = doc.get('created_at')
    if isinstance(created, str):
        try:
            created = datetime.fromisoformat(created)
        except ValueError:
            created = datetime.now(timezone.utc)
    return Product(
        id=doc['id'],
        slug=doc['slug'],
        name=doc['name'],
        brand=doc['brand'],
        category=doc['category'],
        sub_category=doc['sub_category'],
        pet_type=doc.get('pet_type', 'both'),
        image=doc['image'],
        description=doc['description'],
        size=doc.get('size'),
        tags=doc.get('tags', []),
        featured=doc.get('featured', False),
        status=doc.get('status', 'published'),
        created_at=created if isinstance(created, datetime) else datetime.now(timezone.utc),
    )


@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    sub_category: Optional[str] = None,
    pet_type: Optional[str] = None,
    featured: Optional[bool] = None,
):
    query: dict = {"status": "published"}
    if category:
        query["category"] = category
    if sub_category:
        query["sub_category"] = sub_category
    if pet_type:
        # 'both' matches everything; otherwise match exact or 'both'
        query["pet_type"] = {"$in": [pet_type, "both"]}
    if featured is not None:
        query["featured"] = featured

    items = await db.products.find(query, {"_id": 0}).sort("created_at", 1).to_list(500)
    return [_serialize_product(it) for it in items]


@api_router.get("/products/{slug}", response_model=Product)
async def get_product(slug: str):
    doc = await db.products.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return _serialize_product(doc)


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_seed_products():
    try:
        inserted = await seed_products_if_empty(db)
        if inserted:
            logger.info("Seeded %d products into catalogue.", inserted)
    except Exception as e:  # noqa: BLE001
        logger.error("Product seeding failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
