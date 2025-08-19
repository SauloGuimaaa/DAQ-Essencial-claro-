// main.js - versão ultra-otimizada para mobile com correções
(function() {
  'use strict';

  // 1. Gerenciamento de recursos
  function loadResources() {
    // Carregar Font Awesome se necessário (COM CORREÇÃO)
    if (!(document.fonts.check('1em FontAwesome') || document.fonts.check('1em "Font Awesome 6 Free"'))) {
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

  // 4. Gerenciamento de modais otimizado (VERSÃO CORRIGIDA)
  function initModals() {
    const modal = document.getElementById('formModal');
    if (!modal) return; // Se o modal não existir, não faz nada

    const openButtons = document.querySelectorAll('.js-open-form');
    const closeButton = modal.querySelector('.js-close-form');

    // Função para abrir o modal
    const mostrarFormulario = function(e) {
      if (e) e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    };

    // Função para fechar o modal
    const fecharFormulario = function(e) {
      if (e) e.preventDefault();
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    // === INÍCIO DA CORREÇÃO PARA MOBILE ===
    // Adiciona evento de 'click' E 'touchstart' para máxima compatibilidade
    openButtons.forEach(btn => {
      ['click', 'touchstart'].forEach(eventType => {
        btn.addEventListener(eventType, mostrarFormulario);
      });
    });
    // === FIM DA CORREÇÃO PARA MOBILE ===

    // Adiciona evento para o botão de fechar
    if (closeButton) {
      closeButton.addEventListener('click', fecharFormulario);
    }

    // Fechar ao clicar na área externa (fundo) do modal
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        fecharFormulario(e);
      }
    });
    
    // Bônus: Fechar com a tecla 'Escape'
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && !modal.classList.contains('hidden')) {
            fecharFormulario();
        }
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
        whatsapp: formData.get('whatsapp') // A formatação será feita no backend ou antes do envio
      };

      // Validação simples
      if (data.nome.length < 3) return showFeedback('Nome muito curto');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showFeedback('E-mail inválido');
      if (data.whatsapp.replace(/\D/g,'').length < 10) return showFeedback('Telefone inválido');

      // Envio otimizado
      try {
        const response = await fetch('https://n8n.srv928140.hstgr.cloud/webhook/13c8579f-e98e-463c-839e-0795865e6dfa', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          window.location.href = `https://pay.hotmart.com/K70495535U?checkoutMode=1011&name=${encodeURIComponent(data.nome)}&email=${encodeURIComponent(data.email)}`;
        } else {
          showFeedback('Erro no servidor, tente novamente');
        }
      } catch (error) {
        showFeedback('Erro ao enviar, verifique sua conexão');
      }
    });
    
    // Função global para formatação do telefone no input
    window.formatarTelefone = function(input) {
        let value = input.value.replace(/\D/g, '');
        value = value.substring(0, 11); // Limita a 11 dígitos
        if (value.length > 10) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 5) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else {
            value = value.replace(/(\d*)/, '($1');
        }
        input.value = value;
    };

    function showFeedback(msg) {
        let feedback = form.querySelector('.form-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'form-feedback';
            form.prepend(feedback);
        }
        feedback.textContent = msg;
        feedback.style.color = 'red'; // Exemplo de estilo
        feedback.classList.remove('hidden');

        setTimeout(() => {
            if(feedback) feedback.remove();
        }, 3000);
    }
  }

  // Inicialização otimizada
  document.addEventListener('DOMContentLoaded', function() {
    // Marcar hero como carregado
    document.body.classList.add('hero-loaded');

    // Inicializações prioritárias
    initScrollProgress();
    initModals(); // Função corrigida
    initForm();

    // Carregar recursos não críticos após um pequeno atraso
    setTimeout(() => {
      loadResources();
      lazyLoadImages();
    }, 500);
    
    // Inicializar outros componentes que dependem de visibilidade
    initDepoimentosCarousel();
    initFAQ();
  });

  
  function initDepoimentosCarousel() {
    const track = document.querySelector('.depoimentos-track');
    if (!track || track.children.length === 0) return;

    let currentIndex = 0;
    let slidesPerView = 1;
    let totalSlides = track.children.length;

    const prevBtn = document.querySelector('.depoimento-prev');
    const nextBtn = document.querySelector('.depoimento-next');
    const indicatorsContainer = document.querySelector('.depoimentos-section .flex.justify-center');

    function updateCarouselState() {
        const screenWidth = window.innerWidth;
        if (screenWidth >= 1024) {
            slidesPerView = 3;
        } else if (screenWidth >= 768) {
            slidesPerView = 2;
        } else {
            slidesPerView = 1;
        }

        const slideWidth = track.parentElement.offsetWidth / slidesPerView;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // Atualizar botões
        if(prevBtn) prevBtn.disabled = currentIndex === 0;
        if(nextBtn) nextBtn.disabled = currentIndex >= totalSlides - slidesPerView;
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < totalSlides - slidesPerView) {
                currentIndex++;
                updateCarouselState();
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarouselState();
            }
        });
    }

    window.addEventListener('resize', updateCarouselState, { passive: true });
    updateCarouselState(); // Chamar na inicialização
  }

  function initFAQ() {
    const faqContainer = document.querySelector('#faq');
    if (!faqContainer) return;

    // Usar delegação de eventos para performance
    faqContainer.addEventListener('click', function(e) {
      const button = e.target.closest('.faq-button');
      if (!button) return; // Se não clicou em um botão, não faz nada

      const content = button.nextElementSibling;
      const icon = button.querySelector('i.fas');
      
      if (!content || !icon) return; // Garante que os elementos existem

      const isOpening = content.style.maxHeight === '0px' || !content.style.maxHeight;

      // Fecha todos os outros itens do FAQ antes de abrir o novo
      faqContainer.querySelectorAll('.faq-content').forEach(item => {
        if (item !== content) {
          item.style.maxHeight = '0';
          const otherIcon = item.previousElementSibling.querySelector('i.fas');
          if (otherIcon) {
            otherIcon.classList.remove('rotate-180');
          }
        }
      });

      // Abre ou fecha o item clicado
      if (isOpening) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.classList.add('rotate-180');
      } else {
        content.style.maxHeight = '0';
        icon.classList.remove('rotate-180');
      }
    });

    // Garante que todos comecem fechados
    faqContainer.querySelectorAll('.faq-content').forEach(item => {
      item.style.maxHeight = '0';
    });
  

    // Ajusta o max-height inicial para '0' para garantir que a transição funcione
    document.querySelectorAll('.faq-content').forEach(item => {
      item.style.maxHeight = '0';
      item.style.overflow = 'hidden';
      item.style.transition = 'max-height 0.3s ease-out';
    });
  }

})();