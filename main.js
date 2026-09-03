const GITHUB_USERNAME = 'octocat'; // TODO: 본인의 GitHub 아이디로 변경하세요.
const NAV_SCROLL_THRESHOLD = 60;
const TOP_BUTTON_THRESHOLD = 300;
const OBSERVER_THRESHOLD = 0.2;

const state = {
  theme: 'light',
  menuOpen: false,
  repos: [],
  projectStatus: 'idle',
  projectError: '',
  activeFilter: 'All',
  formErrors: {}
};

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const themeButton = document.querySelector('.theme-toggle');
const themeIcon = document.querySelector('.theme-icon');
const navLinks = document.querySelectorAll('.nav-menu a');
const scrollTopButton = document.querySelector('#scroll-top');
const projectsGrid = document.querySelector('#projects-grid');
const projectState = document.querySelector('#project-state');
const projectFilters = document.querySelector('#project-filters');
const refreshProjectsButton = document.querySelector('#refresh-projects');
const contactForm = document.querySelector('#contact-form');
const formSuccess = document.querySelector('#form-success');
const currentYear = document.querySelector('#current-year');

const setMenuState = (isOpen) => {
  state.menuOpen = isOpen;
  navMenu.classList.toggle('active', state.menuOpen);
  menuButton.classList.toggle('active', state.menuOpen);
  menuButton.setAttribute('aria-expanded', String(state.menuOpen));
  menuButton.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
};

const setTheme = (theme) => {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('portfolio-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
  themeButton.setAttribute('aria-label', theme === 'dark' ? '라이트 모드 전환' : '다크 모드 전환');
};

const initializeTheme = () => {
  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));
};

const handleNavLinkClick = (event) => {
  const href = event.currentTarget.getAttribute('href');
  if (!href?.startsWith('#')) return;
  event.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  setMenuState(false);
};

const handleScroll = () => {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY >= NAV_SCROLL_THRESHOLD);
  scrollTopButton.classList.toggle('visible', scrollY >= TOP_BUTTON_THRESHOLD);
};

const createRepoCard = (repo) => {
  const { name, description, html_url: url, language, stargazers_count: stars, forks_count: forks } = repo;
  return `
    <article class="project-card">
      <h3>${escapeHtml(name)}</h3>
      <p>${escapeHtml(description || '설명이 등록되지 않은 프로젝트입니다.')}</p>
      <div class="project-meta">
        <span>● ${escapeHtml(language || 'Other')}</span>
        <span>★ ${stars}</span>
        <span>⑂ ${forks}</span>
      </div>
      <a class="project-link" href="${url}" target="_blank" rel="noreferrer">GitHub에서 보기 →</a>
    </article>`;
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderProjectFilters = () => {
  const languages = [...new Set(state.repos.map(({ language }) => language).filter(Boolean))];
  const filters = ['All', ...languages];

  projectFilters.innerHTML = filters.map((filter) => `
    <button class="filter-btn ${state.activeFilter === filter ? 'active' : ''}" type="button" data-filter="${escapeHtml(filter)}">
      ${escapeHtml(filter)}
    </button>
  `).join('');

  projectFilters.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.filter;
      renderProjects();
      renderProjectFilters();
    });
  });
};

const renderProjects = () => {
  projectsGrid.innerHTML = '';

  if (state.projectStatus === 'loading') {
    projectState.innerHTML = '<div class="loading-wrap"><span class="spinner" aria-hidden="true"></span><span>프로젝트를 불러오는 중...</span></div>';
    return;
  }

  if (state.projectStatus === 'error') {
    projectState.innerHTML = `프로젝트를 불러올 수 없습니다. ${escapeHtml(state.projectError)} <button class="retry-btn" id="retry-projects" type="button">다시 시도</button>`;
    document.querySelector('#retry-projects')?.addEventListener('click', fetchProjects);
    return;
  }

  const filteredRepos = state.activeFilter === 'All'
    ? state.repos
    : state.repos.filter(({ language }) => language === state.activeFilter);

  if (filteredRepos.length === 0) {
    projectState.textContent = '표시할 프로젝트가 없습니다.';
    return;
  }

  projectState.textContent = `${filteredRepos.length}개의 프로젝트를 표시합니다.`;
  projectsGrid.innerHTML = filteredRepos.map(createRepoCard).join('');
};

