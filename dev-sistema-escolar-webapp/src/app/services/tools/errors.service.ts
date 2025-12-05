import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  public generic: string = "";
  public required: string = "";
  public numeric: string = "";
  public betweenDate: string  = "";
  public email: string = "";
  public passwordMatch: string = "";
  public curp: string = "";


  public emailLowercase: string = "";
  public emailValidacion: string = "";
  public noSpecialChars: string = "";
  public onlyLetters: string = "";
  public strongPassword: string = "";
  public notFutureDate: string = "";
  public minAge: string = "";
  public curpFormat: string = "";
  public rfcFormat: string = "";
  public idFormat: string = "";
  public cubiculoFormat: string = "";
  public alphanumeric: string = "";
  public minPasswordLength: string = "";
  //Proyecto Final
  public nomEvento: string = "";
  public fechaRealizacion: string = "";
  public validarHora: string = "";
  public lugar: string = "";
  public validarPublic: string = "";
  public validarDescripcion: string = "";


  constructor() {
    this.generic = 'Favor de verificar el tipo de dato introducido, ya que no es válido';
    this.required = 'Campo requerido';
    this.numeric = 'Solo se aceptan valores numéricos';
    this.betweenDate = 'Fecha no es válida';
    this.email = 'Favor de introducir un correo con el formato correcto';
    this.passwordMatch = 'Las contraseñas no coinciden';
    this.curp = 'El formato de la CURP no es válido';


    this.emailLowercase = 'El correo electrónico no debe contener mayúsculas';
    this.noSpecialChars = 'No se permiten caracteres especiales';
    this.onlyLetters = 'Solo se permiten letras y espacios';
    this.strongPassword = 'La contraseña debe contener al menos una mayúscula y un número';
    this.minPasswordLength = 'La contraseña debe tener al menos 8 caracteres';
    this.notFutureDate = 'La fecha no puede ser futura';
    this.minAge = 'Debe ser mayor de 18 años';
    this.emailValidacion = 'El correo electrónico no es válido, use un formato adecuado';
    this.curpFormat = 'La CURP debe tener exactamente 18 caracteres y no deben ser especiales';
    this.rfcFormat = 'El RFC debe tener entre 12 y 13 caracteres y no debe contener caracteres especiales';
    this.idFormat = 'El ID debe tener máximo 10 caracteres, sin caracteres especiales';
    this.cubiculoFormat = 'El cubículo solo puede contener letras, números y guiones';
    this.alphanumeric = 'Solo se permiten letras y números, sin caracteres especiales';

    //Proyecto Final
    this.nomEvento = "Solo se permiten letras, números y espacios";
    this.fechaRealizacion = "La fecha no puede ser anterior al día actual";
    this.validarHora = "La hora de finalización debe ser mayor que la hora de inicio";
    this.lugar = "Solo se permiten caracteres alfanuméricos y espacios";
    this.validarPublic = "Debes seleccionar al menos un público objetivo";
    this.validarDescripcion = "Solo se permiten letras, números y signos de puntuación básicos";
  }

  between(min: any, max: any) {
    return 'El valor introducido debe de ser entre ' + min + ' y ' + max;
  }

  max(size: any) {
    return 'Se excedió la longitud del campo aceptada: ' + size;
  }

  min(size: any) {
    return 'El campo no cumple la longitud aceptada: ' + size;
  }

  minAsistentes(size: any) {
    return 'El campo debe tener por lo menos: ' + size + ' asistente';
  }

}
