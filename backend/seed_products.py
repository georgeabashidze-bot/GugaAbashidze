"""Idempotent product seeder for SmartPaw Food.

Run automatically on app startup if `products` collection is empty,
or manually via:  python -m backend.seed_products
"""

from datetime import datetime, timezone
from typing import List, Dict


# Stable image pool. Photos chosen to read clearly as pet food / hygiene / vitamins.
IMG = {
    # Food
    "kibble_dog": "https://images.pexels.com/photos/8434637/pexels-photo-8434637.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "kibble_cat": "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "wet_cat": "https://images.pexels.com/photos/7210262/pexels-photo-7210262.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "treat_dog": "https://images.pexels.com/photos/5731866/pexels-photo-5731866.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "raw_dog": "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "salmon_dog": "https://images.pexels.com/photos/6816859/pexels-photo-6816859.jpeg?auto=compress&cs=tinysrgb&w=1200",

    # Hygiene
    "shampoo": "https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "dental": "https://images.pexels.com/photos/6816865/pexels-photo-6816865.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "ear_clean": "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "litter": "https://images.pexels.com/photos/6957007/pexels-photo-6957007.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "wipes": "https://images.pexels.com/photos/5731841/pexels-photo-5731841.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "brush": "https://images.pexels.com/photos/6816863/pexels-photo-6816863.jpeg?auto=compress&cs=tinysrgb&w=1200",

    # Vitamins
    "calm": "https://images.pexels.com/photos/8434641/pexels-photo-8434641.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "joint": "https://images.pexels.com/photos/5731869/pexels-photo-5731869.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "omega": "https://images.pexels.com/photos/7210754/pexels-photo-7210754.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "probiotic": "https://images.pexels.com/photos/8434670/pexels-photo-8434670.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "multivit": "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "skin_coat": "https://images.pexels.com/photos/6568501/pexels-photo-6568501.jpeg?auto=compress&cs=tinysrgb&w=1200",
}


