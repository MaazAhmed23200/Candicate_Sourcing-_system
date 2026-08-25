
from google import genai
from google.genai import types
from django.conf import settings
import PyPDF2
import json


# Initialize the NEW Gemini Client
client = genai.Client(api_key=settings.GEMINI_API_KEY)


def extract_text_from_pdf(file_obj):
    """Extract raw text from a PDF file."""
    try:
        reader = PyPDF2.PdfReader(file_obj)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text() or ""
            text += page_text + "\n"

        return text.strip()

    except Exception as e:
        print(f"PDF Extraction Error: {str(e)}")
        return ""


def analyze_with_gemini(resume_text, cover_note, job_description):
    """
    Sends resume, cover note, and job description to Gemini
    and returns an AI match score and summary.
    """

    prompt = f"""
You are an expert technical AI recruiter.

Evaluate the candidate against the provided Job Description.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume_text}

CANDIDATE COVER NOTE:
{cover_note}

Analyze the candidate based on:

1. Required technical skills
2. Relevant experience
3. Education
4. Domain knowledge
5. Tools and technologies
6. Overall suitability for the job

Return ONLY valid JSON using exactly this structure:

{{
    "score": 0,
    "summary": [
        "Explain the overall match and why this score was given.",
        "Mention the candidate's strongest skills and qualifications.",
        "Mention the important missing skills, experience, or requirements."
    ]
}}

Rules:
- score must be an integer between 0 and 100.
- summary must contain exactly 3 strings.
- Do not include Markdown.
- Do not include ```json.
- Do not include any text outside the JSON.
"""

    try:
        # Call Gemini using the new Google GenAI SDK
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        # Get Gemini response
        response_text = response.text.strip()

        # Parse JSON response
        result = json.loads(response_text)

        # Get score
        score = result.get("score", 0)

        # Validate score
        try:
            score = int(score)
        except (ValueError, TypeError):
            score = 0

        score = max(0, min(100, score))

        # Get summary
        summary = result.get("summary", [])

        # Convert list to text for Django TextField
        if isinstance(summary, list):
            summary = "\n".join(
                f"• {item}" for item in summary
            )

        elif not isinstance(summary, str):
            summary = "No summary generated."

        return score, summary

    except json.JSONDecodeError as e:
        print(f"Gemini JSON Parsing Error: {str(e)}")
        print(f"Gemini Raw Response: {getattr(response, 'text', '')}")

        return 0, "AI Analysis failed: Invalid JSON response."

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")

        return 0, "AI Analysis failed."


def process_application_ai_background(application_id):
    """
    Runs AI processing in the background.

    Steps:
    1. Fetch application
    2. Get job description
    3. Get cover note
    4. Extract resume text
    5. Send data to Gemini
    6. Save AI score and summary
    """

    from .models import Application

    try:
        # Fetch application from database
        app = Application.objects.get(id=application_id)

        # ---------------------------------------
        # 1. Get Job Description
        # ---------------------------------------

        job_desc = ""

        if app.job:
            job_desc = app.job.job_description or ""

        # ---------------------------------------
        # 2. Get Cover Note
        # ---------------------------------------

        cover = app.cover_note or ""

        # ---------------------------------------
        # 3. Extract Resume Text
        # ---------------------------------------

        resume_text = ""

        if app.resume:
            try:
                app.resume.open()

                resume_text = extract_text_from_pdf(
                    app.resume
                )

            finally:
                app.resume.close()

        # Check whether resume text was extracted
        if not resume_text:
            print(
                f"Warning: No text extracted from resume "
                f"for Application ID: {application_id}"
            )

        # ---------------------------------------
        # 4. Call Gemini AI
        # ---------------------------------------

        score, summary = analyze_with_gemini(
            resume_text=resume_text,
            cover_note=cover,
            job_description=job_desc,
        )

        # ---------------------------------------
        # 5. Save AI Results
        # ---------------------------------------

        app.ai_match_score = score
        app.ai_summary = summary
        app.ai_processed = True

        app.save(
            update_fields=[
                "ai_match_score",
                "ai_summary",
                "ai_processed",
            ]
        )

        print(
            f"Successfully processed AI for "
            f"Application ID: {application_id}"
        )

    except Application.DoesNotExist:
        print(
            f"Application with ID {application_id} "
            f"does not exist."
        )

    except Exception as e:
        print(
            f"Background AI Error for App "
            f"{application_id}: {str(e)}"
        )