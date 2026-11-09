# -*- coding: utf-8 -*-
"""Executa o script inline de index.html (monitor-soja) num DOM falso (Duktape)
e simula interações. Uso: python C:\\...\\page_harness.py [caminho index.html]
"""
import io, os, re, sys, dukpy

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
base = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, "index.html")
src = io.open(base, encoding="utf-8").read()
inline = re.search(r"/\*<inline>\*/\n(.*?)\n/\*</inline>\*/", src, re.S).group(1)
payload = io.open(base.replace("index.html", "data.js"), encoding="utf-8").read()

STUB = r'''
function El(id, tag) {
  this.id = id || ""; this._tag = tag || "";
  this.style = {}; this.hidden = false; this.value = ""; this.checked = false;
  this.className = ""; this.children = []; this.options = []; this._handlers = {};
  var cl = {};
  this.classList = {
    add: function (c) { cl[c] = 1; },
    remove: function (c) { delete cl[c]; },
    toggle: function (c, f) { if (f === undefined) { if (cl[c]) delete cl[c]; else cl[c] = 1; } else if (f) cl[c] = 1; else delete cl[c]; },
    contains: function (c) { return !!cl[c]; }
  };
  var self = this;
  Object.defineProperty(this, "innerHTML", {
    get: function () { return self._html || ""; },
    set: function (v) {
      self._html = v;
      if (v === "" || v === null) { self.children = []; self.options = []; }
    }
  });
  this.textContent = "";
}
El.prototype.setAttribute = function (k, v) { this["_" + k] = v; if (k === "id") this.id = v; if (k === "class") this.className = v; };
El.prototype.getAttribute = function (k) { return this["_" + k]; };
El.prototype.appendChild = function (c) { this.children.push(c); this.options.push(c); return c; };
El.prototype.addEventListener = function (t, f) { (this._handlers[t] = this._handlers[t] || []).push(f); };
El.prototype._fire = function (t, ev) {
  (this._handlers[t] || []).forEach(function (f) { f(ev || {}); });
};
El.prototype.querySelectorAll = function (sel) {
  var tag = sel.replace(/[.\[#].*$/, "");
  var out = [];
  function walk(n) {
    (n.children || []).forEach(function (c) {
      if (c._tag && c._tag === tag) out.push(c);
      walk(c);
    });
  }
  walk(this);
  return out;
};
El.prototype.querySelector = function (sel) { var r = this.querySelectorAll(sel); return r.length ? r[0] : null; };
var location = { hash: "" };
var REG = {};
function getEl(id) { if (!REG[id]) REG[id] = new El(id); return REG[id]; }
getEl("mapa-metrica").value = "virou";
getEl("matriz-metrica").value = "virou";
getEl("escopo").value = "-1";
var document = {
  getElementById: function (id) { return getEl(id); },
  createElement: function (t) { return new El("", t); },
  createElementNS: function (ns, t) { return new El("", t); },
  addEventListener: function () {}
};
var Intl = { NumberFormat: function (loc, opt) { this.format = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }; } };
String.prototype.padStart = function (n, s) { s = s || " "; var t = this; while (t.length < n) t = s + t; return String(t); };
var LOG = [];
function log(a, b, c, d) { LOG.push([a, b, c, d].filter(function (x) { return x !== undefined; }).join(" | ")); }
function step(n, f) { try { f(); log("ok:", n); } catch (err) { log("ERRO:", n, "=>", String(err && err.message || err)); } }
'''

