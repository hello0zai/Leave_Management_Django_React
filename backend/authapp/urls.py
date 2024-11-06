from django.urls import path , include
from rest_framework.routers import DefaultRouter
from .views import UserRegisterView, CustomTokenObtainPairView , CustomUserViewset , DepartmentViewSet , DesignationViewSet , RolesViewSet , register_leave_balance
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'Users', CustomUserViewset)
router.register(r'designations', DesignationViewSet)
router.register(r'department', DepartmentViewSet)
router.register(r'role' , RolesViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('designations/department/<int:department_id>/', views.get_designations_by_department, name='get_designations_by_department'),
    path('register/leave_balance/', register_leave_balance, name='register_leave_balance'),
]
