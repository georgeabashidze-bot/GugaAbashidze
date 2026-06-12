"""Seed the 3 default SmartPaw plans into MongoDB if the collection is empty.

The plans match the copy currently shown on PlansPage.jsx so the public page
keeps rendering identically after switching from hardcoded to API-driven.
Admins can now edit any of these via /admin/plans.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Dict


def _plans() -> List[Dict]:
    now_iso = datetime.now(timezone.utc).isoformat()
    base = {
        "created_at": now_iso,
        "updated_at": now_iso,
        "status": "published",
    }
    return [
        {
            **base,
            "id": str(uuid.uuid4()),
            "slug": "free",
            "order": 1,
            "name": "Free",
            "name_ka": "უფასო",
            "tagline": "Stock from our catalogue on your schedule — delivery and reminders, free.",
            "tagline_ka": "შეუკვეთე ჩვენი კატალოგიდან შენი გრაფიკით — მიწოდება და შეხსენებები უფასოდ.",
            "price": "0",
            "price_suffix": "GEL / month",
            "price_suffix_ka": "ლარი / თვეში",
            "price_note": "No minimum spend",
            "price_note_ka": "მინიმუმის გარეშე",
            "features": [
                {"en": "Free Tbilisi delivery", "ka": "უფასო მიწოდება თბილისში"},
                {"en": "Auto reminders before you run out", "ka": "ავტომატური შეხსენებები ამოწურვამდე"},
                {"en": "Personalised feeding plan", "ka": "ინდივიდუალური კვების გეგმა"},
                {"en": "WhatsApp ops concierge", "ka": "WhatsApp კონსიერჟი"},
                {"en": "Pause / skip any time", "ka": "შეჩერება / გამოტოვება ნებისმიერ დროს"},
                {"en": "Access to all Special Offers", "ka": "წვდომა ყველა სპეც. შეთავაზებაზე"},
            ],
            "cta_label": "Start free",
            "cta_label_ka": "დაიწყე უფასოდ",
            "badge": None,
            "badge_ka": None,
            "featured": False,
        },
        {
            **base,
            "id": str(uuid.uuid4()),
            "slug": "feeder",
            "order": 2,
            "name": "Free + Feeder",
            "name_ka": "უფასო + ფიდერი",
            "tagline": "Same free plan — plus our Wi-Fi SmartPaw Feeder on loan, set up and synced.",
            "tagline_ka": "იგივე უფასო გეგმა — დამატებით უფასო Wi-Fi SmartPaw ფიდერი დაყენებითა და სინქრონიზაციით.",
            "price": "0",
            "price_suffix": "GEL / month",
            "price_suffix_ka": "ლარი / თვეში",
            "price_note": "min. 150 GEL monthly spend on partner products",
            "price_note_ka": "მინ. 150 ლარი თვეში პარტნიორ პროდუქტებზე",
            "features": [
                {"en": "Everything in Free", "ka": "ყველაფერი უფასო გეგმიდან"},
                {"en": "SmartPaw Wi-Fi Feeder included", "ka": "SmartPaw Wi-Fi ფიდერი ჩართულია"},
                {"en": "Feeder setup, sync & support", "ka": "ფიდერის დაყენება, სინქრონი და მხარდაჭერა"},
                {"en": "Priority delivery slots", "ka": "პრიორიტეტული მიწოდების სლოტები"},
                {"en": "Auto-portioning to your plan", "ka": "ავტომატური დოზირება შენი გეგმისთვის"},
                {"en": "Missed-meal alerts", "ka": "გამოტოვებული კვების შეტყობინებები"},
            ],
            "cta_label": "Claim the feeder",
            "cta_label_ka": "მიიღე ფიდერი",
            "badge": "Most popular",
            "badge_ka": "ყველაზე პოპულარული",
            "featured": True,
        },
        {
            **base,
            "id": str(uuid.uuid4()),
            "slug": "custom",
            "order": 3,
            "name": "Custom Pick",
            "name_ka": "ინდივიდუალური არჩევანი",
            "tagline": "Already loyal to a brand we don’t stock? We’ll source it and run the same routine.",
            "tagline_ka": "გყავს საყვარელი ბრენდი, რომელიც ჩვენ არ გვაქვს? ჩვენ მოვიტანთ და გავაგრძელებთ იგივე რუტინას.",
            "price": "15",
            "price_suffix": "GEL / month",
            "price_suffix_ka": "ლარი / თვეში",
            "price_note": "For products outside our catalogue",
            "price_note_ka": "კატალოგის გარეთ მყოფი პროდუქტებისთვის",
            "features": [
                {"en": "Free Tbilisi delivery", "ka": "უფასო მიწოდება თბილისში"},
                {"en": "Any product, any brand — sourced for you", "ka": "ნებისმიერი პროდუქტი, ნებისმიერი ბრენდი"},
                {"en": "Auto reminders & stock tracking", "ka": "ავტომატური შეხსენებები"},
                {"en": "WhatsApp ops concierge", "ka": "WhatsApp კონსიერჟი"},
                {"en": "Pause / skip any time", "ka": "შეჩერება / გამოტოვება ნებისმიერ დროს"},
                {"en": "Access to all Special Offers", "ka": "წვდომა სპეც. შეთავაზებებზე"},
            ],
            "cta_label": "Pick your brand",
            "cta_label_ka": "აირჩიე ბრენდი",
            "badge": None,
            "badge_ka": None,
            "featured": False,
        },
    ]


async def seed_plans_if_empty(db) -> int:
    existing = await db.plans.count_documents({})
    if existing > 0:
        return 0
    docs = _plans()
    await db.plans.insert_many(docs)
    return len(docs)
