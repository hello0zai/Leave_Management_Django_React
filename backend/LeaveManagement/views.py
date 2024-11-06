from django.shortcuts import render
from .models import Leave_Balance, Leave_Type ,LeaveRequest
from rest_framework import viewsets, status
from .serializers import Leave_TypeSerializer, Leave_BalanceSerializer,LeaveRequestSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import JsonResponse

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = Leave_Type.objects.all()
    serializer_class = Leave_TypeSerializer

class LeaveBalanceViewSet(viewsets.ModelViewSet):
    queryset = Leave_Balance.objects.all()
    serializer_class = Leave_BalanceSerializer


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all().order_by('-id')
    serializer_class = LeaveRequestSerializer
    permission_classes = []  

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def approve_leave(self, request, pk):
        leave_request = self.get_object()
        leave_request.status = 'Approved'
        leave_request.save()
        if leave_request.approve_leave_and_deduct_balance():
            return Response({"detail": "Leave request approved successfully and balance deducted."}, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Failed to approve leave request. Insufficient balance or balance entry not found."}, status=status.HTTP_400_BAD_REQUEST)


    def reject_leave(self, request, pk):
        leave_request = self.get_object()
        leave_request.status = 'Rejected'
        leave_request.save()
        return Response({"detail": "Leave request rejected successfully"}, status=status.HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Filter by employee name if provided in query params
        employee_name = request.query_params.get('employee_name', None)
        if employee_name:
            queryset = queryset.filter(user__username__icontains=employee_name)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if (instance.start_date - timezone.now().date()).days >= 3:
            self.perform_destroy(instance)
            return Response({"detail": "Leave request cancelled successfully"}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"detail": "Cannot cancel leave within 3 days of start date"}, status=status.HTTP_400_BAD_REQUEST)

## getting leave request by user in filter 
    
def get_levaverequest_by_user(request, user_id):
    leaverequests = LeaveRequest.objects.filter(user=user_id).order_by('-id')
    leaverequest_list = [{"id": leaveuser.id ,"user": leaveuser.user.username, "leave_type": leaveuser.leave_type.id, "start_date": leaveuser.start_date, "end_date": leaveuser.end_date, 
                        "date_of_request":leaveuser.date_of_request , "reason": leaveuser.reason , "status": leaveuser.status} for leaveuser in leaverequests]
    return JsonResponse(leaverequest_list, safe=False)

## getting leaverequest by type in filter

def get_leave_requests_by_type(request, leave_type_id):
    leaverequests = LeaveRequest.objects.filter(leave_type=leave_type_id)
    leaverequest_list = [{
        "id": leaveuser.id,
        "user": leaveuser.user.id,
        "leave_type": leaveuser.leave_type.id,
        "start_date": leaveuser.start_date,
        "end_date": leaveuser.end_date,
        "date_of_request": leaveuser.date_of_request,
        "reason": leaveuser.reason,
        "status": leaveuser.status
    } for leaveuser in leaverequests]
    return JsonResponse(leaverequest_list, safe=False)

## getting leaverequest by user and its taken leave leavetype by filter 

def get_leave_requests_by_user_and_type(request, user_id, leave_type_id):
    leaverequests = LeaveRequest.objects.filter(user=user_id, leave_type=leave_type_id)
    leaverequest_list = [{
        "id": leaveuser.id,
        "user": leaveuser.user.id,
        "leave_type": leaveuser.leave_type.id,
        "start_date": leaveuser.start_date,
        "end_date": leaveuser.end_date,
        "date_of_request": leaveuser.date_of_request,
        "reason": leaveuser.reason,
        "status": leaveuser.status
    } for leaveuser in leaverequests]
    return JsonResponse(leaverequest_list, safe=False)

#for get leavebalance by user to check user have a enough balance of leave or not...

def get_leave_balance_by_user(request ,user_id):
    balancerequests = Leave_Balance.objects.filter(user=user_id)
    balancerequest_list = [{
        "id": leaveuser.id,
        "user": leaveuser.user.id,
        "leavetype": leaveuser.leavetype.id,
        "leavetypename":leaveuser.leavetype.name,
        "balance" : leaveuser.balance,
    }for leaveuser in balancerequests]
    return JsonResponse(balancerequest_list, safe=False)
