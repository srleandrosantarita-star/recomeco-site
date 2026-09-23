// ---------- Utilidades ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function carregar(chave, padrao) {
  try {
    const v = localStorage.getItem("recomeco_" + chave);
    return v ? JSON.parse(v) : padrao;
  } catch { return padrao; }
}
function salvar(chave, valor) {
  try { localStorage.setItem("recomeco_" + chave, JSON.stringify(valor)); } catch {}
}
function esc(txt) {
  return String(txt ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ---------- Navegação ----------
function mostrarPagina() {
  const alvo = (location.hash || "#inicio").slice(1);
  const pagina = document.getElementById(alvo) || document.getElementById("inicio");
  if (pagina.id !== "respirar" && typeof pararRespiracao === "function") pararRespiracao();
  $$(".pagina").forEach(p => p.classList.toggle("visivel", p === pagina));
  $$("nav a").forEach(a => a.classList.toggle("ativo", a.getAttribute("href") === "#" + pagina.id));
  $("#menu").classList.remove("aberto");
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", mostrarPagina);
$("#menuBtn").addEventListener("click", () => $("#menu").classList.toggle("aberto"));

// ---------- Frases ----------
const frases = [
  "Você não precisa ver a escada inteira. Apenas dê o primeiro passo. — Martin Luther King Jr.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia. — Robert Collier",
  "Comece onde você está. Use o que você tem. Faça o que você pode. — Arthur Ashe",
  "Não é sobre ter tempo, é sobre fazer tempo.",
  "Cada dia é uma nova chance de mudar a sua vida.",
  "A persistência realiza o impossível. — Provérbio chinês",
  "Seja gentil consigo mesmo. Você está fazendo o melhor que pode.",
  "Feito é melhor que perfeito.",
  "Grandes coisas nunca vêm de zonas de conforto.",
  "Tudo o que um sonho precisa para ser realizado é alguém que acredite que ele possa ser realizado. — Roberto Shinyashiki",
  "A jornada de mil quilômetros começa com um único passo. — Lao Tsé",
  "Não deixe o que você não pode fazer interferir no que você pode fazer. — John Wooden",
  "Você é mais forte do que pensa e mais capaz do que imagina.",
  "O fracasso é apenas a oportunidade de recomeçar de novo, com mais inteligência. — Henry Ford",
  "Cuide do seu corpo. É o único lugar que você tem para viver. — Jim Rohn",
  "Pequenos progressos ainda são progresso.",
  "Você não precisa ser perfeito, precisa ser constante.",
  "A mudança começa no momento em que você decide tentar.",
  "Confie no processo. Toda grande jornada tem dias difíceis.",
  "O que importa não é de onde você veio, é para onde você está indo.",
  "Descanse se precisar, mas não desista.",
  "Aprenda com o ontem, viva o hoje, tenha esperança para amanhã. — Albert Einstein",
  "Acredite que você pode e você já está no meio do caminho. — Theodore Roosevelt",
  "Não espere motivação para começar. Comece, e a motivação vem depois.",
];
let fraseAtual = Math.floor(Math.random() * frases.length);
let fraseIntervalo = null;
function mostrarFrase() {
  const el = $("#frase");
  el.classList.remove("frase-anim");
  void el.offsetWidth; // força o navegador a reiniciar a animação
  el.textContent = "“" + frases[fraseAtual] + "”";
  el.classList.add("frase-anim");
}
function avancarFrase() {
  fraseAtual = (fraseAtual + 1) % frases.length;
  mostrarFrase();
}
function reiniciarTrocaAutomatica() {
  clearInterval(fraseIntervalo);
  fraseIntervalo = setInterval(avancarFrase, 7000);
}
$("#novaFrase").addEventListener("click", () => {
  fraseAtual = (fraseAtual + 1 + Math.floor(Math.random() * (frases.length - 1))) % frases.length;
  mostrarFrase();
  reiniciarTrocaAutomatica();
});
reiniciarTrocaAutomatica();

// ---------- Currículo ----------
const cvForm = $("#cvForm");
let cv = carregar("cv", { experiencia: [], formacao: [] });

const camposLista = {
  experiencia: [
    ["cargo", "Cargo"], ["empresa", "Empresa"],
    ["inicio", "Início (ex.: 03/2021)"], ["fim", "Fim (ou Atual)"],
    ["descricao", "O que você fez e conquistou", true],
  ],
  formacao: [
    ["curso", "Curso"], ["instituicao", "Instituição"],
    ["inicio", "Início"], ["fim", "Conclusão (ou Cursando)"],
  ],
};

function desenharListas() {
  for (const tipo of Object.keys(camposLista)) {
    const alvo = tipo === "experiencia" ? $("#listaExperiencia") : $("#listaFormacao");
    alvo.innerHTML = (cv[tipo] || []).map((item, i) => `
      <div class="item-bloco">
        <button type="button" class="btn-mini" data-remover="${tipo}" data-i="${i}" title="Remover">✕</button>
        ${campoHtml(tipo, i, item, 0)}${campoHtml(tipo, i, item, 1)}
        <div class="duas">${campoHtml(tipo, i, item, 2)}${campoHtml(tipo, i, item, 3)}</div>
        ${camposLista[tipo][4] ? campoHtml(tipo, i, item, 4) : ""}
      </div>`).join("");
  }
}
function campoHtml(tipo, i, item, n) {
  const [nome, rotulo, area] = camposLista[tipo][n];
  const val = esc(item[nome]);
  const attrs = `data-tipo="${tipo}" data-i="${i}" data-campo="${nome}"`;
  return area
    ? `<label>${rotulo}<textarea rows="3" ${attrs}>${val}</textarea></label>`
    : `<label>${rotulo}<input ${attrs} value="${val}"></label>`;
}

function lerFormulario() {
  const dados = Object.fromEntries(new FormData(cvForm));
  Object.assign(cv, dados);
}
function preencherFormulario() {
  for (const el of cvForm.elements) {
    if (el.name && cv[el.name] !== undefined) el.value = cv[el.name];
  }
  desenharListas();
}

function listaVirgula(txt) { return (txt || "").split(",").map(s => s.trim()).filter(Boolean); }

function desenharCv() {
  const p = $("#cvPreview");
  const cor = cv.cor || "#1f6f5c";
  p.style.setProperty("--cor", cor);
  p.className = "cv " + (cv.modelo === "moderno" ? "moderno" : "classico");

  const temAlgo = cv.nome || cv.cargo || cv.resumo || (cv.experiencia || []).length;
  if (!temAlgo) {
    p.innerHTML = `<p class="vazio">Comece a preencher o formulário.<br>A prévia do seu currículo aparece aqui.</p>`;
    return;
  }

  const contato = [cv.email, cv.telefone, cv.cidade, cv.link].filter(Boolean).map(c => `<span>${esc(c)}</span>`).join("");
  const cabecalho = `
    <h1>${esc(cv.nome || "Seu Nome")}</h1>
    ${cv.cargo ? `<div class="cv-cargo">${esc(cv.cargo)}</div>` : ""}
    ${contato ? `<div class="cv-contato">${contato}</div>` : ""}`;

  const resumo = cv.resumo ? `<h3>Resumo</h3><p style="margin:0;white-space:pre-line">${esc(cv.resumo)}</p>` : "";

  const exp = (cv.experiencia || []).filter(e => e.cargo || e.empresa);
  const experiencia = exp.length ? `<h3>Experiência</h3>` + exp.map(e => `
    <div class="cv-item">
      <div class="cv-item-topo"><span>${esc(e.cargo)}</span><span>${esc([e.inicio, e.fim].filter(Boolean).join(" – "))}</span></div>
      <div class="cv-item-sub">${esc(e.empresa)}</div>
      ${e.descricao ? `<p>${esc(e.descricao)}</p>` : ""}
    </div>`).join("") : "";

  const form = (cv.formacao || []).filter(f => f.curso || f.instituicao);
  const formacao = form.length ? `<h3>Formação</h3>` + form.map(f => `
    <div class="cv-item">
      <div class="cv-item-topo"><span>${esc(f.curso)}</span><span>${esc([f.inicio, f.fim].filter(Boolean).join(" – "))}</span></div>
      <div class="cv-item-sub">${esc(f.instituicao)}</div>
    </div>`).join("") : "";

  const hab = listaVirgula(cv.habilidades);
  const habilidades = hab.length ? `<h3>Habilidades</h3><div class="tags">${hab.map(h => `<span>${esc(h)}</span>`).join("")}</div>` : "";
  const idi = listaVirgula(cv.idiomas);
  const idiomas = idi.length ? `<h3>Idiomas</h3><ul>${idi.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : "";
  const cur = (cv.cursos || "").split("\n").map(s => s.trim()).filter(Boolean);
  const cursos = cur.length ? `<h3>Cursos e Certificações</h3><ul>${cur.map(h => `<li>${esc(h)}</li>`).join("")}</ul>` : "";

  if (cv.modelo === "moderno") {
    p.innerHTML = `
      <div class="lateral">${cabecalho}${habilidades}${idiomas}</div>
      <div class="principal">${resumo}${experiencia}${formacao}${cursos}</div>`;
  } else {
    p.innerHTML = cabecalho + resumo + experiencia + formacao + habilidades + idiomas + cursos;
  }
}

function atualizarCv() { lerFormulario(); salvar("cv", cv); desenharCv(); if (typeof desenharCarta === "function") desenharCarta(); }

cvForm.addEventListener("input", e => {
  const el = e.target;
  if (el.dataset.tipo) {
    cv[el.dataset.tipo][el.dataset.i][el.dataset.campo] = el.value;
  }
  atualizarCv();
});
cvForm.addEventListener("click", e => {
  const add = e.target.dataset.add;
  const rem = e.target.dataset.remover;
  if (add) {
    cv[add] = cv[add] || [];
    cv[add].push({});
    desenharListas();
    atualizarCv();
  } else if (rem) {
    cv[rem].splice(Number(e.target.dataset.i), 1);
    desenharListas();
    atualizarCv();
  }
});
function imprimirSecao(idSecao, tituloDoc) {
  const secao = document.getElementById(idSecao);
  const nomeAntigo = document.title;
  document.title = tituloDoc;
  secao.classList.add("imprimir-ativo");
  window.print();
  secao.classList.remove("imprimir-ativo");
  document.title = nomeAntigo;
}
$("#baixarPdf").addEventListener("click", () => {
  imprimirSecao("curriculo", "Curriculo - " + (cv.nome || "Meu Nome"));
});
$("#limparCv").addEventListener("click", () => {
  if (!confirm("Apagar todos os dados do currículo?")) return;
  cv = { experiencia: [], formacao: [], modelo: "classico", cor: "#1f6f5c" };
  cvForm.reset();
  preencherFormulario();
  atualizarCv();
});
$("#exemploCv").addEventListener("click", () => {
  if ((cv.nome || (cv.experiencia || []).length) && !confirm("Substituir seus dados pelo exemplo?")) return;
  cv = {
    nome: "Maria da Silva", cargo: "Assistente Administrativo",
    email: "maria.silva@email.com", telefone: "(11) 98765-4321",
    cidade: "São Paulo - SP", link: "linkedin.com/in/mariasilva",
    resumo: "Profissional organizada, com 4 anos de experiência em rotinas administrativas e atendimento ao cliente. Busco contribuir com agilidade e foco em resultados.",
    experiencia: [
      { cargo: "Auxiliar Administrativo", empresa: "Comercial Horizonte Ltda.", inicio: "02/2022", fim: "Atual",
        descricao: "Organizei o arquivo digital da empresa, reduzindo em 30% o tempo de busca de documentos.\nAtendi em média 40 clientes por dia por telefone e e-mail." },
      { cargo: "Recepcionista", empresa: "Clínica Bem Viver", inicio: "03/2020", fim: "01/2022",
        descricao: "Controlei a agenda de 5 médicos e fiz o cadastro de pacientes." },
    ],
    formacao: [
      { curso: "Tecnólogo em Gestão de Recursos Humanos", instituicao: "Faculdade Exemplo", inicio: "2023", fim: "Cursando" },
      { curso: "Ensino Médio", instituicao: "E.E. Prof. João Santos", inicio: "2016", fim: "2018" },
    ],
    habilidades: "Pacote Office, Excel intermediário, Atendimento ao cliente, Organização, Comunicação",
    idiomas: "Português nativo, Inglês básico",
    cursos: "Excel Avançado - SENAC (2023)\nAtendimento de Excelência - SEBRAE (2021)",
    modelo: cv.modelo || "classico", cor: cv.cor || "#1f6f5c",
  };
  preencherFormulario();
  atualizarCv();
});

// ---------- Carta de Apresentação ----------
const cartaForm = $("#cartaForm");
let carta = carregar("carta", {});

function preencherCartaFormulario() {
  for (const el of cartaForm.elements) {
    if (el.name && carta[el.name] !== undefined) el.value = carta[el.name];
  }
}
function dataPorExtenso() {
  return new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
function desenharCarta() {
  const p = $("#cartaPreview");
  p.className = "cv carta-doc " + (cv.modelo === "moderno" ? "" : "classico");
  p.style.setProperty("--cor", cv.cor || "#1f6f5c");

  if (!carta.nome && !carta.corpo && !carta.cargo) {
    p.innerHTML = `<p class="vazio">Preencha o formulário ou clique em "Gerar sugestão".<br>A prévia da sua carta aparece aqui.</p>`;
    return;
  }
  const assunto = [carta.cargo && `Candidatura à vaga de ${esc(carta.cargo)}`, carta.empresa && `na ${esc(carta.empresa)}`].filter(Boolean).join(" ");
  p.innerHTML = `
    <div class="carta-data">${esc(cv.cidade ? cv.cidade.split("-")[0].trim() : "")}${cv.cidade ? ", " : ""}${dataPorExtenso()}</div>
    ${carta.contato ? `<p>${esc(carta.contato)}</p>` : ""}
    ${assunto ? `<p class="carta-assunto">${assunto}</p>` : ""}
    <p>Prezados(as),</p>
    <div class="carta-corpo">${esc(carta.corpo)}</div>
    <div class="carta-assinatura">Atenciosamente,<br><strong>${esc(carta.nome)}</strong></div>`;
}
function atualizarCarta() { Object.assign(carta, Object.fromEntries(new FormData(cartaForm))); salvar("carta", carta); desenharCarta(); }

cartaForm.addEventListener("input", atualizarCarta);
$("#baixarCartaPdf").addEventListener("click", () => {
  imprimirSecao("carta", "Carta de Apresentacao - " + (carta.nome || "Meu Nome"));
});
$("#limparCarta").addEventListener("click", () => {
  if (!confirm("Apagar todos os dados da carta?")) return;
  carta = {};
  cartaForm.reset();
  atualizarCarta();
});
$("#gerarSugestaoCarta").addEventListener("click", () => {
  if (carta.corpo && !confirm("Substituir o texto atual pela sugestão?")) return;
  const nome = cv.nome || carta.nome || "";
  const cargo = cv.cargo || carta.cargo || "";
  const empresa = carta.empresa || "";
  const habilidades = listaVirgula(cv.habilidades).slice(0, 4).join(", ");
  const partes = [
    `Meu nome é ${nome || "[seu nome]"} e tenho grande interesse na vaga de ${cargo || "[cargo]"}${empresa ? " na " + empresa : ""}.`,
    cv.resumo ? cv.resumo : "Sou uma pessoa dedicada, organizada e sempre disposta a aprender.",
    habilidades ? `Entre minhas principais qualificações estão: ${habilidades}.` : "",
    "Acredito que minha experiência e minha vontade de crescer podem contribuir com a equipe.",
    "Fico à disposição para conversarmos e agradeço desde já a atenção.",
  ].filter(Boolean);
  carta.nome = nome; carta.cargo = cargo;
  cartaForm.elements.nome.value = nome;
  cartaForm.elements.cargo.value = cargo;
  cartaForm.elements.corpo.value = partes.join("\n\n");
  atualizarCarta();
});

// ---------- Metas ----------
let metas = carregar("metas", []);
function desenharMetas() {
  const alvo = $("#listaMetas");
  if (!metas.length) { alvo.innerHTML = `<p class="vazio-lista">Nenhuma meta ainda. Que tal começar por uma pequena?</p>`; return; }
  alvo.innerHTML = metas.map(m => {
    const total = m.passos.length;
    const feitos = m.passos.filter(p => p.feito).length;
    const pct = total ? Math.round((feitos / total) * 100) : 0;
    const prazo = m.prazo ? new Date(m.prazo + "T00:00").toLocaleDateString("pt-BR") : "";
    return `
      <div class="cartao" data-meta="${m.id}">
        <div class="meta-topo">
          <h3>${pct === 100 && total ? "🏆 " : ""}${esc(m.titulo)}</h3>
          <button class="btn-mini" data-acao="removerMeta" title="Remover meta">✕</button>
        </div>
        <div class="meta-prazo">${prazo ? "Prazo: " + prazo + " · " : ""}${feitos} de ${total} passos (${pct}%)</div>
        <div class="barra"><div style="width:${pct}%"></div></div>
        <ul class="passos">
          ${m.passos.map((p, i) => `
            <li class="${p.feito ? "feito" : ""}">
              <input type="checkbox" data-acao="marcarPasso" data-i="${i}" ${p.feito ? "checked" : ""}>
              <span>${esc(p.texto)}</span>
              <button class="btn-mini" data-acao="removerPasso" data-i="${i}" title="Remover passo">✕</button>
            </li>`).join("")}
        </ul>
        <form class="passo-form" data-acao="addPasso">
          <input placeholder="Adicionar um passo" required>
          <button class="btn secundario">+</button>
        </form>
      </div>`;
  }).join("");
}
$("#metaForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  metas.unshift({ id: id(), titulo: d.titulo.trim(), prazo: d.prazo, passos: [] });
  salvar("metas", metas); e.target.reset(); desenharMetas();
});
$("#listaMetas").addEventListener("click", e => {
  const acao = e.target.dataset.acao;
  const cartao = e.target.closest("[data-meta]");
  if (!acao || !cartao) return;
  const meta = metas.find(m => m.id === cartao.dataset.meta);
  if (acao === "removerMeta") {
    if (!confirm("Remover esta meta?")) return;
    metas = metas.filter(m => m !== meta);
  } else if (acao === "marcarPasso") {
    meta.passos[e.target.dataset.i].feito = e.target.checked;
  } else if (acao === "removerPasso") {
    meta.passos.splice(e.target.dataset.i, 1);
  } else return;
  salvar("metas", metas); desenharMetas();
});
$("#listaMetas").addEventListener("submit", e => {
  e.preventDefault();
  const meta = metas.find(m => m.id === e.target.closest("[data-meta]").dataset.meta);
  meta.passos.push({ texto: e.target.querySelector("input").value.trim(), feito: false });
  salvar("metas", metas); desenharMetas();
});

// ---------- Hábitos ----------
const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
let habitos = carregar("habitos", []);
function desenharHabitos() {
  const t = $("#tabelaHabitos");
  if (!habitos.length) { t.innerHTML = `<tr><td class="vazio-lista">Adicione seu primeiro hábito acima.</td></tr>`; return; }
  t.innerHTML = `
    <tr><th>Hábito</th>${dias.map(d => `<th>${d}</th>`).join("")}<th>Total</th><th></th></tr>
    ${habitos.map((h, i) => `
      <tr>
        <td>${esc(h.nome)}</td>
        ${h.dias.map((v, d) => `<td><input type="checkbox" data-h="${i}" data-d="${d}" ${v ? "checked" : ""} aria-label="${esc(h.nome)} ${dias[d]}"></td>`).join("")}
        <td><strong>${h.dias.filter(Boolean).length}/7</strong></td>
        <td><button class="btn-mini" data-remover-habito="${i}" title="Remover">✕</button></td>
      </tr>`).join("")}`;
}
$("#habitoForm").addEventListener("submit", e => {
  e.preventDefault();
  const nome = new FormData(e.target).get("nome").trim();
  habitos.push({ nome, dias: Array(7).fill(false) });
  salvar("habitos", habitos); e.target.reset(); desenharHabitos();
});
$("#tabelaHabitos").addEventListener("click", e => {
  const el = e.target;
  if (el.dataset.h !== undefined) {
    habitos[el.dataset.h].dias[el.dataset.d] = el.checked;
  } else if (el.dataset.removerHabito !== undefined) {
    habitos.splice(el.dataset.removerHabito, 1);
  } else return;
  salvar("habitos", habitos); desenharHabitos();
});
$("#novaSemana").addEventListener("click", () => {
  if (!confirm("Desmarcar todos os dias para começar uma nova semana?")) return;
  habitos.forEach(h => h.dias = Array(7).fill(false));
  salvar("habitos", habitos); desenharHabitos();
});

// ---------- Diário ----------
let diario = carregar("diario", []);
let humorSel = "";
$("#humores").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  humorSel = b.dataset.humor;
  $$("#humores button").forEach(x => x.classList.toggle("sel", x === b));
});
$("#diarioForm").addEventListener("submit", e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  if (!humorSel && !d.gratidao.trim() && !d.texto.trim()) { alert("Escreva algo ou escolha um humor antes de salvar."); return; }
  diario.unshift({ id: id(), data: new Date().toISOString(), humor: humorSel, gratidao: d.gratidao.trim(), texto: d.texto.trim() });
  salvar("diario", diario);
  e.target.reset(); humorSel = ""; $$("#humores button").forEach(x => x.classList.remove("sel"));
  desenharDiario();
});
function desenharDiario() {
  const alvo = $("#listaDiario");
  if (!diario.length) { alvo.innerHTML = `<p class="vazio-lista">Seus registros aparecerão aqui.</p>`; return; }
  alvo.innerHTML = diario.map(r => `
    <div class="cartao registro">
      <div class="registro-topo">
        <span><strong>${r.humor || "📝"}</strong> ${new Date(r.data).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}</span>
        <button class="btn-mini" data-remover-registro="${r.id}" title="Apagar">✕</button>
      </div>
      ${r.gratidao ? `<p><em>Gratidão:</em>\n${esc(r.gratidao)}</p>` : ""}
      ${r.texto ? `<p>${esc(r.texto)}</p>` : ""}
    </div>`).join("");
}
$("#listaDiario").addEventListener("click", e => {
  const rid = e.target.dataset.removerRegistro;
  if (!rid || !confirm("Apagar este registro?")) return;
  diario = diario.filter(r => r.id !== rid);
  salvar("diario", diario); desenharDiario();
});

// ---------- Respiração guiada ----------
const tecnicasRespirar = {
  "478": [{ fase: "Inspire", seg: 4, escala: 1.35 }, { fase: "Segure", seg: 7, escala: 1.35 }, { fase: "Solte", seg: 8, escala: 0.85 }],
  box: [{ fase: "Inspire", seg: 4, escala: 1.35 }, { fase: "Segure", seg: 4, escala: 1.35 }, { fase: "Solte", seg: 4, escala: 0.85 }, { fase: "Segure", seg: 4, escala: 0.85 }],
  calma: [{ fase: "Inspire", seg: 4, escala: 1.35 }, { fase: "Solte", seg: 6, escala: 0.85 }],
};
let respirarTimer = null;
let respirarCiclos = 0;
function pararRespiracao() {
  clearTimeout(respirarTimer); respirarTimer = null;
  $("#circuloRespirar").style.transition = "";
  $("#circuloRespirar").style.transform = "scale(0.85)";
  $("#respirarTexto").textContent = "Pronto?";
  $("#iniciarRespirar").hidden = false;
  $("#pararRespirar").hidden = true;
}
function passoRespiracao(passos, i) {
  if (!respirarTimer && i !== 0) return; // foi parado
  const p = passos[i];
  const circulo = $("#circuloRespirar");
  circulo.style.transition = `transform ${p.seg}s ease-in-out`;
  circulo.style.transform = `scale(${p.escala})`;
  $("#respirarTexto").textContent = p.fase;
  respirarTimer = setTimeout(() => {
    const prox = (i + 1) % passos.length;
    if (prox === 0) { respirarCiclos++; $("#ciclosRespirar").textContent = `Ciclos completos: ${respirarCiclos}`; }
    passoRespiracao(passos, prox);
  }, p.seg * 1000);
}
$("#iniciarRespirar").addEventListener("click", () => {
  const passos = tecnicasRespirar[$("#tecnicaRespirar").value];
  respirarCiclos = 0;
  $("#ciclosRespirar").textContent = "";
  $("#iniciarRespirar").hidden = true;
  $("#pararRespirar").hidden = false;
  respirarTimer = 1; // marca como ativo antes do primeiro passo
  passoRespiracao(passos, 0);
});
$("#pararRespirar").addEventListener("click", pararRespiracao);

// ---------- Checklist de busca de emprego ----------
const checklistPadrao = [
  "Currículo atualizado e revisado",
  "Perfil do LinkedIn atualizado",
  "Carta de apresentação pronta",
  "Lista de referências profissionais",
  "Cadastro em pelo menos 3 sites de vagas",
  "E-mail profissional configurado",
  "Respostas prontas para perguntas comuns de entrevista",
  "Pesquisa feita sobre empresas de interesse",
  "Roupas para entrevista organizadas",
  "Meta de quantas vagas aplicar por semana definida",
].map(texto => ({ id: id(), texto, feito: false }));
let checklist = carregar("checklist", checklistPadrao);
function desenharChecklist() {
  const total = checklist.length;
  const feitos = checklist.filter(i => i.feito).length;
  const pct = total ? Math.round((feitos / total) * 100) : 0;
  $("#checklistBarra").style.width = pct + "%";
  $("#checklistResumo").textContent = total ? `${feitos} de ${total} itens concluídos (${pct}%)` : "";
  const alvo = $("#listaChecklist");
  alvo.innerHTML = total ? checklist.map(item => `
    <li class="${item.feito ? "feito" : ""}">
      <input type="checkbox" data-marcar="${item.id}" ${item.feito ? "checked" : ""}>
      <span>${esc(item.texto)}</span>
      <button class="btn-mini" data-remover="${item.id}" title="Remover">✕</button>
    </li>`).join("") : `<p class="vazio-lista">Nenhum item ainda. Adicione um acima ou restaure os itens padrão.</p>`;
}
$("#checklistForm").addEventListener("submit", e => {
  e.preventDefault();
  const texto = new FormData(e.target).get("texto").trim();
  checklist.push({ id: id(), texto, feito: false });
  salvar("checklist", checklist); e.target.reset(); desenharChecklist();
});
$("#listaChecklist").addEventListener("click", e => {
  const marcar = e.target.dataset.marcar;
  const remover = e.target.dataset.remover;
  if (marcar) {
    checklist.find(i => i.id === marcar).feito = e.target.checked;
  } else if (remover) {
    checklist = checklist.filter(i => i.id !== remover);
  } else return;
  salvar("checklist", checklist); desenharChecklist();
});
$("#restaurarChecklist").addEventListener("click", () => {
  if (!confirm("Isso substitui sua lista atual pelos itens padrão. Continuar?")) return;
  checklist = checklistPadrao.map(i => ({ ...i, id: id(), feito: false }));
  salvar("checklist", checklist); desenharChecklist();
});

// ---------- Início ----------
mostrarFrase();
preencherFormulario();
desenharCv();
preencherCartaFormulario();
desenharCarta();
desenharMetas();
desenharHabitos();
desenharDiario();
desenharChecklist();
mostrarPagina();
