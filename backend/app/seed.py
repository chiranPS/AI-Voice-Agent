
import os
import logging
from pathlib import Path

from dotenv import load_dotenv

# Load backend environment variables before importing models.
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import (
    Organisation,
    FAQCategory,
    FAQDocument,
    FAQEmbedding,
     UniversityContact,
)
from app.services.embedding_service import generate_document_embedding


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)

logger = logging.getLogger(__name__)

ORGANISATION_NAME = "Northstar University"
ORGANISATION_SLUG = "northstar-university"

EMBEDDING_MODEL = os.getenv(
    "GEMINI_EMBEDDING_MODEL",
    "gemini-embedding-2",
)


# All information below is fictional and intended for this project demo.
CATEGORIES = [
    {
        "name": "General Information",
        "description": "Basic information about Northstar University and its campus.",
    },
    {
        "name": "Admissions",
        "description": "Application requirements and admission procedures.",
    },
    {
        "name": "Academic Programmes",
        "description": "Available programmes, academic structure, and study information.",
    },
    {
        "name": "Fees and Payments",
        "description": "Tuition fees, payment methods, and payment deadlines.",
    },
    {
        "name": "Scholarships",
        "description": "Scholarship opportunities and eligibility requirements.",
    },
    {
        "name": "Accommodation",
        "description": "Student accommodation and residential facilities.",
    },
    {
        "name": "Student Services",
        "description": "Library, IT support, student activities, and other services.",
    },
    {
        "name": "International Students",
        "description": "Information for students applying from outside the country.",
    },
    {
        "name": "Contact Information",
        "description": "University office locations and contact details.",
    },
]

# Synthetic university contact information for demonstration.
CONTACT_DATA = [
    {
        "department": "General Enquiries",
        "phone_number": "+94 11 200 1000",
        "email": "info@northstar.example",
        "office_location": "Main Reception, Administration Building",
        "office_hours": "Monday to Friday, 8:00 AM to 5:00 PM",
    },
    {
        "department": "Admissions Office",
        "phone_number": "+94 11 200 1001",
        "email": "admissions@northstar.example",
        "office_location": "First Floor, Administration Building",
        "office_hours": "Monday to Friday, 8:30 AM to 4:30 PM",
    },
    {
        "department": "Student Affairs",
        "phone_number": "+94 11 200 1002",
        "email": "studentaffairs@northstar.example",
        "office_location": "Ground Floor, Student Services Building",
        "office_hours": "Monday to Friday, 8:30 AM to 4:30 PM",
    },
    {
        "department": "IT Support",
        "phone_number": "+94 11 200 1003",
        "email": "itsupport@northstar.example",
        "office_location": "Second Floor, Computer Centre",
        "office_hours": "Monday to Friday, 8:00 AM to 5:00 PM",
    },
    {
        "department": "Finance Office",
        "phone_number": "+94 11 200 1004",
        "email": "finance@northstar.example",
        "office_location": "First Floor, Administration Building",
        "office_hours": "Monday to Friday, 8:30 AM to 4:30 PM",
    },
    {
        "department": "Examination Office",
        "phone_number": "+94 11 200 1005",
        "email": "examinations@northstar.example",
        "office_location": "Second Floor, Administration Building",
        "office_hours": "Monday to Friday, 8:30 AM to 4:30 PM",
    },
]



