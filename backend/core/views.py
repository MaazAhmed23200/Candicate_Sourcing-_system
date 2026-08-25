
import json
import threading

# Django Imports
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import models
from django.shortcuts import render
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

# Django REST Framework Imports
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

# Local App Imports
from .ai_utils import process_application_ai_background
from .models import (
    AdminNotification,
    Application,
    CustomUser,
    Education,
    Experience,
    JobRequisition,
)
from .serializers import (
    CandidateApplicationSerializer,
    CustomTokenObtainPairSerializer,
    JobRequisitionSerializer,
    RegisterSerializer,
)

class RegisterCandidateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ForgotPasswordView(APIView):
    """Generates a secure password reset link and emails it to the candidate."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = CustomUser.objects.get(email=email)
            
    
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
           
            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
            
            
            send_mail(
                subject="Password Reset Request - Talent Bridge",
                message=f"Hello {user.first_name},\n\nClick the link below to reset your password:\n{reset_link}\n\nIf you did not request this, please ignore this email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
        except CustomUser.DoesNotExist:
           
            pass 

       
        return Response({'message': 'If an account exists, a reset link has been sent.'}, status=status.HTTP_200_OK)







class ResetPasswordConfirmView(APIView):
    """Verifies the secure token and sets the new password."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            
            uid = urlsafe_base64_decode(uidb64).decode()
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        # Check if user exists and token is valid
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successful!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid or expired password reset link.'}, status=status.HTTP_400_BAD_REQUEST)





# ADMIN DASHBOARD VIEW


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'

class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = JobRequisition.objects.all().order_by('-posted_date')
    serializer_class = JobRequisitionSerializer
    permission_classes = [IsAdminUser]

    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        job = self.get_object()
        job.pk = None 
        job.req_id = "" 
        job.title = f"Copy of {job.title}"
        job.status = 'DRAFT' # Always duplicate as a draft
        job.save()
        
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)





class AdminApplicationDetailView(APIView):
    """Handles viewing, updating, or deleting a specific application."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
        
        try:
            app = Application.objects.get(pk=pk)
            app.delete()
            return Response({'message': 'Application deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)





class AdminApplicationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        job_id = request.query_params.get('job_id')
        status_filter = request.query_params.get('status')
        search_query = request.query_params.get('search')

        applications = Application.objects.all().prefetch_related('educations', 'experiences').order_by('-submitted_at')

        if job_id:
            applications = applications.filter(job_id=job_id)
        if status_filter:
            applications = applications.filter(status=status_filter)
        if search_query:
            applications = applications.filter(
                models.Q(first_name__icontains=search_query) |
                models.Q(last_name__icontains=search_query) |
                models.Q(email__icontains=search_query)
            )

        data = []
        for app in applications:
            total_exp = sum([((x.end_date.year if x.end_date else 2026) - x.start_date.year) for x in app.experiences.all() if x.start_date])
            exp_text = f"{total_exp} years" if total_exp > 0 else "Fresher"

            data.append({
                'id': app.id,
                'app_id': app.app_id,
                'job_title': app.job.title,
                'candidate_name': f"{app.first_name} {app.last_name}",
                'email': app.email,
                'mobile': app.mobile,
                'gender': app.gender or 'N/A',
                'dob': app.dob.strftime('%Y-%m-%d') if app.dob else 'N/A',
                'location': app.current_location,
                'current_company': app.current_company or 'N/A',
                'notice_period': app.notice_period or 'N/A',
                'current_address': app.current_address or 'N/A',
                'profile_photo': request.build_absolute_uri(app.profile_photo.url) if app.profile_photo else None,
                'experience': exp_text,
                'status': app.status,
                'cover_note': app.cover_note or 'N/A',
                'resume_url': request.build_absolute_uri(app.resume.url) if app.resume else '',
                'submitted_at': app.submitted_at.strftime('%Y-%m-%d %H:%M'),
                
                # --- NEW AI FIELDS ADDED HERE ---
                'ai_match_score': app.ai_match_score,
                'ai_summary': app.ai_summary,
                'ai_processed': app.ai_processed,
                # --------------------------------

                'education': [{
                    'level': e.education_level, 
                    'degree': e.degree, 
                    'specialization': e.specialization or '',
                    'institution': e.institution, 
                    'year': e.year_of_passing,
                    'grade': e.grade or 'N/A'
                } for e in app.educations.all()],
                'experience_details': [{
                    'company': x.company, 
                    'designation': x.designation,
                    'start_date': x.start_date.strftime('%Y-%m-%d') if x.start_date else '',
                    'end_date': x.end_date.strftime('%Y-%m-%d') if x.end_date else 'Present',
                    'responsibilities': x.responsibilities or ''
                } for x in app.experiences.all()]
            })
        return Response(data)




class AdminUpdateApplicationStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        
        try:
            app = Application.objects.get(pk=pk)
            
            
            app.status = request.data.get('status', app.status)
            
            
            app.save() 
            
            return Response({'status': app.status}, status=status.HTTP_200_OK)
            
        except Application.DoesNotExist:
            return Response({'error': 'Application not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminNotificationListView(APIView):
    """Fetches notifications for the admin and marks them as read."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        notifications = AdminNotification.objects.order_by('-created_at')[:30]
        data = [{
            'id': n.id,
            'message': n.message,
            'is_read': n.is_read,
            'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')
        } for n in notifications]
        return Response(data)

    def post(self, request):
        
        if request.user.role != 'ADMIN':
            return Response(status=status.HTTP_403_FORBIDDEN)
            
        AdminNotification.objects.filter(is_read=False).update(is_read=True)
        return Response({'message': 'Marked as read'}, status=status.HTTP_200_OK)







