import { useState } from "react";

// ─── ESTRUCTURA DEL TORNEO ───────────────────────────────────────
// 🎨 COLORES: verde/blanco/rojo — CD Lourdes
const CATEGORIAS = [
  { id: "alevin",   label: "Alevín",   emoji: "🟢", tipo: "Fútbol 8",  color: "#16a34a", colorBg: "#071a08" },
  { id: "infantil", label: "Infantil", emoji: "⚪", tipo: "Fútbol 11", color: "#e5e7eb", colorBg: "#111118" },
  { id: "juvenil",  label: "Juvenil",  emoji: "🔴", tipo: "Fútbol 11", color: "#dc2626", colorBg: "#2d0a0a" },
];

// 🏆 TÍTULO DEL TORNEO
const TITULO_TORNEO = "IV Torneo Femenino CD Lourdes";

// 🔐 CONTRASEÑA ADMIN (cámbiala por una segura)
const ADMIN_PASSWORD = "admin123";

const GRUPOS_LETRAS = ["A", "B", "C", "D"];

function generarEquipos() {
  const equipos = [];
  CATEGORIAS.forEach(cat => {
    GRUPOS_LETRAS.forEach(g => {
      for (let i = 1; i <= 4; i++) {
        equipos.push({
          id: `${cat.id}-${g}${i}`,
          nombre: `Equipo ${g}${i}`,
          categoria: cat.id,
          grupo: g,
          color: cat.color,
          jugadores: Array.from({ length: cat.id === "alevin" ? 8 : 11 }, (_, k) => ({
            nombre: `Jugador ${k + 1}`, numero: k + 1,
          })),
        });
      }
    });
  });
  return equipos;
}

function generarPartidos(equipos) {
  const partidos = [];
  let id = 1;
  CATEGORIAS.forEach(cat => {
    GRUPOS_LETRAS.forEach(g => {
      const eq = equipos.filter(e => e.categoria === cat.id && e.grupo === g);
      for (let i = 0; i < eq.length; i++) {
        for (let j = i + 1; j < eq.length; j++) {
          partidos.push({
            id: id++,
            categoria: cat.id,
            grupo: g,
            local: eq[i].id,
            visitante: eq[j].id,
            golesLocal: null,
            golesVisitante: null,
            fecha: `2026-06-${String(14 + Math.floor(id / 8)).padStart(2, "0")}`,
            hora: `${9 + ((id % 6) * 2)}:00`,
            campo: `Campo ${((id - 1) % 4) + 1}`,
          });
        }
      }
    });
  });
  return partidos;
}

const EQUIPOS_INIT = generarEquipos();
const PARTIDOS_INIT = generarPartidos(EQUIPOS_INIT);

// ─── HELPERS ─────────────────────────────────────────────────────
function calcTabla(equipos, partidos, categoria, grupo) {
  const eqs = equipos.filter(e => e.categoria === categoria && e.grupo === grupo);
  const tabla = eqs.map(e => ({ ...e, PJ:0, PG:0, PE:0, PP:0, GF:0, GC:0, DIF:0, PTS:0 }));
  partidos
    .filter(p => p.categoria === categoria && p.grupo === grupo && p.golesLocal !== null)
    .forEach(p => {
      const loc = tabla.find(e => e.id === p.local);
      const vis = tabla.find(e => e.id === p.visitante);
      if (!loc || !vis) return;
      loc.PJ++; vis.PJ++;
      loc.GF += p.golesLocal; loc.GC += p.golesVisitante;
      vis.GF += p.golesVisitante; vis.GC += p.golesLocal;
      if (p.golesLocal > p.golesVisitante) { loc.PG++; loc.PTS += 3; vis.PP++; }
      else if (p.golesLocal < p.golesVisitante) { vis.PG++; vis.PTS += 3; loc.PP++; }
      else { loc.PE++; vis.PE++; loc.PTS++; vis.PTS++; }
    });
  tabla.forEach(e => e.DIF = e.GF - e.GC);
  return tabla.sort((a, b) => b.PTS - a.PTS || b.DIF - a.DIF || b.GF - a.GF);
}

