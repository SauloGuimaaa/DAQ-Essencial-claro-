/* ========== UTILITÁRIOS GERAIS ========== */

function formatarTelefone(input) {
  // Se for um elemento input, pega o value, senão assume que é uma string
  const value = typeof input === 'object' ? input.value : input;
  const numbers = value.replace(/\D/g, "").substring(0, 11);
  
  // Formatação visual para o usuário
  if (typeof input === 'object') {
    input.value = numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  return numbers; // Retorna apenas números para envio
}

/* ========== CONTROLE DO MODAL ========== */
function openModal() {
  const modal = document.getElementById("formulario");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  requestAnimationFrame(() => (modal.style.opacity = "1"));
}

function closeModal() {
  const modal = document.getElementById("formulario");
  if (!modal) return;
  modal.style.opacity = "0";
  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 300);
}

window.mostrarFormulario = openModal;
window.fecharFormulario = closeModal;

/* ========== LÓGICA DE ENVIO ========== */
document.addEventListener("DOMContentLoaded", () => {  
  const HOTMART_CHECKOUT = "https://pay.hotmart.com/K70495535U";
  const N8N_WEBHOOK_URL = "https://soporquestoes.app.n8n.cloud/webhook/f50b8bea-8786-46b6-9c52-09a3a0209865";

  const form = document.getElementById("formNI");
  const submitBtn = form?.querySelector("button[type='submit']");

  const feedback = (msg, tipo = "erro") => {
    document.querySelectorAll(".form-feedback").forEach((e) => e.remove());
    const div = document.createElement("div");
    div.className = `form-feedback ${tipo}`;
    div.innerHTML = `<i class="fas ${tipo === "sucesso" ? "fa-check-circle" : "fa-exclamation-circle"}"></i> ${msg}`;
    form.prepend(div);
    setTimeout(() => div.remove(), 5000);
  };

  const sanitize = (str) => str.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

  async function enviarParaN8N(dados) {
  if (!N8N_WEBHOOK_URL) {
    console.warn("URL do webhook N8N não configurada");
    return { success: false, message: "Webhook não configurado" };
  }

  try {
    // Criar payload mais simples e compatível
    const payload = {
      data: {
        nome: sanitize(dados.nome),
        email: sanitize(dados.email),
        telefone: `55${dados.whatsapp}`,
        produto: dados.produto,
        valor: dados.valor,
        origem: dados.origem,
        key: '123ABC',
        data_cadastro: new Date().toISOString(),
        url_checkout: HOTMART_CHECKOUT
      }
    };

    console.log("Payload para N8N:", JSON.stringify(payload, null, 2));

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    // Tentar obter a resposta como JSON ou texto
    try {
      const responseData = await response.json();
      return { success: true, response: responseData };
    } catch (e) {
      return { success: true, response: await response.text() };
    }
  } catch (e) {
    console.error("Erro ao enviar para N8N:", e);
    return {
      success: false,
      message: e.message
    };
  }
}

  async function enviarFormulario(e) {
    e.preventDefault();
    if (!form || !submitBtn) return;

    const dados = {
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
     whatsapp: formatarTelefone(form.whatsapp), // Usando a função corrigida
      produto: "DAQ Essencial",
      valor: "497",
      origem: "Landing Page DAQ"
    };

    // Validações
    if (dados.nome.length < 3) return feedback("Nome incompleto (mín. 3 letras)");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) return feedback("E‑mail inválido");
    if (dados.whatsapp.length < 11) return feedback("Telefone incompleto (DDD + número)");


    // UI carregando
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    try {
      // 1) Envia para N8N
      const resultadoN8N = await enviarParaN8N(dados);
      
      if (!resultadoN8N.success) {
        throw new Error(resultadoN8N.message);
      }

      feedback("Cadastro realizado com sucesso! Redirecionando...", "sucesso");
      form.reset();
      
      // Pequeno delay para o usuário ver o feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      closeModal();

      // 2) Redireciona ao checkout
      const checkoutURL = new URL(HOTMART_CHECKOUT);
      checkoutURL.searchParams.append("name", dados.nome);
      checkoutURL.searchParams.append("email", dados.email);
      checkoutURL.searchParams.append("phone", `55${dados.whatsapp}`);
      window.location.href = checkoutURL.toString();

    } catch (erro) {
      console.error("Erro no envio:", erro);
      feedback("Recebemos seus dados! Redirecionando para o checkout...", "sucesso");
      
      // Pequeno delay para o usuário ver o feedback
      await new Promise(resolve => setTimeout(resolve, 1500));
      closeModal();

      // Redireciona mesmo em caso de erro
      const fallbackURL = new URL(HOTMART_CHECKOUT);
      fallbackURL.searchParams.append("name", dados.nome);
      fallbackURL.searchParams.append("email", dados.email);
      window.location.href = fallbackURL.toString();
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Quero o DAQ Essencial';
    }
  }

  form && form.addEventListener("submit", enviarFormulario);
});

