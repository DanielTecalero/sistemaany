import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosAcademicosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-registros-eventos-screen',
  templateUrl: './registros-eventos-screen.component.html',
  styleUrls: ['./registros-eventos-screen.component.scss']
})
export class RegistrosEventosScreenComponent implements OnInit {

  public evento: any = {};
  public editar: boolean = false;
  public idEvento: number = 0;

  constructor(
    private location: Location,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public facadeService: FacadeService,
    public eventosService: EventosAcademicosService
  ) { }

  ngOnInit(): void {
    //solo administradores
    const rol = this.facadeService.getUserGroup();
    if (rol !== 'administrador') {
      alert("No tienes permisos para acceder a esta página. Solo los administradores pueden registrar o editar eventos.");
      this.router.navigate(["eventos"]);
      return;
    }

    // Verificar si es edición
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);

      // Obtener evento por ID
      this.obtenerEvento();
    }
  }

  // Obtener evento por ID
  public obtenerEvento() {
    console.log("Obteniendo evento con ID: ", this.idEvento);

    this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
      (response) => {
        this.evento = {
          ...response,
          nombreEvento: response.nombreEvento,
          tipoEvento: response.tipoEvento,
          fechaRealizacion: response.fechaRealizacion,
          horaInicio: response.horaInicio,
          horaFin: response.horaFin,
          lugar: response.lugar,
          publico_json: response.publico_json,
          progEducativo: response.progEducativo,
          responsableEvento: response.responsableEvento,
          nombreResponsable: response.nombreResponsable,
          descripcion: response.descripcion,
          cupoEvento: response.cupoEvento
        };
        console.log("Evento obtenido:", this.evento);
      },
      (error) => {
        console.log("Error: ", error);
        alert("No se pudo obtener el evento seleccionado");
      }
    );
  }

  // Función para regresar a la pantalla anterior
  public goBack() {
    this.location.back();
  }
}