// ─── APP ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("fixture");
  const [catSel, setCatSel] = useState("alevin");
  const [equipos, setEquipos] = useState(EQUIPOS_INIT);
  const [partidos, setPartidos] = useState(PARTIDOS_INIT);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [editPartido, setEditPartido] = useState(null);
  const [editScore, setEditScore] = useState({ local: "", visitante: "" });
  const [nombreTorneo, setNombreTorneo] = useState(TITULO_TORNEO);
  const [equipoSel, setEquipoSel] = useState(null);
  const [adminView, setAdminView] = useState("resultados");
  const [grupoSel, setGrupoSel] = useState("A");

  const cat = CATEGORIAS.find(c => c.id === catSel);
  const nombreEq = id => equipos.find(e => e.id === id)?.nombre || id;

  function abrirEdit(p) {
    setEditPartido(p);
    setEditScore({ local: p.golesLocal ?? "", visitante: p.golesVisitante ?? "" });
  }

  function guardarResult() {
    const gl = parseInt(editScore.local);
    const gv = parseInt(editScore.visitante);
    if (isNaN(gl) || isNaN(gv) || gl < 0 || gv < 0) return;
    setPartidos(prev => prev.map(p =>
      p.id === editPartido.id ? { ...p, golesLocal: gl, golesVisitante: gv } : p
    ));
    setEditPartido(null);
  }

  function renombrar(id, nombre) {
    setEquipos(prev => prev.map(e => e.id === id ? { ...e, nombre } : e));
  }

  const NAV = [
    { id: "fixture", icon: "📅", label: "Partidos" },
    { id: "tabla",   icon: "📊", label: "Tablas" },
    { id: "bracket", icon: "🏆", label: "Bracket" },
    { id: "equipos", icon: "👥", label: "Equipos" },
    { id: "admin",   icon: "🔐", label: "Admin" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#f0f0f5",
      fontFamily:"'Nunito','Arial Rounded MT Bold',Arial,sans-serif",
      maxWidth:480, margin:"0 auto", paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input{font-family:inherit}
        .btn{border:none;cursor:pointer;border-radius:8px;padding:10px 18px;
          font-family:inherit;font-weight:700;font-size:14px;transition:all .15s}
        .btn:active{transform:scale(.97)}
        .card{background:#10101c;border:1px solid #1e1e32;border-radius:12px;padding:14px 16px;margin-bottom:10px}
        .field{background:#080810;border:1px solid #2a2a44;border-radius:8px;
          padding:10px 14px;color:#f0f0f5;font-size:16px;width:100%}
        .field:focus{outline:none;border-color:${cat.color}}
        .gtab{background:#10101c;border:1px solid #1e1e32;border-radius:8px;
          padding:7px 14px;font-size:13px;font-weight:700;cursor:pointer;color:#666;transition:all .15s}
        .gtab.on{color:#fff}
        .navbtn{background:none;border:none;cursor:pointer;padding:8px 4px;
          display:flex;flex-direction:column;align-items:center;gap:2px;transition:all .15s}
        .navbtn:active{transform:translateY(1px)}
      `}</style>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(160deg,${cat.colorBg} 0%,#080810 100%)`,
        padding:"16px 20px 14px", borderBottom:`2px solid ${cat.color}33` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
          <div style={{ width:58, height:62, borderRadius:10, overflow:"hidden",
            background:"#fff", border:`2px solid ${cat.color}55`,
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <img src="/escudo.png" alt="CD Lourdes"
              style={{ width:"100%", height:"100%", objectFit:"contain", padding:2 }} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9, letterSpacing:3, color:cat.color, fontWeight:800, marginBottom:3, textTransform:"uppercase" }}>
              Torneo Femenino
            </div>
            <div style={{ fontSize:18, fontWeight:900, lineHeight:1.1, color:"#fff" }}>
              {nombreTorneo}
            </div>
            <div style={{ fontSize:11, color:"#555", marginTop:3, fontWeight:600 }}>
              Junio 2026 · Pamplona
            </div>
          </div>
        </div>
        {/* Selector de categoría */}
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          {CATEGORIAS.map(c => (
            <button key={c.id} onClick={() => { setCatSel(c.id); setGrupoSel("A"); }}
              style={{ flex:1, background: catSel === c.id ? c.color : "#10101c",
                border:`1px solid ${catSel === c.id ? c.color : "#1e1e32"}`,
                color: catSel === c.id ? "#fff" : "#666",
                borderRadius:8, padding:"8px 4px", fontFamily:"inherit",
                fontWeight:700, fontSize:13, cursor:"pointer", transition:"all .15s",
                letterSpacing:.5 }}>
              {c.label}<br />
              <span style={{ fontSize:10, fontWeight:400, opacity:.8 }}>{c.tipo}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEWS */}
      <div style={{ padding:16 }}>
        {tab === "fixture" && <Fixture partidos={partidos} catSel={catSel} cat={cat}
          nombreEq={nombreEq} adminOk={adminOk} onEdit={abrirEdit} grupoSel={grupoSel} setGrupoSel={setGrupoSel} />}
        {tab === "tabla" && <Tablas equipos={equipos} partidos={partidos} catSel={catSel}
          cat={cat} grupoSel={grupoSel} setGrupoSel={setGrupoSel} />}
        {tab === "bracket" && <Bracket equipos={equipos} partidos={partidos} catSel={catSel} cat={cat} />}
        {tab === "equipos" && <Equipos equipos={equipos} partidos={partidos} catSel={catSel}
          cat={cat} equipoSel={equipoSel} setEquipoSel={setEquipoSel} nombreEq={nombreEq} />}
        {tab === "admin" && <Admin adminOk={adminOk} adminPass={adminPass} setAdminPass={setAdminPass}
          setAdminOk={setAdminOk} equipos={equipos} partidos={partidos} nombreEq={nombreEq}
          renombrar={renombrar} nombreTorneo={nombreTorneo} setNombreTorneo={setNombreTorneo}
          adminView={adminView} setAdminView={setAdminView} catSel={catSel} cat={cat}
          onEdit={p => { abrirEdit(p); setTab("fixture"); }} />}
      </div>

      {/* MODAL RESULTADO */}
      {editPartido && (
        <div style={{ position:"fixed", inset:0, background:"#000c", display:"flex",
          alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }}>
          <div style={{ background:"#10101c", border:`1px solid ${cat.color}`,
            borderRadius:16, padding:24, width:"100%", maxWidth:360 }}>
            <div style={{ fontSize:16, fontWeight:900, letterSpacing:1, marginBottom:6 }}>
              RESULTADO
            </div>
            <div style={{ fontSize:12, color:"#666", marginBottom:18 }}>
              {nombreEq(editPartido.local)} vs {nombreEq(editPartido.visitante)}
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"flex-end", marginBottom:20 }}>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#888", marginBottom:6, fontWeight:700 }}>
                  {nombreEq(editPartido.local)}
                </div>
                <input className="field" type="number" min="0" max="30" value={editScore.local}
                  onChange={e => setEditScore(s => ({ ...s, local: e.target.value }))}
                  style={{ textAlign:"center", fontSize:30, fontWeight:900, padding:10 }} />
              </div>
              <div style={{ fontSize:18, color:"#333", paddingBottom:14 }}>–</div>
              <div style={{ flex:1, textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#888", marginBottom:6, fontWeight:700 }}>
                  {nombreEq(editPartido.visitante)}
                </div>
                <input className="field" type="number" min="0" max="30" value={editScore.visitante}
                  onChange={e => setEditScore(s => ({ ...s, visitante: e.target.value }))}
                  style={{ textAlign:"center", fontSize:30, fontWeight:900, padding:10 }} />
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn" onClick={() => setEditPartido(null)}
                style={{ flex:1, background:"#1a1a2e", color:"#888" }}>Cancelar</button>
              <button className="btn" onClick={guardarResult}
                style={{ flex:1, background:cat.color, color:"#fff" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480, background:"#0a0a14",
        borderTop:"1px solid #1e1e32", display:"flex",
        justifyContent:"space-around", padding:"8px 0 14px", zIndex:100 }}>
        {NAV.map(n => (
          <button key={n.id} className="navbtn" onClick={() => setTab(n.id)}
            style={{ color: tab === n.id ? cat.color : "#444" }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase" }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FIXTURE ─────────────────────────────────────────────────────
function Fixture({ partidos, catSel, cat, nombreEq, adminOk, onEdit, grupoSel, setGrupoSel }) {
  const ps = partidos.filter(p => p.categoria === catSel && p.grupo === grupoSel);
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:2, marginBottom:14 }}>📅 FIXTURE</div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {GRUPOS_LETRAS.map(g => (
          <button key={g} className={`gtab ${grupoSel === g ? "on" : ""}`}
            onClick={() => setGrupoSel(g)}
            style={{ background: grupoSel === g ? cat.color : "#10101c",
              borderColor: grupoSel === g ? cat.color : "#1e1e32" }}>
            Grupo {g}
          </button>
        ))}
      </div>
      {ps.map(p => (
        <div key={p.id} className="card">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontSize:11, color:"#555" }}>
            <span style={{ color:cat.color, fontWeight:700 }}>📍 {p.campo}</span>
            <span>{p.fecha} · {p.hora}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ flex:1, textAlign:"right", fontWeight:700, fontSize:14 }}>
              {nombreEq(p.local)}
            </div>
            {p.golesLocal !== null ? (
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                <div style={{ background:"#1a1a2e", border:"2px solid #2a2a45", borderRadius:8,
                  padding:"8px 14px", fontSize:22, fontWeight:900, minWidth:48, textAlign:"center" }}>
                  {p.golesLocal}
                </div>
                <span style={{ color:"#444", fontSize:12 }}>–</span>
                <div style={{ background:"#1a1a2e", border:"2px solid #2a2a45", borderRadius:8,
                  padding:"8px 14px", fontSize:22, fontWeight:900, minWidth:48, textAlign:"center" }}>
                  {p.golesVisitante}
                </div>
              </div>
            ) : (
              <div style={{ background:"#1a1a2e", borderRadius:8, padding:"8px 18px",
                fontSize:13, color:"#444", fontWeight:700 }}>VS</div>
            )}
            <div style={{ flex:1, fontWeight:700, fontSize:14 }}>{nombreEq(p.visitante)}</div>
          </div>
          {adminOk && (
            <button className="btn" onClick={() => onEdit(p)}
              style={{ width:"100%", marginTop:10, background:"#1a1a2e", color:cat.color, fontSize:12, padding:8 }}>
              ✏️ Editar resultado
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── TABLAS ──────────────────────────────────────────────────────
function Tablas({ equipos, partidos, catSel, cat, grupoSel, setGrupoSel }) {
  const tabla = calcTabla(equipos, partidos, catSel, grupoSel);
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:2, marginBottom:14 }}>📊 TABLAS</div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {GRUPOS_LETRAS.map(g => (
          <button key={g} className={`gtab ${grupoSel === g ? "on" : ""}`}
            onClick={() => setGrupoSel(g)}
            style={{ background: grupoSel === g ? cat.color : "#10101c",
              borderColor: grupoSel === g ? cat.color : "#1e1e32" }}>
            Grupo {g}
          </button>
        ))}
      </div>
      <div style={{ background:"#10101c", border:"1px solid #1e1e32", borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"22px 1fr 28px 28px 28px 28px 28px 34px",
          padding:"8px 12px", background:"#1a1a2e", fontSize:10, fontWeight:700, color:"#666", letterSpacing:1 }}>
          <span>#</span><span>EQUIPO</span>
          {["PJ","PG","PE","PP","DIF","PTS"].map(h => <span key={h} style={{ textAlign:"center" }}>{h}</span>)}
        </div>
        {tabla.map((e, i) => (
          <div key={e.id} style={{ display:"grid",
            gridTemplateColumns:"22px 1fr 28px 28px 28px 28px 28px 34px",
            padding:"11px 12px", borderBottom:"1px solid #14141e",
            background: i < 2 ? "#0a180a" : "transparent", alignItems:"center" }}>
            <div style={{ width:20, height:20, borderRadius:"50%", display:"flex",
              alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900,
              background: i === 0 ? "#ca8a04" : i === 1 ? "#475569" : "#1a1a2e",
              color: i < 2 ? "#000" : "#555" }}>
              {i + 1}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:cat.color, flexShrink:0 }} />
              <span style={{ fontSize:13, fontWeight:600 }}>{e.nombre}</span>
              {i < 2 && <span style={{ fontSize:9, background:"#0f2e0f", color:"#4ade80",
                padding:"2px 6px", borderRadius:20, fontWeight:700 }}>CLASIFICA</span>}
            </div>
            {[e.PJ, e.PG, e.PE, e.PP].map((v, k) => (
              <span key={k} style={{ textAlign:"center", fontSize:13, color:"#ccc" }}>{v}</span>
            ))}
            <span style={{ textAlign:"center", fontSize:12,
              color: e.DIF > 0 ? "#4ade80" : e.DIF < 0 ? "#f87171" : "#888" }}>
              {e.DIF > 0 ? `+${e.DIF}` : e.DIF}
            </span>
            <span style={{ textAlign:"center", fontSize:16, fontWeight:900, color:cat.color }}>{e.PTS}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BRACKET ─────────────────────────────────────────────────────
function Bracket({ equipos, partidos, catSel, cat }) {
  const clasificados = GRUPOS_LETRAS.flatMap(g => {
    const t = calcTabla(equipos, partidos, catSel, g);
    return t.slice(0, 2).map((e, i) => ({ ...e, posGrupo: i + 1 }));
  });
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:2, marginBottom:6 }}>🏆 BRACKET</div>
      <div style={{ fontSize:12, color:"#555", marginBottom:16 }}>
        Los 2 mejores de cada grupo clasifican · 8 equipos
      </div>
      {clasificados.length === 0 ? (
        <div style={{ textAlign:"center", padding:"50px 20px", color:"#333" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>⏳</div>
          <div style={{ fontSize:16, fontWeight:700 }}>Aún no hay clasificados</div>
          <div style={{ fontSize:13, marginTop:6, color:"#444" }}>Ingresa resultados de grupos primero</div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:cat.color, marginBottom:10, letterSpacing:2 }}>
            CLASIFICADOS ({clasificados.length}/8)
          </div>
          {GRUPOS_LETRAS.map(g => {
            const cls = clasificados.filter(e => e.grupo === g);
            return (
              <div key={g} className="card">
                <div style={{ fontSize:10, fontWeight:700, color:"#444", letterSpacing:2, marginBottom:8 }}>
                  GRUPO {g}
                </div>
                {cls.length === 0 ? (
                  <div style={{ fontSize:13, color:"#333" }}>Pendiente...</div>
                ) : cls.map((e, i) => (
                  <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10,
                    padding:"6px 0", borderBottom: i < cls.length-1 ? "1px solid #14141e" : "none" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900,
                      background: i === 0 ? "#ca8a04" : "#475569", color:"#000" }}>
                      {i + 1}°
                    </div>
                    <span style={{ fontSize:14, fontWeight:600 }}>{e.nombre}</span>
                    <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:cat.color }}>
                      {e.PTS}pts
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── EQUIPOS ─────────────────────────────────────────────────────
function Equipos({ equipos, partidos, catSel, cat, equipoSel, setEquipoSel, nombreEq }) {
  const [busq, setBusq] = useState("");
  if (equipoSel) {
    const eq = equipos.find(e => e.id === equipoSel);
    const ps = partidos.filter(p => p.local === eq.id || p.visitante === eq.id);
    let g=0, em=0, p=0, gf=0, gc=0;
    ps.filter(x => x.golesLocal !== null).forEach(x => {
      const esL = x.local === eq.id;
      const mios = esL ? x.golesLocal : x.golesVisitante;
      const suyos = esL ? x.golesVisitante : x.golesLocal;
      gf += mios; gc += suyos;
      if (mios > suyos) g++; else if (mios === suyos) em++; else p++;
    });
    return (
      <div>
        <button onClick={() => setEquipoSel(null)}
          style={{ background:"none", border:"none", color:cat.color, cursor:"pointer",
            fontSize:14, fontWeight:700, marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
          ← Volver
        </button>
        <div style={{ background:`linear-gradient(135deg,${cat.colorBg},#080810)`,
          border:`2px solid ${cat.color}44`, borderRadius:16,
          padding:24, marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:8 }}>⚽</div>
          <div style={{ fontSize:24, fontWeight:900, letterSpacing:2 }}>{eq.nombre}</div>
          <div style={{ fontSize:12, color:"#666", marginTop:4 }}>
            Grupo {eq.grupo} · {CATEGORIAS.find(c=>c.id===catSel)?.label}
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:16 }}>
          {[["PJ",g+em+p],["PG",g],["PE",em],["PP",p],["GF",gf],["GC",gc]].map(([l,v]) => (
            <div key={l} className="card" style={{ textAlign:"center", padding:12 }}>
              <div style={{ fontSize:22, fontWeight:900, color:cat.color }}>{v}</div>
              <div style={{ fontSize:10, color:"#555", fontWeight:700, letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:"#666", marginBottom:10, letterSpacing:1 }}>
          PLANTILLA · {eq.jugadores.length} jugadores
        </div>
        {eq.jugadores.map(j => (
          <div key={j.numero} style={{ display:"flex", alignItems:"center", gap:12,
            padding:"10px 0", borderBottom:"1px solid #12121c" }}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              background:`${cat.color}22`, border:`2px solid ${cat.color}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:900, fontSize:13, color:cat.color }}>
              {j.numero}
            </div>
            <span style={{ fontSize:15, fontWeight:600 }}>{j.nombre}</span>
          </div>
        ))}
      </div>
    );
  }
  const filtrados = equipos
    .filter(e => e.categoria === catSel)
    .filter(e => e.nombre.toLowerCase().includes(busq.toLowerCase()) || e.grupo.includes(busq.toUpperCase()));
  return (
    <div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:2, marginBottom:14 }}>👥 EQUIPOS</div>
      <input className="field" placeholder="🔍 Buscar equipo..." value={busq}
        onChange={e => setBusq(e.target.value)} style={{ marginBottom:14 }} />
      {filtrados.map(eq => (
        <div key={eq.id} className="card" onClick={() => setEquipoSel(eq.id)}
          style={{ cursor:"pointer", borderLeft:`4px solid ${cat.color}`, transition:"all .15s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:28 }}>⚽</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{eq.nombre}</div>
              <div style={{ fontSize:11, color:"#555", marginTop:2 }}>
                Grupo {eq.grupo} · {eq.jugadores.length} jugadores
              </div>
            </div>
            <span style={{ color:"#333", fontSize:20 }}>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN ───────────────────────────────────────────────────────
function Admin({ adminOk, adminPass, setAdminPass, setAdminOk, equipos, partidos,
  nombreEq, renombrar, nombreTorneo, setNombreTorneo, adminView, setAdminView,
  catSel, cat, onEdit }) {
  const [editId, setEditId] = useState(null);
  const [tempNombre, setTempNombre] = useState("");
  const [grupoAdmin, setGrupoAdmin] = useState("A");

  if (!adminOk) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", minHeight:"60vh", gap:20 }}>
      <div style={{ fontSize:48 }}>🔐</div>
      <div style={{ fontSize:22, fontWeight:900, letterSpacing:2 }}>PANEL ADMIN</div>
      <div style={{ fontSize:13, color:"#555", textAlign:"center" }}>
        Solo el administrador puede ingresar resultados
      </div>
      <input className="field" type="password" placeholder="Contraseña"
        value={adminPass} onChange={e => setAdminPass(e.target.value)}
        onKeyDown={e => e.key === "Enter" && adminPass === ADMIN_PASSWORD && setAdminOk(true)}
        style={{ maxWidth:280, textAlign:"center" }} />
      <button className="btn" onClick={() => adminPass === ADMIN_PASSWORD && setAdminOk(true)}
        style={{ background:cat.color, color:"#fff", maxWidth:280, width:"100%" }}>
        Ingresar
      </button>
      <div style={{ fontSize:11, color:"#333" }}>Contraseña: admin123</div>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:900, letterSpacing:2 }}>🔐 ADMIN</div>
        <button className="btn" onClick={() => setAdminOk(false)}
          style={{ background:"#1a1a2e", color:"#f87171", fontSize:12, padding:"6px 12px" }}>
          Salir
        </button>
      </div>

      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {[["resultados","⚽ Resultados"],["equipos","👥 Equipos"],["config","⚙️ Config"]].map(([v,l]) => (
          <button key={v} className={`gtab ${adminView === v ? "on" : ""}`}
            onClick={() => setAdminView(v)}
            style={{ background: adminView === v ? cat.color : "#10101c",
              borderColor: adminView === v ? cat.color : "#1e1e32", fontSize:12 }}>
            {l}
          </button>
        ))}
      </div>

      {adminView === "config" && (
        <div className="card">
          <div style={{ fontSize:11, fontWeight:700, color:"#666", marginBottom:10, letterSpacing:1 }}>
            NOMBRE DEL TORNEO
          </div>
          <input className="field" value={nombreTorneo}
            onChange={e => setNombreTorneo(e.target.value)} />
          <div style={{ fontSize:11, color:"#444", marginTop:8 }}>
            Cambia el nombre visible en el header de la app
          </div>
        </div>
      )}

      {adminView === "equipos" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {GRUPOS_LETRAS.map(g => (
              <button key={g} className={`gtab ${grupoAdmin === g ? "on" : ""}`}
                onClick={() => setGrupoAdmin(g)}
                style={{ background: grupoAdmin === g ? cat.color : "#10101c",
                  borderColor: grupoAdmin === g ? cat.color : "#1e1e32" }}>
                Grupo {g}
              </button>
            ))}
          </div>
          {equipos.filter(e => e.categoria === catSel && e.grupo === grupoAdmin).map(eq => (
            <div key={eq.id} className="card" style={{ borderLeft:`4px solid ${cat.color}` }}>
              {editId === eq.id ? (
                <div style={{ display:"flex", gap:8 }}>
                  <input className="field" value={tempNombre}
                    onChange={e => setTempNombre(e.target.value)}
                    style={{ flex:1, fontSize:14, padding:8 }} />
                  <button className="btn" onClick={() => { renombrar(eq.id, tempNombre); setEditId(null); }}
                    style={{ background:cat.color, color:"#fff", padding:"8px 12px" }}>✓</button>
                  <button className="btn" onClick={() => setEditId(null)}
                    style={{ background:"#1a1a2e", color:"#888", padding:"8px 12px" }}>✕</button>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{eq.nombre}</div>
                    <div style={{ fontSize:11, color:"#555" }}>Grupo {eq.grupo}</div>
                  </div>
                  <button className="btn" onClick={() => { setEditId(eq.id); setTempNombre(eq.nombre); }}
                    style={{ background:"#1a1a2e", color:cat.color, fontSize:12, padding:"6px 12px" }}>
                    ✏️ Editar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adminView === "resultados" && (
        <div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            {GRUPOS_LETRAS.map(g => (
              <button key={g} className={`gtab ${grupoAdmin === g ? "on" : ""}`}
                onClick={() => setGrupoAdmin(g)}
                style={{ background: grupoAdmin === g ? cat.color : "#10101c",
                  borderColor: grupoAdmin === g ? cat.color : "#1e1e32" }}>
                Grupo {g}
              </button>
            ))}
          </div>
          {partidos.filter(p => p.categoria === catSel && p.grupo === grupoAdmin).map(p => (
            <div key={p.id} className="card" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontSize:13, flex:1 }}>
                <span style={{ fontWeight:600 }}>{nombreEq(p.local)}</span>
                <span style={{ color:"#444", margin:"0 6px" }}>vs</span>
                <span style={{ fontWeight:600 }}>{nombreEq(p.visitante)}</span>
                <div style={{ fontSize:10, color:"#555", marginTop:3 }}>{p.campo} · {p.hora}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {p.golesLocal !== null ? (
                  <span style={{ fontWeight:900, color:"#4ade80", fontSize:14 }}>
                    {p.golesLocal}–{p.golesVisitante}
                  </span>
                ) : (
                  <span style={{ fontSize:11, color:"#555" }}>Pendiente</span>
                )}
                <button className="btn" onClick={() => onEdit(p)}
                  style={{ background:"#1a1a2e", color:cat.color, fontSize:11, padding:"5px 10px" }}>
                  ✏️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