# Each FAQ contains:
# category, question, answer
FAQ_DATA = [
    # General Information
    (
        "General Information",
        "Where is Northstar University located?",
        "Northstar University is a fictional university used for this demonstration. Its main campus is located in Colombo, Sri Lanka.",
    ),
    (
        "General Information",
        "What are the university's normal opening hours?",
        "For this demonstration, Northstar University's main campus is open from Monday to Friday, 8:00 AM to 5:00 PM. Administrative offices are closed on weekends and public holidays.",
    ),
    (
        "General Information",
        "Does Northstar University have campus facilities?",
        "Yes. The demonstration campus includes a library, computer laboratories, lecture rooms, a student lounge, a cafeteria, and an administrative office.",
    ),
    (
        "General Information",
        "How can I get information about the university?",
        "You can ask this information kiosk about admissions, academic programmes, fees, scholarships, accommodation, and student services. You can also contact the relevant university office for further assistance.",
    ),

    # Admissions
    (
        "Admissions",
        "How can I apply to Northstar University?",
        "Applicants can submit an application through the fictional Northstar University admissions portal. They should complete the application form and provide the required educational documents.",
    ),
    (
        "Admissions",
        "What documents are required for admission?",
        "The demonstration admission process requires a completed application form, copies of educational certificates, a copy of a valid identification document, and a recent passport-sized photograph.",
    ),
    (
        "Admissions",
        "When do applications open?",
        "For this demonstration, applications for the September intake open on 1 May and close on 31 July. These dates are fictional and are provided for testing the information kiosk.",
    ),
    (
        "Admissions",
        "Can I check my application status?",
        "Applicants can check their application status through the fictional admissions portal using their application reference number. If the status is unclear, they should contact the admissions office.",
    ),

    # Academic Programmes
    (
        "Academic Programmes",
        "What academic programmes are available?",
        "The fictional Northstar University offers demonstration programmes in Computer Science, Business Management, Information Technology, and Data Science.",
    ),
    (
        "Academic Programmes",
        "How long does the Computer Science degree take?",
        "The demonstration Bachelor of Science in Computer Science programme takes three years to complete on a full-time study basis.",
    ),
    (
        "Academic Programmes",
        "Are classes conducted on weekdays?",
        "Most full-time lectures and practical sessions are scheduled from Monday to Friday. Individual timetables may differ depending on the programme and semester.",
    ),
    (
        "Academic Programmes",
        "Does the university provide online learning?",
        "Yes. The demonstration university provides an online learning portal where students can access lecture materials, announcements, learning resources, and selected online activities.",
    ),

    # Fees and Payments
    (
        "Fees and Payments",
        "How much is the annual tuition fee?",
        "For this fictional demonstration, the annual tuition fee for the Computer Science programme is LKR 450,000. Fees for other programmes may differ.",
    ),
    (
        "Fees and Payments",
        "Can I pay tuition fees in instalments?",
        "Yes. Under the fictional demonstration payment policy, students may pay tuition fees in two instalments per academic year. They should contact the finance office to confirm their payment schedule.",
    ),
    (
        "Fees and Payments",
        "What payment methods are accepted?",
        "The demonstration university accepts bank transfers, debit cards, and credit cards. Students should retain their payment receipts for reference.",
    ),
    (
        "Fees and Payments",
        "Where can I obtain a payment receipt?",
        "Students can request a payment receipt from the finance office after their payment has been confirmed. They should provide their student identification number and payment reference.",
    ),

    # Scholarships
    (
        "Scholarships",
        "Does Northstar University offer scholarships?",
        "Yes. The fictional university offers academic merit scholarships and financial assistance scholarships as part of this demonstration.",
    ),
    (
        "Scholarships",
        "Who is eligible for an academic scholarship?",
        "Under the fictional demonstration policy, students with strong academic results may apply for an academic merit scholarship. Applications are reviewed by the scholarship committee.",
    ),
    (
        "Scholarships",
        "How can I apply for a scholarship?",
        "Students can submit a scholarship application through the student portal. They must provide their academic results and any supporting documents requested by the scholarship committee.",
    ),
    (
        "Scholarships",
        "When will scholarship results be announced?",
        "For this demonstration, scholarship results are announced within four weeks after the application closing date. Applicants are notified through their registered email addresses.",
    ),

    # Accommodation
    (
        "Accommodation",
        "Does the university provide student accommodation?",
        "The fictional Northstar University provides limited student accommodation near its main campus. Availability depends on the number of applications received.",
    ),
    (
        "Accommodation",
        "How can I apply for university accommodation?",
        "Students can apply through the accommodation office by completing the residential application form and providing their student details.",
    ),
    (
        "Accommodation",
        "Are meals included in the accommodation fee?",
        "For this demonstration, accommodation fees do not include meals. Students can use the campus cafeteria or arrange their own meals.",
    ),
    (
        "Accommodation",
        "Can international students apply for accommodation?",
        "Yes. International students may apply for university accommodation. They should submit their application early because residential spaces are limited.",
    ),

    # Student Services
    (
        "Student Services",
        "What are the library opening hours?",
        "For this demonstration, the university library is open Monday to Friday from 8:00 AM to 6:00 PM and on Saturday from 9:00 AM to 1:00 PM.",
    ),
    (
        "Student Services",
        "Does the university provide computer laboratory facilities?",
        "Yes. The demonstration campus includes computer laboratories with internet access and software for academic activities. Students can use these facilities according to their timetables.",
    ),
    (
        "Student Services",
        "How can I get technical support for my student account?",
        "Students can contact the IT support office or submit a support request through the student portal. They should include their student identification number and a description of the problem.",
    ),
    (
        "Student Services",
        "Are there student clubs and societies?",
        "Yes. The fictional university has demonstration student clubs for technology, business, sports, arts, and community activities. Students can contact the student affairs office to learn about joining.",
    ),

    # International Students
    (
        "International Students",
        "Can international students apply to Northstar University?",
        "Yes. The fictional university accepts applications from international students for its listed academic programmes. Applicants must meet the relevant academic and admission requirements.",
    ),
    (
        "International Students",
        "What documents do international applicants need?",
        "International applicants should provide their educational certificates, passport details, completed application form, and any additional documents requested by the admissions office.",
    ),
    (
        "International Students",
        "Does the university assist with visa information?",
        "The international student office can provide general guidance about student visa documentation. Applicants should confirm current visa requirements with the relevant official immigration authority.",
    ),
    (
        "International Students",
        "Can international students stay in university accommodation?",
        "Yes. International students can apply for the university's limited accommodation spaces. Applications are considered according to availability and the accommodation policy.",
    ),

    # Contact Information
    (
        "Contact Information",
        "How can I contact the admissions office?",
        "For this demonstration, the admissions office can be contacted at admissions@northstar.example. This is a fictional email address and is not a real university contact.",
    ),
    (
        "Contact Information",
        "How can I contact the finance office?",
        "For this demonstration, the finance office can be contacted at finance@northstar.example. This is a fictional email address and is not a real university contact.",
    ),
    (
        "Contact Information",
        "Where is the student affairs office?",
        "The demonstration student affairs office is located on the ground floor of the main administration building, near the main reception area.",
    ),
    (
        "Contact Information",
        "How can I contact the IT support office?",
        "For this demonstration, the IT support office can be contacted at itsupport@northstar.example. Students can also submit a support request through the fictional student portal.",
    ),
]


