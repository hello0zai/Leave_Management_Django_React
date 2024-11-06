from django.db import models
from authapp.models import CustomUser
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

class Leave_Type(models.Model):
    TYPES = (
        ('Casual Leave', 'Casual Leave'),
        ('Sick leave', 'Sick leave'),
        ('Leave without Pay', 'Leave without Pay'),
    )
    name = models.CharField(max_length=20, choices=TYPES)
    description = models.CharField(max_length=200)
    valid_from = models.DateField(default=timezone.now, null=True)
    valid_to = models.DateField(null=True)

    def __str__(self):
        return self.name

class Leave_Balance(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    leavetype = models.ForeignKey(Leave_Type, on_delete=models.CASCADE)
    balance = models.CharField(max_length=10)

    class Meta:
        unique_together = ('user', 'leavetype')

    def __str__(self):
        return f"{self.user.username} - {self.leavetype.name}: {self.balance} days"


# hey these is a Employee leaverequest leave model
User = get_user_model()

class LeaveRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    leave_type = models.ForeignKey(Leave_Type, on_delete=models.CASCADE)  
    start_date = models.DateField()
    end_date = models.DateField()
    date_of_request = models.DateTimeField(auto_now_add=True)
    reason = models.TextField()
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected')],default='Pending')  # Pending, Approved, Rejected, etc.

    def __str__(self):
        return f"LeaveRequest #{self.pk} - {self.user.username}"

    def approve_leave_and_deduct_balance(self):
           try:
               balance_entry = Leave_Balance.objects.get(user=self.user, leavetype=self.leave_type)
               current_balance = int(balance_entry.balance)
               leave_duration = (self.end_date - self.start_date).days + 1
               if current_balance >= leave_duration:
                   balance_entry.balance = str(current_balance - leave_duration)
                   balance_entry.save()
                   self.status = 'Approved'
                   self.save()
                   return True
               else:
                   return False  
           except Leave_Balance.DoesNotExist:
               return False  

