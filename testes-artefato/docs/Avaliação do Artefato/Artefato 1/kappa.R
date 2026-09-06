library(irr)

# Ler o CSV
dados <- read.csv("disciplinas.csv", encoding = "UTF-8")
names(dados) <- c("oficial", "ia")

# 1. Kappa geral
cat("========== KAPPA GERAL ==========\n")
kappa_geral <- kappa2(dados[, c("oficial", "ia")])
print(kappa_geral)
