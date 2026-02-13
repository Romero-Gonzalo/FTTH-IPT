import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs/operators";
import { ChangeDetectorRef } from "@angular/core";

import { OrdenesService } from "../../services/ordenes.service";
import { TipoOrden } from "../../models/orden.model";
import { MapPickerComponent } from "../../components/map-picker/map-picker";

type LatLng = { lat: number; lng: number };

@Component({
  selector: "app-ordenes-new",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MapPickerComponent],
  templateUrl: "./ordenes-new.html",
})
export class OrdenesNewPage {
  saving = false;

  tipo: TipoOrden = "INSTALACION_FTTH";
  abonadoNombre = "";
  telefono = "";
  planMbps: number | null = 100;
  macEquipo = "";
  referenciaCasa = "";
  descripcion = "";
barrio = "";
tecnico = "";

  ubicacion: LatLng | null = null;

  constructor(
    private ordenesService: OrdenesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  save() {
    if (!this.abonadoNombre.trim()) {
      alert("Falta el nombre del abonado");
      return;
    }

    this.saving = true;

    this.ordenesService
      .create({
        tipo: this.tipo,
        abonadoNombre: this.abonadoNombre.trim(),
        telefono: this.telefono.trim(),
        planMbps: this.planMbps,
        macEquipo: this.macEquipo.trim(),
        referenciaCasa: this.referenciaCasa.trim(),
        descripcion: this.descripcion.trim(),
        barrio: this.barrio.trim(),
        tecnico: this.tecnico.trim(),
        ubicacion: this.ubicacion,
      })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (o) => this.router.navigate(["/ordenes", o.id]),
        error: (err) => {
          console.error("ERROR CREATE:", err);
          alert("Error guardando (mirá consola).");
          this.cdr.detectChanges();
        },
      });
  }
}
