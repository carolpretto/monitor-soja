# -*- coding: utf-8 -*-
"""Aggregate soja trajectory CSVs into data.js for the GitHub Pages site.

Entrada  : todas-transicoes/soja39_<UF>_origem<ANO>.csv  (27 UFs, origens 1985-2024,
           cada arquivo com todos os destinos possíveis até 2025)
Saída    : index.html + data.js na RAIZ do repositório (GitHub Pages serve de /)

Formato do DADOS:
{
  gerado, periodo,
  anos   : [1985..2025],
  ufs    : [[codigo, rotulo], ...]     índice = índice da UF em t
  classes: [[classe_id, nome], ...]
  t      : [ por UF: [ [ano_origem, ano_destino, tipo, [[classe_id, area], ...]], ... ] ]
           tipo: 0=Virou soja, 1=Deixou de ser soja, 2=Permaneceu soja
}
Áreas: hectares. < 10 ha mantêm 1 casa decimal; >= 10 ha arredondadas a inteiro.
Entradas que arredondam para 0 (< 0,05 ha) são descartadas.
"""
import csv
import gzip
import json
import os
from collections import defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, "todas-transicoes")
OUT_DIR = BASE  # site na raiz, para o GitHub Pages reconhecer index.html direto

UF_LABELS = {
    "Acre": "Acre", "Alagoas": "Alagoas", "Amapa": "Amapá", "Amazonas": "Amazonas",
    "Bahia": "Bahia", "Ceara": "Ceará", "Distrito_Federal": "Distrito Federal",
    "Espirito_Santo": "Espírito Santo", "Goias": "Goiás", "Maranhao": "Maranhão",
    "Mato_Grosso": "Mato Grosso", "Mato_Grosso_Do_Sul": "Mato Grosso do Sul",
    "Minas_Gerais": "Minas Gerais", "Para": "Pará", "Paraiba": "Paraíba",
    "Parana": "Paraná", "Pernambuco": "Pernambuco", "Piaui": "Piauí",
    "Rio_De_Janeiro": "Rio de Janeiro", "Rio_Grande_Do_Norte": "Rio Grande do Norte",
    "Rio_Grande_Do_Sul": "Rio Grande do Sul", "Rondonia": "Rondônia",
    "Roraima": "Roraima", "Santa_Catarina": "Santa Catarina", "Sao_Paulo": "São Paulo",
    "Sergipe": "Sergipe", "Tocantins": "Tocantins",
}

TIPO_V, TIPO_D, TIPO_P = 0, 1, 2
PREFIXO = "soja39_"

# (uf, ano_origem, ano_destino, tipoid) -> {classe_id: area}
agg = defaultdict(dict)
# todas as UFs entram no índice, mesmo as sem nenhum dado (arquivos vazios)
ufs = sorted(UF_LABELS)
ufs_set = set(UF_LABELS)
classes = {}             # classe_id -> nome
origens = set()
destinos = set()
rows_lidas = 0
arquivos = 0
arquivos_vazios = []

