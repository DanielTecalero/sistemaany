import os
from dotenv import load_dotenv
import dj_database_url # Necesitarás instalar esta librería: pip install dj-database-url

# ----------------------------------------------------
# 1. CARGA DE VARIABLES DE ENTORNO
# ----------------------------------------------------
# Carga las variables del archivo .env
load_dotenv() 

# ----------------------------------------------------
# CONFIGURACIÓN BÁSICA DE DJANGO
# ----------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Lee la clave secreta del archivo .env (¡MUY IMPORTANTE!)
SECRET_KEY = os.environ.get('SECRET_KEY', 'default-key-para-desarrollo') 

# Lee el estado de DEBUG del archivo .env. En producción DEBE ser False
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Lee los hosts permitidos del archivo .env o usa localhost en desarrollo.
# Usamos una lista de Python para los ALLOWED_HOSTS
ALLOWED_HOSTS_STR = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1')
ALLOWED_HOSTS = ALLOWED_HOSTS_STR.split(',')


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders', 
    'dev_sistema_escolar_api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ----------------------------------------------------
# CONFIGURACIÓN DE CORS
# ----------------------------------------------------
# Lee los orígenes permitidos desde el .env
CORS_ALLOWED_ORIGINS_STR = os.environ.get('CONS_ALLOWED_ORIGINS', 'http://localhost:4200')
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STR.split(',')

CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'dev_sistema_escolar_api.urls'


MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles") # Necesitas esto en producción

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

# ----------------------------------------------------
# 2. CONFIGURACIÓN DE BASE DE DATOS (LA CORRECCIÓN CLAVE)
# ----------------------------------------------------
# Aquí es donde Django obtenía la configuración de MySQL de forma incorrecta.
# Ahora leerá las variables DB_XXX que definiste en el .env
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME'), 
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),  # <--- Lee la dirección correcta de PythonAnywhere
        'PORT': os.environ.get('DB_PORT', 3306),
        'OPTIONS': {
             'charset': 'utf8mb4',
             # NO necesitas 'read_default_file': os.path.join(BASE_DIR, "my.cnf")
             # Lo quitamos, ya que en PA usamos el host/puerto/usuario/pass directos
        }
    }
}


AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

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
}