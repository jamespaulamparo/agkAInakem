from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import DailyCheckIn, ReferralResource


class ResourceSerializer(serializers.ModelSerializer):
    kind_label = serializers.CharField(source='get_kind_display')

    class Meta:
        model = ReferralResource
        fields = ('id', 'name', 'short_name', 'kind', 'kind_label', 'description', 'description_fil', 'location',
                  'phones', 'hours', 'is_24_7', 'source_url', 'verified_on')


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = ('mood_status', 'primary_feeling')


@api_view(['GET'])
def resources(request):
    return Response(ResourceSerializer(ReferralResource.objects.filter(is_active=True), many=True).data)


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def check_in(request):
    s = CheckInSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response({'ok': True}, status=201)


check_in.cls.throttle_scope = 'check_in'
