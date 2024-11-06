from django.contrib.auth.models import AbstractUser
from django.db import models

    
class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class Designation(models.Model):
    department = models.ForeignKey(Department , on_delete=models.CASCADE , null=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Roles(models.Model):
     name = models.CharField(max_length=10)

     def __str__(self):
         return self.name
     
class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True , null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE , null=True)
    designation = models.ForeignKey(Designation, on_delete=models.CASCADE , null=True)
    contact_no = models.CharField(max_length=15 , null= True)
    role = models.ForeignKey(Roles , on_delete=models.CASCADE , default='2' , null=True)

    USERNAME_FIELD = 'username'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name}"

