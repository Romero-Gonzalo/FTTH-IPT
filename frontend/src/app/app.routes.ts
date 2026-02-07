import { Routes } from "@angular/router";
import { OrdenesListPage } from "./pages/ordenes-list/ordenes-list";
import { OrdenesNewPage } from "./pages/ordenes-new/ordenes-new";
import { OrdenesDetailPage } from "./pages/ordenes-detail/ordenes-detail";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "ordenes" },
  { path: "ordenes", component: OrdenesListPage },
  { path: "ordenes/nueva", component: OrdenesNewPage },
  { path: "ordenes/:id", component: OrdenesDetailPage },
  { path: "**", redirectTo: "ordenes" },
];