def get_or_create_organisation(db):
    organisation = db.scalar(
        select(Organisation).where(
            Organisation.slug == ORGANISATION_SLUG
        )
    )

    if organisation:
        logger.info("Organisation already exists: %s", organisation.name)
        return organisation

    organisation = Organisation(
        name=ORGANISATION_NAME,
        slug=ORGANISATION_SLUG,
    )

    db.add(organisation)
    db.commit()
    db.refresh(organisation)

    logger.info("Created organisation: %s", organisation.name)
    return organisation


def get_or_create_categories(db, organisation):
    category_map = {}

    for category_data in CATEGORIES:
        category = db.scalar(
            select(FAQCategory).where(
                FAQCategory.organisation_id == organisation.id,
                FAQCategory.name == category_data["name"],
            )
        )

        if category is None:
            category = FAQCategory(
                organisation_id=organisation.id,
                name=category_data["name"],
                description=category_data["description"],
            )
            db.add(category)
            db.flush()

            logger.info("Created category: %s", category.name)

        category_map[category.name] = category

    db.commit()
    return category_map


def seed_faqs(db, organisation, category_map):
    created_count = 0
    updated_count = 0
    unchanged_count = 0

    total = len(FAQ_DATA)

    for index, (category_name, question, answer) in enumerate(
        FAQ_DATA,
        start=1,
    ):
        logger.info("Processing FAQ %s/%s: %s", index, total, question)

        category = category_map[category_name]

        faq = db.scalar(
            select(FAQDocument).where(
                FAQDocument.organisation_id == organisation.id,
                FAQDocument.question == question,
            )
        )

        is_new = faq is None

        if is_new:
            faq = FAQDocument(
                organisation_id=organisation.id,
                category_id=category.id,
                question=question,
                answer=answer,
                is_active=True,
            )
            db.add(faq)
            db.flush()

        content_changed = (
            not is_new
            and (
                faq.question != question
                or faq.answer != answer
            )
        )

        if not is_new:
            faq.category_id = category.id
            faq.is_active = True

        if content_changed:
            faq.answer = answer

        embedding_record = db.get(FAQEmbedding, faq.id)

        needs_embedding = (
            is_new
            or content_changed
            or embedding_record is None
        )

        if needs_embedding:
            logger.info("Generating embedding...")

            embedding_vector = generate_document_embedding(
                question,
                answer,
            )

            if len(embedding_vector) != int(
                os.getenv("EMBEDDING_DIMENSIONS", "768")
            ):
                raise ValueError(
                    f"Embedding dimension mismatch for FAQ: {question}"
                )

            if embedding_record is None:
                embedding_record = FAQEmbedding(
                    faq_id=faq.id,
                    embedding=embedding_vector,
                    model=EMBEDDING_MODEL,
                )
                db.add(embedding_record)
            else:
                embedding_record.embedding = embedding_vector
                embedding_record.model = EMBEDDING_MODEL

            if is_new:
                created_count += 1
            else:
                updated_count += 1
        else:
            unchanged_count += 1

        # Save each FAQ and its embedding together.
        db.commit()

    logger.info("FAQ seeding completed.")
    logger.info("New FAQs: %s", created_count)
    logger.info("Updated FAQs / embeddings: %s", updated_count)
    logger.info("Unchanged FAQs: %s", unchanged_count)


