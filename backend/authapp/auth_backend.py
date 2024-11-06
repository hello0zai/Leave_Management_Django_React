from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

class CaseSensitiveModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        User = get_user_model()
        if username is None or password is None:
            return None
        try:
            user = User._default_manager.get(username=username)
        except User.DoesNotExist:
            return None
        else:
            if user.check_password(password) and self.user_can_authenticate(user):
                return user

    def user_can_authenticate(self, user):
        """
        Override this method if necessary to reject users based on custom criteria.
        By default, allow all users to authenticate.
        """
        return user.is_active
