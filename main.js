// main.js - versão ultra-otimizada para mobile

(function() {
  'use strict';

  // 1. Gerenciamento de recursos
  function loadResources() {
    // Carregar Font Awesome se necessário
    if (!document.fonts.check('1em FontAwesome')) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fa);
    }
  }

  // 2. Barra de progresso de scroll
  function initScrollProgress() {
    const scrollBar = document.getElementById('scrollBar');
    if (scrollBar) {
      window.addEventListener('scroll', function() {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / height) * 100;
        scrollBar.style.width = scrolled + '%';
      }, { passive: true });
    }
  }

  // 3. Carregamento otimizado de imagens
  function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });

    images.forEach(img => imageObserver.observe(img));
  }

  // 4. Gerenciamento de modais otimizado
function initModals() {
  // Modal do formulário
  window.mostrarFormulario = function(e) {
    if (e) e.preventDefault(); // Previne comportamento padrão
    const modal = document.getElementById('formModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      // Foca no primeiro campo do formulário
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }
    return false; // Previne comportamento padrão do link
  };

  window.fecharFormulario = function(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('formModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
    return false;
  };

  // Fechar ao clicar fora (melhorado para mobile)
  document.addEventListener('click', function(e) {
    const modal = document.getElementById('formModal');
    if (e.target === modal) {
      fecharFormulario(e);
    }
  }, { passive: true });

  // Adiciona event listeners para todos os botões CTA
  document.querySelectorAll('[onclick*="mostrarFormulario"]').forEach(btn => {
    btn.addEventListener('click', mostrarFormulario, { passive: false });
    btn.addEventListener('touchstart', mostrarFormulario, { passive: false });
  });
}

  // 5. Formulário otimizado
  function initForm() {
    const form = document.getElementById('formNI');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        nome: formData.get('nome'),
        email: formData.get('email'),
        whatsapp: formatarTelefone(formData.get('whatsapp'))
      };

      // Validação simples
      if (data.nome.length < 3) return showFeedback('Nome muito curto');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showFeedback('E-mail inválido');
      if (data.whatsapp.replace(/\D/g,'').length < 11) return showFeedback('Telefone incompleto');

      // Envio otimizado
      try {
        const response = await fetch('https://n8n.srv928140.hstgr.cloud/webhook/13c8579f-e98e-463c-839e-0795865e6dfa', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          window.location.href = `https://pay.hotmart.com/K70495535U?checkoutMode=1011&name=${encodeURIComponent(data.nome)}&email=${encodeURIComponent(data.email)}`;
        }
      } catch (error) {
        showFeedback('Erro ao enviar, tente novamente');
      }
    });

    function formatarTelefone(tel) {
      const nums = tel.replace(/\D/g,'');
      return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    function showFeedback(msg) {
      const feedback = document.createElement('div');
      feedback.className = 'form-feedback';
      feedback.textContent = msg;
      form.prepend(feedback);
      setTimeout(() => feedback.remove(), 3000);
    }
  }

  // Inicialização otimizada
  document.addEventListener('DOMContentLoaded', function() {
    // Marcar hero como carregado
    document.body.classList.add('hero-loaded');

    // Inicializações prioritárias
    initScrollProgress();
    initModals();
    initForm();

    // Carregar recursos não críticos após 1s
    setTimeout(() => {
      loadResources();
      lazyLoadImages();
    }, 1000);
  });

  
  // Adicione este código ao seu main.js

function initDepoimentosCarousel() {
  const track = document.querySelector('.depoimentos-track');
  if (!track) return;

  // Configurações responsivas
  let slidesPerView = 1;
  let slideWidth = 0;
  
  function updateCarousel() {
    // Atualiza slides visíveis baseado na largura da tela
    if (window.innerWidth >= 1024) {
      slidesPerView = 3;
    } else if (window.innerWidth >= 768) {
      slidesPerView = 2;
    } else {
      slidesPerView = 1;
    }
    
    slideWidth = track.children[0].offsetWidth;
    updateIndicators();
  }

  // Lazy load para imagens
  function lazyLoadDepoimentoImages() {
    const images = track.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.getAttribute('data-src')) {
        img.src = img.getAttribute('data-src');
      }
    });
  }

  // Atualiza indicadores
  function updateIndicators() {
    const indicators = document.querySelectorAll('.depoimento-indicador');
    if (!indicators.length) return;
    
    const totalGroups = Math.ceil(track.children.length / slidesPerView);
    indicators.forEach((indicator, i) => {
      indicator.style.display = i < totalGroups ? 'block' : 'none';
    });
  }

  // Navegação
  function setupNavigation() {
    const prevBtn = document.querySelector('.depoimento-prev');
    const nextBtn = document.querySelector('.depoimento-next');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - slidesPerView);
        updateCarouselPosition();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = Math.min(
          track.children.length - slidesPerView, 
          currentIndex + slidesPerView
        );
        updateCarouselPosition();
      });
    }
  }

  function updateCarouselPosition() {
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    updateIndicators();
  }

  // Inicialização
  let currentIndex = 0;
  updateCarousel();
  lazyLoadDepoimentoImages();
  setupNavigation();
  
  // Atualizar ao redimensionar
  window.addEventListener('resize', () => {
    updateCarousel();
  }, { passive: true });
}

  // Chamar a função quando a seção estiver visível
  const depoimentosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initDepoimentosCarousel();
        depoimentosObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  const depoimentosSection = document.querySelector('.depoimentos-section');
  if (depoimentosSection) {
    depoimentosObserver.observe(depoimentosSection);
  }

  function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-content');
  if (!faqItems.length) return;

  // Delegation de eventos para melhor performance
  document.addEventListener('click', function(e) {
    const button = e.target.closest('[onclick*="toggleFAQ"]');
    if (button) {
      e.preventDefault();
      const faqItem = button.parentElement;
      const content = faqItem.querySelector('.faq-content');
      const icon = button.querySelector('i');
      
      // Alternar estado
      const isOpening = !content.classList.contains('active');
      
      // Fechar todos os outros itens primeiro
      if (isOpening) {
        document.querySelectorAll('.faq-content.active').forEach(item => {
          item.classList.remove('active');
          item.previousElementSibling.querySelector('i').classList.remove('rotate-180');
        });
      }
      
      // Alternar o item atual
      content.classList.toggle('active');
      icon.classList.toggle('rotate-180');
      
      // Animar suavemente
      if (isOpening) {
        content.style.maxHeight = content.scrollHeight + 'px';
      } else {
        content.style.maxHeight = '0';
      }
    }
  }, { passive: true });
}

// Inicializar quando a seção FAQ estiver visível
const faqObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      initFAQ();
      faqObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

const faqSection = document.querySelector('#faq');
if (faqSection) {
  faqObserver.observe(faqSection);
}
})();