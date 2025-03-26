//Função pra buscar o CDI atual pela API do BC.
document.addEventListener('DOMContentLoaded', function () {
    fetchCDIAtual();
});

function fetchCDIAtual() {
    const url = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados?formato=json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const ultimoCDI = data[data.length - 1];
            const valorCDI = parseFloat(ultimoCDI.valor);

            const cdiInput = document.getElementById('cdiAtual');
            if (cdiInput) {
                cdiInput.value = valorCDI.toFixed(2);
            }
            const cdiInput1 = document.getElementById('cdiAtual1');
            if (cdiInput1) {
                cdiInput1.value = valorCDI.toFixed(2);
            }
            const cdiInput2 = document.getElementById('cdiAtual2');
            if (cdiInput2) {
                cdiInput2.value = valorCDI.toFixed(2);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar CDI:', error);
        });
}

// Exibir a seção escolhida
function showSection(section) {
    document.getElementById("calcularSection").classList.add("hidden");
    document.getElementById("compararSection").classList.add("hidden");
    document.getElementById(section).classList.remove("hidden");
}

// Alternar entre taxa fixa e CDI
/*function toggleCDI(section, index = null) {
    let tipo;
    let cdiGroup;
    let taxaGroup;
    let rendimentoGroup;

    if (section === "calcular") {
        tipo = document.getElementById("tipoTaxa").value;
        cdiGroup = document.getElementById("cdiGroupCalcular");
        taxaGroup = document.getElementById("taxaGroupCalcular");
        rendimentoGroup = document.getElementById("rendimentoGroupCalcular");
        

    } else if (section === "comparar") {
        tipo = document.getElementById(`tipoTaxa${index}`).value;
        cdiGroup = document.getElementById(`cdiGroup${index}`);
        taxaGroup = document.getElementById(`taxaGroup${index}`);
        rendimentoGroup = document.getElementById(`rendimentoGroupCalcular${index}`);
    }
    cdiGroup.classList.toggle("hidden", tipo !== "cdi");
    taxaGroup.classList.toggle("hidden", tipo !== "fixa")
    rendimentoGroup.classList.toggle("hidden", tipo !== "cdi")
}*/
function toggleCDI(section, index = null) {
    let tipo, cdiGroup, taxaGroup, rendimentoGroup;

    if (section === "calcular") {
        tipo = document.getElementById("tipoTaxa").value;
        cdiGroup = document.getElementById("cdiGroupCalcular");
        taxaGroup = document.getElementById("taxaGroupCalcular");
        rendimentoGroup = document.getElementById("rendimentoGroupCalcular");
    } else if (section === "comparar") {
        tipo = document.getElementById(`tipoTaxa${index}`).value;
        cdiGroup = document.getElementById(`cdiGroup${index}`);
        taxaGroup = document.getElementById(`taxaGroup${index}`);
        rendimentoGroup = document.getElementById(`rendimentoGroupCalcular${index}`);
    }

    cdiGroup.classList.toggle("hidden", tipo !== "cdi");
    taxaGroup.classList.toggle("hidden", tipo !== "fixa")
    rendimentoGroup.classList.toggle("hidden", tipo !== "cdi")

    // Habilitar/desabilitar campos conforme o tipo
    if (tipo === "cdi") {
        if (section === "calcular") {
            document.getElementById("percentualRendimento").disabled = false;
        } else {
            document.getElementById(`percentualRendimento${index}`).disabled = false;
        }
    }
}

