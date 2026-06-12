from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from seed_products import seed_products_if_empty
from seed_promos import seed_promos_if_empty
from seed_blog import seed_blog_posts_if_empty
from auth import seed_admin
from admin_routes import admin_router
from products_import import import_router

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
    name_ka: Optional[str] = None
    brand: str
    category: str  # 'catalogue' | 'specials'
    sub_category: str  # 'food' | 'hygiene' | 'vitamins' | 'toys' | 'tech' | 'services'
    pet_type: str = 'both'  # 'dog' | 'cat' | 'both'
    image: str
    description: str
    description_ka: Optional[str] = None
    size: Optional[str] = None
    price: Optional[float] = None
    currency: str = 'GEL'
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


class ContactInquiryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=180)
    message: str = Field(min_length=1, max_length=4000)
    department: Optional[str] = Field(default='general', max_length=40)


class ContactInquiry(ContactInquiryCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ContactInquiryResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    subject: str
    created_at: datetime


@api_router.post("/contact-inquiries", response_model=ContactInquiryResponse, status_code=201)
async def create_contact_inquiry(payload: ContactInquiryCreate):
    inquiry = ContactInquiry(**payload.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contact_inquiries.insert_one(doc)
    return ContactInquiryResponse(
        id=inquiry.id,
        name=inquiry.name,
        email=inquiry.email,
        subject=inquiry.subject,
        created_at=inquiry.created_at,
    )


@api_router.get("/contact-inquiries", response_model=List[ContactInquiryResponse])
async def list_contact_inquiries():
    items = await db.contact_inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    result: List[ContactInquiryResponse] = []
    for it in items:
        created = it.get('created_at')
        if isinstance(created, str):
            created = datetime.fromisoformat(created)
        result.append(ContactInquiryResponse(
            id=it['id'],
            name=it['name'],
            email=it['email'],
            subject=it['subject'],
            created_at=created,
        ))
    return result


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
        name_ka=doc.get('name_ka'),
        brand=doc['brand'],
        category=doc['category'],
        sub_category=doc['sub_category'],
        pet_type=doc.get('pet_type', 'both'),
        image=doc['image'],
        description=doc['description'],
        description_ka=doc.get('description_ka'),
        size=doc.get('size'),
        price=doc.get('price'),
        currency=doc.get('currency', 'GEL'),
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


# ---- Public Special Offers ----
class PublicSpecialOffer(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    slug: str
    title: str
    title_ka: Optional[str] = None
    description: str
    description_ka: Optional[str] = None
    image: str
    badge: Optional[str] = None
    discount_percent: Optional[int] = None
    original_price: Optional[float] = None
    sale_price: Optional[float] = None
    sub_category: Optional[str] = None
    linked_product_slug: Optional[str] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    order: int = 100


@api_router.get("/special-offers", response_model=List[PublicSpecialOffer])
async def list_public_special_offers(sub_category: Optional[str] = None):
    """Active, in-window special offers for the public site."""
    now_iso = datetime.now(timezone.utc).isoformat()
    query: dict = {
        "status": "published",
        "$and": [
            {"$or": [{"starts_at": None}, {"starts_at": ""}, {"starts_at": {"$lte": now_iso}}]},
            {"$or": [{"ends_at": None}, {"ends_at": ""}, {"ends_at": {"$gte": now_iso}}]},
        ],
    }
    if sub_category:
        query["sub_category"] = sub_category
    docs = await db.special_offers.find(query, {"_id": 0}).sort("order", 1).to_list(200)
    return [PublicSpecialOffer(**d) for d in docs]



# ---- Promos ----
class Promo(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    slug: str
    title: str
    subtitle: str
    badge: Optional[str] = None
    cta_label: str
    cta_route: str
    image: str
    accent: Optional[str] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    active: bool = True
    order: int = 100


@api_router.get("/promos", response_model=List[Promo])
async def list_promos():
    """Return promos that are active and within their date window."""
    now_iso = datetime.now(timezone.utc).isoformat()
    query = {
        "active": True,
        "$and": [
            {"$or": [{"starts_at": None}, {"starts_at": {"$lte": now_iso}}]},
            {"$or": [{"ends_at": None}, {"ends_at": {"$gte": now_iso}}]},
        ],
    }
    items = await db.promos.find(query, {"_id": 0}).sort("order", 1).to_list(50)
    return [Promo(**it) for it in items]


# ---- Blog ----
class BlogPostSummary(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: str
    title: str
    excerpt: str
    tag: Optional[str] = None
    category: Optional[str] = None
    cover_image: str
    cover_alt: Optional[str] = None
    author_name: str
    author_role: Optional[str] = None
    author_avatar: Optional[str] = None
    read_minutes: int = 5
    published_at: str
    tags: List[str] = Field(default_factory=list)


class BlogPost(BlogPostSummary):
    content: str
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None


@api_router.get("/blog/posts", response_model=List[BlogPostSummary])
async def list_blog_posts(tag: Optional[str] = None, limit: int = 24):
    query: dict = {"status": "published"}
    if tag:
        query["tags"] = tag
    items = await db.blog_posts.find(query, {"_id": 0, "content": 0}).sort("published_at", -1).to_list(limit)
    result: List[BlogPostSummary] = []
    for it in items:
        result.append(BlogPostSummary(
            slug=it["slug"],
            title=it["title"],
            excerpt=it.get("excerpt", ""),
            tag=it.get("tag"),
            category=it.get("category"),
            cover_image=it.get("cover_image", ""),
            cover_alt=it.get("cover_alt"),
            author_name=it.get("author_name", "SmartPaw Team"),
            author_role=it.get("author_role"),
            author_avatar=it.get("author_avatar"),
            read_minutes=int(it.get("read_minutes", 5)),
            published_at=it["published_at"],
            tags=it.get("tags", []),
        ))
    return result


@api_router.get("/blog/posts/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    doc = await db.blog_posts.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPost(
        slug=doc["slug"],
        title=doc["title"],
        excerpt=doc.get("excerpt", ""),
        tag=doc.get("tag"),
        category=doc.get("category"),
        cover_image=doc.get("cover_image", ""),
        cover_alt=doc.get("cover_alt"),
        author_name=doc.get("author_name", "SmartPaw Team"),
        author_role=doc.get("author_role"),
        author_avatar=doc.get("author_avatar"),
        read_minutes=int(doc.get("read_minutes", 5)),
        published_at=doc["published_at"],
        tags=doc.get("tags", []),
        content=doc.get("content", ""),
        seo_title=doc.get("seo_title"),
        seo_description=doc.get("seo_description"),
    )


# Include the router in the main app
app.include_router(api_router)
app.include_router(admin_router)
app.include_router(import_router)

# Serve uploaded images (admin uploads land here, ingress routes /api/* to backend)
_upload_dir = Path(os.environ.get('UPLOAD_DIR', '/app/backend/uploads'))
_upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(_upload_dir)), name="uploads")

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
        await seed_admin(db)
        logger.info("Admin seed check complete.")
    except Exception as e:  # noqa: BLE001
        logger.error("Admin seeding failed: %s", e)
    try:
        inserted = await seed_products_if_empty(db)
        if inserted:
            logger.info("Seeded %d products.", inserted)
    except Exception as e:  # noqa: BLE001
        logger.error("Product seeding failed: %s", e)
    try:
        inserted = await seed_promos_if_empty(db)
        if inserted:
            logger.info("Seeded %d promos.", inserted)
    except Exception as e:  # noqa: BLE001
        logger.error("Promo seeding failed: %s", e)
    try:
        inserted = await seed_blog_posts_if_empty(db)
        if inserted:
            logger.info("Seeded %d blog posts.", inserted)
    except Exception as e:  # noqa: BLE001
        logger.error("Blog seeding failed: %s", e)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
