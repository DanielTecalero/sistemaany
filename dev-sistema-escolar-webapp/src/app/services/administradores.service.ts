import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaAdmin(){
    return {
      'rol':'',
      'clave_admin': '',
      'first_name': '',
      'last_name': '',
      'email': '',
      'password': '',
      'confirmar_password': '',
      'telefono': '',
      'rfc': '',
      'edad': '',
      'ocupacion': ''
    }
  }

  //Validación para el formulario
  public validarAdmin(data: any, editar: boolean){
    console.log("Validando admin... ", data);
    let error: any = {};

    //Id administrador
    if (!this.validatorService.required(data["clave_admin"])) {
      error["clave_admin"] = this.errorService.required;
    } else if (!this.validatorService.max(data["clave_admin"], 10)) {
      error["clave_admin"] = this.errorService.max(10);
    } else if (!this.validatorService.alphanumeric(data["clave_admin"])) {
      error["clave_admin"] = this.errorService.alphanumeric;
    }

    // Nombre
    if (!this.validatorService.required(data["first_name"])) {
      error["first_name"] = this.errorService.required;
    } else if (!this.validatorService.onlyLetters(data["first_name"])) {
      error["first_name"] = this.errorService.onlyLetters;
    }

    //Aplellidos
    if (!this.validatorService.required(data["last_name"])) {
      error["last_name"] = this.errorService.required;
    } else if (!this.validatorService.onlyLetters(data["last_name"])) {
      error["last_name"] = this.errorService.onlyLetters;
    }

    // email
    if (!this.validatorService.required(data["email"])) {
      error["email"] = this.errorService.required;
    } else if (!this.validatorService.max(data["email"], 40)) {
      error["email"] = this.errorService.max(40);
    } else if (!this.validatorService.emailValidacion(data["email"])) {
      error["email"] = this.errorService.emailValidacion;
    } else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    // Contraseña y confirmar
    if (!editar) {
      if (!this.validatorService.required(data["password"])) {
        error["password"] = this.errorService.required;
      } else if (!this.validatorService.minPasswordLength(data["password"], 8)) {
        error["password"] = this.errorService.minPasswordLength;
      } else if (!this.validatorService.strongPassword(data["password"])) {
        error["password"] = this.errorService.strongPassword;
      }

      if (!this.validatorService.required(data["confirmar_password"])) {
        error["confirmar_password"] = this.errorService.required;
      } else if (!this.validatorService.minPasswordLength(data["confirmar_password"], 8)) {
        error["confirmar_password"] = this.errorService.minPasswordLength;
      } else if (!this.validatorService.strongPassword(data["confirmar_password"])) {
        error["confirmar_password"] = this.errorService.strongPassword;
      } else if (!this.validatorService.passwordsMatch(data["password"], data["confirmar_password"])) {
        error["confirmar_password"] = this.errorService.passwordMatch;
      }
    } else {
      // Si es editar y se proporciona password, validar
      if (data["password"] || data["confirmar_password"]) {
        if (!this.validatorService.minPasswordLength(data["password"], 8)) {
          error["password"] = this.errorService.minPasswordLength;
        } else if (!this.validatorService.strongPassword(data["password"])) {
          error["password"] = this.errorService.strongPassword;
        }
        if (!this.validatorService.passwordsMatch(data["password"], data["confirmar_password"])) {
          error["confirmar_password"] = this.errorService.passwordMatch;
        }
      }
    }

    // RFC
    if (!this.validatorService.required(data["rfc"])) {
      error["rfc"] = this.errorService.required;
    } else if (!this.validatorService.min(data["rfc"], 12)) {
      error["rfc"] = this.errorService.min(12);
    } else if (!this.validatorService.max(data["rfc"], 13)) {
      error["rfc"] = this.errorService.max(13);
    } else if (!this.validatorService.rfcFormat(data["rfc"])) {
      error["rfc"] = this.errorService.rfcFormat;
    }

    // Edad
    if(!this.validatorService.required(data["edad"])){
      error["edad"] = this.errorService.required;
    }else if(!this.validatorService.numeric(data["edad"])){
      alert("El formato es solo números");
    }else if(data["edad"]<18){
      error["edad"] = "La edad debe ser mayor o igual a 18";
    }

    // Teléfono
    if(!this.validatorService.required(data["telefono"])){
      error["telefono"] = this.errorService.required;
    }

    // Ocupación
    if(!this.validatorService.required(data["ocupacion"])){
      error["ocupacion"] = this.errorService.required;
    }

    //Return arreglo
    return error;
  }

  //Registrar administrador
  //Servicio para registrar un nuevo usuario
  public registrarAdmin (data: any): Observable <any>{
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/create-admin/`,data, { headers });
  }

  // Petición para obtener la lista de administradores
  public obtenerListaAdmins(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");

    }
    return this.http.get<any>(`${environment.url_api}/lista-admins/`, { headers });
  }

  // Petición para obtener un administrador por su ID
  public obtenerAdminPorID(idAdmin: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/create-admin/?id=${idAdmin}`, { headers });
  }

  public actualizarAdmin(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.put<any>(`${environment.url_api}/create-admin/`, data, { headers });
  }

  // Petición para eliminar un administrador
  public eliminarAdmin(idAdmin: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.delete<any>(`${environment.url_api}/create-admin/?id=${idAdmin}`, { headers });
  }

  // Servicio para obtener el total de usuarios registrados por rol
  public getTotalUsuarios(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/total-usuarios/`, { headers });
  }

  public getEstadisticasEventos(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/estadisticas-eventos/`, { headers });
  }

}
