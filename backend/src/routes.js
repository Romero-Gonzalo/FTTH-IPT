const express = require("express");
const router = express.Router();
const db = require("./db/database");

// helper: número OT-00001
function makeNumero(id) {
  return `OT-${String(id).padStart(5, "0")}`;
}

router.get("/ordenes", (req, res) => {
  db.all(
    `SELECT * FROM ordenes ORDER BY id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", err });

      const data = rows.map((r) => ({
        id: r.id,
        numero: r.numero,
        tipo: r.tipo,
        abonadoNombre: r.abonadoNombre,
        telefono: r.telefono || "",
        planMbps: r.planMbps ?? null,
        macEquipo: r.macEquipo || "",
        referenciaCasa: r.referenciaCasa || "",
        descripcion: r.descripcion || "",
        estado: r.estado,
        ubicacion:
          r.ubicacionLat != null && r.ubicacionLng != null
            ? { lat: r.ubicacionLat, lng: r.ubicacionLng }
            : null,
        ubicacionAnterior: null,
        ubicacionNueva: null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      res.json(data);
    }
  );
});

router.get("/ordenes/:id", (req, res) => {
  const id = Number(req.params.id);

  db.get(`SELECT * FROM ordenes WHERE id = ?`, [id], (err, r) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (!r) return res.status(404).json({ message: "No encontrada" });

    res.json({
      id: r.id,
      numero: r.numero,
      tipo: r.tipo,
      abonadoNombre: r.abonadoNombre,
      telefono: r.telefono || "",
      planMbps: r.planMbps ?? null,
      macEquipo: r.macEquipo || "",
      referenciaCasa: r.referenciaCasa || "",
      descripcion: r.descripcion || "",
      estado: r.estado,
      ubicacion:
        r.ubicacionLat != null && r.ubicacionLng != null
          ? { lat: r.ubicacionLat, lng: r.ubicacionLng }
          : null,
      ubicacionAnterior: null,
      ubicacionNueva: null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  });
});

router.post("/ordenes", (req, res) => {
  const p = req.body;

  const createdAt = Date.now();
  const updatedAt = createdAt;

  const tipo = p.tipo;
  const abonadoNombre = p.abonadoNombre;
  const telefono = p.telefono || "";
  const planMbps = p.planMbps ?? null;
  const macEquipo = p.macEquipo || "";
  const referenciaCasa = p.referenciaCasa || "";
  const descripcion = p.descripcion || "";
  const estado = "PENDIENTE";

  // 👇 NUEVO
  const barrio = p.barrio || "";
  const tecnico = p.tecnico || "";

  const ubicacionLat = p.ubicacion?.lat ?? null;
  const ubicacionLng = p.ubicacion?.lng ?? null;

  if (!tipo || !abonadoNombre) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  db.run(
    `
    INSERT INTO ordenes (
      numero, tipo, abonadoNombre, telefono, planMbps, macEquipo, referenciaCasa, descripcion,
      barrio, tecnico,
      estado, ubicacionLat, ubicacionLng, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      "TEMP",
      tipo,
      abonadoNombre,
      telefono,
      planMbps,
      macEquipo,
      referenciaCasa,
      descripcion,
      barrio,      // 👈
      tecnico,     // 👈
      estado,
      ubicacionLat,
      ubicacionLng,
      createdAt,
      updatedAt,
    ],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error", err });

      const id = this.lastID;
      const numero = `OT-${String(id).padStart(5, "0")}`;

      db.run(`UPDATE ordenes SET numero = ? WHERE id = ?`, [numero, id], (err2) => {
        if (err2) return res.status(500).json({ message: "DB error", err: err2 });

        res.status(201).json({
          id,
          numero,
          tipo,
          abonadoNombre,
          telefono,
          planMbps,
          macEquipo,
          referenciaCasa,
          descripcion,
          barrio,      // 👈
          tecnico,     // 👈
          estado,
          ubicacion:
            ubicacionLat != null && ubicacionLng != null
              ? { lat: ubicacionLat, lng: ubicacionLng }
              : null,
          createdAt,
          updatedAt,
        });
      });
    }
  );
});

router.put("/ordenes/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = req.body;

  const updatedAt = Date.now();

  const tipo = p.tipo;
  const abonadoNombre = p.abonadoNombre;
  const telefono = p.telefono || "";
  const planMbps = p.planMbps ?? null;
  const macEquipo = p.macEquipo || "";
  const referenciaCasa = p.referenciaCasa || "";
  const descripcion = p.descripcion || "";

  // 👇 NUEVO
  const barrio = p.barrio || "";
  const tecnico = p.tecnico || "";

  const estado = p.estado || "PENDIENTE";

  const ubicacionLat = p.ubicacion?.lat ?? null;
  const ubicacionLng = p.ubicacion?.lng ?? null;

  db.run(
    `
    UPDATE ordenes SET
      tipo = ?,
      abonadoNombre = ?,
      telefono = ?,
      planMbps = ?,
      macEquipo = ?,
      referenciaCasa = ?,
      descripcion = ?,
      barrio = ?,          -- 👈
      tecnico = ?,         -- 👈
      estado = ?,
      ubicacionLat = ?,
      ubicacionLng = ?,
      updatedAt = ?
    WHERE id = ?
  `,
    [
      tipo,
      abonadoNombre,
      telefono,
      planMbps,
      macEquipo,
      referenciaCasa,
      descripcion,
      barrio,     // 👈
      tecnico,    // 👈
      estado,
      ubicacionLat,
      ubicacionLng,
      updatedAt,
      id,
    ],
    function (err) {
      if (err) return res.status(500).json({ message: "DB error", err });
      if (this.changes === 0)
        return res.status(404).json({ message: "Orden no encontrada" });

      res.json({ message: "Orden actualizada" });
    }
  );
});

router.delete("/ordenes/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run(`DELETE FROM ordenes WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (this.changes === 0) return res.status(404).json({ message: "No encontrada" });

    res.json({ ok: true });
  });
});

module.exports = router;