const fetchProjects = async () => {
  state.projectStatus = 'loading';
  state.projectError = '';
  renderProjects();

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=12`);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('GitHub API 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.');
      }
      if (response.status === 404) {
        throw new Error('GitHub 사용자를 찾을 수 없습니다. main.js의 아이디를 확인해 주세요.');
      }
      throw new Error(`요청 실패 (${response.status})`);
    }

    const repos = await response.json();
    state.repos = repos.filter(({ fork }) => !fork);
    state.projectStatus = 'success';
    state.activeFilter = 'All';
    renderProjectFilters();
    renderProjects();
  } catch (error) {
    state.projectStatus = 'error';
    state.projectError = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    renderProjects();
  }
};

const validators = {
  name: (value) => value.trim() ? '' : '이름을 입력해 주세요.',
  email: (value) => {
    if (!value.trim()) return '이메일을 입력해 주세요.';
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value.trim()) ? '' : '올바른 이메일 형식으로 입력해 주세요.';
  },
  message: (value) => value.trim().length >= 10 ? '' : '메시지를 10자 이상 입력해 주세요.'
};

const validateField = (field) => {
  const validator = validators[field.name];
  if (!validator) return true;

  const error = validator(field.value);
  state.formErrors[field.name] = error;

  const fieldWrapper = field.closest('.form-field');
  const errorElement = document.querySelector(`#${field.name}-error`);
  fieldWrapper?.classList.toggle('invalid', Boolean(error));
  if (errorElement) errorElement.textContent = error;

  return !error;
};

const handleFormSubmit = (event) => {
  event.preventDefault();
  formSuccess.textContent = '';

  const fields = [...contactForm.querySelectorAll('input, textarea')];
  const isValid = fields.map(validateField).every(Boolean);

  if (!isValid) {
    const firstInvalid = contactForm.querySelector('.invalid input, .invalid textarea');
    firstInvalid?.focus();
    return;
  }

  formSuccess.textContent = '메시지가 정상적으로 작성되었습니다. (현재는 데모 폼이라 실제 전송되지는 않습니다.)';
  contactForm.reset();
  state.formErrors = {};
};

const setupRevealObserver = () => {
  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: OBSERVER_THRESHOLD });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
};

const setupTypingEffect = () => {
  const typingElement = document.querySelector('.typing-text');
  const phrases = ['배움을 연결합니다.', '콘텐츠를 설계합니다.', '웹으로 구현합니다.'];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const type = () => {
    const currentPhrase = phrases[phraseIndex];
    charIndex += deleting ? -1 : 1;
    typingElement.textContent = currentPhrase.slice(0, charIndex);

    let delay = deleting ? 55 : 95;
    if (!deleting && charIndex === currentPhrase.length) {
      deleting = true;
      delay = 1200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 350;
    }
    window.setTimeout(type, delay);
  };

  type();
};

menuButton.addEventListener('click', () => setMenuState(!state.menuOpen));
themeButton.addEventListener('click', () => setTheme(state.theme === 'dark' ? 'light' : 'dark'));
navLinks.forEach((link) => link.addEventListener('click', handleNavLinkClick));
window.addEventListener('scroll', handleScroll, { passive: true });
scrollTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
refreshProjectsButton.addEventListener('click', fetchProjects);
contactForm.addEventListener('submit', handleFormSubmit);
contactForm.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', () => validateField(field)));

initializeTheme();
handleScroll();
setupRevealObserver();
setupTypingEffect();
fetchProjects();
currentYear.textContent = new Date().getFullYear();
