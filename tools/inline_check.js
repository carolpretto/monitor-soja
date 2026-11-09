// Espelho do script inline de index.html (raiz) — regenerado por extração.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var fmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

  /* cores OFICIAIS da Coleção 11 do MapBiomas (legenda publicada em 13/08/2026) */
  var CORES = {
    3: "#1f8d49", 4: "#7dc975", 5: "#04381d", 6: "#007785", 7: "#228c70", 9: "#7a5900",
    11: "#517979", 12: "#d6bc74", 15: "#edde8e", 20: "#db7093", 21: "#ffefc3",
    23: "#ffa07a", 24: "#49271e", 25: "#db4d4f", 29: "#ad5100", 30: "#9c0027",
    31: "#091077", 32: "#fc8114", 33: "#2532e4", 35: "#9065d0", 40: "#c71585",
    41: "#f54ca9", 46: "#d68fe2", 47: "#9932cc", 48: "#e6ccff", 49: "#02d659",
    50: "#ffaa5f", 62: "#ff69b4", 75: "#757272", 84: "#81dbbf", 91: "#403d3e",
    39: "#f5b3c8"
  };
  var PALETA = ["#2e7d5b", "#d9c87c", "#9aa5a0", "#dcc06a", "#6f8fb5", "#a8c48a", "#c06058", "#e2b93b", "#5fb37a", "#b58fb5"];
  function corCls(id) {
    if (CORES[id] != null) return CORES[id];
    var s = String(CLS[id] || "");
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return PALETA[h % PALETA.length];
  }
  /* interpolação hex para rampas do mapa */
  function hex2rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mix(a, b, t) {
    var c1 = hex2rgb(a), c2 = hex2rgb(b);
    return "rgb(" + Math.round(c1[0] + (c2[0] - c1[0]) * t) + "," + Math.round(c1[1] + (c2[1] - c1[1]) * t) + "," + Math.round(c1[2] + (c2[2] - c1[2]) * t) + ")";
  }
  function mixHex(a, b, t) {
    var c1 = hex2rgb(a), c2 = hex2rgb(b);
    function hx(x) { var s = Math.round(Math.max(0, Math.min(255, x))).toString(16); return s.length < 2 ? "0" + s : s; }
    return "#" + hx(c1[0] + (c2[0] - c1[0]) * t) + hx(c1[1] + (c2[1] - c1[1]) * t) + hx(c1[2] + (c2[2] - c1[2]) * t);
  }
  var RAMPA = { virou: ["#edf1e6", "#184b39"], deixou: ["#f2e9db", "#8a4a12"], perm: ["#edf1eb", "#414f47"], sojad: ["#e8efeb", "#0e6a56"] };
  var SALDO_POS = "#2e7d5b", SALDO_NEG = "#b06010", SALDO_MEIO = "#eff1ea", SALDO_NEG_CLARO = "#f2ece2";

  function ha(v) { return fmt.format(Math.round(v || 0)) + " ha"; }
  function resumo(v) {
    v = v || 0;
    var neg = v < 0; v = Math.abs(v);
    var s;
    if (v >= 1e6) s = (v / 1e6).toFixed(2).replace(".", ",") + " M ha";
    else if (v >= 1e4) s = fmt.format(Math.round(v / 1e3)) + " mil ha";
    else if (v >= 1e3) s = (v / 1e3).toFixed(1).replace(".", ",") + " mil ha";
    else s = fmt.format(Math.round(v)) + " ha";
    return neg ? "−" + s : s;
  }
  function pct(v, t) { return t > 0 ? (100 * v / t).toFixed(1).replace(".", ",") + "%" : "0%"; }
  function corSaldo(v, maxAbs) {
    if (!maxAbs) return SALDO_MEIO;
    var t = Math.abs(v) <= 0 ? 0 : Math.log1p(Math.abs(v)) / Math.log1p(maxAbs);
    return v >= 0 ? mix(SALDO_MEIO, SALDO_POS, t) : mix(SALDO_NEG_CLARO, SALDO_NEG, t);
  }

  /* ---- dados ---- */
  var ANOS = DADOS.anos;
  var UFS = DADOS.ufs;
  var CLS = {};
  DADOS.classes.forEach(function (p) { CLS[p[0]] = p[1]; });

  var IDX = DADOS.t.map(function (grupos) {
    var m = {};
    grupos.forEach(function (g) {
      var k = g[0] + "-" + g[1];
      var rec = m[k] || (m[k] = { v: 0, d: 0, p: 0, dv: null, dd: null });
      var s = 0;
      g[3].forEach(function (c) { s += c[1]; });
      if (g[2] === 0) { rec.v = s; rec.dv = g[3]; }
      else if (g[2] === 1) { rec.d = s; rec.dd = g[3]; }
      else { rec.p = s; }
    });
    return m;
  });
  var SEM_DADOS = [];
  UFS.forEach(function (u, i) {
    var tem = false;
    for (var k in IDX[i]) { tem = true; break; }
    if (!tem) SEM_DADOS.push(u[1]);
  });

  function ufPair(i, o, dd) { return IDX[i][o + "-" + dd] || { v: 0, d: 0, p: 0, dv: null, dd: null }; }


  function agrega(o, dd) {
    var k = o + "-" + dd;
    var r = { v: 0, d: 0, p: 0, dv: {}, dd: {}, n: 0 };
    IDX.forEach(function (m) {
      var rec = m[k];
      if (!rec) return;
      r.v += rec.v; r.d += rec.d; r.p += rec.p;
      if (rec.v || rec.d || rec.p) r.n++;
      if (rec.dv) rec.dv.forEach(function (c) { r.dv[c[0]] = (r.dv[c[0]] || 0) + c[1]; });
      if (rec.dd) rec.dd.forEach(function (c) { r.dd[c[0]] = (r.dd[c[0]] || 0) + c[1]; });
    });
    return r;
  }

  function classesDe(src) {
    var arr = Array.isArray(src)
      ? src.map(function (c) { return { id: c[0], area: c[1] }; })
      : Object.keys(src).map(function (k) { return { id: +k, area: src[k] }; });
    return arr.sort(function (a, b) { return b.area - a.area; });
  }

  /* siglas (minúsculas, como os ids do SVG do mapa) */
  var CODE2SIGLA = {
    Acre: "ac", Alagoas: "al", Amapa: "ap", Amazonas: "am", Bahia: "ba", Ceara: "ce",
    Distrito_Federal: "df", Espirito_Santo: "es", Goias: "go", Maranhao: "ma",
    Mato_Grosso: "mt", Mato_Grosso_Do_Sul: "ms", Minas_Gerais: "mg", Para: "pa",
    Paraiba: "pb", Parana: "pr", Pernambuco: "pe", Piaui: "pi", Rio_De_Janeiro: "rj",
    Rio_Grande_Do_Norte: "rn", Rio_Grande_Do_Sul: "rs", Rondonia: "ro", Roraima: "rr",
    Santa_Catarina: "sc", Sao_Paulo: "sp", Sergipe: "se", Tocantins: "to"
  };
  var SIGLA2IDX = {};
  UFS.forEach(function (u, i) { SIGLA2IDX[CODE2SIGLA[u[0]]] = i; });

  /* ---- console ---- */
  var selO = $("ano-origem"), selD = $("ano-destino"), selUF = $("escopo");
  var O0 = 2018, D0 = 2024;

  ANOS.slice(0, -1).forEach(function (a) {
    var o = document.createElement("option");
    o.value = a; o.textContent = a;
    selO.appendChild(o);
  });
  function opcoesDestino() {
    var o = +selO.value;
    selD.innerHTML = "";
    ANOS.forEach(function (a) {
      if (a <= o) return;
      var op = document.createElement("option");
      op.value = a; op.textContent = a;
      selD.appendChild(op);
    });
    if (+selD.value > o || !selD.options.length) selD.value = ANOS[ANOS.length - 1];
  }
  opcoesDestino();
  selO.value = String(O0); selD.value = String(D0);

  /* janela/escopo via URL (compartilhável): #2018-2024-mt */
  function aplicarHash() {
    var h = (location.hash || "").replace("#", "");
    if (!h) return;
    var p = h.split("-");
    if (p.length >= 2 && +p[0] >= ANOS[0] && +p[0] <= ANOS[ANOS.length - 2]) {
      selO.value = p[0];
      opcoesDestino();
      if (+p[1] > +p[0] && +p[1] <= ANOS[ANOS.length - 1]) selD.value = p[1];
    }
    if (p[2]) {
      var i = SIGLA2IDX[p[2].toLowerCase()];
      if (i != null) selUF.value = String(i);
    }
  }
  /* a chamada fica após as opções do escopo existirem */

  var brOpt = document.createElement("option");
  brOpt.value = "-1";
  brOpt.textContent = "Brasil (todas as UFs)";
  selUF.appendChild(brOpt);
  UFS.forEach(function (u, i) {
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = u[1];
    selUF.appendChild(o);
  });
  aplicarHash();

  /* ---- estado da seleção de estado(s) ---- */
  var MODO = "um";       // "um" | "comparar"
  var MAX_CMP = 5;
  var SELS = [];         // índices de UF em modo comparar (ordem de marcação)

  function setModo(m) {
    MODO = m;
    $("mode-um").className = m === "um" ? "on" : "";
    $("mode-cmp").className = m === "comparar" ? "on" : "";
    var cmp = m === "comparar";
    $("cmp-count").hidden = !cmp;
    $("uf-chips").className = cmp ? "show" : "";
    $("state-panel").hidden = cmp;
    $("cmp-grid").hidden = !cmp;
    $("cmp-empty").hidden = !cmp || SELS.length > 0;
    $("evo-single").hidden = cmp || !serieTem();
    $("evo-multi").hidden = !cmp;
    if (cmp && !SELS.length) prefillCmp();
    renderFicha();
    renderEvo();
    renderMapa();
    renderMatriz();
  }
  function serieTem() {
    if (+selUF.value < 0) return true;
    var o = +selO.value;
    for (var dd = o + 1; dd <= ANOS[ANOS.length - 1]; dd++) {
      var r = ufPair(+selUF.value, o, dd);
      if (r.v || r.d || r.p) return true;
    }
    return false;
  }
  function prefillCmp() {
    var o = +selO.value, dd = +selD.value;
    var rank = UFS.map(function (u, i) { return { i: i, v: ufPair(i, o, dd).v }; })
      .sort(function (a, b) { return b.v - a.v; }).slice(0, 4).map(function (x) { return x.i; });
    var ui = +selUF.value;
    if (ui >= 0) { rank = [ui].concat(rank.filter(function (x) { return x !== ui; })).slice(0, 4); }
    rank.forEach(function (i) { $("chip-" + i).checked = true; });
    SELS = rank.slice();
    syncChipsUI();
  }
  function syncChipsUI() {
    SELS.forEach(function (i) { $("chip-" + i).classList.add("on"); });
    UFS.forEach(function (u, i) {
      var el = $("chip-" + i);
      if (el) el.classList.toggle("on", el.checked);
    });
    $("cmp-count").textContent = SELS.length + " de " + MAX_CMP + " selecionados";
    var lotado = SELS.length >= MAX_CMP;
    UFS.forEach(function (u, i) {
      var el = $("chip-" + i);
      if (el) el.classList.toggle("max", lotado && !el.checked);
    });
    $("cmp-empty").hidden = SELS.length > 0;
  }

  /* chips */
  UFS.forEach(function (u, i) {
    var lb = document.createElement("label");
    lb.className = "chip";
    lb.id = "chipbox-" + i;
    var inp = document.createElement("input");
    inp.type = "checkbox";
    inp.id = "chip-" + i;
    inp.addEventListener("change", function () {
      if (inp.checked) {
        if (SELS.length >= MAX_CMP) { inp.checked = false; return; }
        SELS.push(i);
      } else {
        SELS = SELS.filter(function (x) { return x !== i; });
      }
      syncChipsUI();
      renderFicha();
      renderEvo();
      renderMapa();
    });
    var txt = document.createElement("span");
    txt.textContent = u[1];
    lb.appendChild(inp);
    lb.appendChild(txt);
    $("uf-chips").appendChild(lb);
  });
  $("mode-um").addEventListener("click", function () { setModo("um"); });
  $("mode-cmp").addEventListener("click", function () { setModo("comparar"); });

  /* ---- renders ---- */
  function renderResumo() {
    var o = +selO.value, dd = +selD.value;
    var ui = +selUF.value;
    var br = agrega(o, dd);
    var r;
    if (ui < 0) {
      r = br;
    } else {
      var rec = ufPair(ui, o, dd);
      r = { v: rec.v || 0, d: rec.d || 0, p: rec.p || 0, dv: rec.dv || [], dd: rec.dd || [], n: 1 };
    }
    $("badge-valor").textContent = resumo(r.v);
    $("badge-rotulo").textContent = "viraram soja · " + o + " → " + dd;
    $("janela-txt").textContent = o + " → " + dd;
    $("st-soja-dd").textContent = resumo(r.v + r.p);
    $("st-virou").textContent = resumo(r.v);
    $("st-deixou").textContent = resumo(r.d);
    $("st-perm").textContent = resumo(r.p);
    $("st-saldo").textContent = resumo(r.v - r.d);
    $("st-ufs").textContent = ui < 0 ? (r.n + " de 27") : pct(r.v + r.p, br.v + br.p);
    $("st-ufs-l").textContent = ui < 0 ? "UFs com soja na janela" : "Soja do escopo ÷ soja do Brasil";
    $("rank-desc").textContent = "Barra única empilhada por UF — virou (verde), deixou de ser (âmbar) e permaneceu (cinza) entre " + o + " e " + dd + ", em hectares, numa única escala para preservar as proporções reais." + (ui >= 0 ? " O estado do escopo aparece destacado." : "");
    $("vg-eyebrow").textContent = ui < 0 ? "Panorama nacional" : "Panorama: " + UFS[ui][1];
    $("vg-title").textContent = ui < 0 ? "O balanço da janela, em números" : "O balanço de " + UFS[ui][1] + " na janela";
    $("vg-desc").textContent = ui < 0
      ? "Totais do Brasil para a trajetória selecionada no console, agregados sobre as 27 unidades federativas. Valores em hectares, medidos sobre malhas de 10 m."
      : "Totais de " + UFS[ui][1] + " na trajetória do console (em hectares, malhas de 10 m). O card “UFs com soja” mostra a fatia do estado sobre a soja do Brasil nesta mesma janela; escolha o escopo Brasil para voltar aos comparativos nacionais.";
    $("comp-v-hint").textContent = "Composição das áreas que viraram soja (" + resumo(r.v) + ") pelas classes de uso no ano de início (" + o + ").";
    $("comp-d-hint").textContent = "Composição das áreas que deixaram de ser soja (" + resumo(r.d) + ") pelas classes de uso no ano de fim (" + dd + ").";
    return r;
  }

  function renderRanking(r) {
    var o = +selO.value, dd = +selD.value;
    var ui = +selUF.value;
    var lista = UFS.map(function (u, i) {
      var rec = ufPair(i, o, dd);
      return { i: i, label: u[1], v: rec.v || 0, d: rec.d || 0, p: rec.p || 0 };
    });
    lista.forEach(function (e) { e.t = e.v + e.d + e.p; });
    lista.sort(function (a, b) { return (b.v - a.v) || (b.d - a.d); });
    var comArea = lista.filter(function (e) { return e.t > 0; });
    var maxT = lista.reduce(function (a, e) { return Math.max(a, e.t); }, 0) || 1;
    if (!comArea.length) {
      $("rank-list").innerHTML = "";
      $("rank-empty").hidden = false;
      $("rank-empty").textContent = "Nenhuma área da classe Soja registrada nesta janela — a classe não estava presente nos anos selecionados.";
      $("rank-scale").textContent = "";
      return;
    }
    $("rank-empty").hidden = true;
    $("rank-scale").textContent = "Uma barra empilhada por UF, numa única escala (maior UF da janela: " + resumo(maxT) + "): o que virou (verde), o que deixou de ser (âmbar) e o que permaneceu (cinza) têm entre si e entre estados a proporção real. Valores dentro da barra quando cabem; no direito, “mant.” = soja no ano final (virou + permaneceu) e o saldo líquido.";
    var html = "", ordem = 0;
    comArea.forEach(function (e) {
      ordem++;
      var largura = 100 * e.t / maxT;
      function seg(cls, area) {
        if (area <= 0) return "";
        var frac = area / e.t;
        var rot = frac >= 0.14 ? '<span class="seg-rot num">' + resumo(area) + '</span>' : "";
        return '<span class="seg ' + cls + '" style="flex:' + area + '" data-lbl="' + resumo(area) + ' · ' + pct(area, e.t)
          + '" title="' + resumo(area) + ' (' + pct(area, e.t) + ')">' + rot + '</span>';
      }
      html += '<div class="rank-row' + (MODO === "um" && e.i === ui ? ' hl' : '') + '"><div class="rank-head">'
        + '<span class="pos num">' + String(ordem).padStart(2, "0") + '</span>'
        + '<span class="uf">' + e.label + '</span>'
        + '<span class="val num">' + resumo(e.v + e.p) + ' mant. · saldo ' + resumo(e.v - e.d) + '</span></div>'
        + '<div class="bar-track"><div class="bar-stack" style="width:' + largura.toFixed(1) + '%">'
        + seg("seg-sd", e.d) + seg("seg-se", e.v) + seg("seg-sp", e.p)
        + '</div></div></div>';
    });
    $("rank-list").innerHTML = html;
  }

  function renderEstrutura(r) {
    var t = r.v + r.d + r.p;
    $("estrutura-hint").textContent = "Proporção de cada movimento sobre o total de área envolvida (" + resumo(t) + ") na trajetória " + +selO.value + " → " + +selD.value + ".";
    $("estrutura-bar").innerHTML = t > 0
      ? '<span class="seg seg-se" style="flex:' + r.v + '" title="' + pct(r.v, t) + '"></span>'
        + '<span class="seg seg-sd" style="flex:' + r.d + '" title="' + pct(r.d, t) + '"></span>'
        + '<span class="seg seg-sp" style="flex:' + r.p + '" title="' + pct(r.p, t) + '"></span>'
      : '<span class="seg" style="flex:1"></span>';
    $("estrutura-legend").innerHTML = [
      { sw: "var(--forest)", nm: "Virou soja", v: r.v },
      { sw: "var(--atencao)", nm: "Deixou de ser soja", v: r.d },
      { sw: "var(--perm)", nm: "Permaneceu soja", v: r.p }
    ].map(function (c) {
      return '<div class="comp-item"><span class="sw" style="background:' + c.sw + '"></span>'
        + '<span class="nm">' + c.nm + '</span><span class="pv num">' + pct(c.v, t) + ' · ' + resumo(c.v) + '</span></div>';
    }).join("");
  }

  function renderComp(total, src, barId, legId) {
    var comps = classesDe(src).filter(function (c) { return c.area > 0; });
    if (!comps.length) {
      $(barId).innerHTML = '<span class="seg" style="flex:1"></span>';
      $(legId).innerHTML = '<div class="comp-item"><span class="nm" style="color:var(--muted)">Sem área registrada nesta janela.</span></div>';
      return;
    }
    var top = comps.slice(0, 8), resto = comps.slice(8);
    var segs = top.concat([{ id: null, area: resto.reduce(function (a, c) { return a + c.area; }, 0) }]).filter(function (c) { return c.area > 0; });
    $(barId).innerHTML = segs.map(function (c) {
      var cor = c.id === null ? "#c3cdc6" : (CORES[c.id] || corCls(c.id));
      return '<span class="seg" style="flex:' + Math.max(c.area, 0.01) + ';background:' + cor + '" title="' + (c.id === null ? "Outras classes" : CLS[c.id]) + '"></span>';
    }).join("");
    $(legId).innerHTML = segs.map(function (c) {
      var cor = c.id === null ? "#c3cdc6" : (CORES[c.id] || corCls(c.id));
      return '<div class="comp-item"><span class="sw" style="background:' + cor + '"></span>'
        + '<span class="nm">' + (c.id === null ? "Outras classes" : CLS[c.id]) + '</span>'
        + '<span class="pv num">' + pct(c.area, total) + ' · ' + resumo(c.area) + '</span></div>';
    }).join("");
  }

  /* ---- mapa ---- */
  var svgNS = "http://www.w3.org/2000/svg";
  var SVG = null;
  if (DADOS.mapa) {
    SVG = document.createElementNS(svgNS, "svg");
    SVG.setAttribute("viewBox", DADOS.mapa.viewBox);
    DADOS.mapa.locs.forEach(function (l) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", l[1]);
      p.setAttribute("id", "mp-" + l[0]);
      SVG.appendChild(p);
    });
    $("brazil-map").appendChild(SVG);
  }
  var tip = $("mapa-tip");

  function gK(metrica) { return metrica.charAt(1); }
  function quantisTh(vals, K) {
    var pos = vals.filter(function (v) { return v > 0; }).sort(function (a, b) { return a - b; });
    var th = [];
    for (var i = 1; i < K; i++) th.push(pos.length ? pos[Math.floor(pos.length * i / K)] : 0);
    return th;
  }
  function binDe(v, th) { var b = 0; while (b < th.length && v > th[b]) b++; return b; }
  function siglaDe(id) { return id.slice(id.indexOf("-") + 1); }
  function valoresMapa(o, dd, metrica) {
    return UFS.map(function (u, i) {
      var r = ufPair(i, o, dd);
      if (metrica === "virou") return r.v;
      if (metrica === "deixou") return r.d;
      if (metrica === "perm") return r.p;
      if (metrica === "sojad") return r.v + r.p;
      if (metrica.charAt(0) === "g" && metrica.length === 2) {
        var s = 0, ids = GRUPOS[+metrica.charAt(1)].ids;
        (r.dv || []).forEach(function (c) { if (ids[c[0]]) s += c[1]; });
        return s;
      }
      return r.v - r.d;
    });
  }

  function renderMapa() {
    if (!SVG) return;
    var o = +selO.value, dd = +selD.value;
    var metrica = $("mapa-metrica").value;
    var vals = valoresMapa(o, dd, metrica);
    var max = vals.reduce(function (a, v) { return Math.max(a, Math.abs(v)); }, 0) || 0;
    var min = metrica === "saldo" ? Math.min.apply(null, vals) : 0;
    var maxPos = Math.max.apply(null, vals);
    var dmap = {
      virou: "área que virou soja", deixou: "área que deixou de ser soja",
      saldo: "área líquida (virou − deixou)", perm: "área que permaneceu soja",
      sojad: "área total de soja no ano final"
    };
    if (metrica.charAt(0) === "g") dmap[metrica] = "área vinda de " + GRUPOS[+gK(metrica)].tit;
    $("mapa-desc").textContent = "Cada UF pintada pela " + dmap[metrica] + " entre " + o + " e " + dd + ".";
    if (max <= 0) {
      SVG.querySelectorAll("path").forEach(function (p) { p.setAttribute("fill", "#edf1eb"); });
      $("mapa-grad").style.background = "#edf1eb";
      $("mapa-min").textContent = "0"; $("mapa-max").textContent = "sem dados";
      $("mapa-top").innerHTML = '<li><span class="uf" style="color:var(--muted)">Nenhum valor nesta janela.</span></li>';
    } else {
      SVG.querySelectorAll("path").forEach(function (p) {
        var i = SIGLA2IDX[p.id.slice(3)];
        var v = vals[i];
        var cor;
        if (metrica === "saldo") cor = corSaldo(v, max);
        else {
          var r = metrica.charAt(0) === "g" ? GRUPOS[+gK(metrica)].rampa : RAMPA[metrica];
          cor = mix(r[0], r[1], Math.max(v, 0) <= 0 ? 0 : Math.log1p(Math.max(v, 0)) / Math.log1p(max));
        }
        p.setAttribute("fill", cor);
      });
      var grad;
      if (metrica === "saldo") {
        grad = "linear-gradient(90deg," + SALDO_NEG + "," + SALDO_MEIO + " 50%," + SALDO_POS + ")";
        $("mapa-min").textContent = "−" + resumo(Math.abs(min)).replace("−", "");
        $("mapa-max").textContent = "+" + resumo(maxPos).replace("+", "");
      } else {
        var rg = metrica.charAt(0) === "g" ? GRUPOS[+gK(metrica)].rampa : RAMPA[metrica];
        grad = "linear-gradient(90deg," + rg[0] + "," + rg[1] + ")";
        $("mapa-min").textContent = "0";
        $("mapa-max").textContent = resumo(max);
      }
      $("mapa-grad").style.background = grad;
      var top = vals.map(function (v, i) { return { i: i, v: v }; })
        .sort(function (a, b) { return Math.abs(b.v) - Math.abs(a.v); }).slice(0, 5);
      $("mapa-top").innerHTML = top.map(function (x, k) {
        return '<li><span class="pos num">' + (k + 1) + '.</span><span class="uf">' + UFS[x.i][1] + '</span><span class="v num">' + resumo(x.v) + '</span></li>';
      }).join("");
    }
    marcaSelecao();
  }

  function marcaSelecao() {
    if (!SVG) return;
    SVG.querySelectorAll("path").forEach(function (p) {
      p.classList.remove("sel"); p.classList.remove("cmp");
    });
    if (MODO === "um" && +selUF.value >= 0) {
     var p = document.getElementById("mp-" + CODE2SIGLA[UFS[+selUF.value][0]]);
      if (p) p.classList.add("sel");
    } else if (MODO === "comparar") {
      SELS.forEach(function (i) {
        var p = document.getElementById("mp-" + CODE2SIGLA[UFS[i][0]]);
        if (p) p.classList.add("cmp");
      });
    }
  }

  if (SVG) {
    SVG.addEventListener("mousemove", function (e) {
      var path = e.target.closest ? e.target.closest("path") : null;
      if (!path) { tip.style.opacity = 0; return; }
      var i = SIGLA2IDX[path.id.slice(3)];
      if (i == null) { tip.style.opacity = 0; return; }
      var o = +selO.value, dd = +selD.value;
      var r = ufPair(i, o, dd);
      tip.innerHTML = '<div class="t-nome">' + UFS[i][1] + '</div>'
        + '<div class="t-metrica num">soja em ' + dd + ': ' + resumo(r.v + r.p) + '</div>'
        + '<div class="num">' + resumo(r.v) + ' virou · ' + resumo(r.d).replace("−", "") + ' deixou</div>'
        + '<div class="num">' + resumo(r.p) + ' permaneceu · saldo ' + resumo(r.v - r.d) + '</div>';
      var rect = $("map-plot").getBoundingClientRect();
      var x = Math.min(Math.max(e.clientX - rect.left, 90), rect.width - 90);
      tip.style.left = x + "px";
      tip.style.top = (e.clientY - rect.top) + "px";
      tip.style.opacity = 1;
    });
    SVG.addEventListener("mouseleave", function () { tip.style.opacity = 0; });
      SVG.addEventListener("click", function (e) {
      var path = e.target.closest ? e.target.closest("path") : null;
      if (!path) return;
      var i = SIGLA2IDX[path.id.slice(3)];
      if (i == null) return;
      selUF.value = String(i);
      setModo("um");
    });
  }
  $("mapa-metrica").addEventListener("change", renderMapa);

  /* ---- um mapa por grupo de origem da soja nova ---- */
  function idsSet(arr) {
    var s = {};
    arr.forEach(function (x) { s[x] = 1; });
    return s;
  }
  /* paleta dos 6 grupos definida pelo projeto: cor base = ponto máximo da rampa */
  var BASE6 = [
    { tit: "Soja em {o} e {d}", cor: "#E83E8C", ids: null },
    { tit: "Outras culturas → soja", cor: "#A000D8", ids: [9, 18, 19, 20, 35, 36, 40, 41, 46, 47, 48, 62] },
    { tit: "Pastagem → soja", cor: "#E99400", ids: [15] },
    { tit: "Mosaico de usos → soja", cor: "#FFD21A", ids: [21, 26] },
    { tit: "Vegetação nativa → soja", cor: "#238B57", ids: [1, 3, 4, 5, 6, 7, 10, 11, 12, 13, 29, 32, 49, 50, 77, 84] },
    { tit: "Demais classes → soja", cor: "#777777", ids: [23, 24, 25, 30, 31, 33, 75, 91] }
  ];
  var GRUPOS = BASE6.map(function (g) {
    return { tit: g.tit, cor: g.cor, ids: g.ids ? idsSet(g.ids) : null,
             rampa: [mixHex("#fafbf9", g.cor, 0.16), g.cor] };
  });
  var GSvg = {};
  function buildGroupSvgs() {
    if (!DADOS.mapa || $ ("grupos-grid").children.length) return;
    var html = "";
    GRUPOS.forEach(function (g, k) {
      html += '<div class="mini-map"><h4 id="gtitle-' + k + '"></h4>'
        + '<div class="mm-plot"><div class="bmap" id="gmap-' + k + '"></div>'
        + '<div class="map-tip num" id="gtip-' + k + '"></div></div>'
        + '<div class="scale"><span id="gscalemin-' + k + '">0</span><span class="grad" id="gscale-' + k + '"></span>'
        + '<span id="gscalemax-' + k + '">—</span></div>'
        + '<p class="hint num" id="gtot-' + k + '">—</p></div>';
    });
    $("grupos-grid").innerHTML = html;
    GRUPOS.forEach(function (g, k) {
      var svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", DADOS.mapa.viewBox);
      DADOS.mapa.locs.forEach(function (l) {
        var p = document.createElementNS(svgNS, "path");
        p.setAttribute("d", l[1]);
        p.setAttribute("id", "gm" + k + "-" + l[0]);
        svg.appendChild(p);
      });
      GSvg[k] = svg;
      $("gmap-" + k).appendChild(svg);
      svg.addEventListener("mousemove", function (e) {
        var path = e.target.closest ? e.target.closest("path") : null;
        var tip = $("gtip-" + k);
        if (!path) { tip.style.opacity = 0; return; }
        var i = SIGLA2IDX[siglaDe(path.id)];
        if (i == null) { tip.style.opacity = 0; return; }
        var o = +selO.value, dd = +selD.value;
        var r = ufPair(i, o, dd);
        var v = k === 0 ? r.p : somaGrupo(recGrupos(k, r));
        var rt = r.v + r.p;
        tip.innerHTML = '<div class="t-nome">' + UFS[i][1] + '</div>'
          + '<div class="t-metrica num">' + gTitle(k) + ': ' + resumo(v) + '</div>'
          + (rt > 0 ? '<div class="num">' + pct(v, rt) + ' da soja da UF nesta janela</div>' : "");
        var plot = $("gmap-" + k).getBoundingClientRect();
        var x = Math.min(Math.max(e.clientX - plot.left, 80), plot.width - 80);
        tip.style.left = x + "px";
        tip.style.top = (e.clientY - plot.top) + "px";
        tip.style.opacity = 1;
      });
      svg.addEventListener("mouseleave", function () { $("gtip-" + k).style.opacity = 0; });
      svg.addEventListener("click", function (e) {
        var path = e.target.closest ? e.target.closest("path") : null;
        if (!path) return;
        var i = SIGLA2IDX[siglaDe(path.id)];
        if (i == null) return;
        selUF.value = String(i);
        setModo("um");
      });
    });
  }
  function gTitle(k) {
    var g = GRUPOS[k];
    return g.ids === null ? "Soja em " + selO.value + " e " + selD.value : g.tit;
  }
  function recGrupos(k, r) { return (r.dv || []); }
  function somaGrupo(arr) { return arr.reduce(function (a, c) { return a + c[1]; }, 0); }

  function renderGrupos() {
    var o = +selO.value, dd = +selD.value;
    buildGroupSvgs();
    if (!DADOS.mapa) return;
    var tot = [], max = [], nativaVals = [];
    GRUPOS.forEach(function (g, k) {
      $("gtitle-" + k).textContent = k === 0
        ? "Soja em " + o + " e " + dd
        : g.tit + " · " + o + " → " + dd;
    });
    GRUPOS.forEach(function (g, k) {
      var vals = UFS.map(function (u, i) {
        var r = ufPair(i, o, dd);
        if (k === 0) return r.p;
        var s = 0;
        (r.dv || []).forEach(function (c) { if (g.ids[c[0]]) s += c[1]; });
        return s;
      });
      var mx = vals.reduce(function (a, v) { return Math.max(a, v); }, 0);
      tot[k] = vals.reduce(function (a, v) { return a + v; }, 0);
      max[k] = mx;
      if (k === 4) nativaVals = vals;
      GSvg[k].querySelectorAll("path").forEach(function (p) {
        var v = vals[SIGLA2IDX[siglaDe(p.id)]];
        p.setAttribute("fill", mx > 0 && v > 0
          ? mix(g.rampa[0], g.rampa[1], Math.pow(v / mx, 0.45))
          : "#f2f4ef");
      });
      var grad = "linear-gradient(90deg," + g.rampa[0] + "," + g.rampa[1] + ")";
      $("gscale-" + k).style.background = grad;
      $("gscalemax-" + k).textContent = resumo(mx);
      var topUF = "";
      var bi = 0;
      vals.forEach(function (v, i) { if (v > vals[bi]) bi = i; });
      if (mx > 0) topUF = " · maior: " + UFS[bi][1] + " (" + pct(vals[bi], tot[k]) + ")";
      $("gtot-" + k).textContent = "Brasil: " + resumo(tot[k]) + topUF;
    });
    /* resumo dos seis grupos */
    var base6 = tot[0] + tot[1] + tot[2] + tot[3] + tot[4] + tot[5];
    $("g-leg-hint").textContent = "Área de cada grupo sobre o total envolvido (" + resumo(base6) + ") na janela " + o + " → " + dd + ".";
    $("g-leg").innerHTML = GRUPOS.map(function (g, k) {
      return '<li><span class="sw" style="background:' + g.rampa[1] + '"></span>'
        + '<span class="nm">' + gTitle(k) + '</span>'
        + '<span class="pv num">' + resumo(tot[k]) + ' · ' + pct(tot[k], base6) + '</span></li>';
    }).join("");
    /* top nativa */
    var nt = nativaVals.map(function (v, i) { return { i: i, v: v }; })
      .sort(function (a, b) { return b.v - a.v; }).filter(function (x) { return x.v > 0; }).slice(0, 6);
    $("grupos-top-nativa").innerHTML = nt.length
      ? nt.map(function (x, k) {
        return '<li><span class="pos num">' + (k + 1) + '.</span><span class="uf">' + UFS[x.i][1]
          + '</span><span class="v num">' + resumo(x.v) + '</span></li>';
      }).join("")
      : '<li><span class="uf" style="color:var(--muted)">Nenhuma área desta origem na janela.</span></li>';
  }

  /* ---- matriz origem × destino ---- */
  function escopoMatriz() {
    if (MODO === "comparar") return -1;                 // Brasil
    return +selUF.value;                                 // inclui -1 = Brasil
  }
  function corMetrica(metrica, v, max) {
    if (metrica === "saldo") return corSaldo(v, max);
    var r = metrica.charAt(0) === "g" ? GRUPOS[+gK(metrica)].rampa : RAMPA[metrica];
    var t = Math.max(v, 0) <= 0 ? 0 : Math.log1p(Math.max(v, 0)) / Math.log1p(max);
    return mix(r[0], r[1], t);
  }
  function renderMatriz() {
    var o0 = ANOS[0], oMax = ANOS[ANOS.length - 2], dMax = ANOS[ANOS.length - 1];
    var metrica = $("matriz-metrica").value;
    var ui = escopoMatriz();
    var nome = ui < 0 ? "Brasil (todas as UFs)" : UFS[ui][1];
    $("matriz-escopo").textContent = "Escopo: " + nome
      + (MODO === "comparar" ? " · no modo comparar a matriz mostra o Brasil" : "")
      + ". 820 janelas de uma vez.";
    function val(o, d) {
      var m = ui < 0 ? agrega(o, d) : ufPair(ui, o, d);
      if (metrica === "virou") return m.v;
      if (metrica === "deixou") return m.d;
      if (metrica === "perm") return m.p;
      if (metrica === "sojad") return m.v + m.p;
      if (metrica.charAt(0) === "g" && metrica.length === 2) {
        var ids = GRUPOS[+gK(metrica)].ids;
        if (!m.dv) return 0;
        if (m.dv.forEach) {
          return m.dv.reduce(function (a, c) { return a + (ids[c[0]] ? c[1] : 0); }, 0);
        }
        return Object.keys(m.dv).reduce(function (a, k) { return a + (ids[+k] ? m.dv[k] : 0); }, 0);
      }
      return m.v - m.d;
    }
    var max = 0, minS = 0, maxPos = 0, presentes = [];
    var ANOS_S1 = ANOS.slice(0, -1), ANOS_D = ANOS.slice(1);
    ANOS_S1.forEach(function (o) {
      ANOS_D.forEach(function (d) {
        if (d <= o) return;
        var v = val(o, d);
        max = Math.max(max, Math.abs(v));
        minS = Math.min(minS, v); maxPos = Math.max(maxPos, v);
        presentes.push(v);
      });
    });
    // caixas por quantis: 5 faixas (ou 4+4 no saldo) calibradas pelos próprios dados
    var K = 5;
    var thUni = metrica === "saldo" ? null : quantisTh(presentes, K);
    var thP = metrica === "saldo" ? quantisTh(presentes, 4) : null;
    var thN = metrica === "saldo" ? quantisTh(presentes.map(function (v) { return -v; }), 4) : null;
    var linhas = "";
    ANOS_D.forEach(function (d) {
      linhas += '<div class="mx-h" data-d="' + d + '"><span>' + d + '</span></div>';
    });
    ANOS_S1.forEach(function (o) {
      linhas += '<div class="mx-lbl num" data-o="' + o + '">' + o + '</div>';
      ANOS_D.forEach(function (d) {
        if (d <= o) { linhas += '<i class="mx-e"></i>'; return; }
        var v = val(o, d);
        var cor = corBin(v);
        var m = ui < 0 ? agrega(o, d) : ufPair(ui, o, d);
        linhas += '<div class="mx-c" data-o="' + o + '" data-d="' + d + '" style="background:' + cor
          + '" title="' + o + ' → ' + d + ' · virou ' + resumo(m.v) + ' · deixou ' + resumo(m.d)
          + ' · permaneceu ' + resumo(m.p) + '"></div>';
      });
    });
    function corBin(v) {
      if (metrica === "saldo") {
        if (v === 0) return SALDO_MEIO;
        if (v > 0) return mix(SALDO_MEIO, SALDO_POS, binDe(v, thP) / 3);
        return mix(SALDO_NEG_CLARO, SALDO_NEG, binDe(-v, thN) / 3);
      }
      var r = metrica.charAt(0) === "g" ? GRUPOS[+gK(metrica)].rampa : RAMPA[metrica];
      return mix(r[0], r[1], binDe(v, thUni) / (K - 1));
    }
    function gradDegraus(seq) {
      var n = seq.length;
      return "linear-gradient(90deg," + seq.map(function (c, i) {
        return c + " " + (i * 100 / n).toFixed(1) + "% " + ((i + 1) * 100 / n).toFixed(1) + "%";
      }).join(",") + ")";
    }
    $("matriz-grid").innerHTML = '<div class="mx-lbl" style="text-align:left;padding-right:6px;line-height:normal;font-size:1rem;font-weight:800;color:var(--forest);background:#e6efdf;border-radius:4px;padding:6px 8px 4px 4px;margin-bottom:2px">origem ↓<br><span style="color:var(--muted);font-weight:700">destino →</span></div>' + linhas;
    if (max <= 0) {
      $("matriz-grad").style.background = "#edf1eb";
      $("matriz-min").textContent = "0"; $("matriz-max").textContent = "sem dados";
    } else if (metrica === "saldo") {
      var seq, cN = [0, 1, 2, 3].map(function (b) { return mix(SALDO_NEG_CLARO, SALDO_NEG, b / 3); });
      var cP = [0, 1, 2, 3].map(function (b) { return mix(SALDO_MEIO, SALDO_POS, b / 3); });
      seq = cN.slice().reverse().concat([SALDO_MEIO], cP);
      $("matriz-grad").style.background = gradDegraus(seq);
      $("matriz-min").textContent = "−" + resumo(Math.abs(minS));
      $("matriz-max").textContent = "+" + resumo(maxPos);
    } else {
      var seq, rgm = metrica.charAt(0) === "g" ? GRUPOS[+gK(metrica)].rampa : RAMPA[metrica];
      seq = [0, 1, 2, 3, 4].map(function (b) { return mix(rgm[0], rgm[1], b / 4); });
      $("matriz-grad").style.background = gradDegraus(seq);
      $("matriz-min").textContent = "0";
      $("matriz-max").textContent = resumo(max);
    }
  }
  $("matriz-metrica").addEventListener("change", renderMatriz);
  (function () {
    var grid = $("matriz-grid"), ativo = [];
    function limpaHi() {
      ativo.forEach(function (el) { el.classList.remove("mx-hi", "mx-vi"); });
      ativo = [];
    }
    grid.addEventListener("mousemove", function (e) {
      var c = e.target.closest && e.target.closest(".mx-c");
      if (!c || !c.hasAttribute("data-d")) { limpaHi(); return; }
      if (ativo.length && ativo[0] === c) return;
      limpaHi();
      c.classList.add("mx-vi");
      ativo.push(c);
      var hd = grid.querySelector('.mx-h[data-d="' + c.getAttribute("data-d") + '"]');
      var lo = grid.querySelector('.mx-lbl[data-o="' + c.getAttribute("data-o") + '"]');
      if (hd) { hd.classList.add("mx-hi"); ativo.push(hd); }
      if (lo) { lo.classList.add("mx-hi"); ativo.push(lo); }
    });
    grid.addEventListener("mouseleave", limpaHi);
  })();
  $("matriz-grid").addEventListener("click", function (e) {
    var c = e.target.closest ? e.target.closest(".mx-c") : null;
    if (!c) return;
    selO.value = c.getAttribute("data-o");
    opcoesDestino();
    selD.value = c.getAttribute("data-d");
    renderAll();
  });

  /* ---- sankey origem → soja → destino (SVG, fitas em Bézier) ---- */
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function sankeySVG(o, dd, nome) {
    var ui = +selUF.value;
    var rec;
    if (ui < 0) { var r = agrega(o, dd); rec = { v: r.v, d: r.d, dv: r.dv || [], dd: r.dd || [] }; }
    else rec = ufPair(ui, o, dd);
    var Vs = classesDe(rec.dv).filter(function (c) { return c.area > 0; });
    var Ds = classesDe(rec.dd).filter(function (c) { return c.area > 0; });
    if (!Vs.length && !Ds.length) {
      return '<p class="hint" style="margin-top:10px">Nenhum fluxo de/para soja nesta janela — ajuste os anos de início e fim no console.</p>';
    }
    function pack(lst) {
      var t = lst.slice(0, 6);
      var resto = lst.slice(6);
      if (resto.length) t.push({ id: null, area: resto.reduce(function (a, c) { return a + c.area; }, 0) });
      return t;
    }
    Vs = pack(Vs); Ds = pack(Ds);
    var W = 1088, HL = 238;
    var NODEW = 120;
    var GUT_E = 176, GUT_D = 834;

    function fita(x0, y0, x1, y1, h1, h2, cor, tit) {
      var c = (x0 + x1) / 2;
      return '<path class="fita" d="M' + x0 + ',' + y0 + ' C' + c + ',' + y0 + ' ' + c + ',' + y1 + ' ' + x1 + ',' + y1
        + ' L' + x1 + ',' + (y1 + h2) + ' C' + c + ',' + (y1 + h2) + ' ' + c + ',' + (y0 + h1) + ' ' + x0 + ',' + (y0 + h1)
        + ' Z" fill="' + cor + '" opacity="0.38"><title>' + tit + '</title></path>';
    }
    function diagrama(lst, total, YTOP, fluxoSai, corNode, nomeNode) {
      // fluxoSai=false: classes (esquerda) → soja (direita). true: soja (esquerda) → classes (direita)
      var xNode = fluxoSai ? 130 : 838;
      var frags = "";
      var titulo = fluxoSai
        ? "Para onde foi a soja que saiu · " + o + " → " + dd + " · " + resumo(total)
        : "De onde veio a soja nova · " + o + " → " + dd + " · " + resumo(total);
      frags += '<text x="176" y="' + (YTOP - 12) + '" text-anchor="start" font-size="13.5" font-weight="800" fill="#18362d">' + titulo + '</text>';
      var y = YTOP, cum = 0;
      lst.forEach(function (c) {
        var h = HL * c.area / total;
        var yC = YTOP + (cum / total) * HL;
        var nm = c.id === null ? "Outras classes" : CLS[c.id];
        var cor = c.id === null ? "#c3cdc6" : (CORES[c.id] || corCls(c.id));
        var titF = nm + " — " + resumo(c.area) + " (" + pct(c.area, total) + ")";
        var bx = fluxoSai ? 704 : 186;
        var xNodeBorda = fluxoSai ? 250 : 838;
        var xClBorda = fluxoSai ? bx : bx + NODEW;
        // fita: de classe → centro (esq) ou centro → classe (dir)
        if (fluxoSai) frags += fita(xNodeBorda, yC, xClBorda, y, h, h, cor, titF);
        else frags += fita(xClBorda, y, xNodeBorda, yC, h, h, cor, titF);
        // nó da classe
        frags += '<rect x="' + bx + '" y="' + y + '" width="' + NODEW + '" height="' + h + '" fill="' + cor + '"><title>' + titF + '</title></rect>';
        // rótulo no beco externo (duas linhas)
        var lx = fluxoSai ? GUT_D : GUT_E;
        if (h >= 22) {
          frags += '<text x="' + lx + '" y="' + (y + h / 2 - 1) + '" text-anchor="' + (fluxoSai ? "start" : "end")
            + '" font-size="11.5" font-weight="700" fill="#18362d">' + trunc(nm, 21) + '</text>'
            + '<text x="' + lx + '" y="' + (y + h / 2 + 12) + '" text-anchor="' + (fluxoSai ? "start" : "end")
            + '" font-size="10.5" font-weight="600" fill="#5f7169">' + resumo(c.area) + ' · ' + pct(c.area, total) + '</text>';
        } else if (h >= 16) {
          frags += '<text x="' + lx + '" y="' + (y + h / 2 + 3.5) + '" text-anchor="' + (fluxoSai ? "start" : "end")
            + '" font-size="10.5" font-weight="700" fill="#5f7169">' + trunc(nm, 17) + '</text>';
        }
        y += h;
        cum += c.area;
      });
      // nó central
      frags += '<rect x="' + xNode + '" y="' + YTOP + '" width="' + NODEW + '" height="' + HL + '" rx="6" style="fill:' + corNode + '"><title>' + nomeNode + '</title></rect>'
        + '<text x="' + (xNode + NODEW / 2) + '" y="' + (YTOP + HL / 2 - 3) + '" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff">' + nomeNode.toUpperCase() + '</text>'
        + '<text x="' + (xNode + NODEW / 2) + '" y="' + (YTOP + HL / 2 + 14) + '" text-anchor="middle" font-size="12.5" font-weight="800" fill="#fff">' + resumo(total) + '</text>';
      return frags;
    }
    var Y1 = 34, Y2 = Y1 + HL + 70;
    var H = Ds.length ? (Y2 + HL + 30) : (Y1 + HL + 30);
    var svg = '<svg class="esvg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sankey de fluxos de uso da terra (' + nome + ', ' + o + ' → ' + dd + ')">';
    if (Vs.length) svg += diagrama(Vs, rec.v, Y1, false, "var(--forest)", "soja nova");
    if (Ds.length) svg += diagrama(Ds, rec.d, Y2, true, "var(--atencao)", "soja que saiu");
    svg += '</svg>';
    return svg;
  }

  /* ---- ficha: um estado (expandido) ---- */
  function renderFicha() {
    if (MODO === "comparar") { renderComparar(); return; }
    var o = +selO.value, dd = +selD.value;
    var ui = +selUF.value;
    var nome = ui < 0 ? "Brasil (todas as UFs)" : UFS[ui][1];
    var rec, r = null;
    if (ui < 0) { r = agrega(o, dd); rec = { v: r.v, d: r.d, p: r.p, dv: r.dv, dd: r.dd }; }
    else { rec = ufPair(ui, o, dd); }
    var panel = $("state-panel");
    $("ef-eyebrow").textContent = MODO === "comparar"
      ? "Comparação entre estados"
      : (ui < 0 ? "Ficha do Brasil" : "Ficha: " + UFS[ui][1]);
    var tot = rec.v + rec.d + rec.p;
    if (!tot) {
      panel.innerHTML = '<div class="state-empty">Nenhuma área da classe Soja registrada entre ' + o + ' e ' + dd + ' para esta seleção. Experimente outra janela no console acima.</div>';
      marcaSelecao();
      return;
    }
    var totHtml = '<div class="state-tot">'
      + '<div class="kv"><div class="k">Soja em ' + dd + '</div><div class="n num">' + ha(rec.v + rec.p) + '</div></div>'
      + '<div class="kv"><div class="k">Virou soja</div><div class="n num">' + ha(rec.v) + '</div></div>'
      + '<div class="kv"><div class="k">Deixou de ser soja</div><div class="n num">' + ha(rec.d) + '</div></div>'
      + '<div class="kv"><div class="k">Permaneceu soja</div><div class="n num">' + ha(rec.p) + '</div></div>'
      + '<div class="kv"><div class="k">Saldo</div><div class="n num">' + ha(rec.v - rec.d) + '</div></div>'
      + '</div>';
    function coluna(titulo, hint, arr, emptyMsg) {
      var cls = classesDe(arr).filter(function (c) { return c.area > 0; });
      if (!cls.length) return '<div class="state-cols-col"><h3>' + titulo + '</h3><p class="hint">' + emptyMsg + '</p></div>';
      var max = cls[0].area;
      return '<div class="state-cols-col"><h3>' + titulo + '</h3><p class="hint">' + hint + '</p>'
        + '<div class="cls-list">' + cls.slice(0, 12).map(function (c) {
          var cor = CORES[c.id] || corCls(c.id);
          return '<div class="cls-item"><span class="sw" style="background:' + cor + '"></span>'
            + '<div class="line"><span class="nm">' + CLS[c.id] + '</span><span class="v num">' + ha(c.area) + ' <span style="color:var(--vazio)">(' + pct(c.area, tot) + ')</span></span></div>'
            + '<div class="cbar"><i style="width:' + Math.max(1.5, 100 * c.area / max).toFixed(1) + '%;background:' + cor + '"></i></div></div>';
        }).join("") + '</div></div>';
    }
    panel.innerHTML = totHtml
      + '<div class="state-cols">'
      + coluna("Origem da soja nova", "Em que uso a terra estava antes de virar soja, em " + o + ".", rec.dv, "Nenhuma área virou soja nesta seleção na janela analisada.")
      + coluna("Destino da soja perdida", "Para qual uso a terra foi quando deixou de ser soja, em " + dd + ".", rec.dd, "Nenhuma área deixou de ser soja nesta seleção na janela analisada.")
      + '</div>'
      + '<p class="hint" style="margin-top:16px">' + nome + " · " + o + " → " + dd + (ui < 0 && r ? " · " + r.n + " UFs com soja" : "") + '</p>'
      + '<div class="sankey-wrap"><h3>Fluxos da janela — sankey de origem e destino</h3>'
      + '<p class="hint" style="margin-top:2px">Classes de origem à esquerda, classes de destino à direita; o nó central agrupa a soja movimentada. Rótulos com valor e participação; passe o mouse nas fitas.</p>'
      + sankeySVG(o, dd, nome)
      + '</div>';
    marcaSelecao();
  }

  /* ---- ficha: comparar estados ---- */
  function miniTop3(arr, ano, tipo) {
    var cls = classesDe(arr || []).filter(function (c) { return c.area > 0; }).slice(0, 3);
    return '<div><div class="col-tit">' + tipo + " (" + ano + ')</div>'
      + (cls.length
        ? cls.map(function (c) {
          return '<div class="li"><span class="nm">' + CLS[c.id] + '</span><span class="vv num">' + resumo(c.area) + '</span></div>';
        }).join("")
        : '<div class="hint">sem área</div>')
      + '</div>';
  }
  function renderComparar() {
    var o = +selO.value, dd = +selD.value;
    var grid = $("cmp-grid");
    if (!SELS.length) { grid.innerHTML = ""; return; }
    grid.innerHTML = SELS.map(function (i) {
      var rec = ufPair(i, o, dd);
      var t = rec.v + rec.d + rec.p;
      var bar = t > 0
        ? '<div class="cmp-bar">'
          + '<span class="seg seg-se" style="flex:' + rec.v + '" title="' + pct(rec.v, t) + '"></span>'
          + '<span class="seg seg-sd" style="flex:' + rec.d + '" title="' + pct(rec.d, t) + '"></span>'
          + '<span class="seg seg-sp" style="flex:' + rec.p + '" title="' + pct(rec.p, t) + '"></span>'
          + '</div>'
        : '<div class="cmp-bar"><span class="seg" style="flex:1"></span></div>';
      var vals = '<div class="cmp-vals num">'
        + '<span class="key"><span class="sw" style="background:var(--forest)"></span> Soja em ' + dd + ': ' + resumo(rec.v + rec.p) + '</span>'
        + '<span class="key"><span class="sw" style="background:var(--forest)"></span> Virou: ' + resumo(rec.v) + '</span>'
        + '<span class="key"><span class="sw" style="background:var(--atencao)"></span> Deixou: ' + resumo(rec.d).replace("−", "") + '</span>'
        + '<span class="key"><span class="sw" style="background:var(--perm)"></span> Permaneceu: ' + resumo(rec.p) + '</span>'
        + '</div>';
      var saldoCor = rec.v - rec.d >= 0 ? "var(--ok)" : "var(--atencao)";
      return '<div class="cmp-card"><div class="cmp-head"><h4>' + UFS[i][1] + '</h4>'
        + '<span class="saldo num" style="color:' + saldoCor + '">saldo ' + resumo(rec.v - rec.d) + '</span></div>'
        + bar + vals
        + (t > 0
          ? '<div class="cmp-cols">' + miniTop3(rec.dv, o, "Origem") + miniTop3(rec.dd, dd, "Destino") + '</div>'
          : '<p class="hint" style="margin-top:10px">Sem soja registrada nesta UF nesta janela.</p>')
        + '</div>';
    }).join("");
  }

  /* ---- evolução ---- */
  function serieOrigem(ui, o) {
    var serie = [];
    var tem = false;
    for (var dd = o + 1; dd <= ANOS[ANOS.length - 1]; dd++) {
      var rec = ui < 0 ? agrega(o, dd) : ufPair(ui, o, dd);
      if (rec.v || rec.d || rec.p) tem = true;
      serie.push({ ano: dd, v: rec.v, d: rec.d, p: rec.p });
    }
    return { serie: serie, tem: tem };
  }
  function colunas(serie, hVmax, hDmax, mini) {
    var cols = "";
    serie.forEach(function (s) {
      var hV = s.v > 0 ? Math.max(0.8, 50 * s.v / hVmax) : 0;
      var hD = s.d > 0 ? Math.max(0.8, 50 * s.d / hDmax) : 0;
      var t = 'title="' + s.ano + ' · virou ' + fmt.format(Math.round(s.v)) + ' ha · deixou ' + fmt.format(Math.round(s.d)) + ' ha · permaneceu ' + fmt.format(Math.round(s.p)) + ' ha"';
      cols += '<div class="evo-col">'
        + '<div class="evo-zone up" ' + t + '>' + (s.v > 0 ? '<i style="height:' + hV.toFixed(2) + '%"></i>' : "") + '</div>'
        + '<div class="evo-zone down" ' + t + '>' + (s.d > 0 ? '<i style="height:' + hD.toFixed(2) + '%"></i>' : "") + '</div>'
        + '</div>';
    });
    return cols;
  }
  /* leitura de valores da evolução (painel sempre visível; hover atualiza) */
  var S1 = null, IDXD = 0;
  function roHtml(s) {
    return '<span class="ano">' + s.ano + '</span>'
      + '<span><span class="swmini" style="background:var(--forest)"></span>virou <span class="num" style="color:var(--ok)">' + resumo(s.v) + '</span></span>'
      + '<span><span class="swmini" style="background:var(--atencao)"></span>deixou <span class="num" style="color:var(--atencao)">' + resumo(s.d) + '</span></span>'
      + '<span><span class="swmini" style="background:var(--perm)"></span>permaneceu <span class="num">' + resumo(s.p) + '</span></span>';
  }
  function idxMaxV(serie) {
    var m = 0;
    serie.forEach(function (x, k) { if (x.v > serie[m].v) m = k; });
    return m;
  }
  function renderEvo() {
    var o = +selO.value;
    var ultimo = ANOS[ANOS.length - 1];
    if (MODO === "comparar") {
      $("evo-titulo").textContent = "Comparando trajetórias";
      $("evo-sub").textContent = "Origem fixa em " + o + " · mini-múltiplos por estado · passe o mouse para ler os valores";
      S1 = null;
      var multi = $("evo-multi");
      if (!SELS.length) { multi.innerHTML = ""; $("evo-empty").hidden = false; $("evo-empty").textContent = "Selecione estados na seção “Um estado ou comparação” para ver suas trajetórias aqui."; return; }
      var dados = [];
      var blocks = SELS.map(function (i) {
        var s = serieOrigem(i, o);
        var maxV = s.serie.reduce(function (a, x) { return Math.max(a, x.v); }, 0) || 1;
        var maxD = s.serie.reduce(function (a, x) { return Math.max(a, x.d); }, 0) || 1;
        dados.push({ serie: s.serie, def: idxMaxV(s.serie) });
        return '<div class="mini-evo"><h4>' + UFS[i][1] + '</h4>'
          + '<div class="evo-cols">' + colunas(s.serie, maxV, maxD) + '</div>'
          + '<div class="evo-readout num"></div>'
          + '<p class="hint" style="margin-top:4px">origem ' + o + (s.tem ? "" : " · sem soja registrada") + '</p></div>';
      }).join("");
      $("evo-empty").hidden = true;
      multi.innerHTML = blocks;
      Array.prototype.forEach.call(multi.children, function (card, k) {
        var dd = dados[k];
        var ro = card.querySelector(".evo-readout");
        var cols = card.querySelector(".evo-cols");
        ro.innerHTML = roHtml(dd.serie[dd.def]);
        card.addEventListener("mousemove", function (e) {
          var col = e.target.closest(".evo-col");
          if (!col) return;
          var i = Array.prototype.indexOf.call(cols.children, col);
          if (dd.serie[i]) ro.innerHTML = roHtml(dd.serie[i]);
        });
        card.addEventListener("mouseleave", function () { ro.innerHTML = roHtml(dd.serie[dd.def]); });
      });
      return;
    }
    var ui = +selUF.value;
    var nome = ui < 0 ? "Brasil (todas as UFs)" : UFS[ui][1];
    var s = serieOrigem(ui, o);
    $("evo-sub").textContent = "Origem fixa em " + o + " · destino em cada ano seguinte · " + nome;
    $("evo-titulo").textContent = nome + " · trajetórias da soja de " + o;
    if (!s.tem) {
      S1 = null;
      $("evo-single").hidden = true;
      $("evo-empty").hidden = false;
      $("evo-cols").innerHTML = ""; $("evo-axis").innerHTML = ""; $("evo-line-p").innerHTML = "";
      return;
    }
    $("evo-single").hidden = false;
    $("evo-empty").hidden = true;
    var maxV = s.serie.reduce(function (a, x) { return Math.max(a, x.v); }, 0) || 1;
    var maxD = s.serie.reduce(function (a, x) { return Math.max(a, x.d); }, 0) || 1;
    var maxP = s.serie.reduce(function (a, x) { return Math.max(a, x.p); }, 0) || 1;
    $("evo-scale").textContent = "Escalas — virou até " + resumo(maxV) + " · deixou até " + resumo(maxD)
      + " · permaneceu (linha) até " + resumo(maxP) + " — cada cor na própria escala.";
    S1 = s.serie;
    IDXD = idxMaxV(s.serie);
    $("evo-readout").innerHTML = roHtml(S1[IDXD]);
    $("evo-cols").innerHTML = colunas(s.serie, maxV, maxD, false);
    var axis = "";
    s.serie.forEach(function (x) {
      axis += '<span>' + ((x.ano === o + 1 || x.ano === ultimo || x.ano % 5 === 0) ? x.ano : "") + '</span>';
    });
    $("evo-axis").innerHTML = axis;
    var boxL = $("evo-line-p");
    var Wl = Math.min(1280, Math.max(340, boxL.clientWidth || 340)), Hl = 150;
    var passo = Wl / s.serie.length;
    var pts = [], dots = "";
    s.serie.forEach(function (x, k) {
      var px = k * passo + passo / 2;
      var py = Hl - 18 - 112 * (maxP > 0 ? x.p / maxP : 0);
      pts.push(px.toFixed(1) + "," + py.toFixed(1));
      dots += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3.4" fill="var(--perm)" stroke="#fff" stroke-width="1.2"><title>' + x.ano + ' · permaneceu ' + resumo(x.p) + '</title></circle>';
    });
    var base = Hl - 18;
    function gy(rel) { return (base - 112 * rel).toFixed(1); }
    var areaPath = pts.length > 1
      ? "M" + pts[0] + " L" + pts.slice(1).join(" L") + " L" + (Wl - passo / 2).toFixed(1) + "," + base + " L" + (passo / 2).toFixed(1) + "," + base + " Z"
      : "";
    $("evo-perm-max").textContent = resumo(maxP);
    boxL.innerHTML = '<svg viewBox="0 0 ' + Wl + ' ' + Hl + '" style="display:block;width:100%;height:' + Hl + 'px">'
      + '<line x1="34" y1="' + gy(1) + '" x2="' + Wl + '" y2="' + gy(1) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"></line>'
      + '<line x1="34" y1="' + gy(0.5) + '" x2="' + Wl + '" y2="' + gy(0.5) + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 3"></line>'
      + '<line x1="34" y1="' + base + '" x2="' + Wl + '" y2="' + base + '" stroke="var(--line)" stroke-width="1.4"></line>'
      + '<text x="2" y="' + (+gy(1) + 3.5) + '" font-size="11" font-weight="700" fill="var(--muted)">' + resumo(maxP) + '</text>'
      + '<text x="2" y="' + (+gy(0.5) + 3.5) + '" font-size="11" font-weight="700" fill="var(--muted)">' + resumo(maxP / 2) + '</text>'
      + '<text x="2" y="' + (base + 3.5) + '" font-size="11" font-weight="700" fill="var(--muted)">0</text>'
      + (areaPath ? '<path d="' + areaPath + '" fill="var(--perm)" opacity="0.18"></path>' : "")
      + '<polyline points="' + pts.join(" ") + '" fill="none" stroke="var(--perm)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"></polyline>'
      + dots + '</svg>';
  }

  /* ---- achados da janela ---- */
  function gruposDe(rec) {
    var dv = rec.dv || [];
    if (!dv.forEach) {
      var arr = [];
      Object.keys(dv).forEach(function (k2) { arr.push([+k2, dv[k2]]); });
      dv = arr;
    }
    var tot = [0, 0, 0, 0, 0, 0];
    dv.forEach(function (c) {
      var g = -1;
      for (var i = 1; i < GRUPOS.length && g < 0; i++) if (GRUPOS[i].ids && GRUPOS[i].ids[c[0]]) g = i;
      if (g < 0) g = 5;
      tot[g] += c[1];
    });
    return tot;
  }
  function renderAchados() {
    var o2 = +selO.value, dd2 = +selD.value, ui = +selUF.value;
    var r = ui < 0 ? agrega(o2, dd2) : ufPair(ui, o2, dd2);
    $("achados-sub").textContent = (ui < 0 ? "Brasil" : UFS[ui][1]) + " · " + o2 + " → " + dd2;
    var fatos = [];
    if (!(r.v + r.d + r.p)) {
      fatos.push("Nenhuma área da classe Soja nesta janela para este escopo.");
    } else {
      fatos.push("<strong>Soja em " + dd2 + ":</strong> " + resumo(r.v + r.p) + (ui < 0 ? " (" + r.n + " UFs com soja)" : "") + ".");
      var tv = classesDe(r.dv || []).filter(function (c) { return c.area > 0; });
      if (tv.length) fatos.push("<strong>Top origem da soja nova:</strong> " + CLS[tv[0].id] + " — " + pct(tv[0].area, r.v) + " das áreas que viraram.");
      if (ui < 0) {
        var tops = UFS.map(function (u, i2) { return { n: u[1], v: ufPair(i2, o2, dd2).v }; }).sort(function (a, b) { return b.v - a.v; });
        if (tops[0].v > 0) fatos.push("<strong>Estado que mais avançou:</strong> " + tops[0].n + " (" + resumo(tops[0].v) + ")" + (tops[1] && tops[1].v > 0 ? "; segue " + tops[1].n + " (" + resumo(tops[1].v) + ")" : "") + ".");
      } else {
        var posi = 1;
        UFS.forEach(function (u, i2) { if (ufPair(i2, o2, dd2).v > r.v) posi++; });
        fatos.push("<strong>Posição no ranking de expansão:</strong> " + posi + "º entre os 27.");
      }
      var d10 = o2 + 10;
      if (d10 <= ANOS[ANOS.length - 1]) {
        var r10b = ui < 0 ? agrega(o2, d10) : ufPair(ui, o2, d10);
        if (r10b.p + r10b.d > 0) fatos.push("<strong>Retenção em 10 anos:</strong> " + pct(r10b.p, r10b.p + r10b.d) + " (" + o2 + " → " + d10 + ").");
      }
      var gt = gruposDe(r);
      var gi = 0;
      for (var i3 = 1; i3 < gt.length; i3++) if (gt[i3] > gt[gi]) gi = i3;
      if (gi > 0 && gt[gi] > 0) fatos.push("<strong>Fonte dominante:</strong> " + GRUPOS[gi].tit + " — " + resumo(gt[gi]) + ".");
    }
    $("achados-list").innerHTML = fatos.map(function (f) { return "<li>" + f + "</li>"; }).join("");
  }

  /* ---- ligações ---- */
  /* leitura de valores da evolução: hover nas colunas atualiza o painel */
  $("evo-single").addEventListener("mousemove", function (e) {
    var col = e.target.closest && e.target.closest(".evo-col");
    if (!col || !S1) return;
    var i = Array.prototype.indexOf.call(col.parentNode.children, col);
    if (S1[i]) $("evo-readout").innerHTML = roHtml(S1[i]);
  });
  $("evo-single").addEventListener("mouseleave", function () {
    if (S1) $("evo-readout").innerHTML = roHtml(S1[IDXD]);
  });

  /* ---- visibilidade: análises gerais (ranking, mapas nacionais) só no escopo Brasil ---- */
  function renderVisible() {
    var br = +selUF.value < 0;
    ["ranking", "mapa"].forEach(function (id) {
      $(id).style.display = br ? "" : "none";
    });
    ["nl-ranking", "nl-mapa", "dir-ranking", "dir-mapa", "cobertura-card"].forEach(function (id) {
      $(id).hidden = !br;
    });
  }

  /* ---- contorno ampliado do estado do escopo + localização ---- */
  function renderEstadoMapa() {
    var ui = +selUF.value;
    var card = $("estado-card");
    card.hidden = ui < 0;
    var locBox = $("estado-loc");
    if (ui < 0) { locBox.innerHTML = ""; $("estado-shape").innerHTML = ""; return; }
    var sigla = CODE2SIGLA[UFS[ui][0]];
    var label = UFS[ui][1];
    $("ec-zoom-lbl").textContent = "Contorno da UF: " + label;
    var d = null;
    DADOS.mapa.locs.forEach(function (l) { if (l[0] === sigla) d = l[1]; });
    if (!d) return;
    /* mini-Brasil visível para obter a bounding box (via getBBox) */
    locBox.innerHTML = "";
    var svgLoc = document.createElementNS(svgNS, "svg");
    svgLoc.setAttribute("viewBox", DADOS.mapa.viewBox);
    var pLoc = null;
    DADOS.mapa.locs.forEach(function (l) {
      var p = document.createElementNS(svgNS, "path");
      p.setAttribute("d", l[1]);
      p.id = "el-" + l[0];
      p.setAttribute("fill", l[0] === sigla ? "var(--forest)" : "#e4e9e3");
      svgLoc.appendChild(p);
      if (l[0] === sigla) pLoc = p;
    });
    locBox.appendChild(svgLoc);
    /* zoom */
    var zBox = $("estado-shape");
    zBox.innerHTML = "";
    var svgZ = document.createElementNS(svgNS, "svg");
    var pZ = document.createElementNS(svgNS, "path");
    pZ.setAttribute("d", d);
    pZ.setAttribute("fill", "var(--forest)");
    pZ.setAttribute("stroke", "var(--forest-dark)");
    pZ.setAttribute("stroke-width", "1");
    svgZ.appendChild(pZ);
    zBox.appendChild(svgZ);
    try {
      var bb = pLoc.getBBox();
      var pad = Math.max(bb.width, bb.height) * 0.03;
      svgZ.setAttribute("viewBox", (bb.x - pad) + " " + (bb.y - pad) + " " + (bb.width + 2 * pad) + " " + (bb.height + 2 * pad));
    } catch (e) {
      svgZ.setAttribute("viewBox", DADOS.mapa.viewBox);
    }
  }

  function renderAll() {
    try { location.hash = selO.value + "-" + selD.value + (+selUF.value < 0 ? "" : "-" + CODE2SIGLA[UFS[+selUF.value][0]]); } catch (e) {}
    renderVisible();
    renderEstadoMapa();
    var r = renderResumo();
    renderRanking(r);
    renderEstrutura(r);
    renderComp(r.v, r.dv, "comp-bar", "comp-legend");
    renderComp(r.d, r.dd, "comp-bar-d", "comp-legend-d");
    renderMapa();
    renderGrupos();
    renderMatriz();
    renderFicha();
    renderEvo();
    renderAchados();
  }

  selO.addEventListener("change", function () { opcoesDestino(); renderAll(); });
  selD.addEventListener("change", renderAll);
  selUF.addEventListener("change", renderAll);

  try {
    window.addEventListener("resize", function () {
      clearTimeout(rzT);
      rzT = setTimeout(function () { renderEvo(); }, 180);
    });
  } catch (e) {}

  $("cob-zero").textContent = SEM_DADOS.join(" · ") || "—";
  $("cob-zero2").textContent = SEM_DADOS.join(", ") || "—";

  renderAll();
  (function () {
    var aviso = $("aviso-console");
    var visto = false;
    try { visto = localStorage.getItem("soja39-dica-console") === "1"; } catch (e) {}
    if (!visto) {
      aviso.hidden = false;
      aviso.classList.add("pulsando");
    }
    $("aviso-fechar").addEventListener("click", function () {
      aviso.hidden = true;
      try { localStorage.setItem("soja39-dica-console", "1"); } catch (e) {}
    });
  })();
})();
