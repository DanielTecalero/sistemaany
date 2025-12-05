import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';

@Injectable({
  providedIn: 'root'
})
export class EventosAcademicosService {

  constructor(
    private http: HttpClient,
    private facadeService: FacadeService,
    private errorService: ErrorsService,
    private validatorService: ValidatorService
  ) { }

  public esquemaEvento() {
    return {
      'nombreEvento': '',
      'tipoEvento': '',
      'fechaRealizacion': '',
      'horaInicio': '',
      'horaFin': '',
      'lugar': '',
      'publico_json': [],
      'progEducativo': '',
      'responsableEvento': '',
      'descripcion': '',
      'cupoEvento': ''
    };
  }

  public validarEvento(data: any, editar: boolean) {
    console.log("Validando evento... ", data);
    let error: any = {};

    // Nombre del evento
    if (!this.validatorService.required(data["nombreEvento"])) {
      error["nombreEvento"] = this.errorService.required;
    } else if (!this.validatorService.max(data["nombreEvento"], 50)) {
      error["nombreEvento"] = this.errorService.max(50);
    } else if (!this.validatorService.alphanumerico2(data["nombreEvento"])) {
      error["nombreEvento"] = this.errorService.nomEvento;
    }

    // Tipo de evento
    if (!this.validatorService.required(data["tipoEvento"])) {
      error["tipoEvento"] = this.errorService.required;
    }

    // Fecha de realización
    if (!this.validatorService.required(data["fechaRealizacion"])) {
      error["fechaRealizacion"] = this.errorService.required;
    } else {
      const fechaEvento = new Date(data["fechaRealizacion"]);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaEvento < hoy) {
        error["fechaRealizacion"] = this.errorService.fechaRealizacion;
      }
    }
    // Hora inicio
    if (!this.validatorService.required(data["horaInicio"])) {
      error["horaInicio"] = this.errorService.required;
    } else if (!this.validarFormatoHora(data["horaInicio"])) {
      error["horaInicio"] = "Formato de hora inválido";
    }

    // Hora fin
    if (!this.validatorService.required(data["horaFin"])) {
      error["horaFin"] = this.errorService.required;
    } else if (!this.validarFormatoHora(data["horaFin"])) {
      error["horaFin"] = "Formato de hora inválido";
    }

    // Validar que horaFin sea mayor que horaInicio
    if (data["horaInicio"] && data["horaFin"]) {
      if (!this.compararHoras(data["horaInicio"], data["horaFin"])) {
        error["horaFin"] = this.errorService.validarHora;
      }
    }


    // Lugar
    if (!this.validatorService.required(data["lugar"])) {
      error["lugar"] = this.errorService.required;
    } else if (!this.validatorService.alphanumerico2(data["lugar"])) {
      error["lugar"] = this.errorService.lugar;
    }

    // Público objetivo
    if (!this.validatorService.required(data["publico_json"]) || data["publico_json"].length === 0) {
      error["publico_json"] = this.errorService.validarPublic;


    }
    // Programa educativo (solo si público objetivo incluye "Estudiantes")
    if (data["publico_json"].includes("Estudiantes")) {
      if (!this.validatorService.required(data["progEducativo"])) {
        error["progEducativo"] = this.errorService.required;
      }
    }

    // Responsable del evento
    if (!this.validatorService.required(data["responsableEvento"])) {
      error["responsableEvento"] = this.errorService.required;
    }

    // Descripción
    if (!this.validatorService.required(data["descripcion"])) {
      error["descripcion"] = this.errorService.required;
    } else if (!this.validatorService.max(data["descripcion"], 300)) {
      error["descripcion"] = this.errorService.max(300);
    } else if (!this.validatorService.alphanumerico2(data["descripcion"])) {
      error["descripcion"] = this.errorService.validarDescripcion;
    }

    // Cupo máximo
    if (!this.validatorService.required(data["cupoEvento"])) {
      error["cupoEvento"] = this.errorService.required;
    } else if (!this.validatorService.numeric(data["cupoEvento"])) {
      error["cupoEvento"] = this.errorService.numeric;
    } else if (parseInt(data["cupoEvento"]) <= 0) {
      error["cupoEvento"] = this.errorService.minAsistentes(1);
    } else if (data["cupoEvento"].length > 3) {
      error["cupoEvento"] = this.errorService.max(3);
    }

    return error;
  }

  // Validar formato de hora
  private validarFormatoHora(hora: string): boolean {
    const regex24 = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const regex12 = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
    return regex24.test(hora) || regex12.test(hora);
  }

  // Comparar que hora inicio sea menor a hora fin
  private compararHoras(hora1: string, hora2: string): boolean {
    const convertir = (hora: string): number => {
      const match12 = hora.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match12) {
        let h = parseInt(match12[1]);
        const m = parseInt(match12[2]);
        const periodo = match12[3].toUpperCase();
        if (periodo === 'PM' && h !== 12) h += 12;
        if (periodo === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      }
      // Formato 24h
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m;
    };

    return convertir(hora2) > convertir(hora1);
  }

  // Servicio para registrar un nuevo evento
  public registrarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  // Servicio para obtener la lista de eventos
  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }

  // Petición para obtener un evento por su ID
  public obtenerEventoPorID(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  // Servicio para actualizar un evento
  public actualizarEvento(data: any): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  // Servicio para eliminar un evento
  public eliminarEvento(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }
}
