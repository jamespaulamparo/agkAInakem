from django.shortcuts import render

def explore_view(request):
    """Sentence-to-word discovery interface."""
    context = {
        'page_title': 'Explore Emotional Vocabulary — Words For It',
    }
    return render(request, 'discovery/explore.html', context)
