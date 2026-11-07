import datetime as dt

from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import JournalEntry

MAX_FEELINGS = 8


class EntrySerializer(serializers.ModelSerializer):
    feelings = serializers.ListField(child=serializers.SlugField(max_length=80), max_length=MAX_FEELINGS, required=False)

    class Meta:
        model = JournalEntry
        fields = ('date', 'mood', 'feelings', 'note', 'updated_at')
        read_only_fields = ('updated_at',)

    def validate_date(self, value):
        if value > dt.date.today() + dt.timedelta(days=1):   # +1 tolerates timezone differences
            raise serializers.ValidationError('Entries can’t be in the future.')
        return value


def _parse(d, default=None):
    try:
        return dt.date.fromisoformat(d)
    except (TypeError, ValueError):
        return default


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def entries(request):
    """GET /api/journal/entries/?start=YYYY-MM-DD&end=YYYY-MM-DD (defaults: the last 400 days)."""
    end = _parse(request.GET.get('end'), dt.date.today() + dt.timedelta(days=1))
    start = _parse(request.GET.get('start'), end - dt.timedelta(days=400))
    qs = request.user.journal_entries.filter(date__gte=start, date__lte=end)
    return Response(EntrySerializer(qs, many=True).data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def entry(request, date):
    """PUT creates or replaces the entry for that day; DELETE removes it."""
    day = _parse(date)
    if not day:
        return Response({'detail': 'Invalid date.'}, status=400)
    existing = request.user.journal_entries.filter(date=day).first()
    if request.method == 'DELETE':
        if existing:
            existing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    s = EntrySerializer(existing, data={**request.data, 'date': day.isoformat()})
    s.is_valid(raise_exception=True)
    s.save(user=request.user)
    return Response(s.data, status=200 if existing else 201)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_entries(request):
    """Move check-ins saved in this browser into the account. Existing days are kept, not overwritten."""
    items = request.data.get('entries', [])
    if not isinstance(items, list) or len(items) > 2000:
        return Response({'detail': 'Invalid payload.'}, status=400)
    have = set(request.user.journal_entries.values_list('date', flat=True))
    created = skipped = 0
    for item in items:
        s = EntrySerializer(data=item)
        if not s.is_valid() or s.validated_data['date'] in have:
            skipped += 1
            continue
        s.save(user=request.user)
        have.add(s.validated_data['date'])
        created += 1
    return Response({'created': created, 'skipped': skipped})
