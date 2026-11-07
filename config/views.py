from django.shortcuts import render

def home_view(request):
    """Primary landing page introducing the two core pillars."""
    context = {
        'page_title': 'Words For It — Language for Emotional Experiences & Early Support',
    }
    return render(request, 'pages/home.html', context)

def about_view(request):
    """Ethical boundaries, safety policies, and clinical non-diagnostic disclaimer."""
    context = {
        'page_title': 'About & Safety Principles — Words For It',
    }
    return render(request, 'pages/about.html', context)
