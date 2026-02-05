// Default values parsed from ghl-custom-values-template.csv
// These serve as form placeholders and reset values

export const DEFAULTS = {
  // Branding - Logo placeholder
  logo_url: 'https://placehold.co/200x60/1a1a1a/ffffff?text=LOGO',
  brand_primary_color: '#ffcc03',
  brand_secondary_color: '#0b9a9a',
  bg_gradient_start: '#0a2e1f',
  bg_gradient_end: '#030a07',

  // Typography
  heading_font: 'system-ui, -apple-system, sans-serif',
  body_font: 'system-ui, -apple-system, sans-serif',

  // Advanced Options
  border_radius: '16',  // Global corner radius in px (default: 16)

  // Hero Section
  hero_headline: 'Laat klanten je sales doen.',
  hero_subheadline: 'Met ons bewezen systeem verzamelen structureren en presenteren wij klantverhalen die vertrouwen wekken en conversies verhogen.',
  cta_button_text: 'Ik wil dit systeem',
  cta_button_secondary_text: 'Laat klanten ook mijn sales doen',
  cta_button_url: '#form',
  vimeo_embed_url: '',

  // Trust Badges - Avatar placeholders with diverse faces
  trust_badge_count: '35+',
  trust_badge_photo_1: 'https://i.pravatar.cc/80?img=1',
  trust_badge_photo_2: 'https://i.pravatar.cc/80?img=5',
  trust_badge_photo_3: 'https://i.pravatar.cc/80?img=8',
  trust_badge_photo_4: 'https://i.pravatar.cc/80?img=12',
  trust_badge_photo_5: 'https://i.pravatar.cc/80?img=15',

  // Mini Testimonials (small avatar + quote)
  mini_testimonial_1: 'Eindelijk een systeem dat werkt!',
  mini_testimonial_2: 'Onze omzet is verdubbeld.',
  mini_testimonial_3: 'Beste investering dit jaar.',
  mini_testimonial_avatar_1: 'https://i.pravatar.cc/48?img=32',
  mini_testimonial_avatar_2: 'https://i.pravatar.cc/48?img=47',
  mini_testimonial_avatar_3: 'https://i.pravatar.cc/48?img=51',

  // Process Steps
  process_headline: 'Hoe wij in 4 stappen klantverhalen omzetten naar omzet',
  step_1_title: 'Proof Capture',
  step_1_description: 'Wij verzamelen authentieke klantervaringen via gestructureerde interviews en video-opnames.',
  step_image_1: 'https://placehold.co/400x300/1a1a1a/ffffff?text=Step+1%0ACapture',
  step_2_title: 'Proof Story Build',
  step_2_description: 'We structureren de verhalen tot overtuigende cases met duidelijke resultaten en emotie.',
  step_image_2: 'https://placehold.co/400x300/1a1a1a/ffffff?text=Step+2%0ABuild',
  step_3_title: 'Proof Page',
  step_3_description: 'Alles komt samen op een krachtige landingspagina die bezoekers omzet in klanten.',
  step_image_3: 'https://placehold.co/400x300/1a1a1a/ffffff?text=Step+3%0APage',
  guarantee_text: '100% tevredenheidsgarantie - Geen resultaat? Geld terug.',

  // Google Reviews Badge
  google_rating: '5.0',
  google_review_count: '35',
  google_reviews_url: '',  // Leave empty to hide badge

  // Google Reviews - Avatar placeholders
  review_name_1: 'Peter de Vries',
  review_text_1: 'Professionele aanpak en geweldig resultaat. Onze testimonial pagina converteert nu 3x beter.',
  review_avatar_1: 'https://i.pravatar.cc/80?img=33',
  review_name_2: 'Maria Jansen',
  review_text_2: 'Eindelijk een partij die snapt hoe je klantverhalen moet inzetten. Absolute aanrader!',
  review_avatar_2: 'https://i.pravatar.cc/80?img=25',
  review_name_3: 'Thomas van Dijk',
  review_text_3: 'ROI binnen 2 maanden terugverdiend. De video testimonials maken echt het verschil.',
  review_avatar_3: 'https://i.pravatar.cc/80?img=52',
  review_name_4: 'Lisa van den Berg',
  review_text_4: 'Super tevreden met het resultaat. Klanten komen nu al overtuigd bij ons binnen.',
  review_avatar_4: 'https://i.pravatar.cc/80?img=47',
  review_name_5: 'Jan Willem Addink',
  review_text_5: 'Door TESTIMOTION hebben we nu een constante stroom van leads die al overtuigd zijn.',
  review_avatar_5: 'https://i.pravatar.cc/80?img=59',
  review_name_6: 'Erik Bakker',
  review_text_6: 'Fantastische kwaliteit videos en de hele workflow was super smooth.',
  review_avatar_6: 'https://i.pravatar.cc/80?img=61',

  // Video Testimonials
  reviews_headline: 'Dit zeggen onze klanten over het systeem',
  reviews_subheadline: 'Bekijk de video testimonials van ondernemers die je voorgingen',
  video_testimonial_thumb_1: 'https://placehold.co/400x225/1a1a1a/ffffff?text=Video+1%0ATestimonial',
  video_testimonial_name_1: 'Erik Bakker',
  video_testimonial_company_1: 'Digital Agency',
  video_testimonial_url_1: '',
  video_testimonial_thumb_2: 'https://placehold.co/400x225/1a1a1a/ffffff?text=Video+2%0ATestimonial',
  video_testimonial_name_2: 'Sandra Mulder',
  video_testimonial_company_2: 'Coaching Practice',
  video_testimonial_url_2: '',
  video_testimonial_thumb_3: 'https://placehold.co/400x225/1a1a1a/ffffff?text=Video+3%0ATestimonial',
  video_testimonial_name_3: 'Mark Hendriks',
  video_testimonial_company_3: 'SaaS Company',
  video_testimonial_url_3: '',
  video_format: 'landscape',  // 'landscape' (16:9) or 'portrait' (9:16)

  // Footer
  footer_headline: 'Klaar om je klanten voor je te laten verkopen?',
  footer_subheadline: 'Plan een vrijblijvend gesprek en ontdek hoe wij jouw klantverhalen omzetten in een conversiemachine.',

  // FAQ Section
  faq_headline: 'Veelgestelde vragen',
  faq_question_1: 'Hoe werkt het proces precies?',
  faq_answer_1: 'Ons proces bestaat uit drie stappen: eerst verzamelen we klantverhalen via interviews, dan structureren we deze tot overtuigende cases, en tot slot presenteren we alles op een professionele landingspagina die converteert.',
  faq_question_2: 'Wat is inbegrepen in het pakket?',
  faq_answer_2: 'Je krijgt professionele video-interviews, geschreven testimonials, een volledig ingerichte landingspagina, en alle bestanden in hoge kwaliteit voor eigen gebruik.',
  faq_question_3: 'Wat als mijn klanten niet willen meewerken?',
  faq_answer_3: 'Wij helpen je met het benaderen van klanten en maken het proces zo makkelijk mogelijk. De meeste klanten zijn vereerd om gevraagd te worden en werken graag mee.',
  faq_question_4: 'Hoeveel kost het en wat is de ROI?',
  faq_answer_4: 'De investering varieert per pakket. De meeste klanten verdienen hun investering binnen 2-3 maanden terug door hogere conversies en meer vertrouwen bij prospects.',
  faq_question_5: 'Hoe lang duurt het voordat alles klaar is?',
  faq_answer_5: 'Gemiddeld is alles binnen 2-4 weken klaar, afhankelijk van de beschikbaarheid van je klanten voor interviews. Wij zorgen voor een soepele planning.',

  // Client Logos - Business logo placeholders (auto-scrolling marquee)
  client_logo_1: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+1',
  client_logo_2: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+2',
  client_logo_3: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+3',
  client_logo_4: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+4',
  client_logo_5: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+5',
  client_logo_6: 'https://placehold.co/150x50/1a1a1a/ffffff?text=Client+6',
  client_logo_7: '',
  client_logo_8: '',

  // Optional floating testimonial fields
  testimonial_name: 'Jan Willem Addink',
  testimonial_company: 'Olmia Robotics',
  testimonial_quote: 'Door TESTIMOTION hebben we nu een constante stroom van leads die al overtuigd zijn voordat ze contact opnemen.',
  testimonial_photo_4: 'https://i.pravatar.cc/120?img=59'
};

export default DEFAULTS;
