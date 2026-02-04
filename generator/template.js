// Base HTML template for TESTIMOTION landing page
// This is converted from testimotion-landing.html

// Generate video testimonial card HTML
function generateVideoCard(values, index, videoFormat = 'landscape') {
  const thumb = values[`video_testimonial_thumb_${index}`];
  const name = values[`video_testimonial_name_${index}`] || '';
  const company = values[`video_testimonial_company_${index}`] || '';
  const videoUrl = values[`video_testimonial_url_${index}`] || '';

  if (!thumb) return '';

  // Aspect ratio class based on format
  const aspectClass = videoFormat === 'portrait' ? 'aspect-[9/16]' : 'aspect-video';

  // Add onclick handler if video URL is provided
  const onClickAttr = videoUrl ? `onclick="openVideoModal('${videoUrl}')"` : '';

  return `
        <!-- Video Testimonial ${index} -->
        <div class="card-radius relative overflow-hidden group cursor-pointer video-testimonial-card" data-ghl-container ${onClickAttr}>
          <img
            src="${thumb}"
            alt="Video Testimonial"
            class="w-full ${aspectClass} object-cover"
            data-ghl-token="video_testimonial_thumb_${index}"
          >
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
            <div class="play-button">
              <svg viewBox="0 0 24 24" fill="black">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <div class="absolute bottom-4 left-4 text-white">
            <p class="font-bold" data-ghl-token="video_testimonial_name_${index}">${name}</p>
            <p class="text-sm text-white/80" data-ghl-token="video_testimonial_company_${index}">${company}</p>
          </div>
        </div>`;
}

// Get adaptive grid classes based on filled video count and format
function getVideoGridClasses(filledCount, videoFormat = 'landscape') {
  if (videoFormat === 'portrait') {
    // Portrait mode: horizontal row with centered layout
    switch (filledCount) {
      case 1:
        return 'flex justify-center gap-6';
      case 2:
        return 'flex justify-center gap-6';
      default:
        return 'flex justify-center gap-6 overflow-x-auto';
    }
  }

  // Landscape mode (default): grid layout
  switch (filledCount) {
    case 1:
      return 'grid grid-cols-1 max-w-md mx-auto gap-6';
    case 2:
      return 'grid grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto gap-6';
    default:
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }
}

