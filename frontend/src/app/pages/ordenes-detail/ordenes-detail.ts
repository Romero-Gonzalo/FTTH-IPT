import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs/operators";
import { OrdenesService } from "../../services/ordenes.service";
import { Orden, TipoOrden } from "../../models/orden.model";
import { MapPickerComponent } from "../../components/map-picker/map-picker";

type LatLng = { lat: number; lng: number };

@Component({
  selector: "app-ordenes-detail",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MapPickerComponent],
  templateUrl: "./ordenes-detail.html",
})
export class OrdenesDetailPage implements OnInit {
  loading = false;
  errorMsg = "";
  orden?: Orden;

  // modo edición
  editMode = false;
  saving = false;
  deleting = false;

  // campos editables
  tipo: TipoOrden = "INSTALACION_FTTH";
  abonadoNombre = "";
  telefono = "";
  planMbps: number | null = null;
  macEquipo = "";
  referenciaCasa = "";
  descripcion = "";
  estado = "PENDIENTE";

  // 👇 NUEVO
  barrio = "";
  tecnico = "";

  ubicacion: LatLng | null = null;

  constructor(
    private route: ActivatedRoute,
    private ordenesService: OrdenesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get("id");
    const id = Number(rawId);

    console.log("DETAIL ID:", rawId, id);

    if (!rawId || Number.isNaN(id)) {
      this.errorMsg = "ID inválido en la URL.";
      return;
    }

    this.loading = true;
    this.errorMsg = "";

    this.ordenesService
      .getById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (o) => {
          console.log("DETAIL OK:", o);
          this.orden = o;
          this.fillFormFromOrden(o);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("ERROR DETAIL:", err);
          this.errorMsg = "No se pudo cargar la orden (¿existe?).";
          this.cdr.detectChanges();
        },
      });
  }

  private fillFormFromOrden(o: Orden) {
    this.tipo = o.tipo;
    this.abonadoNombre = o.abonadoNombre || "";
    this.telefono = o.telefono || "";
    this.planMbps = o.planMbps ?? null;
    this.macEquipo = o.macEquipo || "";
    this.referenciaCasa = o.referenciaCasa || "";
    this.descripcion = o.descripcion || "";
    this.estado = o.estado || "PENDIENTE";

    // 👇 NUEVO
    this.barrio = o.barrio || "";
    this.tecnico = o.tecnico || "";

    this.ubicacion = o.ubicacion ? { lat: o.ubicacion.lat, lng: o.ubicacion.lng } : null;
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode && this.orden) this.fillFormFromOrden(this.orden);
    this.cdr.detectChanges();
  }

  save() {
    if (!this.orden) return;
    if (!this.abonadoNombre.trim()) {
      alert("Falta el nombre del abonado");
      return;
    }

    this.saving = true;

    this.ordenesService
      .update(this.orden.id, {
        tipo: this.tipo,
        abonadoNombre: this.abonadoNombre.trim(),
        telefono: this.telefono.trim(),
        planMbps: this.planMbps,
        macEquipo: this.macEquipo.trim(),
        referenciaCasa: this.referenciaCasa.trim(),

        // 👇 NUEVO
        barrio: this.barrio.trim(),
        tecnico: this.tecnico.trim(),

        descripcion: this.descripcion.trim(),
        estado: this.estado as any,
        ubicacion: this.ubicacion,
      })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (updated) => {
          
          this.orden = updated;
          this.editMode = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("ERROR UPDATE:", err);
          alert("No se pudo guardar");
          this.cdr.detectChanges();
        },
      });
  }

  remove() {
    if (!this.orden) return;

    const ok = confirm(`¿Eliminar ${this.orden.numero}? Esta acción no se puede deshacer.`);
    if (!ok) return;

    this.deleting = true;

    this.ordenesService
      .delete(this.orden.id)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => this.router.navigate(["/ordenes"]),
        error: (err) => {
          console.error("ERROR DELETE:", err);
          alert("No se pudo eliminar");
          this.cdr.detectChanges();
        },
      });
  }

  mapsUrl(lat: number, lng: number) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }
}
