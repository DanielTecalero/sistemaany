import os
import sys

# La ruta completa al directorio donde está manage.py (Tu carpeta de Backend)
# Debe ser: /home/DanielT/sistemaany/dev_sistema_escolar_api
path_to_backend = '/home/DanielT/sistemaany/dev_sistema_escolar_api'

if path_to_backend not in sys.path:
    # Agrega el directorio de backend (donde está manage.py) al path de Python
    sys.path.insert(0, path_to_backend)
    
# Opcional, pero recomendado: Agrega el directorio raíz del repositorio (sistemaany) 
# Esto puede ser útil si tu estructura requiere acceder a archivos fuera del backend.
path_to_repo_root = '/home/DanielT/sistemaany'
if path_to_repo_root not in sys.path:
    sys.path.insert(0, path_to_repo_root)

# ----------------------------------------------------------------------
# LÓGICA PARA CARGAR EL ARCHIVO .ENV
# Reusamos la función de tu compañero, pero apuntando a tu ruta
# ----------------------------------------------------------------------
def load_env_file(filepath):
    """Cargar variables de entorno desde archivo .env"""
    if os.path.exists(filepath):
        with open(filepath) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    # Usamos setdefault para no sobreescribir si ya existe
                    os.environ.setdefault(key.strip(), value.strip())

# Ruta al archivo .env dentro de tu carpeta de backend
env_path = os.path.join(path_to_backend, '.env') 
load_env_file(env_path)


# ----------------------------------------------------------------------
# CONFIGURACIÓN E INICIALIZACIÓN DE DJANGO
# ----------------------------------------------------------------------

# Configurar la variable de entorno que le dice a Django dónde está settings.py
# (Tu archivo de configuración de Django es dev_sistema_escolar_api.settings)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dev_sistema_escolar_api.settings')

# Inicializar Django
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()