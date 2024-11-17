"""
Middleware for handling JWT authentication via cookies.

This middleware extracts the `access_token` from cookies and sets it
in the `Authorization` header to enable compatibility with SimpleJWT or similar libraries.
"""

from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest


class JWTAuthCookieMiddleware(MiddlewareMixin):
    def process_request(self, request: HttpRequest) -> None:
        """
        Process incoming requests to extract the JWT access token from cookies.

        @param request: The incoming HTTP request object.
        @return: None
        """
        access_token = request.COOKIES.get('access_token')

        if access_token:
            # Set the Authorization header as expected by SimpleJWT
            request.META['HTTP_AUTHORIZATION'] = f'Bearer {access_token}'
