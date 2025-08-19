// main.js - versão ultra-otimizada para mobile com correções
(function() {
  'use strict';

  // =======================================================
  // === INÍCIO DA CORREÇÃO PARA O MODAL DE VÍDEO ===
  // =======================================================

  // 1. Função para inicializar os controles do modal de vídeo
  function initVideoModal() {
    const videoModal = document.getElementById('videoModal');
    const closeButton = document.getElementById('closeVideoModal');
    const youtubePlayer = document.getElementById('youtubePlayer');

    if (!videoModal || !closeButton || !youtubePlayer) {
      // Se algum elemento essencial não existir, não faz nada.
      return;
    }

    // Função interna para fechar o modal
    const closeModal = () => {
      videoModal.classList.add('hidden');
      document.body.style.overflow = '';
      // IMPORTANTE: Limpa o src do iframe para parar o vídeo
      youtubePlayer.src = ''; 
    };

    // Eventos para fechar o modal
    closeButton.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
      // Fecha somente se o clique for no fundo escuro (o próprio modal)
      if (e.target === videoModal) {
        closeModal();
      }
    });
    
    // Bônus: Fechar com a tecla 'Escape'
    document.addEventListener('keydown', function(e) {
        if (e.key === "Escape" && !videoModal.classList.contains('hidden')) {
            closeModal();
        }
    });
  }

  // 2. Função para abrir o modal e carregar o vídeo
  // Tornamos a função global para que o 'onclick' do HTML possa encontrá-la
  window.openVideoModal = function(videoId) {
    const videoModal = document.getElementById('videoModal');
    const youtubePlayer = document.getElementById('youtubePlayer');

    if (videoModal && youtubePlayer) {
      // Monta a URL do YouTube com autoplay e remove vídeos relacionados no final
      youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      videoModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  // =======================================================
  // === FIM DA CORREÇÃO PARA O MODAL DE VÍDEO ===
  // =======================================================


  // Gerenciamento de recursos
  function loadResources() {
    if (!(document.fonts.check('1em FontAwesome') || document.fonts.check('1em "Font Awesome 6 Free"'))) {
      const fa = document.createElement('link');
      fa.rel = 'stylesheet';
      fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(fa);
    }
  }

  // Barra de progresso de scroll
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

  // Carregamento otimizado de imagens
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

  // Gerenciamento de modais de formulário
  function initFormModal() {
    const modal = document.getElementById('formModal');
    if (!modal) return;
    const openButtons = document.querySelectorAll('.js-open-form');
    const closeButton = modal.querySelector('.js-close-form');
    const mostrarFormulario = function(e) {
      if (e) e.preventDefault();
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    };
    const fecharFormulario = function(e) {
      if (e) e.preventDefault();
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };
    openButtons.forEach(btn => {
      ['click', 'touchstart'].forEach(eventType => {
        btn.addEventListener(eventType, mostrarFormulario);
      });
    });
    if (closeButton) closeButton.addEventListener('click', fecharFormulario);
    modal.addEventListener('click', (e) => { if (e.target === modal) fecharFormulario(e); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && !modal.classList.contains('hidden')) fecharFormulario(); });
  }

  // Formulário otimizado
  function initForm() {
    const form = document.getElementById('formNI');
    if (!form) return;
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const formData = new FormData(form);
      const data = { nome: formData.get('nome'), email: formData.get('email'), whatsapp: formData.get('whatsapp') };
      if (data.nome.length < 3) return showFeedback('Nome muito curto');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return showFeedback('E-mail inválido');
      if (data.whatsapp.replace(/\D/g,'').length < 10) return showFeedback('Telefone inválido');
      try {
        const response = await fetch('https://n8n.srv928140.hstgr.cloud/webhook/13c8579f-e98e-463c-839e-0795865e6dfa', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
        if (response.ok) {
          window.location.href = `https://pay.hotmart.com/K70495535U?checkoutMode=1011&name=${encodeURIComponent(data.nome)}&email=${encodeURIComponent(data.email)}`;
        } else { showFeedback('Erro no servidor, tente novamente'); }
      } catch (error) { showFeedback('Erro ao enviar, verifique sua conexão'); }
    });
    window.formatarTelefone = function(input) { let v=input.value.replace(/\D/g,'').substring(0,11); if(v.length>10)v=v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');else if(v.length>5)v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');else if(v.length>2)v=v.replace(/(\d{2})(\d{0,5})/,'($1) $2');else v=v.replace(/(\d*)/,'($1'); input.value=v; };
    function showFeedback(msg) { let f=form.querySelector('.form-feedback'); if(!f){f=document.createElement('div');f.className='form-feedback';form.prepend(f);} f.textContent=msg;f.style.color='red';f.classList.remove('hidden'); setTimeout(() => {if(f) f.remove();}, 3000); }
  }

  // Inicialização otimizada
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('hero-loaded');
    
    // Inicializações prioritárias
    initScrollProgress();
    initFormModal(); // Renomeei para maior clareza
    initForm();
    initVideoModal(); // <--- CHAMADA DA NOVA FUNÇÃO

    // Carregar recursos não críticos
    setTimeout(() => {
      loadResources();
      lazyLoadImages();
    }, 500);
    
    // Inicializar componentes visíveis
    initDepoimentosCarousel();
    initFAQ();
  });

  function initDepoimentosCarousel() {
    const track = document.querySelector('.depoimentos-track');
    if (!track || track.children.length === 0) return;
    let currentIndex = 0, slidesPerView = 1, totalSlides = track.children.length;
    const prevBtn = document.querySelector('.depoimento-prev');
    const nextBtn = document.querySelector('.depoimento-next');
    function updateCarouselState() {
        const screenWidth = window.innerWidth;
        slidesPerView = (screenWidth >= 1024) ? 3 : (screenWidth >= 768) ? 2 : 1;
        const slideWidth = track.parentElement.offsetWidth / slidesPerView;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        if(prevBtn) prevBtn.disabled = currentIndex === 0;
        if(nextBtn) nextBtn.disabled = currentIndex >= totalSlides - slidesPerView;
    }
    if (nextBtn) nextBtn.addEventListener('click', () => { if (currentIndex < totalSlides - slidesPerView) { currentIndex++; updateCarouselState(); } });
    if (prevBtn) prevBtn.addEventListener('click', () => { if (currentIndex > 0) { currentIndex--; updateCarouselState(); } });
    window.addEventListener('resize', updateCarouselState, { passive: true });
    updateCarouselState();
  }

  function initFAQ() {
    const faqContainer = document.querySelector('#faq');
    if (!faqContainer) return;
    faqContainer.addEventListener('click', function(e) {
      const button = e.target.closest('.faq-button');
      if (!button) return;
      const content = button.nextElementSibling;
      const icon = button.querySelector('i.fas');
      if (!content || !icon) return;
      const isOpening = content.style.maxHeight === '0px' || !content.style.maxHeight;
      faqContainer.querySelectorAll('.faq-content').forEach(item => {
        if (item !== content) {
          item.style.maxHeight = '0';
          const otherIcon = item.previousElementSibling.querySelector('i.fas');
          if (otherIcon) otherIcon.classList.remove('rotate-180');
        }
      });
      if (isOpening) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.classList.add('rotate-180');
      } else {
        content.style.maxHeight = '0';
        icon.classList.remove('rotate-180');
      }
    });
    faqContainer.querySelectorAll('.faq-content').forEach(item => { item.style.maxHeight = '0'; item.style.overflow = 'hidden'; item.style.transition = 'max-height 0.3s ease-out'; });
  }
})();