from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework  import viewsets
from .models import CustomUser , Designation , Department , Roles
from .serializers import UserSerializer , DepartmentSerializer , DesignationSerializer , RolesSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from LeaveManagement.models import Leave_Balance , Leave_Type


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.all()
    serializer_class = DesignationSerializer
    

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
class RolesViewSet(viewsets.ModelViewSet):
     queryset = Roles.objects.all()
     serializer_class = RolesSerializer

class CustomUserViewset(viewsets.ModelViewSet):
        queryset = CustomUser.objects.filter(role=2)
        serializer_class = UserSerializer

User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

## for took a data in access token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role.id
        token['first_name'] = user.first_name
        token['lastname'] = user.last_name
        token['email'] = user.email
        token['department']= user.department.id
        token['desiganation'] = user.designation.id
        token['contact_no'] = user.contact_no
     
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
     

def get_designations_by_department(request, department_id):
    designations = Designation.objects.filter(department=department_id)
    designations_list = [{"id": desig.id, "name": desig.name} for desig in designations]
    return JsonResponse(designations_list, safe=False)


@api_view(['POST'])
def register_user(request):
    user_serializer = UserSerializer(data=request.data)
    if user_serializer.is_valid():
        user = user_serializer.save()
        return Response({"user_id": user.id}, status=status.HTTP_201_CREATED)
    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register_leave_balance(request):
    try:
        user_id = request.data['user_id']
        leave_balances = request.data['leave_balances']
        
        user = CustomUser.objects.get(id=user_id)
        
        for lb in leave_balances:
            leavetype = Leave_Type.objects.get(id=lb['leavetype'])
            Leave_Balance.objects.create(user=user, leavetype=leavetype, balance=lb['balance'])
        
        return Response({"message": "Leave balances registered successfully"}, status=status.HTTP_201_CREATED)
    
    except CustomUser.DoesNotExist:
        return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
    except Leave_Type.DoesNotExist:
        return Response({"error": "Leave type does not exist"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
