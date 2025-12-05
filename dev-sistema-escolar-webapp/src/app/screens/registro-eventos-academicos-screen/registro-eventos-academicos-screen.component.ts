import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { FacadeService } from 'src/app/services/facade.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EventosAcademicosService } from 'src/app/services/eventos.service';
import { EditarUserModalComponent } from 'src/app/modals/editar-user-modal/editar-user-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registro-eventos-academicos-screen',
  templateUrl: './registro-eventos-academicos-screen.component.html',
  styleUrls: ['./registro-eventos-academicos-screen.component.scss']
})
export class RegistroEventosAcademicosScreenComponent implements OnInit {
  @Input() datos_evento: any = {};
  evento: any = {};
  public errors: any = {};
  public editar: boolean = false;
  public token: string = "";
  public idEvento: number = 0;

  // Listas para selects y checkboxes
  public tiposEvento: any[] = [
    { value: 'Conferencia', viewValue: 'Conferencia' },
    { value: 'Taller', viewValue: 'Taller' },
    { value: 'Seminario', viewValue: 'Seminario' },
    { value: 'Concurso', viewValue: 'Concurso' }
  ];

  public publicosObjetivo: any[] = [
    { value: 'Estudiantes', nombre: 'Estudiantes' },
    { value: 'Profesores', nombre: 'Profesores' },
    { value: 'Público general', nombre: 'Público general' }
  ];

  public programasEducativos: any[] = [
    { value: 'ICC', viewValue: 'Ingeniería en Ciencias de la Computación' },
    { value: 'LCC', viewValue: 'Licenciatura en Ciencias de la Computación' },
    { value: 'ITI', viewValue: 'Ingeniería en Tecnologías de la Información' }
  ];

  public responsables: any[] = [];
  public mostrar: boolean = false;

  // Constructor
  constructor(
    private router: Router,
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private maestrosService: MaestrosService,
    private administradoresService: AdministradoresService,
    private eventosService: EventosAcademicosService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Verificar si es edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);
    } else {
      // Registrar nuevo evento
      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
    }

    // Cargar responsables
    this.cargarResponsables();
    console.log("Evento en ngOnInit: ", this.evento);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datos_evento'] && changes['datos_evento'].currentValue) {
      this.cargarDatosEvento();
    }
  }
  private cargarDatosEvento(): void {
    if (this.datos_evento && Object.keys(this.datos_evento).length > 0) {
      this.evento = {...this.datos_evento};
      this.verificarPublicoObjetivo();
    }
  }

  public cargarResponsables() {
  this.maestrosService.obtenerListaMaestros().subscribe(
    (maestros) => {

      const maestrosObtenidos: any[] = [];
      for (let i = 0; i < maestros.length; i++) {
        const m = maestros[i];
        maestrosObtenidos.push({id: m.id, nombre: `Maestro : ${m.user.first_name} ${m.user.last_name}`});
      }

      this.administradoresService.obtenerListaAdmins().subscribe(
        (admins) => {

          const adminsObtenidos: any[] = [];
          for (let i = 0; i < admins.length; i++) {
            const a = admins[i];
            adminsObtenidos.push({ id: a.id, nombre: `Administrador : ${a.user.first_name} ${a.user.last_name}`});
          }
          this.responsables = [...maestrosObtenidos, ...adminsObtenidos];
        },
          (error) => console.error("Error administradores:", error)
        );
      },
    (error) => console.error("Error maestros:", error)
    );
  }



  public verificarPublicoObjetivo() {
    this.mostrar = this.evento.publico_json?.includes('Estudiantes');
    if (!this.mostrar) {
      this.evento.progEducativo = '';
    }
  }

  public checkboxChangePublico(event: any) {
    console.log("Evento: ", event);
    if (event.checked) {
      this.evento.publico_json.push(event.source.value);
    } else {
      console.log(event.source.value);
      this.evento.publico_json.forEach((materia, i) => {
        if(materia == event.source.value){
          this.evento.publico_json.splice(i,1)
        }
      });
    }
    this.verificarPublicoObjetivo();
    console.log("Array publico Objetivo: ", this.evento);
  }

  public revisarSeleccionPublico(valor: string) {
    if (this.evento.publico_json) {
      return this.evento.publico_json.includes(valor);
    }
    return false;
  }

  public changeFecha(event: any) {
    console.log(event);
    console.log(event.value.toISOString());
    this.evento.fechaRealizacion = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.evento.fechaRealizacion);
  }

  //Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }

  public registrar() {
    // Validar formulario
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (Object.keys(this.errors).length > 0) {
      console.log("Errores de validación:", this.errors);
      alert("Por favor, corrige los errores en el formulario");
      return;
    }

    console.log("Evento a enviar:", this.evento);
    // Registrar evento
    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        alert("Evento registrado exitosamente");
        console.log("Evento registrado: ", response);
        this.router.navigate(["eventos"]);
      },
      (error) => {
        console.error("Error al registrar evento:", error);
        if (error.error && error.error.message) {
          alert(`Error: ${error.error.message}`);
        } else {
          alert("Error al registrar el evento. Verifica los datos.");
        }
      }
    );
  }

  public actualizar() {
    // Validar formulario
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (Object.keys(this.errors).length > 0) {
      console.log("Errores de validación:", this.errors);
      alert("Por favor, corrige los errores en el formulario");
      return;
    }

    const dialogRef = this.dialog.open(EditarUserModalComponent, {
      data: { evento: this.evento },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isUpdate) {
        // Si confirma, agregar el ID y actualizar
        this.evento.id = this.idEvento;
        console.log("Evento a actualizar:", this.evento);
        // Actualizar evento directamente con this.evento
        this.eventosService.actualizarEvento(this.evento).subscribe(
          (response) => {
            alert("Evento actualizado exitosamente");
            console.log("Evento actualizado: ", response);
            this.router.navigate(["eventos"]);
          },
          (error) => {
            console.error("Error completo:", error);
            if (error.error && error.error.error) {
              alert(`Error: ${error.error.error}`);
            } else {
              alert("Error al actualizar el evento. Verifica los datos.");
            }
          }
        );
      } else {
        console.log("Actualización cancelada por el usuario");
      }
    });
  }

  public soloAlfanumerico(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    const isLetter = (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
    const isNumber = charCode >= 48 && charCode <= 57;
    const isSpace = charCode === 32;
    const isAccent = 'ÑñáéíóúÁÉÍÓÚ'.includes(event.key);

    if (!isLetter && !isNumber && !isSpace && !isAccent) {
      event.preventDefault();
    }
  }

  public soloNumeros(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey ||
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight') {
      return;
    }

    const regex = /^[0-9]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }
}
