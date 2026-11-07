from django.shortcuts import render

def reach_out_index(request):
    """Reach Out landing hub: I Need Help, Someone Else, and Check In."""
    context = {
        'page_title': 'Reach Out — Early Support & Human Connection — Words For It',
    }
    return render(request, 'support/reach_out.html', context)

def help_someone_view(request):
    """Notice -> Ask -> Listen -> Connect structured guide."""
    context = {
        'page_title': 'Help Someone Else — Notice, Ask, Listen, Connect — Words For It',
    }
    return render(request, 'support/help_someone.html', context)
