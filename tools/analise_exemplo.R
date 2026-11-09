# ============================================================================
# Análise exploratória da base long — transicoes_long.csv.gz
# Uso:  Rscript tools/analise_exemplo.R      (a partir da raiz do repositório)
# Requer: ggplot2 e scales (install.packages(c("ggplot2", "scales")))
# Gera 4 figuras em ./analise/ e um resumo no console.
# ============================================================================

base <- {
  a <- commandArgs(FALSE)
  f <- grep("^--file=", a, value = TRUE)
  if (length(f)) dirname(dirname(normalizePath(sub("^--file=", "", f)))) else getwd()
}
saida <- file.path(base, "analise")
dir.create(saida, showWarnings = FALSE)

suppressPackageStartupMessages({
  library(ggplot2)
  library(scales)
})

d <- read.csv(gzfile(file.path(base, "transicoes_long.csv.gz")), encoding = "UTF-8")
cat("Linhas:", format(nrow(d), big.mark = "."),
    "| UFs:", length(unique(d$uf)),
    "| anos:", min(d$ano_origem), "-", max(d$ano_destino), "\n\n")

verde <- "#184b39"; ambar <- "#c97320"; tinta <- "#18362d"; cinza <- "#8f9d95"
tema <- theme_minimal() +
  theme(plot.title = element_text(face = "bold", colour = tinta, size = 14),
        plot.subtitle = element_text(colour = "#5f7169", size = 10),
        plot.caption = element_text(colour = cinza, size = 8),
        legend.position = "right",
        panel.grid.minor = element_blank())

# ----------------------------------------------------------------------------
# Q1 — Quanto a soja cresceu desde 1985? (expansão acumulada, Brasil)
a1 <- subset(d, transicao == "Virou soja" & ano_origem == 1985)
q1 <- aggregate(area_ha ~ ano_destino, a1, sum)
q1$ha_m <- q1$area_ha / 1e6

png(file.path(saida, "q1_expansao_acumulada_1985.png"), width = 1600, height = 900, res = 150)
print(
  ggplot(q1, aes(x = ano_destino, y = ha_m)) +
    geom_col(fill = verde, width = 0.8) +
    scale_y_continuous(labels = function(x) paste0(x, " M")) +
    labs(x = "Ano de destino", y = "Milhões de hectares",
         title = "Soja brasileira que não existia em 1985",
         subtitle = "Área que virou soja entre 1985 e cada ano seguinte (Brasil) — cada coluna compara o ano de destino com o ponto de partida fixo em 1985",
         caption = "Fonte: MapBiomas classe 39 (soja), malhas 10 m — transicoes_long.csv.gz")
)
dev.off()

p90 <- sum(q1$area_ha[q1$ano_destino == 1990])
p25 <- sum(q1$area_ha[q1$ano_destino == 2025])
fm <- function(x) prettyNum(round(x), big.mark = ".", decimal.mark = ",", big.interval = 3)
cat(sprintf("Q1 · área que virou soja a partir de 1985 e era soja em 1990: %s ha\n", fm(p90)))
cat(sprintf("   ...em 2025: %s ha — a expansão acumulada ficou %.1fx maior em 40 anos\n",
            fm(p25), p25 / p90))
cat(sprintf("   soma de todas as janelas a partir de 1985 (com sobreposição, só para referência): %s ha\n\n",
            fm(sum(q1$area_ha))))

# ----------------------------------------------------------------------------
# Q2 — Sobrevivência: quanto da soja de cada época continuava soja depois?
coortes <- c(1985, 1992, 1999, 2006, 2013)
a2 <- subset(d, transicao != "Virou soja" & ano_origem %in% coortes)
b2 <- aggregate(area_ha ~ ano_origem + ano_destino + transicao, a2, sum)
w2 <- reshape(b2, idvar = c("ano_origem", "ano_destino"), timevar = "transicao",
              direction = "wide")
names(w2) <- gsub("area_ha\\.", "", names(w2))
w2$retencao <- w2$`Permaneceu soja` / (w2$`Permaneceu soja` + w2$`Deixou de ser soja`)
w2$k <- w2$ano_destino - w2$ano_origem

png(file.path(saida, "q2_sobrevivencia_coortes.png"), width = 1600, height = 900, res = 150)
print(
  ggplot(w2, aes(x = k, y = retencao, colour = factor(ano_origem), group = factor(ano_origem))) +
    geom_line(linewidth = 1.2) +
    scale_y_continuous(labels = percent) +
    scale_colour_brewer(palette = "Dark2", name = "coorte (ano de origem)") +
    labs(x = "Anos após a origem", y = "Fração da soja da origem que continuava soja",
         title = "Sobrevivência da soja por coorte de origem (Brasil)",
         subtitle = "Permaneceu ÷ (permaneceu + deixou) — soja da coorte que seguiu como soja em cada destino",
         caption = "Fonte: MapBiomas classe 39 — métrica par a par (origem × destino)")
)
dev.off()

