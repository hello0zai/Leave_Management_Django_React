# serializers.py
from rest_framework import serializers
from .models import Leave_Balance, Leave_Type

class Leave_BalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave_Balance
        fields = '__all__'

class Leave_TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave_Type
        fields = '__all__'



# coutomer leave request serializer

from rest_framework import serializers
from .models import LeaveRequest

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = ['id', 'user', 'leave_type', 'start_date', 'end_date', 'date_of_request', 'reason', 'status']
