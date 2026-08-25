
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterCandidateView, CustomTokenObtainPairView, AdminJobViewSet, AdminApplicationListView, AdminUpdateApplicationStatusView, PublicJobList, PublicJobDetail, CandidateApplicationListView, CandidateApplicationSubmission, ForgotPasswordView, ResetPasswordConfirmView, AdminNotificationListView, AdminApplicationDetailView

router = DefaultRouter()
router.register(r'admin/jobs', AdminJobViewSet, basename='admin-jobs')

urlpatterns = [
    path('auth/register/', RegisterCandidateView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('admin/applications/', AdminApplicationListView.as_view(), name='admin-applications'),
    path('admin/applications/<int:pk>/status/', AdminUpdateApplicationStatusView.as_view(), name='admin-app-status'),
    path('public/jobs/', PublicJobList.as_view(), name='public-job-list'),
    path('public/jobs/<int:pk>/', PublicJobDetail.as_view(), name='public-job-detail'),
    path('candidate/applications/', CandidateApplicationListView.as_view(), name='candidate-applications'),
    path('jobs/<int:job_id>/apply/', CandidateApplicationSubmission.as_view(), name='apply-job'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/<str:uidb64>/<str:token>/', ResetPasswordConfirmView.as_view(), name='reset-password-confirm'),

    path('admin/notifications/', AdminNotificationListView.as_view(), name='admin-notifications'),
    
    
    path('admin/applications/<int:pk>/', AdminApplicationDetailView.as_view(), name='admin-application-detail'),

    path('', include(router.urls)), 
]