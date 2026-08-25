
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Application


@receiver(pre_save, sender=Application)
def capture_old_status(sender, instance, **kwargs):
    if instance.pk: 
        try:
            old_instance = Application.objects.get(pk=instance.pk)
            instance._old_status = old_instance.status
        except Application.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender=Application)
def send_application_notifications(sender, instance, created, **kwargs):
    if created:
        
        candidate_subject = f"Application Received: {instance.job.title}"
        candidate_message = f"Dear {instance.first_name},\n\nThank you for applying for the {instance.job.title} position.\nYour Application ID is: {instance.app_id}.\n\nBest Regards,\nTalent Acquisition Team"
        send_mail(candidate_subject, candidate_message, settings.DEFAULT_FROM_EMAIL, [instance.email])

        
        admin_subject = f"New Application Alert: {instance.job.title}"
        admin_message = f"A new application ({instance.app_id}) has been submitted by {instance.first_name} {instance.last_name} for the position of {instance.job.title}."
        send_mail(admin_subject, admin_message, settings.DEFAULT_FROM_EMAIL, [settings.SYSTEM_ADMIN_EMAIL])
        
    else:
        
        if getattr(instance, '_old_status', None) != 'REJECTED' and instance.status == 'REJECTED':
            
            subject = f"Update on your application for {instance.job.title}"
            message = (
                f"Dear {instance.first_name},\n\n"
                f"Thank you for taking the time to apply for the {instance.job.title} position.\n\n"
                f"After careful consideration of your profile and experience, we have decided to "
                f"move forward with other candidates whose qualifications more closely align with "
                f"our current needs for this role.\n\n"
                f"We sincerely appreciate your interest in joining our team and wish you the "
                f"absolute best in your continued job search and future career endeavors.\n\n"
                f"Best Regards,\n"
                f"Talent Acquisition Team"
            )
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[instance.email],
                fail_silently=True
            )