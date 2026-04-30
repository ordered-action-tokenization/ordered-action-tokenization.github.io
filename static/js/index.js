const DEMO_VIDEO_ROOTS = {
  iphone: './media/video/real_iphone',
  logi: './media/video/real_logi',
};

const DEMO_VIDEO_INVENTORY = {
  pnp_ball: {
    dp: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    bin: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    fast: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4'],
    },
    quest: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat1: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat2: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat4: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat8: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
  },
  stack_cups: {
    dp: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4'],
    },
    bin: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4'],
    },
    fast: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4'],
    },
    quest: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat1: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat2: {
      failure: ['failure_1.mp4', 'failure_2.mp4', 'failure_3.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat4: {
      failure: ['failure_1.mp4', 'failure_2.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
    oat8: {
      failure: ['failure_1.mp4', 'failure_2.mp4'],
      success: ['success_1.mp4', 'success_2.mp4', 'success_3.mp4'],
    },
  },
};

document.addEventListener('DOMContentLoaded', () => {
  setupStickyHeader();
  setupActiveNavigation();
  setupMeshcatTabs();
  setupMeshcatControls();
  setupDemoVideos();
  setupBlogTokenizerLab();
  setupBlogPrefixLab();
});

function setupStickyHeader() {
  const stickyHeader = document.getElementById('site-sticky');
  if (!stickyHeader) {
    return;
  }

  if (stickyHeader.dataset.persistent === 'true') {
    stickyHeader.classList.add('is-visible');
    stickyHeader.removeAttribute('inert');
    return;
  }

  const setVisibility = () => {
    const isVisible = window.scrollY > 260;
    stickyHeader.classList.toggle('is-visible', isVisible);
    if (isVisible) {
      stickyHeader.removeAttribute('inert');
    } else {
      stickyHeader.setAttribute('inert', '');
    }
  };

  setVisibility();
  window.addEventListener('scroll', setVisibility, { passive: true });
}

function setupActiveNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.site-sticky-links a[href^="#"], .blog-side-nav a[href^="#"]'));
  if (navLinks.length === 0) {
    return;
  }

  const sections = navLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);

  if (sections.length === 0) {
    return;
  }

  const setActiveLink = (activeLink) => {
    navLinks.forEach((link) => {
      if (link === activeLink) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visibleEntry) {
          return;
        }
        const active = sections.find(({ section }) => section === visibleEntry.target);
        if (active) {
          setActiveLink(active.link);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.45, 0.7] }
    );

    sections.forEach(({ section }) => observer.observe(section));
    return;
  }

  const updateActiveLink = () => {
    const anchorOffset = window.innerHeight * 0.35;
    const active =
      sections
        .map(({ link, section }) => ({ link, top: section.getBoundingClientRect().top }))
        .filter(({ top }) => top <= anchorOffset)
        .sort((a, b) => b.top - a.top)[0] || sections[0];
    setActiveLink(active.link);
  };

  updateActiveLink();
  window.addEventListener('scroll', updateActiveLink, { passive: true });
}

