from rest_framework import serializers
from rest_framework.decorators import api_view, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .engine import explore as run_explore, MAX_TEXT


class ExploreInput(serializers.Serializer):
    text = serializers.CharField(max_length=MAX_TEXT, trim_whitespace=True)
    lang = serializers.ChoiceField(choices=('en', 'fil'), default='en')


@api_view(['POST'])
@throttle_classes([ScopedRateThrottle])
def explore(request):
    """
    POST /api/discovery/explore/  {"text": "...", "lang": "en"}
    The submitted text is processed in memory and never written to the database or logs.
    """
    s = ExploreInput(data=request.data)
    s.is_valid(raise_exception=True)
    return Response(run_explore(s.validated_data['text'], lang=s.validated_data['lang']))


explore.cls.throttle_scope = 'explore'
