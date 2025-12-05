"""
WSGI config for dev_sistema_escolar_api project.
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

# ✅ Agregar el path de tu proyecto
path = '/home/DanielT/sistemaany/'  # Cambia esto a tu ruta real
if path not in sys.path:
    sys.path.append(path)

# ✅ Cargar variables de entorno (si usas python-dotenv)
from dotenv import load_dotenv
project_folder = os.path.expanduser(path)
load_dotenv(os.path.join(project_folder, '.env'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_sistema_escolar_api.settings')

application = get_wsgi_application()