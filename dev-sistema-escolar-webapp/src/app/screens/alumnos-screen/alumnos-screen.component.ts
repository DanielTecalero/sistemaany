import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { FacadeService } from 'src/app/services/facade.service';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";
  public lista_alumnos: any[] = [];

  //Para la tabla
  displayedColumns: string[] = ['matricula', 'nombre', 'apellidos', 'email', 'fecha_nacimiento', 'curp', 'rfc', 'edad', 'telefono', 'ocupacion','editar', 'eliminar'];
  dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
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
    //Obtener alumnos
    this.obtenerAlumnos();
  }

  // Consumimos el servicio para obtener los alumnos
  //Obtener alumnos
  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          //Agregar datos del nombre e email
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          // Actualizar el dataSource
          this.dataSource.data = this.lista_alumnos;
          this.dataSource.sortingDataAccessor = (item: any, property) => {
            switch (property) {
              case 'matricula':
                return item.matricula.toLowerCase();
              case 'nombre':
                return item.first_name.toLowerCase();
              case 'apellidos':
                return item.last_name.toLowerCase();
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
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  //Funcion para el filtro
  public filtrar(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: DatosUsuario, filter: string) => {
      const nombre = `${data.first_name}`.toLowerCase();
      return nombre.includes(filter);
    };

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public goEditar(idUser: number) {
    const userIdSession = Number(this.facadeService.getUserId());
    if (this.rol === 'administrador' || (this.rol === 'maestro') || (this.rol === 'alumno' && userIdSession === idUser)) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
    }else{
      alert("No tienes permisos para editar este alumno.");
    }
  }

  public delete(idUser: number) {
         // Se obtiene el ID del usuario en sesión, es decir, quien intenta eliminar
        const userIdSession = Number(this.facadeService.getUserId());
        // --------- Pero el parametro idUser (el de la función) es el ID del maestro que se quiere eliminar ---------
        // Administrador puede eliminar cualquier maestro
        // Alumno solo puede eliminar su propio registro
        if (this.rol === 'administrador' || (this.rol === 'maestro') || (this.rol === 'alumno' && userIdSession === idUser)) {
          //Si es administrador o es maestro, es decir, cumple la condición, se puede eliminar
          const dialogRef = this.dialog.open(EliminarUserModalComponent,{
            data: {id: idUser, rol: 'alumno'}, //Se pasan valores a través del componente
            height: '288px',
            width: '328px',
          });

        dialogRef.afterClosed().subscribe(result => {
          if(result.isDelete){
            console.log("Alumno eliminado");
            alert("Alumno eliminado correctamente.");
            //Recargar página
            window.location.reload();
          }else{
            alert("Alumno no se ha podido eliminar.");
            console.log("No se eliminó el alumno");
          }
        });
        }else{
          alert("No tienes permisos para eliminar este alumno.");
        }
      }

}

//Esto va fuera de la llave que cierra la clase
export interface DatosUsuario {
  id: number,
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string,
  curp: string,
  rfc: string,
  edad: number,
  telefono: string,
  ocupacion: string,
}

