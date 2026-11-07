from django.shortcuts import render

def home_view(request):
    """Primary landing page introducing agkAInakem, rooted in San Fernando, La Union."""
    context = {
        'page_title': 'agkAInakem — Mental Health Literacy & Early Support | San Fernando, La Union',
    }
    return render(request, 'pages/home.html', context)

def about_view(request):
    """Ethical boundaries, safety policies, nakem cultural philosophy, and privacy."""
    context = {
        'page_title': 'About agkAInakem & Safety Principles | San Fernando, La Union',
    }
    return render(request, 'pages/about.html', context)