/* ========== CARROSSEL DE DEPOIMENTOS ========== */

// Carrossel de Depoimentos
document.addEventListener('DOMContentLoaded', function() {
  const track = document.querySelector('.depoimentos-track');
  const slides = document.querySelectorAll('.depoimento-slide');
  const prevBtn = document.querySelector('.depoimento-prev');
  const nextBtn = document.querySelector('.depoimento-next');
  const indicators = document.querySelectorAll('.depoimento-indicador');
  
  if (!track || !slides.length) return;
  
  let currentIndex = 0;
  let slideWidth = slides[0].offsetWidth;
  let slidesPerView = 1;
  let autoScrollInterval;
  
  // Atualizar slides visíveis com base no tamanho da tela
  function updateSlidesPerView() {
    if (window.innerWidth >= 1024) {
      slidesPerView = 3;
    } else if (window.innerWidth >= 768) {
      slidesPerView = 2;
    } else {
      slidesPerView = 1;
    }
    
    slideWidth = slides[0].offsetWidth;
    updateIndicators();
    goToSlide(currentIndex);
  }
  
  // Ir para slide específico
  function goToSlide(index) {
    // Ajusta o índice para não ultrapassar os limites
    const maxIndex = Math.max(slides.length - slidesPerView, 0);
    currentIndex = Math.min(Math.max(index, 0), maxIndex);
    
    const offset = -currentIndex * slideWidth;
    track.style.transform = `translateX(${offset}px)`;
    
    updateIndicators();
  }
  
  // Atualizar indicadores
  function updateIndicators() {
    const totalGroups = Math.ceil(slides.length / slidesPerView);
    const activeGroup = Math.floor(currentIndex / slidesPerView);
    
    indicators.forEach((indicator, i) => {
      if (i < totalGroups) {
        indicator.classList.toggle('active', i === activeGroup);
        indicator.style.display = 'block';
      } else {
        indicator.style.display = 'none';
      }
    });
  }
  
  // Navegação por indicadores
  indicators.forEach((indicator, i) => {
    indicator.addEventListener('click', () => {
      goToSlide(i * slidesPerView);
      resetAutoScroll();
    });
  });
  
  // Navegação anterior
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - slidesPerView);
      resetAutoScroll();
    });
  }
  
  // Navegação próxima
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + slidesPerView);
      resetAutoScroll();
    });
  }
  
  // Auto-scroll
  function startAutoScroll() {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => {
      const maxIndex = Math.max(slides.length - slidesPerView, 0);
      const nextIndex = currentIndex >= maxIndex ? 0 : currentIndex + slidesPerView;
      goToSlide(nextIndex);
    }, 5000);
  }
  
  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }
  
  function resetAutoScroll() {
    stopAutoScroll();
    startAutoScroll();
  }
  
  // Event listeners para pausar auto-scroll
  track.addEventListener('mouseenter', stopAutoScroll);
  track.addEventListener('mouseleave', startAutoScroll);
  
  // Atualizar ao redimensionar
  window.addEventListener('resize', () => {
    slideWidth = slides[0].offsetWidth;
    updateSlidesPerView();
  });
  
  // Inicialização
  updateSlidesPerView();
  startAutoScroll();
  
  // Modal para imagens ampliadas
  const imageContainers = document.querySelectorAll('.depoimento-imagem-container');
  const modal = document.getElementById('imagemModal');
  const modalImg = document.getElementById('imagemAmpliada');
  
  imageContainers.forEach(container => {
    container.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').src;
      modal.style.display = 'flex';
      modalImg.src = imgSrc;
      document.body.style.overflow = 'hidden';
    });
  });
  
  // Fechar modal
  window.fecharModalImagem = function() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  };
  
  // Fechar ao clicar fora
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      fecharModalImagem();
    }
  });
});