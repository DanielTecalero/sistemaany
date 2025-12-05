import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() { }

  // Validaciones
  required(input: any) {
    return (input != undefined && input != null && input != "" && input.toString().trim().length > 0);
  }

  max(input: any, size: any) {
    return (input.length <= size);
  }

  min(input: any, size: any) {
    return (input.length >= size);
  }

  minAsistentes(input: any, size: any) {
    return (input.length >= size);
  }

  email(input: any) {
    var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return input.match(regEx); // Invalid format
  }


  numeric(input: any) {
    return (!isNaN(parseFloat(input)) && isFinite(input));
  }

  // Para validar que tengan solo letras y espacios
  onlyLetters(input: any) {
    let pat = new RegExp('^[A-Za-zÑñáéíóúÁÉÍÓÚ ]+$');
    return pat.test(input);
  }

  // Para caracteres especiales
  alphanumeric(input: any) {
    let pat = new RegExp('^[A-Za-z0-9ÑñáéíóúÁÉÍÓÚ]+$');
    return pat.test(input);
  }

  alphanumerico2(input: any) {
    let pat = new RegExp('^[A-Za-z0-9ÑñáéíóúÁÉÍÓÚ .,;:¿?¡!\-()]+$');
    return pat.test(input);
  }


  // Para contraseñas seguras
  strongPassword(input: any) {
    const hasUpperCase = /[A-Z]/.test(input);
    const hasNumber = /[0-9]/.test(input);
    return hasUpperCase && hasNumber;
  }

  // Fecha no futura
  notFutureDate(input: any) {
    const inputDate = new Date(input);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today;
  }

  // Edad por la fecha de nacimiento
  minAge(fechaNacimiento: any, edadMinima: number) {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= edadMinima;
  }

  // Curp caracteres alfanumericos
  curpFormat(input: any) {
    let pat = new RegExp('^[A-Z0-9]{18}$');
    return pat.test(input.toUpperCase());
  }

  // RFC solo caracteres alfanumericos
  rfcFormat(input: any) {
    let pat = new RegExp('^[A-Z0-9]{12,13}$');
    return pat.test(input.toUpperCase());
  }

  // Validacion para comparar contraseñas
  passwordsMatch(password: any, confirmPassword: any) {
    return password === confirmPassword;
  }

  // Id matricula caracteres alfanumericos
  idFormat(input: any) {
    let pat = new RegExp('^[A-Z0-9]{1,10}$');
    return pat.test(input.toUpperCase());
  }

  // Cubiculo sin caracteres especiales
  cubiculoFormat(input: any) {
    let pat = new RegExp('^[A-Za-z0-9-]+$');
    return pat.test(input);
  }
  emailValidacion(input: any) {
    var regEx = /^[a-z0-9]+[a-z0-9._-]*[a-z0-9]+@[a-z0-9]+([.-][a-z0-9]+)*\.[a-z]{2,}$/;
    return regEx.test(input);
  }

  minPasswordLength(input: any, minLength: number = 8) {
  return input && input.length >= minLength;
}


}
