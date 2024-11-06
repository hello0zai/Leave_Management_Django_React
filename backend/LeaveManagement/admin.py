from django.contrib import admin
from .models import Leave_Type , Leave_Balance
# Register your models here.


admin.site.register(Leave_Type),
admin.site.register(Leave_Balance)