from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import LeaveBalanceViewSet , LeaveTypeViewSet , LeaveRequestViewSet 
from . import views

router = DefaultRouter()
router.register(r'Leave-Balance', LeaveBalanceViewSet)
router.register(r'Leave-Type', LeaveTypeViewSet)
router.register(r'leave-request', LeaveRequestViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('Leave-Balance/user/<int:user_id>/', views.get_leave_balance_by_user, name="get_leave_balance_by_user" ),
    path('leave-request/user/<int:user_id>/type/<int:leave_type_id>/', views.get_leave_requests_by_user_and_type, name='leave-requests-by-user-and-type'),
    path('leave-request/leave_type/<int:leave_type_id>/', views.get_leave_requests_by_type, name='get_leave_requests_by_type'),
    path('leave-request/user/<int:user_id>/', views.get_levaverequest_by_user, name='get_levaverequest_by_user'),
    path('leave-request/<int:pk>/approve/', LeaveRequestViewSet.as_view({'put': 'approve_leave'}), name='leave-request-approve'),
    path('leave-request/<int:pk>/reject/', LeaveRequestViewSet.as_view({'put': 'reject_leave'}), name='leave-request-reject'),
]

