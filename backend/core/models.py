
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=False)


    email = models.EmailField(unique=True) 
    role = models.CharField(max_length=20, default='CANDIDATE') 

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email



class JobRequisition(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('CLOSED', 'Closed'),
    )
    title = models.CharField(max_length=100) 
    req_id = models.CharField(max_length=50, unique=True, editable=False) 
    location = models.CharField(max_length=100) 
    employment_type = models.CharField(max_length=50)
    experience_range = models.CharField(max_length=50) 
    openings = models.PositiveIntegerField(default=1) 
    hiring_manager = models.CharField(max_length=100)
    job_description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    posted_date = models.DateTimeField(auto_now_add=True) 

    def save(self, *args, **kwargs):
        if not self.req_id:
            self.req_id = f"REQ-2026-{uuid.uuid4().hex[:5].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.req_id



class Application(models.Model):
    app_id = models.CharField(max_length=50, unique=True, editable=False)
    job = models.ForeignKey(JobRequisition, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='NEW')
    
    # 9.1 Bio-Data
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField()
    mobile = models.CharField(max_length=20)
    dob = models.DateField(blank=True, null=True)
    current_location = models.CharField(max_length=100)
    current_company = models.CharField(max_length=100, blank=True, null=True)
    notice_period = models.CharField(max_length=50, blank=True, null=True)
    current_address = models.TextField(blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True) 

    # Resume & Attachments
    resume = models.FileField(upload_to='resumes/')
    cover_note = models.TextField(max_length=3500, blank=True, null=True)
    consent_data_accuracy = models.BooleanField(default=False)
    consent_privacy_policy = models.BooleanField(default=False)
    
    # --- AI Analysis Fields ---
    ai_match_score = models.IntegerField(null=True, blank=True)
    ai_summary = models.TextField(null=True, blank=True)
    ai_processed = models.BooleanField(default=False)
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.app_id:
            self.app_id = f"APP-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)


# EDUCATION DETAILS ---
class Education(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='educations')
    education_level = models.CharField(max_length=50) 
    degree = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    institution = models.CharField(max_length=200)
    year_of_passing = models.CharField(max_length=4) 
    grade = models.CharField(max_length=50, blank=True, null=True)


# WORK EXPERIENCE DETAILS ---
class Experience(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=150, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    currently_working_here = models.BooleanField(default=False)
    responsibilities = models.TextField(max_length=1000, blank=True, null=True) 


class AdminNotification(models.Model):
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message