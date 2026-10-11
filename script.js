
document.addEventListener("DOMContentLoaded", function () {
    const temperatureInput = document.getElementById("temperature");
    const humiditeInput = document.getElementById("humidite");
    const temperatureRange = document.getElementById("temperature-range");
    const humiditeRange = document.getElementById("humidite-range");
    const evaluerButton = document.getElementById("evaluer");
    const reinitialiserButton = document.getElementById("reinitialiser");
    const messageErreur = document.getElementById("message-erreur");

    // Fonctions d'appartenance : température
    function temperatureFroide(t) {
        if (t <= 10) return 1;
        if (t >= 20) return 0;
        return (20 - t) / 10;
    }

    function temperatureModeree(t) {
        if (t <= 15 || t >= 30) return 0;
        if (t <= 22.5) return (t - 15) / 7.5;
        return (30 - t) / 7.5;
    }

    function temperatureChaude(t) {
        if (t <= 25) return 0;
        if (t >= 35) return 1;
        return (t - 25) / 10;
    }

    // Fonctions d'appartenance : humidité
    function humiditeFaible(h) {
        if (h <= 20) return 1;
        if (h >= 40) return 0;
        return (40 - h) / 20;
    }

    function humiditeMoyenne(h) {
        if (h <= 30 || h >= 70) return 0;
        if (h <= 50) return (h - 30) / 20;
        return (70 - h) / 20;
    }

    function humiditeElevee(h) {
        if (h <= 60) return 0;
        if (h >= 80) return 1;
        return (h - 60) / 20;
    }

    // Affichage des degrés et des barres
    function afficherGroupe(valeurs) {
        Object.entries(valeurs).forEach(function ([nom, valeur]) {
            const valeurElement = document.getElementById(nom + "-value");
            const barreElement = document.getElementById(nom + "-bar");
            const degre = Math.max(0, Math.min(1, valeur));

            if (valeurElement) {
                valeurElement.textContent = degre.toFixed(2);
            }

            if (barreElement) {
                barreElement.style.width = (degre * 100) + "%";
            }
        });
    }

    // Base de règles : R1 à R9
    function appliquerRegles(tf, tm, tc, hf, hm, he) {
        // R1 : Froide ET Faible => Mauvais
        const R1 = Math.min(tf, hf);

        // R2 : Froide ET Moyenne => Mauvais
        const R2 = Math.min(tf, hm);

        // R3 : Froide ET Élevée => Mauvais
        const R3 = Math.min(tf, he);

        // R4 : Modérée ET Faible => Moyen
        const R4 = Math.min(tm, hf);

        // R5 : Modérée ET Moyenne => Bon
        const R5 = Math.min(tm, hm);

        // R6 : Modérée ET Élevée => Moyen
        const R6 = Math.min(tm, he);

        // R7 : Chaude ET Faible => Mauvais
        const R7 = Math.min(tc, hf);

        // R8 : Chaude ET Moyenne => Mauvais
        const R8 = Math.min(tc, hm);

        // R9 : Chaude ET Élevée => Mauvais
        const R9 = Math.min(tc, he);

        // Agrégation par le maximum
        return {
            mauvais: Math.max(R1, R2, R3, R7, R8, R9),
            moyen: Math.max(R4, R6),
            bon: R5
        };
    }

    // Calcul d'un score indicatif sur 100
    function calculerScore(mauvais, moyen, bon) {
        const somme = mauvais + moyen + bon;

        if (somme === 0) return 0;

        return Math.round(
            (mauvais * 20 + moyen * 50 + bon * 100) / somme
        );
    }

    // Affichage du score
    function afficherScore(score) {
        let couleur;
        let libelle;
        let description;

        if (score < 40) {
            couleur = "#d66b70";
            libelle = "Confort faible";
            description =
                "Les conditions évaluées sont peu favorables au confort thermique.";
        } else if (score < 75) {
            couleur = "#d7a345";
            libelle = "Confort moyen";
            description =
                "Les conditions restent intermédiaires et peuvent être améliorées.";
        } else {
            couleur = "#328566";
            libelle = "Confort élevé";
            description =
                "Les conditions évaluées sont favorables selon les règles du système.";
        }

        const cercle = document.getElementById("score-circle");
        const progression = document.getElementById("score-progress");
        const scoreElement = document.getElementById("score");
        const label = document.getElementById("comfort-label");
        const descriptionElement = document.getElementById("result-description");

        if (cercle) {
            const angle = score * 3.6;
            cercle.style.background =
                "conic-gradient(" + couleur + " " + angle + "deg, #edf1f2 " + angle + "deg)";
        }

        if (scoreElement) scoreElement.textContent = score;

        if (label) {
            label.textContent = libelle;
            label.style.color = couleur;
        }

        if (descriptionElement) {
            descriptionElement.textContent = description;
        }

        if (progression) {
            progression.style.width = score + "%";
            progression.style.background = couleur;
        }
    }

    // Recommandation et texte sous la maison
    function afficherRecommandation(t, h, score) {
        const carte = document.getElementById("advice-card");
        const icone = document.getElementById("advice-icon");
        const titre = document.getElementById("advice-title");
        const texte = document.getElementById("advice");
        const maisonTitre = document.getElementById("house-title");
        const maisonMessage = document.getElementById("house-message");

        carte.classList.remove("warning", "danger");

        if (t < 18) {
            carte.classList.add("warning");
            icone.textContent = "❄";
            titre.textContent = "Température basse";
            texte.textContent =
                "La température est fraîche. Une augmentation modérée du chauffage peut améliorer le confort.";
            maisonTitre.textContent = "Une ambiance plus chaleureuse";
            maisonMessage.textContent =
                "Une température adaptée contribue à une sensation de confort intérieur.";
        } else if (t > 28) {
            carte.classList.add("danger");
            icone.textContent = "☀";
            titre.textContent = "Température élevée";
            texte.textContent =
                "Aérez la pièce si possible et utilisez une protection solaire pour limiter la chaleur.";
            maisonTitre.textContent = "Un intérieur plus frais";
            maisonMessage.textContent =
                "La maîtrise de la chaleur peut rendre l'espace intérieur plus agréable.";
        } else if (h > 65) {
            carte.classList.add("warning");
            icone.textContent = "≈";
            titre.textContent = "Humidité élevée";
            texte.textContent =
                "Une ventilation adaptée peut aider à renouveler l'air et à réduire l'excès d'humidité.";
            maisonTitre.textContent = "Un air mieux équilibré";
            maisonMessage.textContent =
                "Une humidité maîtrisée participe à la qualité de l'environnement intérieur.";
        } else if (h < 30) {
            carte.classList.add("warning");
            icone.textContent = "♧";
            titre.textContent = "Air relativement sec";
            texte.textContent =
                "L'humidité est faible. Surveillez les conditions intérieures et adaptez-les à vos besoins.";
            maisonTitre.textContent = "Un environnement équilibré";
            maisonMessage.textContent =
                "La température et l'humidité contribuent ensemble à la sensation de confort.";
        } else if (score >= 75) {
            icone.textContent = "✓";
            titre.textContent = "Conditions favorables";
            texte.textContent =
                "Les conditions sont favorables selon les règles du modèle. Maintenez-les si possible.";
            maisonTitre.textContent = "Un environnement confortable";
            maisonMessage.textContent =
                "Les paramètres évalués correspondent à un niveau de confort élevé dans ce modèle.";
        } else {
            carte.classList.add("warning");
            icone.textContent = "✦";
            titre.textContent = "Confort à améliorer";
            texte.textContent =
                "Les conditions sont intermédiaires. Ajustez progressivement la température ou l'humidité.";
            maisonTitre.textContent = "Un cadre de vie à optimiser";
            maisonMessage.textContent =
                "De petits ajustements peuvent améliorer les conditions de confort.";
        }
    }

    // Évaluation principale
    function evaluerConfort() {
        const valeurT = temperatureInput.value.trim();
        const valeurH = humiditeInput.value.trim();

        if (valeurT === "" || valeurH === "") {
            messageErreur.textContent = "Veuillez remplir les deux champs.";
            return;
        }

        const t = Number(valeurT);
        const h = Number(valeurH);

        if (!Number.isFinite(t) || t < 0 || t > 45) {
            messageErreur.textContent =
                "La température doit être comprise entre 0 et 45 °C.";
            return;
        }

        if (!Number.isFinite(h) || h < 0 || h > 100) {
            messageErreur.textContent =
                "L'humidité doit être comprise entre 0 et 100 %.";
            return;
        }

        messageErreur.textContent = "";

        // Synchronisation des curseurs
        temperatureRange.value = t;
        humiditeRange.value = h;

        // Fuzzification
        const tf = temperatureFroide(t);
        const tm = temperatureModeree(t);
        const tc = temperatureChaude(t);

        const hf = humiditeFaible(h);
        const hm = humiditeMoyenne(h);
        const he = humiditeElevee(h);

        afficherGroupe({
            froide: tf,
            moderee: tm,
            chaude: tc,
            faible: hf,
            moyenne: hm,
            elevee: he
        });

        // Inférence floue selon les neuf règles
        const resultat = appliquerRegles(tf, tm, tc, hf, hm, he);

        afficherGroupe(resultat);

        // Score et recommandation
        const score = calculerScore(
            resultat.mauvais,
            resultat.moyen,
            resultat.bon
        );

        afficherScore(score);
        afficherRecommandation(t, h, score);
    }

    // Bouton d'évaluation
    evaluerButton.addEventListener("click", evaluerConfort);

    // Mise à jour en temps réel avec les curseurs
    temperatureRange.addEventListener("input", function () {
        temperatureInput.value = temperatureRange.value;
        evaluerConfort();
    });

    humiditeRange.addEventListener("input", function () {
        humiditeInput.value = humiditeRange.value;
        evaluerConfort();
    });

    // Mise à jour lorsque l'utilisateur saisit un nombre
    temperatureInput.addEventListener("input", function () {
        const t = Number(temperatureInput.value);

        if (
            temperatureInput.value.trim() !== "" &&
            Number.isFinite(t) && t >= 0 && t <= 45
        ) {
            temperatureRange.value = t;
            evaluerConfort();
        }
    });

    humiditeInput.addEventListener("input", function () {
        const h = Number(humiditeInput.value);

        if (
            humiditeInput.value.trim() !== "" &&
            Number.isFinite(h) && h >= 0 && h <= 100
        ) {
            humiditeRange.value = h;
            evaluerConfort();
        }
    });

    // Bouton de réinitialisation
    reinitialiserButton.addEventListener("click", function () {
        temperatureInput.value = 25;
        temperatureRange.value = 25;

        humiditeInput.value = 50;
        humiditeRange.value = 50;

        messageErreur.textContent = "";
        evaluerConfort();
    });

    // Première évaluation
    evaluerConfort();
});