for name in sorted(os.listdir(SRC)):
    if not name.endswith(".csv") or not name.startswith(PREFIXO):
        continue
    uf, _, resto = name[len(PREFIXO):].partition("_origem")
    if not resto.endswith(".csv") or not resto[:-4].isdigit():
        print("!! nome de arquivo fora do padrão:", name)
        continue
    ano_o = int(resto[:-4])
    arquivos += 1
    rows_lidas_arq = 0
    with open(os.path.join(SRC, name), encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            t = (r.get("transicao") or "").strip()
            if t.startswith("Virou"):
                tipo = TIPO_V
            elif t.startswith("Deixou"):
                tipo = TIPO_D
            elif t.startswith("Permaneceu"):
                tipo = TIPO_P
            else:
                print("!! transicao desconhecida em", name, ":", t)
                continue
            try:
                cid = int(float(r.get("classe_id") or 0))
            except ValueError:
                print("!! classe_id inválido em", name, ":", r.get("classe_id"))
                continue
            nm = (r.get("classe_nome") or "Sem classe").strip()
            if classes.get(cid) not in (None, nm):
                if classes[cid] != nm:
                    print("!! nome de classe divergente para id", cid, classes[cid], "|", nm)
            classes[cid] = nm
            try:
                area = float(r.get("area_ha") or 0)
            except ValueError:
                print("!! area_ha inválido em", name, ":", r.get("area_ha"))
                continue
            try:
                ano_d = int(float(r.get("ano_destino")))
            except ValueError:
                print("!! ano_destino inválido em", name, ":", r.get("ano_destino"))
                continue
            origens.add(ano_o)
            destinos.add(ano_d)
            if ano_d <= ano_o:
                print("!! destino <= origem em", name, ":", ano_o, "->", ano_d)
            bucket = agg[(uf, ano_o, ano_d, tipo)]
            bucket[cid] = bucket.get(cid, 0.0) + area
            rows_lidas_arq += 1
    rows_lidas += rows_lidas_arq
    if rows_lidas_arq == 0:
        arquivos_vazios.append(uf + " origem " + str(ano_o))

# --------- compação ----------
def area_fmt(v):
    a = round(v) if v >= 10 else round(v, 1)
    return 0 if a == 0 else (int(a) if a == int(a) or v >= 10 else a)

# grupos por UF: [ano_o, ano_d, tipo, [[cid, area], ...]]
por_uf = [[ ] for _ in ufs]
ordem_uf = {u: i for i, u in enumerate(ufs)}
n_grupos = 0
n_entradas = 0
tot_v = tot_d = tot_p = 0.0
tot_v_2018_2024 = 0.0
for key in sorted(agg, key=lambda k: (ordem_uf[k[0]], k[1], k[2], k[3])):
    uf, ano_o, ano_d, tipo = key
    classes_pair = []
    for cid, v in sorted(agg[key].items()):
        a = area_fmt(v)
        if a == 0:
            continue
        classes_pair.append([cid, a])
        n_entradas += 1
        if tipo == TIPO_V:
            tot_v += a
            if ano_o == 2018 and ano_d == 2024:
                tot_v_2018_2024 += a
        elif tipo == TIPO_D:
            tot_d += a
        else:
            tot_p += a
    if not classes_pair:
        continue
    por_uf[ordem_uf[uf]].append([ano_o, ano_d, tipo, classes_pair])
    n_grupos += 1

anos = list(range(min(origens | destinos), max(origens | destinos) + 1))
dados = {
    "gerado": "2026-11-08",
    "periodo": "1985–2025",
    "anos": anos,
    "ufs": [[u, UF_LABELS.get(u, u.replace("_", " "))] for u in ufs],
    "classes": sorted(classes.items()),
    "t": por_uf,
}

# geometria SVG das UFs (embutida no data.js; @svg-maps/brazil, CC0)
MAPA_SRC = os.path.join(BASE, "tools", "brazil-map.json")
if os.path.exists(MAPA_SRC):
    with open(MAPA_SRC, encoding="utf-8") as f:
        dados["mapa"] = json.load(f)
else:
    print("!! tools/brazil-map.json não encontrado — data.js sai sem o mapa")
    dados["mapa"] = None

os.makedirs(OUT_DIR, exist_ok=True)
out_path = os.path.join(OUT_DIR, "data.js")
with open(out_path, "w", encoding="utf-8") as f:
    f.write("// Gerado automaticamente a partir dos CSVs de todas-transicoes — não editar à mão\n")
    f.write("const DADOS = ")
    f.write(json.dumps(dados, ensure_ascii=False, separators=(",", ":")))
    f.write(";\n")

size_mb = os.path.getsize(out_path) / 1e6

# --------- base "tidy" (formato long) para análise externa (R, Python) ---------
TIPO_NOME = {TIPO_V: "Virou soja", TIPO_D: "Deixou de ser soja", TIPO_P: "Permaneceu soja"}
out_csv = os.path.join(BASE, "transicoes_long.csv.gz")
n_csv = 0
with gzip.open(out_csv, "wt", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["uf", "ano_origem", "ano_destino", "transicao", "classe_id", "classe_nome", "area_ha"])
    for key in sorted(agg, key=lambda k: (ordem_uf[k[0]], k[1], k[2], k[3])):
        uf, ano_o, ano_d, tipo = key
        for cid, v in sorted(agg[key].items()):
            if v < 0.05:
                continue
            w.writerow([UF_LABELS[uf], ano_o, ano_d, TIPO_NOME[tipo], cid, classes[cid],
                        round(v, 2)])
            n_csv += 1
csv_mb = os.path.getsize(out_csv) / 1e6
print("transicoes_long.csv.gz : %d linhas, %.2f MB (gzip)" % (n_csv, csv_mb))

# --------- dados.json (payload do site, formato puro) ---------
out_json = os.path.join(BASE, "dados.json")
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(dados, f, ensure_ascii=False, separators=(",", ":"))
print("dados.json            : %.2f MB" % (os.path.getsize(out_json) / 1e6))

# --------- todas-transicoes.zip (CSVs de origem) ---------
import zipfile
zip_path = os.path.join(BASE, "todas-transicoes.zip")
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for name in sorted(os.listdir(SRC)):
        if name.endswith(".csv") and name.startswith(PREFIXO):
            z.write(os.path.join(SRC, name), arcname=name)
print("todas-transicoes.zip  : %.2f MB" % (os.path.getsize(zip_path) / 1e6))

print("arquivos lidos        : %d (vazios: %d)" % (arquivos, len(arquivos_vazios)))
print("linhas lidas          : %d" % rows_lidas)
print("grupos (uf/o/d/tipo)  : %d | entradas (classe/area): %d" % (n_grupos, n_entradas))
print("tamanho data.js       : %.2f MB" % size_mb)
print("classes               : %s" % ", ".join("%d=%s" % (c, n) for c, n in sorted(classes.items())))
print("origens: %d (%d-%d) | destinos: %d (%d-%d)" % (
    len(origens), min(origens), max(origens), len(destinos), min(destinos), max(destinos)))
print("Brasil totais (todas janelas) : virou=%.0f  deixou=%.0f  permaneceu=%.0f (ha)"
      % (tot_v, tot_d, tot_p))
print("Brasil janela 2018->2024      : virou=%.0f ha (comparar com conjunto antigo: 6,8 M ha)"
      % tot_v_2018_2024)
for i, u in enumerate(ufs):
    n_pares = len({(g[0], g[1]) for g in por_uf[i]})
    print("%-22s pares(o,d)=%3d grupos=%3d" % (UF_LABELS[u], n_pares, len(por_uf[i])))
