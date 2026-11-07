from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import DailyCheckIn, ReferralResource, ResponderProfile, SupportRequest


class ResourceSerializer(serializers.ModelSerializer):
    kind_label = serializers.CharField(source='get_kind_display')

    class Meta:
        model = ReferralResource
        fields = ('id', 'name', 'short_name', 'kind', 'kind_label', 'description', 'description_fil', 'location',
                  'phones', 'hours', 'is_24_7', 'source_url', 'verified_on')


class ResponderSerializer(serializers.ModelSerializer):
    support_type_label = serializers.CharField(source='get_support_type_display')

    class Meta:
        model = ResponderProfile
        fields = ('id', 'display_name', 'organization', 'role', 'support_type', 'support_type_label', 'scope',
                  'availability', 'contact_methods', 'phone', 'expected_response', 'verification_status', 'verified_on', 'is_demo')


class SupportRequestSerializer(serializers.ModelSerializer):
    responder = serializers.PrimaryKeyRelatedField(queryset=ResponderProfile.objects.filter(is_active=True))

    class Meta:
        model = SupportRequest
        fields = ('responder', 'first_name', 'preferred_contact', 'contact_detail', 'message')

    def validate(self, attrs):
        if attrs['preferred_contact'] in ('message', 'call') and not attrs.get('contact_detail'):
            raise serializers.ValidationError({'contact_detail': 'Add how the responder can reach you, or choose "In person".'})
        return attrs


class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = ('mood_status', 'primary_feeling')


@api_view(['GET'])
def resources(request):
    return Response(ResourceSerializer(ReferralResource.objects.filter(is_active=True), many=True).data)


@api_view(['GET'])
def responders(request):
    return Response(ResponderSerializer(ResponderProfile.objects.filter(is_active=True), many=True).data)


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def create_request(request):
    s = SupportRequestSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    req = s.save()
    r = req.responder
    return Response({
        'ok': True,
        'responder': r.display_name,
        'expected_response': r.expected_response,
        'is_demo': r.is_demo,
        'note': ('This is a demonstration profile: no real person will receive this request.' if r.is_demo
                 else f'{r.display_name} will see your request during their listed hours.'),
    }, status=201)


create_request.cls.throttle_scope = 'support_request'


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def check_in(request):
    s = CheckInSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    s.save()
    return Response({'ok': True}, status=201)


check_in.cls.throttle_scope = 'check_in'