HARNESS = r'''
var osel = document.getElementById("ano-origem");
var dsel = document.getElementById("ano-destino");
var mm = document.getElementById("mapa-metrica");
var mc = document.getElementById("mode-cmp");
var mu = document.getElementById("mode-um");
var paths = REG["brazil-map"].children[0].querySelectorAll("path");
var mt = null; paths.forEach(function (p) { if (p.id === "mp-mt") mt = p; });

step("boot: contagem de paths do mapa", function () { log("paths:", String(paths.length)); });
step("destinos p/ origem 1985", function () { osel.value = "1985"; osel._fire("change", {}); log("n destinos:", String(dsel.children.length), "valor:", dsel.value); });
step("metrica saldo", function () { mm.value = "saldo"; mm._fire("change", {}); log("MT fill:", mt.getAttribute("fill")); });
step("clique no mapa (MT)", function () { mt._fire("click", { target: { closest: function () { return mt; } } }); log("escopo:", REG["escopo"].value); });
step("tooltip mapa (simulado)", function () {
  var plot = document.getElementById("map-plot");
  plot._fire("mousemove", { clientX: 100, clientY: 100, target: mt });
  log("tip visivel:", String(REG["mapa-tip"].innerHTML.length > 0));
});
step("clique correto no SVG (com closest)", function () {
  var svg = REG["brazil-map"].children[0];
  svg._fire("click", { target: { closest: function (s) { return s === "path" ? mt : null; } } });
  log("escopo apos clique:", REG["escopo"].value);
  log("modo:", REG["mode-um"]._cl && Object.keys(REG["mode-um"]._handlers) ? "ver botao classe" : "");
});
step("minis de evolucao (HTML string)", function () {
  log("evo-multi html len:", String(REG["evo-multi"]._html ? REG["evo-multi"].innerHTML.length : "0"), "| mini-evo presentes:", String(REG["evo-multi"].innerHTML.split("mini-evo").length - 2));
});
step("voltar p/ modo um", function () { mu._fire("click", {}); log("escopo mantido:", REG["escopo"].value); });
step("origem 2018 de volta", function () { osel.value = "2018"; osel._fire("change", {}); });
step("matriz renderizada", function () {
  log("células (html len):", String(REG["matriz-grid"].innerHTML.length > 100000 ? ">100k" : String(REG["matriz-grid"].innerHTML.length)),
      "| grad:", String(REG["matriz-grad"].style.background || "").slice(0, 40),
      "| escopo:", REG["matriz-escopo"].textContent.slice(0, 40));
});
step("troca UF no seletor (ficha+matriz)", function () {
  var s = document.getElementById("uf-select");
  s.value = "10"; s._fire("change", {});
  log("matriz escopo:", REG["matriz-escopo"].textContent.slice(0, 40));
  s.value = "-1"; s._fire("change", {});
});
step("badge/scales", function () {
  log("badge:", REG["badge-valor"].textContent, "|", REG["badge-rotulo"].textContent);
  log("rank-scale:", String(REG["rank-scale"].textContent).slice(0, 60));
  log("evo-scale:", String(REG["evo-scale"].textContent).slice(0, 40));
  log("readout default:", String(REG["evo-readout"].innerHTML).slice(0, 60));
});
step("hover na evolucao", function () {
  var col = REG["evo-cols"].children[5];
  REG["evo-single"]._fire("mousemove", { target: col });
  log("readout hover:", String(REG["evo-readout"].innerHTML).slice(0, 60));
});
step("escopo = Mato Grosso", function () {
  var esc = document.getElementById("escopo");
  esc.value = "10"; esc._fire("change", {});
  log("st-ufs-l:", REG["st-ufs-l"].textContent);
  log("ficha tem sankey:", String(REG["state-panel"]._html.indexOf("De onde veio a soja nova") >= 0));
  log("ranking destaca MT:", String(REG["rank-list"].innerHTML.indexOf("rank-row hl") >= 0));
  log("evo título:", REG["evo-titulo"].textContent.slice(0, 40));
  log("matriz escopo:", REG["matriz-escopo"].textContent.slice(0, 40));
});
step("escopo de volta ao Brasil", function () {
  var esc = document.getElementById("escopo");
  esc.value = "-1"; esc._fire("change", {});
  log("st-ufs-l:", REG["st-ufs-l"].textContent, "| st-ufs:", REG["st-ufs"].textContent);
});


step("textos dinâmicos + card do estado (escopo MT)", function () {
  var esc = document.getElementById("escopo");
  esc.value = "10"; esc._fire("change", {});
  log("vg-eyebrow:", REG["vg-eyebrow"].textContent);
  log("vg-title:", REG["vg-title"].textContent);
  log("ef-eyebrow:", REG["ef-eyebrow"].textContent);
  log("card visível:", String(!REG["estado-card"].hidden));
  log("loc paths:", String(REG["estado-loc"].children.length ? REG["estado-loc"].children[0].children.length : 0));
  log("zoom viewBox:", String(REG["estado-shape"].children.length ? REG["estado-shape"].children[0].children[0].__viewBox : "n/a"));
});
step("Brasil: card esconde", function () {
  var esc = document.getElementById("escopo");
  esc.value = "-1"; esc._fire("change", {});
  log("card hidden:", String(REG["estado-card"].hidden), "| vg-title:", REG["vg-title"].textContent);
});
step("visibilidade: escopo estado esconde ranking/mapa", function () {
  var esc = document.getElementById("escopo");
  esc.value = "10"; esc._fire("change", {});
  log("ranking display:", REG["ranking"].style.display, "| mapa display:", REG["mapa"].style.display,
      "| nl-ranking hidden:", String(REG["nl-ranking"].hidden));
  log("ficha sankey:", String(REG["state-panel"]._html.indexOf("De onde veio a soja nova") >= 0));
});
step("visibilidade: escopo Brasil mostra tudo", function () {
  var esc = document.getElementById("escopo");
  esc.value = "-1"; esc._fire("change", {});
  log("ranking display:", REG["ranking"].style.display, "| mapa display:", REG["mapa"].style.display);
});
LOG.push("__OK__");
LOG.join("\n");
'''

try:
    res = dukpy.evaljs(STUB + "\n" + payload + "\n" + inline + "\n" + HARNESS)
    print(res)
except Exception as e:
    print("ERRO NA EXECUÇÃO (interrompido antes do fim):")
    print(str(e)[:5000])