function setupMeshcatTabs() {
  const buttons = Array.from(document.querySelectorAll('[data-episode-target]'));
  const rows = Array.from(document.querySelectorAll('.embed-row[data-episode]'));

  if (buttons.length === 0 || rows.length === 0) {
    return;
  }

  const activate = (episode) => {
    buttons.forEach((button) => {
      const isActive = button.dataset.episodeTarget === episode;
      button.classList.toggle('is-dark', isActive);
      button.classList.toggle('is-light', !isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    rows.forEach((row) => {
      row.hidden = row.dataset.episode !== episode;
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => activate(button.dataset.episodeTarget));
  });
}

function setupMeshcatControls() {
  const iframes = Array.from(document.querySelectorAll('.embed-card iframe'));
  const meshcatState = {
    playing: true,
    seekValue: 0,
  };

  const replayMeshcatState = (iframe) => {
    if (iframe.dataset.loaded !== 'true' || !iframe.contentWindow) {
      return;
    }

    iframe.contentWindow.postMessage({ type: 'meshcat-seek', value: meshcatState.seekValue }, '*');
    iframe.contentWindow.postMessage({ type: meshcatState.playing ? 'meshcat-play' : 'meshcat-pause' }, '*');
  };

  iframes.forEach((iframe) => {
    const originalSrc = iframe.getAttribute('src') || iframe.dataset.src;
    if (!originalSrc) {
      return;
    }

    iframe.dataset.originalSrc = originalSrc;

    if (!iframe.getAttribute('src')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'iframe-placeholder';
      placeholder.textContent = 'Loading 3D visualization.';
      placeholder.setAttribute('aria-hidden', 'true');
      iframe.hidden = true;
      iframe.insertAdjacentElement('afterend', placeholder);
    }

    iframe.addEventListener('load', () => {
      window.setTimeout(() => replayMeshcatState(iframe), 50);
    });
  });

  const loadIframe = (iframe) => {
    if (iframe.dataset.loaded === 'true') {
      return;
    }

    const source = iframe.dataset.originalSrc;
    if (!source) {
      return;
    }

    iframe.src = source;
    iframe.hidden = false;
    iframe.dataset.loaded = 'true';
    iframe.nextElementSibling?.classList?.contains('iframe-placeholder') && iframe.nextElementSibling.remove();
    window.setTimeout(() => replayMeshcatState(iframe), 50);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const iframe = entry.target.matches('iframe') ? entry.target : entry.target.querySelector('iframe');
            if (iframe) {
              loadIframe(iframe);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '600px 0px' }
    );

    iframes.forEach((iframe) => observer.observe(iframe.closest('.embed-card') || iframe));
  } else {
    iframes.forEach(loadIframe);
  }

  const broadcast = (type, payload = {}) => {
    iframes.forEach((iframe) => {
      if (iframe.dataset.loaded === 'true') {
        iframe.contentWindow?.postMessage({ type, ...payload }, '*');
      }
    });
  };

  const playButton = document.getElementById('meshcat-play-all');
  const pauseButton = document.getElementById('meshcat-pause-all');
  const resetButton = document.getElementById('meshcat-reset-all');
  const reloadButton = document.getElementById('meshcat-reload-all');
  const slider = document.getElementById('meshcat-global-slider');
  let sliderIsDragging = false;

  playButton?.addEventListener('click', () => {
    meshcatState.playing = true;
    iframes.forEach(loadIframe);
    broadcast('meshcat-play');
  });
  pauseButton?.addEventListener('click', () => {
    meshcatState.playing = false;
    broadcast('meshcat-pause');
  });

  resetButton?.addEventListener('click', () => {
    if (slider) {
      slider.value = 0;
    }
    meshcatState.seekValue = 0;
    meshcatState.playing = false;
    broadcast('meshcat-seek', { value: 0 });
    broadcast('meshcat-pause');
  });

  reloadButton?.addEventListener('click', () => {
    meshcatState.seekValue = 0;
    meshcatState.playing = true;
    broadcast('meshcat-reset');
    iframes.forEach((iframe) => {
      if (iframe.dataset.loaded === 'true' && iframe.dataset.originalSrc) {
        iframe.src = iframe.dataset.originalSrc;
      } else {
        iframe.contentWindow?.postMessage({ type: 'meshcat-reset-view' }, '*');
      }
    });
    if (slider) {
      slider.value = 0;
    }
    window.setTimeout(() => broadcast('meshcat-play'), 80);
  });

  slider?.addEventListener('input', () => {
    meshcatState.seekValue = Number(slider.value) / 100;
    broadcast('meshcat-seek', { value: meshcatState.seekValue });
    if (meshcatState.playing) {
      window.setTimeout(() => broadcast('meshcat-play'), 20);
    }
  });

  slider?.addEventListener('pointerdown', () => {
    sliderIsDragging = true;
  });

  ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
    slider?.addEventListener(eventName, () => {
      sliderIsDragging = false;
    });
  });

  window.addEventListener('message', (event) => {
    if (event.data?.type !== 'meshcat-time' || !slider || sliderIsDragging) {
      return;
    }

    const normalized = Math.min(Math.max(Number(event.data.value) || 0, 0), 1);
    meshcatState.seekValue = normalized;
    slider.value = Math.round(normalized * 100);
  });
}

