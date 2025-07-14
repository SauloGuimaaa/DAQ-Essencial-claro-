/* ========== UTILITÁRIOS GERAIS ========== */

/**
 * Formata número de telefone brasileiro (DDD + 9 dígitos) no input
 * e devolve apenas os números (para usar no checkout).
 */
function formatarTelefone(input) {
  const numbers = input.value.replace(/\D/g, "").substring(0, 11);
  input.value = numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2‑$3");
  return numbers;
}

/* ========== CONTROLE DO MODAL (FORMULÁRIO) ========== */
function openModal() {
  const modal = document.getElementById("formulario");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");               // centraliza
  requestAnimationFrame(() => (modal.style.opacity = "1"));
}

function closeModal() {
  const modal = document.getElementById("formulario");
  if (!modal) return;
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 300);                                   // igual ao transition‑opacity
}

// expõe para onclick inline (<a onclick="mostrarFormulario()">)
window.mostrarFormulario = openModal;
window.fecharFormulario  = closeModal;

/* ========== LÓGICA DE ENVIO ==========
   Envia lead → backend + (opcional) Notificações Inteligentes
   Depois redireciona ao checkout Hotmart na MESMA ABA
====================================== */
document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_URL       = "http://localhost:3000/lead";      // ajuste se necessário
  const HOTMART_CHECKOUT  = "https://pay.hotmart.com/K70495535U";

  const form      = document.getElementById("formNI");
  const submitBtn = form?.querySelector("button[type='submit']");

  const feedback = (msg, tipo = "erro") => {
    document.querySelectorAll(".form-feedback").forEach((e) => e.remove());
    const div = document.createElement("div");
    div.className = `form-feedback ${tipo}`;
    div.innerHTML =
      `<i class="fas ${tipo === "sucesso" ? "fa-check-circle" : "fa-exclamation-circle"}"></i> ${msg}`;
    form.prepend(div);
    setTimeout(() => div.remove(), 5000);
  };

  const sanitize = (str) =>
    str.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

  async function enviarParaNI(dados) {
    const NI_WEBHOOK = ""; // coloque seu webhook do Make / Notificações Inteligentes se usar
    if (!NI_WEBHOOK) return;

    try {
      await fetch(NI_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: sanitize(dados.nome),
          email: sanitize(dados.email),
          telefone: `55${dados.whatsapp}`,
          origem: "Landing DAQ Essencial",
          data: new Date().toLocaleString("pt-BR"),
        }),
      });
    } catch (e) {
      console.error("Falha ao enviar para NI:", e);
    }
  }

  async function enviarFormulario(e) {
    e.preventDefault();
    if (!form || !submitBtn) return;

    const dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      whatsapp: formatarTelefone(form.whatsapp),
    };

    // === Validações rápidas ===
    if (dados.nome.length < 3)          return feedback("Nome incompleto (mín. 3 letras)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email))
                                         return feedback("E‑mail inválido");
    if (dados.whatsapp.length < 11)     return feedback("Telefone incompleto (DDD + número)");

    // UI carregando
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      // 1) Envia para seu backend (salvar lead)
      const resp = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      }).then((r) => r.json());

      // 2) Se backend falhar, tenta NI
      if (!resp.success) await enviarParaNI(dados);

      feedback(resp.message || "Cadastro realizado com sucesso!", "sucesso");
      form.reset();
      closeModal();

      // 3) Redireciona ao checkout na MESMA aba
      const checkoutURL = new URL(HOTMART_CHECKOUT);
      checkoutURL.searchParams.append("name", dados.nome);
      checkoutURL.searchParams.append("email", dados.email);
      checkoutURL.searchParams.append("phone", `55${dados.whatsapp}`);
      window.location.href = checkoutURL.toString();
    } catch (erro) {
      console.error("Erro no envio:", erro);
      feedback("Recebemos seus dados! Em breve entraremos em contato.", "sucesso");
      await enviarParaNI(dados);
      closeModal();

      // redireciona mesmo em caso de erro
      const fallbackURL = new URL(HOTMART_CHECKOUT);
      fallbackURL.searchParams.append("name", dados.nome);
      fallbackURL.searchParams.append("email", dados.email);
      window.location.href = fallbackURL.toString();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Quero me inscrever';
    }
  }

  form && form.addEventListener("submit", enviarFormulario);
});
