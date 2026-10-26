const STORAGE_KEY = "mural";
const form = document.getElementById("form-mensagem");
const input = document.getElementById("mensagem");
const mural = document.getElementById("mural");
const contador = document.getElementById("contador");
const statusMural = document.getElementById("status-mural");
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "medium",
  timeStyle: "short"
});

function lerMensagens() {
  try {
    const mensagens = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(mensagens) ? mensagens : [];
  } catch {
    return [];
  }
}

function salvarMensagens(mensagens) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensagens));
    statusMural.textContent = "";
    return true;
  } catch {
    statusMural.textContent = "Não foi possível salvar. Verifique o espaço disponível no navegador.";
    return false;
  }
}

function formatarData(data) {
  const dataObj = new Date(data);
  return Number.isNaN(dataObj.getTime()) ? data : dateFormatter.format(dataObj);
}

function renderizarMensagens() {
  const mensagens = lerMensagens();
  const fragmento = document.createDocumentFragment();

  if (mensagens.length === 0) {
    const vazio = document.createElement("p");
    vazio.className = "empty-state";
    vazio.textContent = "O mural está quieto por enquanto. Que tal começar?";
    fragmento.appendChild(vazio);
  } else {
    mensagens.forEach((mensagem, index) => {
      const post = document.createElement("article");
      post.className = "post";

      const texto = document.createElement("p");
      texto.className = "post-text";
      texto.textContent = mensagem.texto || "";

      const meta = document.createElement("div");
      meta.className = "post-meta";

      const data = document.createElement("time");
      data.textContent = formatarData(mensagem.data || "");
      if (mensagem.data) data.dateTime = mensagem.data;

      const excluir = document.createElement("button");
      excluir.className = "delete-button";
      excluir.type = "button";
      excluir.dataset.index = index;
      excluir.textContent = "Excluir";
      excluir.setAttribute("aria-label", `Excluir publicação ${index + 1}`);

      meta.append(data, excluir);
      post.append(texto, meta);
      fragmento.appendChild(post);
    });
  }

  mural.replaceChildren(fragmento);
  statusMural.textContent = mensagens.length === 1
    ? "1 publicação"
    : `${mensagens.length} publicações`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const texto = input.value.trim();
  if (!texto) {
    input.focus();
    return;
  }

  const mensagens = lerMensagens();
  mensagens.unshift({ texto, data: new Date().toISOString() });
  if (salvarMensagens(mensagens)) {
    input.value = "";
    contador.textContent = "0 / 280";
    renderizarMensagens();
    input.focus();
  }
});

input.addEventListener("input", () => {
  contador.textContent = `${input.value.length} / 280`;
});

mural.addEventListener("click", (event) => {
  const botao = event.target.closest(".delete-button");
  if (!botao) return;

  const mensagens = lerMensagens();
  mensagens.splice(Number(botao.dataset.index), 1);
  if (salvarMensagens(mensagens)) renderizarMensagens();
});

document.getElementById("limpar-mural").addEventListener("click", () => {
  if (lerMensagens().length === 0) return;
  if (!window.confirm("Tem certeza de que deseja apagar todas as publicações?")) return;
  if (salvarMensagens([])) renderizarMensagens();
});

renderizarMensagens();