function setupDemoVideos() {
  const taskSelect = document.getElementById('demo-task-select');
  const methodSelect = document.getElementById('demo-method-select');
  const cameraSelect = document.getElementById('demo-camera-select');
  const reloadButton = document.getElementById('demo-video-reload');
  const cards = Array.from(document.querySelectorAll('.demo-method-card'));
  const matrix = document.getElementById('demo-video-matrix');
  const section = document.getElementById('real-world');

  if (!taskSelect || !methodSelect || !cameraSelect || !matrix || cards.length === 0) {
    return;
  }

  const initialMethod = methodSelect.dataset.initialMethod;
  if (initialMethod && methodSelect.querySelector(`option[value="${initialMethod}"]`)) {
    methodSelect.value = initialMethod;
  }

  let videosReady = false;

  const prepareVideoForAutoplay = (video) => {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
  };

  const playVideo = (video) => {
    prepareVideoForAutoplay(video);
    const requestPlayback = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };
    if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      video.addEventListener('canplay', requestPlayback, { once: true });
    }
    requestPlayback();
  };

  const pickSampleVariant = (variants) => {
    if (!variants?.length) {
      return null;
    }
    return variants[Math.floor(Math.random() * variants.length)];
  };

  const clearVideoSources = () => {
    cards.forEach((card) => {
      card.querySelectorAll('video[data-status]').forEach((video) => {
        video.pause();
        video.removeAttribute('src');
        video.removeAttribute('poster');
        video.setAttribute('preload', 'none');
        delete video.dataset.currentSrc;
        video.load();
      });
    });
  };

  const setVideoPlaceholder = (video, placeholder, message = 'Video loads when this section is visible.') => {
    video.hidden = true;
    placeholder?.classList.remove('is-hidden');
    if (placeholder) {
      placeholder.textContent = message;
    }
  };

  const posterFor = (src) => src.replace('./media/video/', './media/poster/').replace(/\.mp4$/, '.jpg');

  const refreshGrid = () => {
    const task = taskSelect.value;
    const methodFilter = methodSelect.value;
    const root = DEMO_VIDEO_ROOTS[cameraSelect.value] || DEMO_VIDEO_ROOTS.iphone;

    matrix.classList.toggle('is-filtered', methodFilter !== 'all');

    cards.forEach((card) => {
      const method = card.dataset.methodCard;
      const matchesMethod = methodFilter === 'all' || methodFilter === method;
      card.hidden = !matchesMethod;

      if (!matchesMethod) {
        card.querySelectorAll('video[data-status]').forEach((video) => video.pause());
        return;
      }

      const methodInventory = DEMO_VIDEO_INVENTORY[task]?.[method] ?? {};
      card.querySelectorAll('figure').forEach((figure) => {
        const video = figure.querySelector('video[data-status]');
        const placeholder = figure.querySelector('.demo-video-placeholder');
        if (!video) {
          return;
        }

        const selectedFile = pickSampleVariant(methodInventory[video.dataset.status] ?? []);
        const hasVideo = Boolean(selectedFile);

        if (!hasVideo) {
          video.pause();
          video.removeAttribute('src');
          video.removeAttribute('poster');
          video.setAttribute('preload', 'none');
          delete video.dataset.currentSrc;
          video.load();
          setVideoPlaceholder(video, placeholder, 'Video unavailable for this task.');
          return;
        }

        const src = `${root}/${task}/${method}/${selectedFile}`;

        if (!videosReady) {
          video.dataset.pendingSrc = src;
          video.dataset.pendingPoster = posterFor(src);
          setVideoPlaceholder(video, placeholder);
          return;
        }

        video.hidden = false;
        placeholder?.classList.add('is-hidden');
        video.poster = posterFor(src);
        prepareVideoForAutoplay(video);

        if (video.dataset.currentSrc !== src) {
          video.dataset.currentSrc = src;
          video.src = src;
          video.load();
        }
        playVideo(video);
      });
    });
  };

  const loadVisibleVideos = () => {
    videosReady = true;
    refreshGrid();
  };

  taskSelect.addEventListener('change', loadVisibleVideos);
  methodSelect.addEventListener('change', loadVisibleVideos);
  cameraSelect.addEventListener('change', () => {
    clearVideoSources();
    loadVisibleVideos();
  });
  reloadButton?.addEventListener('click', () => {
    clearVideoSources();
    loadVisibleVideos();
  });

  refreshGrid();

  if ('IntersectionObserver' in window && section) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadVisibleVideos();
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px' }
    );
    observer.observe(section);
  } else {
    loadVisibleVideos();
  }
}

