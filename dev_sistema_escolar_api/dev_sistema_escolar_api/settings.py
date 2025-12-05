import os
from dotenv import load_dotenv
import dj_database_url
from pathlib import Path

# ====================================================
# 1. CARGA DE VARIABLES DE ENTORNO Y CONFIGURACIÓN BASE
# ====================================================

# Carga las variables del archivo .env si usas dot-env localmente.
# Nota: En PythonAnywhere, si usas la configuración de entorno de PA, no es necesario.
# Si lo usas, debes asegurarte de que el .env esté en la ruta correcta.
load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Lee la clave secreta de las variables de entorno (o usa un default seguro)
SECRET_KEY = os.environ.get('SECRET_KEY', 'genera-una-clave-secreta-alcatoria-aqui-12345')

# Configuración de DEBUG y ALLOWED_HOSTS
# DEBUG: Debe ser False en producción (PythonAnywhere)
DEBUG = os.environ.get('DEBUG', 'False') == 'True' 

# ALLOWED_HOSTS: Lee de .env o usa el nombre de usuario de PythonAnywhere
# Asumimos que tu nombre de usuario es 'DanielT' (por el dominio)
ALLOWED_HOSTS_STR = os.environ.get('ALLOWED_HOSTS', '127.0.0.1,localhost,DanielT.pythonanywhere.com')
ALLOWED_HOSTS = ALLOWED_HOSTS_STR.split(',')


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Terceros
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders', 
    
    # Aplicaciones Locales
    'dev_sistema_escolar_api',
]

# ====================================================
# 2. MIDDLEWARE (Corregido y Optimizado)
# ====================================================

MIDDLEWARE = [
    # 1. CORS debe ir lo más arriba posible, justo después de SecurityMiddleware.
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', # ÚNICA INSTANCIA AQUÍ

    # WhiteNoise se usa para servir archivos estáticos en producción.
    # Si usas la configuración estática de PythonAnywhere, puedes omitir esta línea.
    # 'white_noise.middleware.WhiteNoiseMiddleware', 

    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ====================================================
# 3. CONFIGURACIÓN DE CORS (Corregida)
# ====================================================
# Utiliza la variable CONS_ALLOWED_ORIGINS del .env

CORS_ALLOWED_ORIGINS_STR = os.environ.get('CONS_ALLOWED_ORIGINS', 'http://localhost:4200')
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STR.split(',')

# Si necesitas permitir más métodos y cabeceras
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_CREDENTIALS = True

# ====================================================
# 4. RUTAS Y TEMPLATES
# ====================================================

ROOT_URLCONF = 'dev_sistema_escolar_api.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dev_sistema_escolar_api.wsgi.application'


# ====================================================
# 5. BASE DE DATOS Y AUTENTICACIÓN
# ====================================================
# Utiliza las variables DB_XXX que definiste en tu .env

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),  # Lee la dirección del host de PythonAnywhere
        'PORT': os.environ.get('DB_PORT', 3306),
        'OPTIONS': {
            'charset': 'utf8mb4',
            # Ya no usamos 'read_default_file' si usamos variables de entorno directas
        }
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# ====================================================
# 6. INTERNACIONALIZACIÓN Y ZONAS
# ====================================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# ====================================================
# 7. ARCHIVOS ESTÁTICOS Y MEDIA (Ajustados para PythonAnywhere)
# ====================================================

# Directorio donde Django buscará archivos estáticos durante el desarrollo
STATIC_URL = "/static/" 

# Directorio donde Django recolectará los archivos estáticos en producción (al correr collectstatic)
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles") 

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


# ====================================================
# 8. CONFIGURACIÓN DE REST FRAMEWORK
# ====================================================

REST_FRAMEWORK = {
    'COERCE_DECIMAL_TO_STRING': False,
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'dev_sistema_escolar_api.models.BearerTokenAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    # Añadido para asegurar que el Admin de DRF no cause errores
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}