# candidate and public 



class PublicJobList(generics.ListAPIView):
    """Anonymous visitors can view published jobs and filter by keyword/location."""
    serializer_class = JobRequisitionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = JobRequisition.objects.filter(status='PUBLISHED').order_by('-posted_date')
        search = self.request.query_params.get('search')
        location = self.request.query_params.get('location')
        
        if search:
            queryset = queryset.filter(title__icontains=search)
        if location:
            queryset = queryset.filter(location__icontains=location)
        return queryset

class PublicJobDetail(generics.RetrieveAPIView):
    """Anonymous visitors can view full job details."""
    queryset = JobRequisition.objects.filter(status='PUBLISHED')
    serializer_class = JobRequisitionSerializer
    permission_classes = [permissions.AllowAny]




class CandidateApplicationListView(APIView):
    """Logged-in candidates can view full details of jobs they applied to."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        apps = Application.objects.filter(candidate=request.user).prefetch_related('educations', 'experiences').order_by('-submitted_at')
        data = []
        for app in apps:
            data.append({
                'app_id': app.app_id,
                'job_title': app.job.title,
                'status': app.status,
                'submitted_at': app.submitted_at.strftime('%Y-%m-%d %H:%M'),
                'first_name': app.first_name,
                'last_name': app.last_name,
                'email': app.email,
                'mobile': app.mobile,
                'location': app.current_location,
                'gender': app.gender or 'N/A',
                'dob': app.dob.strftime('%Y-%m-%d') if app.dob else 'N/A',
                'current_company': app.current_company or 'N/A',
                'notice_period': app.notice_period or 'N/A',
                'current_address': app.current_address or 'N/A',
                'cover_note': app.cover_note or 'N/A',
                'profile_photo': request.build_absolute_uri(app.profile_photo.url) if app.profile_photo else None,
                'resume_url': request.build_absolute_uri(app.resume.url) if app.resume else '',
                'education': [{
                    'level': e.education_level, 
                    'degree': e.degree, 
                    'specialization': e.specialization or '',
                    'institution': e.institution, 
                    'year': e.year_of_passing,
                    'grade': e.grade or 'N/A'
                } for e in app.educations.all()],
                'experience': [{
                    'company': x.company, 
                    'designation': x.designation,
                    'start_date': x.start_date.strftime('%Y-%m-%d') if x.start_date else '',
                    'end_date': x.end_date.strftime('%Y-%m-%d') if x.end_date else 'Present',
                    'responsibilities': x.responsibilities or ''
                } for x in app.experiences.all()]
            })
        return Response(data)







class CandidateApplicationSubmission(APIView):
    """Processes multi-step form data & resume file upload from the candidate."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, job_id):
        try:
            job = JobRequisition.objects.get(id=job_id)
        except JobRequisition.DoesNotExist:
            return Response({'error': 'Job not found'}, status=status.HTTP_404_NOT_FOUND)


        if Application.objects.filter(job=job, candidate=request.user).exclude(status='REJECTED').exists():
            return Response({'error': 'You have an active application for this position.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
         
            bio_data = json.loads(request.data.get('bioData', '{}'))
            education_data = json.loads(request.data.get('education', '[]'))
            experience_data = json.loads(request.data.get('experience', '[]'))
            
           
            resume_file = request.FILES.get('resume')
            profile_photo = request.FILES.get('profilePhoto')
            cover_note = request.data.get('coverNote', '')

            if not resume_file:
                return Response({'error': 'Resume file is mandatory.'}, status=status.HTTP_400_BAD_REQUEST)

           
            application = Application.objects.create(
                job=job,
                candidate=request.user,
                first_name=bio_data.get('firstName', ''),
                last_name=bio_data.get('lastName', ''),
                email=request.user.email, 
                gender=bio_data.get('gender', ''),
                mobile=bio_data.get('mobile', ''),
                dob=bio_data.get('dob') or None,
                current_location=bio_data.get('currentLocation', ''),
                current_company=bio_data.get('currentCompany', ''),
                notice_period=bio_data.get('noticePeriod', ''),
                current_address=bio_data.get('currentAddress', ''),
                resume=resume_file,
                profile_photo=profile_photo,
                cover_note=cover_note,
                consent_data_accuracy=True,
                consent_privacy_policy=True
            )

            # 4. Create Education Records
            for edu in education_data:
                Education.objects.create(
                    application=application,
                    education_level=edu.get('educationLevel', ''),
                    degree=edu.get('degree', ''),
                    specialization=edu.get('specialization', ''),
                    institution=edu.get('institution', ''),
                    year_of_passing=edu.get('year', ''),
                    grade=edu.get('grade', '')
                )

            # 5. Create Work Experience Records
            for exp in experience_data:
                Experience.objects.create(
                    application=application,
                    company=exp.get('company', ''),
                    designation=exp.get('designation', ''),
                    start_date=exp.get('startDate') or None,
                    end_date=exp.get('endDate') or None,
                    currently_working_here=exp.get('currentlyWorking', False),
                    responsibilities=exp.get('responsibilities', '')
                )

            # ---------------------------------------------------------
            # 6. TRIGGER NOTIFICATIONS
            # ---------------------------------------------------------
            
            # Save In-App Notification for Admin
            AdminNotification.objects.create(
                message=f"New application ({application.app_id}) received for {job.title} from {application.first_name} {application.last_name}."
            )

            # ---------------------------------------------------------
            # 7. NEW: TRIGGER AI ANALYSIS IN THE BACKGROUND
            # ---------------------------------------------------------
            # We run this in a Thread so the candidate doesn't have to wait 10 seconds 
            # for the AI to finish reading the resume before seeing the "Success" message.
            threading.Thread(target=process_application_ai_background, args=(application.id,)).start()


            return Response({
                'message': 'Application submitted successfully',
                'application_id': application.app_id
            }, status=status.HTTP_201_CREATED)


        except Exception as e:
            return Response({'error': f"Submission failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)