def seed_contacts(db, organisation):
    created_count = 0
    updated_count = 0
    unchanged_count = 0

    for contact_data in CONTACT_DATA:
        contact = db.scalar(
            select(UniversityContact).where(
                UniversityContact.organisation_id == organisation.id,
                UniversityContact.department == contact_data["department"],
            )
        )

        if contact is None:
            contact = UniversityContact(
                organisation_id=organisation.id,
                **contact_data,
            )

            db.add(contact)
            created_count += 1

        else:
            changed = False

            for field, value in contact_data.items():
                if getattr(contact, field) != value:
                    setattr(contact, field, value)
                    changed = True

            contact.is_active = True

            if changed:
                updated_count += 1
            else:
                unchanged_count += 1

    db.commit()

    logger.info("Contact seeding completed.")
    logger.info("New contacts: %s", created_count)
    logger.info("Updated contacts: %s", updated_count)
    logger.info("Unchanged contacts: %s", unchanged_count)

def main():
    db = SessionLocal()

    try:
        logger.info("Starting Northstar University seed process.")

        organisation = get_or_create_organisation(db)

        category_map = get_or_create_categories(
            db,
            organisation,
        )

        seed_faqs(
            db,
            organisation,
            category_map,
        )

        seed_contacts(
            db,
            organisation,
        )


        logger.info("Seed process completed successfully.")

    except Exception:
        db.rollback()
        logger.exception("Seed process failed.")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()
