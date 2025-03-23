// Exibir a seção escolhida
function showSection(section) {
    document.getElementById("calcularSection").classList.add("hidden");
    document.getElementById("compararSection").classList.add("hidden");
    document.getElementById(section).classList.remove("hidden");
}

// Alternar entre taxa fixa e CDI
function toggleCDI(section, index = null) {
    let tipo;
    let cdiGroup;

    if (section === "calcular") {
        tipo = document.getElementById("tipoTaxa").value;
        cdiGroup = document.getElementById("cdiGroupCalcular");
    } else if (section === "comparar") {
        tipo = document.getElementById(`tipoTaxa${index}`).value;
        cdiGroup = document.getElementById(`cdiGroup${index}`);
    }

    cdiGroup.classList.toggle("hidden", tipo !== "cdi");
}

// Calcular Rentabilidade
function calcularRentabilidade() {
    let valorInvestido = parseFloat(document.getElementById("valorInvestido").value);
    let tipoTaxa = document.getElementById("tipoTaxa").value;
    let taxa = parseFloat(document.getElementById("taxa").value);
    let cdiAtual = tipoTaxa === "cdi" ? parseFloat(document.getElementById("cdiAtual").value) : null;
    let tempo = parseFloat(document.getElementById("tempo").value);
    let incidenciaIR = parseFloat(document.getElementById("ir").value);

    fetch("http://127.0.0.1:5000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor: valorInvestido, taxa: taxa, cdi: cdiAtual, tempo: tempo, ir: incidenciaIR })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("resultadoCalculo").innerHTML = `
            <p><strong>Montante Bruto:</strong> R$ ${data.montante_bruto.toFixed(2)}</p>
            <p><strong>Lucro Bruto:</strong> R$ ${data.lucro_bruto.toFixed(2)}</p>
            <p><strong>Imposto de Renda:</strong> R$ ${data.ir.toFixed(2)}</p>
            <p><strong>Montante Líquido:</strong> R$ ${data.montante_liquido.toFixed(2)}</p>
        `;
        document.getElementById("resultadoCalculo").classList.remove("hidden");
    })
    .catch(error => {
        console.error("Erro ao calcular rentabilidade:", error);
    });
}

// Comparar Rentabilidade
function compararRentabilidade() {
    let investimentos = [];

    for (let i = 1; i <= 2; i++) {
        let tipoTaxa = document.getElementById(`tipoTaxa${i}`).value;
        let taxa = parseFloat(document.getElementById(`taxa${i}`).value);
        let cdiAtual = tipoTaxa === "cdi" ? parseFloat(document.getElementById(`cdiAtual${i}`).value) : null;

        investimentos.push({
            valor: parseFloat(document.getElementById(`valor${i}`).value),
            taxa: taxa,
            cdi: cdiAtual,
            tempo: parseFloat(document.getElementById(`tempo${i}`).value),
            ir: parseFloat(document.getElementById(`ir${i}`).value)
        });
    }

    fetch("http://127.0.0.1:5000/comparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investimentos })
    })
    .then(response => response.json())
    .then(data => {
        let resultado = "<h3>Resultados:</h3>";
        data.resultados.forEach((invest, index) => {
            resultado += `
                <p><strong>Investimento ${index + 1}:</strong></p>
                <p>Montante Bruto: R$ ${invest.montante_bruto.toFixed(2)}</p>
                <p>Lucro Bruto: R$ ${invest.lucro_bruto.toFixed(2)}</p>
                <p>Imposto de Renda: R$ ${invest.ir.toFixed(2)}</p>
                <p>Montante Líquido: R$ ${invest.montante_liquido.toFixed(2)}</p>
                <hr>
            `;
        });
        document.getElementById("resultadoComparacao").innerHTML = resultado;
        document.getElementById("resultadoComparacao").classList.remove("hidden");
    })
    .catch(error => {
        console.error("Erro ao comparar rentabilidades:", error);
    });
}

// Event listeners para alternar entre as seções
document.getElementById("btnCalcular").addEventListener("click", function() {
    showSection("calcularSection");
});

document.getElementById("btnComparar").addEventListener("click", function() {
    showSection("compararSection");
});