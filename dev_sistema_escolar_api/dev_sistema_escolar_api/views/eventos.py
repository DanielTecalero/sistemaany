from django.db.models import *
from django.db import transaction
from dev_sistema_escolar_api.serializers import EventoSerializer
from dev_sistema_escolar_api.models import *
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
import json
from django.shortcuts import get_object_or_404


class EventosAll(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, *args, **kwargs):
        eventos = Eventos.objects.all().order_by("id")
        lista = EventoSerializer(eventos, many=True).data
        # Convertir publico_json de string a array
        for evento in lista:
            if isinstance(evento, dict) and "publico_json" in evento:
                try:
                    evento["publico_json"] = json.loads(evento["publico_json"])
                except Exception:
                    evento["publico_json"] = []
        
        return Response(lista, 200)


class EventosView(generics.CreateAPIView):
    
    # Permisos por método
    def get_permissions(self):
        if self.request.method in ['GET', 'PUT', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return []  # POST no requiere autenticación
    
    # Obtener evento por ID
    def get(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        evento_data = EventoSerializer(evento, many=False).data
        
        # Convertir publico_json de string a array
        if isinstance(evento_data, dict) and "publico_json" in evento_data:
            try:
                evento_data["publico_json"] = json.loads(evento_data["publico_json"])
            except Exception:
                evento_data["publico_json"] = []
        
        return Response(evento_data, 200)
    
    # Registrar nuevo evento
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            if not user.groups.filter(name='administrador').exists():
                return Response({"error": "No tienes permisos para registrar eventos"}, 403)
            # Obtener el nombre completo del responsable
            responsableEvento = request.data.get("responsableEvento")
            nombre_responsable = self.obtener_nombre_responsable(responsableEvento)
            
            # Crear el evento
            evento = Eventos.objects.create(
                nombreEvento=request.data["nombreEvento"],
                tipoEvento=request.data["tipoEvento"],
                fechaRealizacion=request.data["fechaRealizacion"],
                horaInicio=request.data["horaInicio"],
                horaFin=request.data["horaFin"],  
                lugar=request.data["lugar"],
                publico_json=json.dumps(request.data["publico_json"]),
                progEducativo=request.data.get("progEducativo", None),
                responsableEvento=responsableEvento,
                nombreResponsable=nombre_responsable,
                descripcion=request.data["descripcion"],
                cupoEvento=request.data["cupoEvento"]
            )
            evento.save()
            return Response({"message": "Evento creado exitosamente", "id": evento.id}, 201)
        
        except KeyError as e:
            return Response({"error": f"Campo faltante: {str(e)}"}, 400)
        except Exception as e:
            return Response({"error": f"Error al crear evento: {str(e)}"}, 500)

    # Actualizar evento existente
    @transaction.atomic
    def put(self, request, *args, **kwargs):
        try:
            user = request.user
            if not user.groups.filter(name='administrador').exists():
                return Response({"error": "No tienes permisos para actualizar eventos"}, 403)
            # Obtener el evento a actualizar
            evento = get_object_or_404(Eventos, id=request.data["id"])
            
            # Obtener el nombre completo del responsable
            responsableEvento = request.data.get("responsableEvento", evento.responsableEvento)
            nombre_responsable = self.obtener_nombre_responsable(responsableEvento)
            
            # Actualizar campos - Sin conversiones
            evento.nombreEvento = request.data["nombreEvento"]
            evento.tipoEvento = request.data["tipoEvento"]
            evento.fechaRealizacion = request.data["fechaRealizacion"]
            evento.horaInicio = request.data["horaInicio"]
            evento.horaFin = request.data["horaFin"]
            evento.lugar = request.data["lugar"]
            evento.publico_json = json.dumps(request.data["publico_json"])
            evento.progEducativo = request.data.get("progEducativo", None)
            evento.responsableEvento = responsableEvento
            evento.nombreResponsable = nombre_responsable
            evento.descripcion = request.data["descripcion"]
            evento.cupoEvento = request.data["cupoEvento"]
            evento.save()
            
            return Response({"message": "Evento actualizado correctamente","evento": EventoSerializer(evento).data}, 200)
        
        except KeyError as e:
            return Response({"error": f"Campo faltante: {str(e)}"}, 400)
        except Exception as e:
            return Response({"error": f"Error al actualizar evento: {str(e)}"}, 500)
    
    # Eliminar evento
    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        user = request.user
        if not user.groups.filter(name='administrador').exists():
            return Response({"error": "No tienes permisos para eliminar eventos"}, 403)
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        try:
            evento.delete()
            return Response({"details": "Evento eliminado correctamente"}, 200)
        except Exception as e:
            return Response({"details": f"Error al eliminar: {str(e)}"}, 400)
    
    # Método auxiliar para obtener el nombre completo del responsable
    def obtener_nombre_responsable(self, responsableEvento):
        try:
            # Buscar en Maestros
            maestro = Maestros.objects.get(id=responsableEvento)
            return f"Maestro: {maestro.user.first_name} {maestro.user.last_name} "
        except Maestros.DoesNotExist:
            try:
                # Buscar en Administradores
                admin = Administradores.objects.get(id=responsableEvento)
                return f"Admin: {admin.user.first_name} {admin.user.last_name} "
            except Administradores.DoesNotExist:
                return "Responsable desconocido"


class EventosEstadisticas(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    def get(self, request, *args, **kwargs):
        tipos = ["conferencia", "taller", "seminario", "concurso"]
        data = {}
        for tipo in tipos:
            eventos_tipo = Eventos.objects.filter(tipoEvento__iexact=tipo)
            data[tipo] = {"cantidad": eventos_tipo.count(), "max_cupo": eventos_tipo.aggregate(Max("cupoEvento"))["cupoEvento__max"] or 0}

        return Response(data, 200)