ret10 <- tapply(w2$retencao[w2$k == 10], w2$ano_origem[w2$k == 10], identity)
cat("Q2 · retenção 10 anos após a origem (por coorte):\n")
for (co in names(ret10)) cat(sprintf("   %s: %.0f%%\n", co, 100 * ret10[[co]]))
cat("\n")

# ----------------------------------------------------------------------------
# Q3 — De onde vinham as áreas que viraram soja, antigamente e hoje?
a3 <- subset(d, transicao == "Virou soja" & ano_destino == 2025 &
               ano_origem %in% c(1985, 2015))
b3 <- aggregate(area_ha ~ ano_origem + classe_nome, a3, sum)
b3$janela <- ifelse(b3$ano_origem == 1985, "1985 → 2025 (40 anos)", "2015 → 2025 (10 anos)")
b3$share <- ave(b3$area_ha, b3$janela, FUN = function(x) x / sum(x))
top <- unique(b3$classe_nome[order(-b3$area_ha)][1:8])
b3$classe2 <- ifelse(b3$classe_nome %in% top, b3$classe_nome, "Outras")
b3b <- aggregate(share ~ janela + classe2, b3, sum)

png(file.path(saida, "q3_origem_do_virou.png"), width = 1600, height = 900, res = 150)
print(
  ggplot(b3b, aes(x = share, y = reorder(classe2, -share), fill = janela)) +
    geom_col(position = position_dodge(width = 0.7)) +
    scale_x_continuous(labels = percent) +
    scale_fill_manual(values = c(verde, ambar), name = "janela") +
    labs(x = "Participação nas áreas que viraram soja", y = NULL,
         title = "A origem da soja mudou?",
         subtitle = "Classe de uso antes de virar soja — destino 2025, partindo de 1985 vs. partindo de 2015 (Brasil)",
         caption = "Fonte: MapBiomas classe 39")
)
dev.off()

cat("Q3 · top-3 classes de origem por janela:\n")
for (j in unique(b3b$janela)) {
  jj <- b3b[b3b$janela == j, ]
  jj <- jj[order(-jj$share), ][1:3, ]
  cat(sprintf("   %s: %s\n", j,
      paste(sprintf("%s (%.0f%%)", jj$classe2, 100 * jj$share), collapse = ", ")))
}
cat("\n")

# ----------------------------------------------------------------------------
# Q4 — Estados: a expansão mudou de endereço? 1990→2005 vs 2010→2025
a4 <- subset(d, transicao == "Virou soja" &
               ((ano_origem == 1990 & ano_destino == 2005) |
                (ano_origem == 2010 & ano_destino == 2025)))
b4 <- aggregate(area_ha ~ uf + ano_origem + ano_destino, a4, sum)
b4$periodo <- ifelse(b4$ano_origem == 1990, "antigo", "recente")
w4 <- reshape(b4[, c("uf", "area_ha", "periodo")], idvar = "uf", timevar = "periodo",
              direction = "wide")
names(w4) <- gsub("area_ha\\.", "", names(w4))
w4$recente[is.na(w4$recente)] <- 0; w4$antigo[is.na(w4$antigo)] <- 0
w4 <- w4[order(-w4$recente), ][1:12, ]

png(file.path(saida, "q4_estados_dumbbell.png"), width = 1600, height = 1000, res = 150)
print(
  ggplot(w4, aes(x = antigo / 1e6, xend = recente / 1e6, y = reorder(uf, recente))) +
    geom_segment(linewidth = 2, colour = cinza, alpha = 0.7,
                 arrow = arrow(length = unit(8, "pt"), type = "closed")) +
    scale_x_continuous(labels = function(x) paste0(x, " M")) +
    labs(x = "Milhões de hectares que viraram soja", y = NULL,
         title = "A expansão mudou de endereço?",
         subtitle = "Da janela 1990→2005 para a janela 2010→2025 — 12 maiores estados na janela recente",
         caption = "Fonte: MapBiomas classe 39")
)
dev.off()

cat("Q4 · top-5 na janela 2010→2025 (vs 1990→2005):\n")
print(format(w4[1:5, c("uf", "antigo", "recente")], big.mark = ".", scientific = FALSE),
      row.names = FALSE)
cat("\nFiguras salvas em:", saida, "\n")