PRODUCTS: List[Dict] = [
    # ---------------- FOOD ----------------
    {
        "slug": "royal-canin-medium-adult",
        "name": "Royal Canin Medium Adult",
        "brand": "Royal Canin",
        "sub_category": "food",
        "pet_type": "dog",
        "image": IMG["kibble_dog"],
        "description": "Complete dry food tailored to medium-breed adult dogs (11–25 kg). Crunchy kibble with optimal energy for daily activity.",
        "size": "4 kg · 15 kg",
        "tags": ["dry", "adult", "medium-breed"],
        "featured": True,
    },
    {
        "slug": "hills-science-plan-adult-cat",
        "name": "Hill's Science Plan Adult Chicken",
        "brand": "Hill's Science Plan",
        "sub_category": "food",
        "pet_type": "cat",
        "image": IMG["kibble_cat"],
        "description": "Clinically-formulated dry food for adult cats 1–6 years. Real chicken, balanced minerals for urinary health.",
        "size": "1.5 kg · 3 kg · 10 kg",
        "tags": ["dry", "adult", "urinary"],
        "featured": True,
    },
    {
        "slug": "purina-pro-plan-sensitive-cat-wet",
        "name": "Pro Plan Sensitive Skin Wet Pouches",
        "brand": "Purina Pro Plan",
        "sub_category": "food",
        "pet_type": "cat",
        "image": IMG["wet_cat"],
        "description": "Wet food pouches in jelly for cats with sensitive skin. High in salmon and Omega-6, supports a glossy coat.",
        "size": "85 g × 26 pouches",
        "tags": ["wet", "sensitive-skin"],
    },
    {
        "slug": "acana-heritage-free-run-poultry",
        "name": "Acana Heritage Free-Run Poultry",
        "brand": "Acana",
        "sub_category": "food",
        "pet_type": "dog",
        "image": IMG["raw_dog"],
        "description": "Biologically appropriate kibble with 60% free-run chicken, turkey and eggs. Whole-prey ratios, no plant proteins.",
        "size": "2 kg · 11.4 kg",
        "tags": ["grain-free", "high-protein"],
    },
    {
        "slug": "brit-care-hypoallergenic-salmon",
        "name": "Brit Care Hypoallergenic Salmon",
        "brand": "Brit Care",
        "sub_category": "food",
        "pet_type": "dog",
        "image": IMG["salmon_dog"],
        "description": "Single-protein salmon recipe for dogs with food intolerances. Grain-free, hypoallergenic, gentle on the stomach.",
        "size": "1 kg · 3 kg · 12 kg",
        "tags": ["hypoallergenic", "single-protein"],
    },
    {
        "slug": "happy-cat-sensitive-stomach",
        "name": "Happy Cat Sensitive Stomach & Intestines",
        "brand": "Happy Cat",
        "sub_category": "food",
        "pet_type": "cat",
        "image": IMG["treat_dog"],
        "description": "Easily digestible dry food for cats with sensitive digestion. Reduced fat, prebiotics for gut balance.",
        "size": "1.4 kg · 4 kg",
        "tags": ["sensitive", "digestion"],
    },

    # ---------------- HYGIENE ----------------
    {
        "slug": "tropiclean-deep-cleansing-shampoo",
        "name": "TropiClean Deep Cleansing Shampoo",
        "brand": "TropiClean",
        "sub_category": "hygiene",
        "pet_type": "both",
        "image": IMG["shampoo"],
        "description": "Berry-and-coconut shampoo that lifts dirt and dander without stripping natural oils. Soap- and paraben-free.",
        "size": "355 ml · 1 L",
        "tags": ["shampoo", "natural"],
        "featured": True,
    },
    {
        "slug": "beaphar-dental-toothpaste",
        "name": "Beaphar Dog-A-Dent Toothpaste",
        "brand": "Beaphar",
        "sub_category": "hygiene",
        "pet_type": "dog",
        "image": IMG["dental"],
        "description": "Liver-flavoured enzymatic toothpaste that loosens plaque and freshens breath. No rinsing required.",
        "size": "100 g",
        "tags": ["dental"],
    },
    {
        "slug": "virbac-epi-otic-ear-cleanser",
        "name": "Virbac Epi-Otic Ear Cleanser",
        "brand": "Virbac",
        "sub_category": "hygiene",
        "pet_type": "both",
        "image": IMG["ear_clean"],
        "description": "Veterinary ear cleaner for routine maintenance. Removes wax and debris, helps prevent infections.",
        "size": "125 ml · 250 ml",
        "tags": ["ear-care", "vet"],
    },
    {
        "slug": "ever-clean-multiple-cat-litter",
        "name": "Ever Clean Multiple Cat Clumping Litter",
        "brand": "Ever Clean",
        "sub_category": "hygiene",
        "pet_type": "cat",
        "image": IMG["litter"],
        "description": "Hard-clumping bentonite litter with activated carbon. Locks in odour, low dust — ideal for multi-cat homes.",
        "size": "6 kg · 10 kg",
        "tags": ["litter", "clumping"],
        "featured": True,
    },
    {
        "slug": "pet-head-quick-fix-wipes",
        "name": "Pet Head Quick Fix Grooming Wipes",
        "brand": "Pet Head",
        "sub_category": "hygiene",
        "pet_type": "both",
        "image": IMG["wipes"],
        "description": "Plant-derived deodorising wipes for paws, coat and bums between baths. Aloe and vitamin E.",
        "size": "100 wipes",
        "tags": ["wipes", "deodoriser"],
    },
    {
        "slug": "trixie-soft-bristle-brush",
        "name": "Trixie Soft-Bristle Grooming Brush",
        "brand": "Trixie",
        "sub_category": "hygiene",
        "pet_type": "both",
        "image": IMG["brush"],
        "description": "Wooden handle, natural-bristle brush for short-haired cats and dogs. Daily de-shed and finishing.",
        "size": "One size",
        "tags": ["brush", "grooming"],
    },

    # ---------------- VITAMINS ----------------
    {
        "slug": "vetriscience-composure-chews",
        "name": "VetriScience Composure Calming Chews",
        "brand": "VetriScience",
        "sub_category": "vitamins",
        "pet_type": "both",
        "image": IMG["calm"],
        "description": "Veterinary-recommended chews with L-theanine and colostrum complex. Eases travel, fireworks and vet-visit stress.",
        "size": "30 chews · 60 chews",
        "tags": ["calming", "behavioural"],
        "featured": True,
    },
    {
        "slug": "nutramax-cosequin-ds",
        "name": "Nutramax Cosequin DS Joint Support",
        "brand": "Nutramax",
        "sub_category": "vitamins",
        "pet_type": "dog",
        "image": IMG["joint"],
        "description": "Glucosamine + chondroitin + MSM chewable tablets. Supports cartilage and joint mobility in active and senior dogs.",
        "size": "60 tabs · 132 tabs",
        "tags": ["joints", "senior"],
    },
    {
        "slug": "beaphar-salmon-oil",
        "name": "Beaphar Pure Salmon Oil",
        "brand": "Beaphar",
        "sub_category": "vitamins",
        "pet_type": "both",
        "image": IMG["omega"],
        "description": "Cold-pressed Norwegian salmon oil. High in Omega-3 and Omega-6 for shiny coat, healthy skin and joint comfort.",
        "size": "250 ml · 500 ml · 1 L",
        "tags": ["omega-3", "skin-coat"],
        "featured": True,
    },
    {
        "slug": "vetoquinol-propectalin-paste",
        "name": "Vetoquinol Pro-Pectalin Probiotic Paste",
        "brand": "Vetoquinol",
        "sub_category": "vitamins",
        "pet_type": "both",
        "image": IMG["probiotic"],
        "description": "Fast-acting probiotic paste for digestive upsets. Kaolin and pectin firm up stools, probiotics restore gut flora.",
        "size": "15 ml · 30 ml syringe",
        "tags": ["probiotic", "digestion"],
    },
    {
        "slug": "trixie-premio-multivitamin-stick",
        "name": "Trixie Premio Multivitamin Stick",
        "brand": "Trixie",
        "sub_category": "vitamins",
        "pet_type": "dog",
        "image": IMG["multivit"],
        "description": "Daily multivitamin chew with calcium, biotin and B-complex. Reward and supplement in one bite.",
        "size": "12 sticks",
        "tags": ["multivitamin", "daily"],
    },
    {
        "slug": "canina-petvital-derm-caps",
        "name": "Canina Petvital Derm Caps",
        "brand": "Canina",
        "sub_category": "vitamins",
        "pet_type": "both",
        "image": IMG["skin_coat"],
        "description": "Skin & coat capsules with evening primrose, fish oil and biotin. For dull coats, itching and seasonal shedding.",
        "size": "60 caps · 120 caps",
        "tags": ["skin-coat"],
    },
]


def _expand(p: dict, category: str = "catalogue") -> dict:
    """Add the fields every Product document needs in MongoDB."""
    import uuid
    return {
        "id": str(uuid.uuid4()),
        "slug": p["slug"],
        "name": p["name"],
        "brand": p["brand"],
        "category": p.get("category", category),
        "sub_category": p["sub_category"],
        "pet_type": p.get("pet_type", "both"),
        "image": p["image"],
        "description": p["description"],
        "size": p.get("size"),
        "tags": p.get("tags", []),
        "featured": p.get("featured", False),
        "status": "published",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


async def seed_products_if_empty(db) -> int:
    """Insert sample products (catalogue + specials) if collection is empty.

    Returns total inserted (0 if collection already had docs).
    """
    existing = await db.products.count_documents({})
    if existing > 0:
        return 0
    from seed_specials import SPECIALS_PRODUCTS

    docs = [_expand(p, "catalogue") for p in PRODUCTS]
    docs += [_expand(p, "specials") for p in SPECIALS_PRODUCTS]
    if docs:
        await db.products.insert_many(docs)
        await db.products.create_index("slug", unique=True)
        await db.products.create_index([("category", 1), ("sub_category", 1)])
    return len(docs)
