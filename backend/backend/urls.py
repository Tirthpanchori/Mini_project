
from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static
urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/accounts/', include('accounts.urls')),

    # Quiz management
    path('api/quiz/', include('quiz.urls')),

    # Quiz attempts
    path('api/attempts/', include('attempts.urls')),

    # # Reports / analytics
    # path('api/reports/', include('reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