function setupBlogTokenizerLab() {
  const buttons = Array.from(document.querySelectorAll('[data-tokenizer-target]'));
  const summary = document.querySelector('[data-tokenizer-summary]');
  const panel = document.getElementById('tokenizer-panel');
  const meters = {
    compression: document.querySelector('[data-tokenizer-meter="compression"]'),
    decodability: document.querySelector('[data-tokenizer-meter="decodability"]'),
    ordering: document.querySelector('[data-tokenizer-meter="ordering"]'),
  };
  const labels = {
    compression: document.querySelector('[data-tokenizer-label="compression"]'),
    decodability: document.querySelector('[data-tokenizer-label="decodability"]'),
    ordering: document.querySelector('[data-tokenizer-label="ordering"]'),
  };

  if (buttons.length === 0 || !summary) {
    return;
  }

  const data = {
    binning: {
      compression: [35, 'Low'],
      decodability: [100, 'Yes'],
      ordering: [20, 'Low'],
      summary:
        'Binning is universally decodable but produces long, flat token sequences that are hard for autoregressive policies to model efficiently.',
    },
    fast: {
      compression: [60, 'Medium'],
      decodability: [0, 'No'],
      ordering: [60, 'Medium'],
      summary:
        'FAST has medium compression and medium ordering, but variable-length BPE can make arbitrary generated sequences undefined for fixed-size action decoding.',
    },
    latent: {
      compression: [86, 'High'],
      decodability: [100, 'Yes'],
      ordering: [36, 'Low'],
      summary:
        'Vanilla latents can compress and decode well, but the token order is usually not structured for left-to-right next-token prediction.',
    },
    oat: {
      compression: [90, 'High'],
      decodability: [100, 'Yes'],
      ordering: [92, 'High'],
      summary:
        'OAT is designed to satisfy all three desiderata: compact action chunks, total decoding, and a prefix order that aligns with autoregressive generation.',
    },
  };

  const activate = (key) => {
    const selected = data[key] || data.binning;
    buttons.forEach((button) => {
      const isActive = button.dataset.tokenizerTarget === key;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
      if (isActive && panel && button.id) {
        panel.setAttribute('aria-labelledby', button.id);
      }
    });

    Object.entries(meters).forEach(([metric, meter]) => {
      if (!meter) {
        return;
      }
      meter.value = selected[metric][0];
    });

    Object.entries(labels).forEach(([metric, label]) => {
      if (!label) {
        return;
      }
      label.textContent = selected[metric][1];
    });

    summary.textContent = selected.summary;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => activate(button.dataset.tokenizerTarget));
    button.addEventListener('keydown', (event) => {
      const currentIndex = buttons.indexOf(button);
      const lastIndex = buttons.length - 1;
      let nextIndex = currentIndex;

      if (event.key === 'ArrowRight') {
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = lastIndex;
      } else {
        return;
      }

      event.preventDefault();
      buttons[nextIndex].focus();
      activate(buttons[nextIndex].dataset.tokenizerTarget);
    });
  });

  activate(buttons.find((button) => button.classList.contains('is-active'))?.dataset.tokenizerTarget || 'binning');
}

function setupBlogPrefixLab() {
  const choices = Array.from(document.querySelectorAll('[data-prefix-choice]'));
  const title = document.querySelector('[data-prefix-title]');
  const copy = document.querySelector('[data-prefix-copy]');
  const decodedLine = document.querySelector('[data-prefix-decoded-line]');
  const decodedPoints = Array.from(document.querySelectorAll('[data-prefix-decoded-point]'));

  if (choices.length === 0 || !title || !copy || !decodedLine || decodedPoints.length === 0) {
    return;
  }

  const summaries = {
    1: 'One token decodes a complete action chunk, but the reconstruction is coarse and visibly offset from the ground truth.',
    2: 'Two tokens keep the whole chunk executable while pulling the decoded trajectory closer to the reference.',
    4: 'Four tokens recover most coarse structure and start aligning fine-grained contact timing.',
    8: 'Eight tokens nearly overlap the ground truth, giving the highest-fidelity reconstruction in this view.',
  };
  const groundTruth = [
    [70, 170],
    [145, 145],
    [220, 122],
    [295, 102],
    [370, 88],
    [445, 74],
    [520, 61],
    [590, 50],
  ];
  const offsets = [
    [24, 26],
    [-28, -22],
    [30, 16],
    [-25, -18],
    [20, -20],
    [-21, 24],
    [17, -14],
    [-15, 13],
  ];
  const fidelity = {
    1: 1.25,
    2: 0.75,
    4: 0.35,
    8: 0.06,
  };

  const update = (nextValue) => {
    const value = [1, 2, 4, 8].includes(Number(nextValue)) ? Number(nextValue) : 4;
    const decoded = groundTruth.map(([x, y], index) => [
      x + offsets[index][0] * fidelity[value],
      y + offsets[index][1] * fidelity[value],
    ]);

    choices.forEach((choice) => {
      const isActive = Number(choice.dataset.prefixChoice) === value;
      choice.classList.toggle('is-active', isActive);
      choice.setAttribute('aria-pressed', String(isActive));
    });

    title.textContent = `${value} prefix token${value === 1 ? '' : 's'}`;
    copy.textContent = summaries[value];
    decodedLine.setAttribute('points', decoded.map(([x, y]) => `${x},${y}`).join(' '));
    decodedPoints.forEach((point, index) => {
      const [x, y] = decoded[index];
      point.setAttribute('cx', x);
      point.setAttribute('cy', y);
    });
  };

  choices.forEach((choice) => {
    choice.addEventListener('click', () => update(choice.dataset.prefixChoice));
  });

  update(1);
}