// Calcular Rentabilidade
/*function calcularRentabilidade() {
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
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <p><strong>Montante Bruto:</strong> R$ ${data.montante_bruto.toFixed(2)}</p>
                    <p><strong>Lucro Bruto:</strong> R$ ${data.lucro_bruto.toFixed(2)}</p>
                    <p><strong>Imposto de Renda:</strong> R$ ${data.ir.toFixed(2)}</p>
                    <p><strong>Montante Líquido:</strong> R$ ${data.montante_liquido.toFixed(2)}</p>
                </div>
            </div>
        `;
        // Show the modal
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        resultModal.show();
    })
    .catch(error => {
        console.error("Erro ao calcular rentabilidade:", error);
    });
}*/
function calcularRentabilidade() {
    let valorInvestido = parseFloat(document.getElementById("valorInvestido").value);
    let tipoTaxa = document.getElementById("tipoTaxa").value;
    let taxa;
    let cdiAtual = tipoTaxa === "cdi" ? parseFloat(document.getElementById("cdiAtual").value) : null;
    let tempo = parseFloat(document.getElementById("tempo").value);
    let incidenciaIR = parseFloat(document.getElementById("ir").value);

    // Cálculo do rendimento real quando for CDI
    if (tipoTaxa === "cdi") {
        let percentualRendimento = parseFloat(document.getElementById("percentualRendimento").value);
        taxa = cdiAtual * (percentualRendimento / 100); // Calcula o percentual real sobre o CDI
    } else {
        taxa = parseFloat(document.getElementById("taxa").value);
    }

    fetch("http://127.0.0.1:5000/calcular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            valor: valorInvestido, 
            taxa: taxa,
            cdi: cdiAtual, 
            tempo: tempo, 
            ir: incidenciaIR 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Dados para o modal:", data);
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <p><strong>Montante Bruto:</strong> R$ ${data.montante_bruto.toFixed(2)}</p>
                    <p><strong>Lucro Bruto:</strong> R$ ${data.lucro_bruto.toFixed(2)}</p>
                    <p><strong>Imposto de Renda:</strong> R$ ${data.ir.toFixed(2)}</p>
                    <p><strong>Montante Líquido:</strong> R$ ${data.montante_liquido.toFixed(2)}</p>
                </div>
            </div>
        `;
        
        // Modificação importante aqui:
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        resultModal.show();
    })
    .catch(error => {
        console.error("Erro completo:", error);
        // Mostra o erro no modal mesmo com falha
        const modalBody = document.getElementById("modalBody");
        modalBody.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`;
        const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
        resultModal.show();
    });
}

// Comparar Rentabilidade
function compararRentabilidade() {
    let investimentos = [];

    for (let i = 1; i <= 2; i++) {
        let tipoTaxa = document.getElementById(`tipoTaxa${i}`).value;
        let taxa;
        let cdiAtual = tipoTaxa === "cdi" ? parseFloat(document.getElementById(`cdiAtual${i}`).value) : null;

        // Cálculo do rendimento real quando for CDI
        if (tipoTaxa === "cdi") {
            let percentualRendimento = parseFloat(document.getElementById(`percentualRendimento${i}`).value);
            taxa = cdiAtual * (percentualRendimento / 100);
        } else {
            taxa = parseFloat(document.getElementById(`taxa${i}`).value);
        }

        investimentos.push({
            valor: parseFloat(document.getElementById(`valor${i}`).value),
            taxa: taxa,  // Já inclui o cálculo do percentual sobre o CDI
            cdi: cdiAtual,
            tempo: parseFloat(document.getElementById(`tempo${i}`).value),
            ir: parseFloat(document.getElementById(`ir${i}`).value)
        });

        fetch("http://127.0.0.1:5000/comparar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ investimentos })
        })
            .then(response => response.json())
            .then(data => {
                let resultado = `<div class="row">`;
                data.resultados.forEach((invest, index) => {
                    resultado += `
                <div class="col-md-6">
                    <h4>Investimento ${index + 1}</h4>
                    <p><strong>Montante Bruto:</strong> R$ ${invest.montante_bruto.toFixed(2)}</p>
                    <p><strong>Lucro Bruto:</strong> R$ ${invest.lucro_bruto.toFixed(2)}</p>
                    <p><strong>Imposto de Renda:</strong> R$ ${invest.ir.toFixed(2)}</p>
                    <p><strong>Montante Líquido:</strong> R$ ${invest.montante_liquido.toFixed(2)}</p>
                </div>
            `;
                });
                resultado += `</div>`;
                const modalBody = document.getElementById("modalBody");
                modalBody.innerHTML = resultado;
                // Show the modal
                const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
                resultModal.show();
            })
            .catch(error => {
                console.error("Erro ao comparar rentabilidades:", error);
            });
    }
}

// Event listeners para alternar entre as seções
document.getElementById("btnCalcular").addEventListener("click", function () {
    showSection("calcularSection");
});

document.getElementById("btnComparar").addEventListener("click", function () {
    showSection("compararSection");
});