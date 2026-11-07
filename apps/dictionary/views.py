from django.shortcuts import render

def dictionary_index(request):
    """Dictionary browse and taxonomy overview."""
    context = {
        'page_title': 'Specialized Mental Health Dictionary — Words For It',
    }
    return render(request, 'dictionary/index.html', context)
