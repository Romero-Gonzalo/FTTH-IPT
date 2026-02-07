import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Orden } from "../models/orden.model";

@Injectable({ providedIn: "root" })
export class OrdenesService {
private baseUrl = "/api";

  constructor(private http: HttpClient) {}

  list(): Observable<Orden[]> {
    return this.http.get<Orden[]>(`${this.baseUrl}/ordenes`);
  }

  getById(id: number): Observable<Orden> {
    return this.http.get<Orden>(`${this.baseUrl}/ordenes/${id}`);
  }

  create(payload: Partial<Orden>): Observable<Orden> {
    return this.http.post<Orden>(`${this.baseUrl}/ordenes`, payload);
  }
  update(id: number, payload: Partial<Orden>): Observable<Orden> {
  return this.http.put<Orden>(`${this.baseUrl}/ordenes/${id}`, payload);
}

delete(id: number): Observable<{ ok: boolean }> {
  return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/ordenes/${id}`);
}

}
