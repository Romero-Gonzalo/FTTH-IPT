import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { finalize } from "rxjs/operators";
import { OrdenesService } from "../../services/ordenes.service";
import { Orden } from "../../models/orden.model";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: "app-ordenes-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./ordenes-list.html",
})
export class OrdenesListPage implements OnInit {
  loading = false;
  errorMsg = "";
  ordenes: Orden[] = [];

constructor(
  private ordenesService: OrdenesService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.errorMsg = "";

    this.ordenesService
  .list()
  .pipe(finalize(() => {
    this.loading = false;
    this.cdr.detectChanges();
  }))
  .subscribe({
    next: (data) => {
      console.log("LIST OK:", data);
      this.ordenes = data ?? [];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("ERROR LIST:", err);
      this.errorMsg = "No se pudo cargar la lista.";
      this.cdr.detectChanges();
    },
  });
    }

  badgeClass(estado: string) {
    if (estado === "FINALIZADA") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (estado === "EN_PROGRESO") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    return "bg-sky-500/15 text-sky-300 border-sky-500/30";
  }

  tipoLabel(tipo: string) {
    if (tipo === "INSTALACION_FTTH") return "Instalación FTTH";
    if (tipo === "REUBICACION_BAJADA") return "Reubicación de bajada";
    if (tipo === "MIGRACION_HFC_A_FTTH") return "Migración HFC → FTTH";
    return tipo;
  }
}
