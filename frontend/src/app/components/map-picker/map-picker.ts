import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import * as L from "leaflet";

type LatLng = { lat: number; lng: number };

@Component({
  selector: "app-map-picker",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./map-picker.html",
  styleUrl: "./map-picker.css",
})
export class MapPickerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() value: LatLng | null = null;
  @Input() heightPx = 360;

  // Centro inicial (La Rioja aprox)
  @Input() center: LatLng = { lat: -29.4133, lng: -66.8567 };
  @Input() zoom = 13;

  @Output() valueChange = new EventEmitter<LatLng>();

  private map?: L.Map;
  private marker?: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si ya existe el mapa y cambia el value desde afuera, se actualiza el marcador
    if (this.map && changes["value"] && this.value) {
      this.setMarker(this.value.lat, this.value.lng, true);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap() {
    const el = document.getElementById("map-picker");
    if (!el) return;

    this.map = L.map(el, {
      center: [this.center.lat, this.center.lng],
      zoom: this.zoom,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("click", (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      this.setMarker(lat, lng, false);
      this.valueChange.emit({ lat, lng });
    });

    
    if (this.value) {
      this.setMarker(this.value.lat, this.value.lng, true);
    }
  }

  private setMarker(lat: number, lng: number, pan: boolean) {
    if (!this.map) return;

    // Icon fix (Angular + bundlers)
    const icon = L.icon({
      iconUrl: "/leaflet/marker-icon.png",
iconRetinaUrl: "/leaflet/marker-icon-2x.png",
shadowUrl: "/leaflet/marker-shadow.png",

      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (!this.marker) {
      this.marker = L.marker([lat, lng], { icon }).addTo(this.map);
    } else {
      this.marker.setLatLng([lat, lng]);
      this.marker.setIcon(icon);
    }

    if (pan) this.map.setView([lat, lng], Math.max(this.map.getZoom(), 15));
  }

  //  centrar usando geolocalización del navegador
  useMyLocation() {
    if (!this.map || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        this.map!.setView([lat, lng], 16);
      },
      () => {
        alert("No se pudo obtener tu ubicación (permiso denegado o sin señal).");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}
