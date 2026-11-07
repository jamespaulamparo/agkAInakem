from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .views import _lan_ips


@api_view(['GET'])
def share(request):
    """Addresses other devices on the same Wi-Fi can use (only when LAN sharing is switched on)."""
    port = request.get_port()
    urls = [f'http://{ip}:{port}/' for ip in _lan_ips()] if settings.LAN_SHARING else []
    return Response({'lan': settings.LAN_SHARING, 'urls': urls})
