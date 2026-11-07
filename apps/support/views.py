from django.shortcuts import render, redirect
from django.contrib import messages
from .models import DailyCheckIn

def reach_out_index(request):
    """Reach Out landing hub: I Need Help, Someone Else, and San Fernando Local Directory."""
    context = {
        'page_title': 'Reach Out — Early Support & Local Care | agkAInakem',
    }
    return render(request, 'support/reach_out.html', context)


def help_someone_view(request):
    """Notice -> Ask -> Listen -> Connect structured guide."""
    context = {
        'page_title': 'Help Someone Else — Notice, Ask, Listen, Connect | agkAInakem',
    }
    return render(request, 'support/help_someone.html', context)


def daily_tracker(request):
    """Private, self-reported daily emotional check-in."""
    submitted = False
    status_submitted = None

    if request.method == 'POST':
        mood_status = request.POST.get('mood_status')
        primary_feeling = request.POST.get('primary_feeling', '').strip()
        note = request.POST.get('note', '').strip()

        if mood_status in ['green', 'yellow', 'red']:
            DailyCheckIn.objects.create(
                mood_status=mood_status,
                primary_feeling=primary_feeling,
                note=note
            )
            submitted = True
            status_submitted = mood_status

    context = {
        'page_title': 'Daily Emotional Tracker | agkAInakem',
        'submitted': submitted,
        'status_submitted': status_submitted,
    }
    return render(request, 'support/daily_tracker.html', context)