// Generate Google Fonts link if using web fonts
function generateGoogleFontsLink(headingFont, bodyFont) {
  const systemFonts = [
    'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI',
    'Roboto', 'Helvetica Neue', 'Arial', 'Helvetica', 'sans-serif',
    'serif', 'monospace'
  ];

  // Extract font name (first part before comma)
  function extractFontName(fontStack) {
    if (!fontStack) return null;
    const primary = fontStack.split(',')[0].trim().replace(/['"]/g, '');
    // Check if it's a system font
    if (systemFonts.some(sf => primary.toLowerCase() === sf.toLowerCase())) {
      return null;
    }
    return primary;
  }

  const headingName = extractFontName(headingFont);
  const bodyName = extractFontName(bodyFont);

  // Collect unique font names
  const fonts = [];
  if (headingName) fonts.push(headingName);
  if (bodyName && bodyName !== headingName) fonts.push(bodyName);

  if (fonts.length === 0) return '';

  // Build Google Fonts URL
  const families = fonts.map(f => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&');
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${families}&display=swap" rel="stylesheet">`;
}

// Generate the full template with values
export function generateTemplate(values, filledVideoCount = 3) {
  // Helper to get value with fallback
  const v = (key, fallback = '') => values[key] || fallback;

  // Get hidden sections as a JSON string for the template
  const hiddenSections = values._hiddenSections || [];
  const hiddenSectionsJson = JSON.stringify(hiddenSections);

  // Get video format setting
  const videoFormat = v('video_format', 'landscape');

  // Generate video testimonials section
  const videoCards = [1, 2, 3]
    .map(i => generateVideoCard(values, i, videoFormat))
    .filter(html => html)
    .join('\n');

  const videoGridClasses = getVideoGridClasses(filledVideoCount, videoFormat);

  // Generate Google Fonts link if needed
  const headingFont = v('heading_font', 'system-ui, -apple-system, sans-serif');
  const bodyFont = v('body_font', 'system-ui, -apple-system, sans-serif');
  const googleFontsLink = generateGoogleFontsLink(headingFont, bodyFont);

  // Get border radius value
  const borderRadius = v('border_radius', '16');

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TESTIMOTION - Laat klanten je sales doen</title>
  ${googleFontsLink}
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    :root {
      --brand-primary: ${v('brand_primary_color', '#ffcc03')};
      --brand-secondary: ${v('brand_secondary_color', '#0b9a9a')};
      --bg-gradient-start: ${v('bg_gradient_start', '#0a2e1f')};
      --bg-gradient-end: ${v('bg_gradient_end', '#030a07')};
      --font-heading: ${headingFont};
      --font-body: ${bodyFont};
      --radius: ${borderRadius}px;
      --radius-full: calc(${borderRadius}px + 100px);
    }

    body {
      font-family: var(--font-body);
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
    }

    .brand-primary { color: var(--brand-primary); }
    .bg-brand-primary { background-color: var(--brand-primary); }
    .border-brand-primary { border-color: var(--brand-primary); }
    .brand-secondary { color: var(--brand-secondary); }
    .bg-brand-secondary { background-color: var(--brand-secondary); }

    .bg-gradient-dark {
      background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
    }

    .star-rating {
      color: #FBBC04;  /* Google yellow - always consistent */
    }

    .play-button {
      width: 80px;
      height: 80px;
      background-color: var(--brand-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
      box-shadow: 0 0 30px rgba(255, 204, 3, 0.4);
    }

    .play-button:hover {
      transform: scale(1.1);
    }

    .play-button svg {
      width: 32px;
      height: 32px;
      margin-left: 4px;
    }

    /* Video frame with glowing effect */
    .video-frame {
      border-radius: var(--radius);
      box-shadow:
        0 0 60px rgba(255, 255, 255, 0.15),
        0 0 100px rgba(255, 255, 255, 0.1),
        0 0 140px rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      overflow: hidden;
      background: #000;
    }

    .step-number {
      width: 48px;
      height: 48px;
      background-color: var(--brand-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.25rem;
      color: #000;
    }

    .google-review-card {
      background: white;
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    /* CTA Buttons - pill shape */
    .btn-cta {
      border-radius: var(--radius-full) !important;
    }

    /* Cards use standard radius */
    .card-radius {
      border-radius: var(--radius) !important;
    }

    /* Step card images */
    .step-image {
      border-radius: calc(var(--radius) * 0.75);
    }

    .floating-testimonial {
      display: none; /* Hidden by default to prevent overlap */
    }

    /* Click-to-edit hover effect for preview elements */
    .editable-element {
      cursor: pointer;
      transition: outline 0.2s, outline-offset 0.2s;
    }

    .editable-element:hover {
      outline: 2px dashed var(--brand-primary);
      outline-offset: 4px;
    }

    @media (min-width: 1280px) {
      .floating-testimonial.show {
        display: block;
        position: absolute;
        right: -280px;
        top: 50%;
        transform: translateY(-50%);
        max-width: 300px;
        z-index: 10;
      }
    }
  </style>
</head>
<body class="bg-gradient-dark min-h-screen">

  <!-- ================================================== -->
  <!-- SECTION 1: HERO -->
  <!-- ================================================== -->
  <section class="relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">

      <!-- Logo - Responsive sizing -->
      <div class="flex justify-center mb-10" data-ghl-container>
        <img
          src="${v('logo_url')}"
          alt="TESTIMOTION Logo"
          class="h-10 md:h-14 lg:h-16"
          data-ghl-token="logo_url"
        >
      </div>

      <!-- Mini Testimonials Row - NO IMAGES, just stars + quoted text -->
      <div class="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-10" data-section="mini_testimonials">
        <div class="flex items-center gap-2">
          <span class="star-rating text-lg">★★★★★</span>
          <span class="text-white text-sm" data-ghl-token="mini_testimonial_1">"${v('mini_testimonial_1', 'Eindelijk een systeem dat werkt!')}"</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="star-rating text-lg">★★★★★</span>
          <span class="text-white text-sm" data-ghl-token="mini_testimonial_2">"${v('mini_testimonial_2', 'Onze omzet is verdubbeld.')}"</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="star-rating text-lg">★★★★★</span>
          <span class="text-white text-sm" data-ghl-token="mini_testimonial_3">"${v('mini_testimonial_3', 'Beste investering dit jaar.')}"</span>
        </div>
      </div>

      <!-- Hero Headline -->
      <div class="text-center max-w-4xl mx-auto mb-8">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-ghl-token="hero_headline">
          ${v('hero_headline', 'Laat klanten je sales doen.')}
        </h1>
        <p class="text-lg md:text-xl text-white/80 mb-8" data-ghl-token="hero_subheadline">
          ${v('hero_subheadline', 'Met ons bewezen systeem verzamelen, structureren en presenteren wij klantverhalen die vertrouwen wekken en conversies verhogen.')}
        </p>
      </div>

      <!-- CTA Button + Trust Badges on SAME LINE -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
        <!-- CTA Button -->
        <a
          href="${v('cta_button_url', '#form')}"
          class="btn-cta inline-block bg-brand-primary text-black font-bold text-lg px-8 py-4 hover:opacity-90 transition-opacity"
          data-ghl-token="cta_button_text"
        >
          ${v('cta_button_text', 'Ik wil dit systeem')}
        </a>

        <!-- Trust Badges -->
        <div class="flex items-center gap-3" data-section="trust_badges">
          <div class="flex -space-x-3">
            <img src="${v('trust_badge_photo_1')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_1">
            <img src="${v('trust_badge_photo_2')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_2">
            <img src="${v('trust_badge_photo_3')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_3">
            <img src="${v('trust_badge_photo_4')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_4">
            <img src="${v('trust_badge_photo_5')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_5">
          </div>
          <p class="text-white/60 text-sm">
            Vertrouwd door <span class="text-white font-semibold" data-ghl-token="trust_badge_count">${v('trust_badge_count', '35+')}</span> ondernemers
          </p>
        </div>
      </div>

      <!-- Video with Glowing Frame -->
      <div class="max-w-4xl mx-auto mb-12" data-section="video">
        <div class="video-frame aspect-video relative">
          <iframe
            src="${v('vimeo_embed_url')}"
            class="w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>

      <!-- Client Logos Row -->
      <div class="flex flex-wrap justify-center items-center gap-8 md:gap-12 pt-4" data-section="client_logos">
        <span data-ghl-container><img src="${v('client_logo_1')}" alt="Client Logo" class="h-8 md:h-10 lg:h-12 opacity-70" data-ghl-token="client_logo_1"></span>
        <span data-ghl-container><img src="${v('client_logo_2')}" alt="Client Logo" class="h-8 md:h-10 lg:h-12 opacity-70" data-ghl-token="client_logo_2"></span>
        <span data-ghl-container><img src="${v('client_logo_3')}" alt="Client Logo" class="h-8 md:h-10 lg:h-12 opacity-70" data-ghl-token="client_logo_3"></span>
        <span data-ghl-container><img src="${v('client_logo_4')}" alt="Client Logo" class="h-8 md:h-10 lg:h-12 opacity-70" data-ghl-token="client_logo_4"></span>
      </div>

    </div>
  </section>

  <!-- ================================================== -->
  <!-- SECTION 2: PROCESS STEPS -->
  <!-- ================================================== -->
  <section class="py-16 md:py-24 relative" data-section="process_steps">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Section Headline -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4" data-ghl-token="process_headline">
          ${v('process_headline', 'Hoe wij in 4 stappen klantverhalen omzetten naar omzet')}
        </h2>
      </div>

      <div class="relative">

        <!-- Process Steps Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">

          <!-- Step 1: Proof Capture -->
          <div class="card-radius bg-white p-6 relative">
            <div class="step-number absolute -top-4 -left-4">1</div>
            <div class="step-image mb-4 overflow-hidden">
              <img
                src="${v('step_image_1')}"
                alt="Proof Capture"
                class="w-full h-48 object-cover"
                data-ghl-token="step_image_1"
              >
            </div>
            <h3 class="text-xl font-bold text-black mb-2" data-ghl-token="step_1_title">
              ${v('step_1_title', 'Proof Capture')}
            </h3>
            <p class="text-gray-600 text-sm" data-ghl-token="step_1_description">
              ${v('step_1_description', 'Wij verzamelen authentieke klantervaringen via gestructureerde interviews en video-opnames.')}
            </p>
          </div>

          <!-- Step 2: Proof Story Build -->
          <div class="card-radius bg-white p-6 relative">
            <div class="step-number absolute -top-4 -left-4">2</div>
            <div class="step-image mb-4 overflow-hidden">
              <img
                src="${v('step_image_2')}"
                alt="Proof Story Build"
                class="w-full h-48 object-cover"
                data-ghl-token="step_image_2"
              >
            </div>
            <h3 class="text-xl font-bold text-black mb-2" data-ghl-token="step_2_title">
              ${v('step_2_title', 'Proof Story Build')}
            </h3>
            <p class="text-gray-600 text-sm" data-ghl-token="step_2_description">
              ${v('step_2_description', 'We structureren de verhalen tot overtuigende cases met duidelijke resultaten en emotie.')}
            </p>
          </div>

          <!-- Step 3: Proof Page -->
          <div class="card-radius bg-white p-6 relative">
            <div class="step-number absolute -top-4 -left-4">3</div>
            <div class="step-image mb-4 overflow-hidden">
              <img
                src="${v('step_image_3')}"
                alt="Proof Page"
                class="w-full h-48 object-cover"
                data-ghl-token="step_image_3"
              >
            </div>
            <h3 class="text-xl font-bold text-black mb-2" data-ghl-token="step_3_title">
              ${v('step_3_title', 'Proof Page')}
            </h3>
            <p class="text-gray-600 text-sm" data-ghl-token="step_3_description">
              ${v('step_3_description', 'Alles komt samen op een krachtige landingspagina die bezoekers omzet in klanten.')}
            </p>
          </div>

        </div>

        <!-- Floating Testimonial Card (hidden by default to prevent overlap) -->
        <div class="floating-testimonial">
          <div class="card-radius bg-white p-6 shadow-xl">
            <div class="flex items-center gap-4 mb-4">
              <img
                src="${v('testimonial_photo_4')}"
                alt="${v('testimonial_name')}"
                class="w-16 h-16 rounded-full object-cover"
              >
              <div>
                <p class="font-bold text-black">${v('testimonial_name', 'Jan Willem Addink')}</p>
                <p class="text-gray-500 text-sm">${v('testimonial_company', 'Olmia Robotics')}</p>
              </div>
            </div>
            <p class="text-gray-700 italic">
              "${v('testimonial_quote', 'Door TESTIMOTION hebben we nu een constante stroom van leads die al overtuigd zijn voordat ze contact opnemen.')}"
            </p>
            <div class="star-rating mt-3">★★★★★</div>
          </div>
        </div>

      </div>

      <!-- CTA Button: "Laat klanten ook mijn sales doen" -->
      <div class="text-center mt-16">
        <a
          href="${v('cta_button_url', '#form')}"
          class="btn-cta inline-block bg-brand-primary text-black font-bold text-lg px-8 py-4 hover:opacity-90 transition-opacity mb-4"
          data-ghl-token="cta_button_secondary_text"
        >
          ${v('cta_button_secondary_text', 'Laat klanten ook mijn sales doen')}
        </a>
        <p class="text-white/60 text-sm" data-ghl-token="guarantee_text">
          ${v('guarantee_text', '100% tevredenheidsgarantie - Geen resultaat? Geld terug.')}
        </p>
      </div>

    </div>
  </section>

  <!-- ================================================== -->
  <!-- SECTION 3: REVIEWS -->
  <!-- ================================================== -->
  <section class="py-16 md:py-24" style="background: rgba(255, 255, 255, 0.05);" data-section="google_reviews">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Trust Header -->
      <div class="flex items-center justify-center gap-4 mb-12">
        <div class="flex -space-x-2">
          <img src="${v('trust_badge_photo_1')}" alt="" class="w-8 h-8 rounded-full border-2 border-white object-cover" data-ghl-token="trust_badge_photo_1">
          <img src="${v('trust_badge_photo_2')}" alt="" class="w-8 h-8 rounded-full border-2 border-white object-cover" data-ghl-token="trust_badge_photo_2">
          <img src="${v('trust_badge_photo_3')}" alt="" class="w-8 h-8 rounded-full border-2 border-white object-cover" data-ghl-token="trust_badge_photo_3">
        </div>
        <p class="text-white">
          Vertrouwd door <span class="font-bold" data-ghl-token="trust_badge_count">${v('trust_badge_count', '35+')}</span> ondernemers
        </p>
      </div>

      <!-- Google Review Cards Grid (3x2 layout) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">

        <!-- Review 1 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_1')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_1"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_1', 'Peter de Vries')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_1', 'Professionele aanpak en geweldig resultaat. Onze testimonial pagina converteert nu 3x beter.')}"
          </p>
        </div>

        <!-- Review 2 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_2')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_2"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_2', 'Maria Jansen')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_2', 'Eindelijk een partij die snapt hoe je klantverhalen moet inzetten. Absolute aanrader!')}"
          </p>
        </div>

        <!-- Review 3 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_3')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_3"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_3', 'Thomas van Dijk')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_3', 'ROI binnen 2 maanden terugverdiend. De video testimonials maken echt het verschil.')}"
          </p>
        </div>

        <!-- Review 4 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_4')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_4"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_4', 'Lisa van den Berg')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_4', 'Super tevreden met het resultaat. Klanten komen nu al overtuigd bij ons binnen.')}"
          </p>
        </div>

        <!-- Review 5 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_5')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_5"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_5', 'Jan Willem Addink')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_5', 'Door TESTIMOTION hebben we nu een constante stroom van leads die al overtuigd zijn.')}"
          </p>
        </div>

        <!-- Review 6 -->
        <div class="google-review-card" data-ghl-container>
          <div class="flex items-center gap-3 mb-4">
            <img
              src="${v('review_avatar_6')}"
              alt="Reviewer"
              class="w-12 h-12 rounded-full object-cover"
              data-ghl-token="review_avatar_6"
            >
            <div>
              <p class="font-bold text-black">${v('review_name_6', 'Erik Bakker')}</p>
              <div class="flex items-center gap-2">
                <img src="https://www.google.com/favicon.ico" alt="Google" class="w-4 h-4">
                <span class="star-rating text-sm">★★★★★</span>
              </div>
            </div>
          </div>
          <p class="text-gray-700">
            "${v('review_text_6', "Fantastische kwaliteit video's en de hele workflow was super smooth.")}"
          </p>
        </div>

      </div>

      <!-- Video Testimonials Section -->
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4" data-ghl-token="reviews_headline">
          ${v('reviews_headline', 'Dit zeggen onze klanten over het systeem')}
        </h2>
        <p class="text-white/60" data-ghl-token="reviews_subheadline">
          ${v('reviews_subheadline', 'Bekijk de video testimonials van ondernemers die je voorgingen')}
        </p>
      </div>

      <!-- Video Testimonial Grid - Adaptive based on filled count -->
      <div class="${videoGridClasses}" data-section="video_testimonials">
${videoCards}
      </div>

    </div>
  </section>

  <!-- ================================================== -->
  <!-- SECTION 4: FOOTER CTA + FORM -->
  <!-- ================================================== -->
  <section id="form" class="py-16 md:py-24" data-section="footer_cta">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

      <!-- Final Headline -->
      <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6" data-ghl-token="footer_headline">
        ${v('footer_headline', 'Klaar om je klanten voor je te laten verkopen?')}
      </h2>

      <p class="text-white/80 text-lg mb-8" data-ghl-token="footer_subheadline">
        ${v('footer_subheadline', 'Plan een vrijblijvend gesprek en ontdek hoe wij jouw klantverhalen omzetten in een conversiemachine.')}
      </p>

      <!-- Trust Badges -->
      <div class="flex flex-col items-center gap-4 mb-8">
        <div class="flex -space-x-3">
          <img src="${v('trust_badge_photo_1')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_1">
          <img src="${v('trust_badge_photo_2')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_2">
          <img src="${v('trust_badge_photo_3')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_3">
          <img src="${v('trust_badge_photo_4')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_4">
          <img src="${v('trust_badge_photo_5')}" alt="" class="w-10 h-10 rounded-full border-2 border-white/20 object-cover" data-ghl-token="trust_badge_photo_5">
        </div>
        <p class="text-white/60 text-sm">
          Vertrouwd door <span class="text-white font-semibold" data-ghl-token="trust_badge_count">${v('trust_badge_count', '35+')}</span> ondernemers
        </p>
      </div>

      <!-- Form Container (only form location on the page) -->
      <div class="card-radius w-full max-w-md mx-auto p-6 bg-white/10 backdrop-blur border border-white/10">
        <!-- GHL_FORM_EMBED: Drag and drop a GHL form element here in the builder -->
      </div>

    </div>
  </section>

  <!-- ================================================== -->
  <!-- FOOTER -->
  <!-- ================================================== -->
  <footer class="py-8 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <img
          src="${v('logo_url')}"
          alt="Logo"
          class="h-8"
          data-ghl-token="logo_url"
        >
        <p class="text-white/40 text-sm">
          © <span data-ghl-token="current_year">${v('current_year', '2025')}</span> <span data-ghl-token="company_name">${v('company_name', 'TESTIMOTION')}</span>. <span data-ghl-token="copyright_text">${v('copyright_text', 'Alle rechten voorbehouden.')}</span>
        </p>
      </div>
    </div>
  </footer>

  <!-- ================================================== -->
  <!-- CONDITIONAL HIDING JAVASCRIPT -->
  <!-- ================================================== -->
  <script>
    /**
     * Conditional Hiding for GHL Custom Values
     *
     * This script checks all elements with data-ghl-token attributes.
     * If the image src contains unresolved {{ tokens }} or is empty,
     * the parent container (data-ghl-container) is hidden.
     *
     * This prevents broken image icons and empty content blocks
     * when Custom Values are not filled in for a specific client.
     */
    document.addEventListener('DOMContentLoaded', function() {
      // Hide sections that are marked as hidden
      const hiddenSections = ${hiddenSectionsJson};
      hiddenSections.forEach(function(sectionId) {
        const sectionElements = document.querySelectorAll('[data-section="' + sectionId + '"]');
        sectionElements.forEach(function(el) {
          el.style.display = 'none';
        });
      });

      // Find all elements with data-ghl-token attribute
      const tokenElements = document.querySelectorAll('[data-ghl-token]');

      tokenElements.forEach(function(el) {
        const src = el.getAttribute('src') || el.textContent || '';
        const tokenName = el.getAttribute('data-ghl-token');

        // Check if the value is empty, contains unresolved tokens, or is a placeholder
        const isEmpty = !src ||
                       src.trim() === '' ||
                       src.includes('{{') ||
                       src.includes('}}') ||
                       src.includes('custom_values.');

        if (isEmpty) {
          // Find the parent container and hide it
          const container = el.closest('[data-ghl-container]');
          if (container) {
            container.style.display = 'none';
          } else {
            // If no container, hide the element itself
            el.style.display = 'none';
          }
        }
      });

      /**
       * Click-to-Focus Handler for Editor Integration
       *
       * When an element with data-ghl-token is clicked in the preview,
       * send a message to the parent editor to focus the corresponding field.
       */
      tokenElements.forEach(function(el) {
        // Add visual feedback for clickable elements
        el.classList.add('editable-element');

        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const token = el.dataset.ghlToken;
          if (token && window.parent) {
            window.parent.postMessage({ type: 'focus-field', field: token }, '*');
          }
        });
      });
    });

    /**
     * Image Error Fallback Handler
     *
     * If an image fails to load (404, broken URL, etc.),
     * this handler hides the container to prevent broken image icons.
     */
    document.querySelectorAll('img[data-ghl-token]').forEach(function(img) {
      img.addEventListener('error', function() {
        const container = this.closest('[data-ghl-container]');
        if (container) {
          container.style.display = 'none';
        } else {
          this.style.display = 'none';
        }
      });
    });

    /**
     * Video Modal Functions
     */
    function openVideoModal(videoUrl) {
      if (!videoUrl) return;

      const modal = document.getElementById('video-modal');
      const iframe = document.getElementById('video-modal-iframe');

      if (modal && iframe) {
        // Ensure URL has autoplay parameter
        let url = videoUrl;
        if (url.includes('vimeo.com')) {
          url = url.includes('?') ? url + '&autoplay=1' : url + '?autoplay=1';
        }

        iframe.src = url;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeVideoModal() {
      const modal = document.getElementById('video-modal');
      const iframe = document.getElementById('video-modal-iframe');

      if (modal && iframe) {
        modal.classList.remove('active');
        iframe.src = '';
        document.body.style.overflow = '';
      }
    }

    // Close modal on backdrop click
    document.addEventListener('DOMContentLoaded', function() {
      const modal = document.getElementById('video-modal');
      if (modal) {
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            closeVideoModal();
          }
        });
      }

      // Close on Escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          closeVideoModal();
        }
      });
    });
  <\/script>

  <!-- Video Modal -->
  <div id="video-modal" class="video-modal">
    <button class="video-modal-close" onclick="closeVideoModal()" aria-label="Close video">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
    <div class="video-modal-content">
      <iframe id="video-modal-iframe" src="" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    </div>
  </div>

  <style>
    /* Video Modal Styles */
    .video-modal {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.9);
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .video-modal.active {
      display: flex;
    }

    .video-modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      z-index: 10001;
    }

    .video-modal-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .video-modal-close svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .video-modal-content {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 16/9;
    }

    .video-modal-content iframe {
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }

    /* Portrait video cards max height */
    .video-testimonial-card.aspect-\\[9\\/16\\] {
      max-height: 500px;
    }
  </style>

</body>
</html>`;
}

// Default export for backwards compatibility
export default generateTemplate;
