import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosAcademicosService } from 'src/app/services/eventos.service';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_eventos: any[] = [];


  //Para la tabla
  public displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<DatosEvento>(this.lista_eventos as DatosEvento[]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosAcademicosService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();

    //Validar que haya inicio de sesión
    //Obtengo el token del login
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }

    if (this.rol === 'administrador') {
    this.displayedColumns = [
      'nombreEvento','tipoEvento','fechaRealizacion','horario','lugar',
      'publico_json','progEducativo','nombreResponsable','descripcion','cupoEvento',
      'editar','eliminar'
    ];
  } else {
    this.displayedColumns = [
      'nombreEvento','tipoEvento','fechaRealizacion','horario','lugar',
      'publico_json','progEducativo','nombreResponsable','descripcion','cupoEvento'
    ];
  }
    //Obtener eventos
    this.obtenerEventos();
  }

  // Consumimos el servicio para obtener los eventos
  public obtenerEventos() {
    this.eventosService.obtenerListaEventos().subscribe(
      (response) => {
        this.lista_eventos = response;
        console.log("Lista eventos: ", this.lista_eventos);
        if (this.lista_eventos.length > 0) {
          console.log("Eventos: ", this.lista_eventos);
          let eventos = response;

          // Mostrar eventos segun su rol
          if (this.rol === 'maestro') {
            eventos = eventos.filter(e =>
              e.publico_json.includes('Profesores') ||
              e.publico_json.includes('Público general')
            );
          }

          if (this.rol === 'alumno') {
            eventos = eventos.filter(e =>
              e.publico_json.includes('Estudiantes') ||
              e.publico_json.includes('Público general')
            );
          }

          this.lista_eventos = eventos;
          this.dataSource.data = eventos;
          // Actualizar el dataSource
          this.dataSource.data = this.lista_eventos;
          this.dataSource.sortingDataAccessor = (item: any, property) => {
            switch (property) {
              case 'nombreEvento':
                return item.nombreEvento.toLowerCase();
              default:
                return item[property];
            }
          };

          // Actualización del paginator y sort
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }, 0);
        }
      }, (error) => {
        console.error("Error al obtener la lista de eventos: ", error);
        alert("No se pudo obtener la lista de eventos");
      }
    );
  }

  //Funcion para el filtro
  public filtrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: DatosEvento, filter: string) => {
      const nombre = `${data.nombreEvento}`.toLowerCase();
      return nombre.includes(filter);
    };

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idEvento: number) {
    this.router.navigate(["registro-eventos-academicos/" + idEvento]);
  }

  public delete(idEvento: number) {
    // Obtener el ID del usuario en sesión
    const userIdSession = Number(this.facadeService.getUserId());

    // Solo administradores y maestros pueden eliminar eventos
    if (this.rol === 'administrador' && userIdSession === idEvento) {
      const dialogRef = this.dialog.open(EliminarUserModalComponent,{
        data: {id: idEvento, rol: 'evento'}, //Se pasan valores a través del componente
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result.isDelete){
          // Llamar al servicio para eliminar el evento
          this.eventosService.eliminarEvento(idEvento).subscribe(
            (response) => {
              console.log("Evento eliminado:", response);
              alert("Evento eliminado correctamente.");
              //Recargar página
              window.location.reload();
            },
            (error) => {
              console.error("Error al eliminar evento:", error);
              alert("Error al eliminar el evento.");
            }
          );
        } else {
          console.log("No se eliminó el evento");
        }
      });
    } else {
      alert("No tienes permisos para eliminar eventos.");
    }
  }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosEvento {
  id: number;
  nombreEvento: string;
  tipoEvento: string;
  fechaRealizacion: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  publico_json: string[];
  progEducativo: string;
  responsableEvento: number;
  nombreResponsable: string;
  descripcion: string;
  cupoEvento: number;
}
