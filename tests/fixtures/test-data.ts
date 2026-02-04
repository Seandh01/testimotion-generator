/**
 * Test Data Fixtures for TESTIMOTION Generator E2E Tests
 * Contains comprehensive field inventory and test values
 */

// All form fields in the generator
export const FORM_FIELDS = {
  // Branding Section
  branding: {
    logo_url: { type: 'url', testValue: 'https://example.com/test-logo.png' },
    brand_primary_color: { type: 'color', testValue: '#ff5500' },
    brand_secondary_color: { type: 'color', testValue: '#0055ff' },
    bg_gradient_start: { type: 'color', testValue: '#1a1a1a' },
    bg_gradient_end: { type: 'color', testValue: '#2a2a2a' },
    heading_font: { type: 'text', testValue: 'Inter, sans-serif' },
    body_font: { type: 'text', testValue: 'Open Sans, sans-serif' },
  },

  // Hero Section
  hero: {
    hero_headline: { type: 'text', testValue: 'Test Hero Headline' },
    hero_subheadline: { type: 'textarea', testValue: 'Test hero subheadline with longer content.' },
    cta_button_text: { type: 'text', testValue: 'Click Me Now' },
    cta_button_url: { type: 'url', testValue: '#test-form' },
    cta_button_secondary_text: { type: 'text', testValue: 'Secondary CTA Text' },
  },

  // Video Section
  video: {
    vimeo_embed_url: { type: 'url', testValue: 'https://player.vimeo.com/video/123456789' },
  },

  // Trust Badges Section
  trust_badges: {
    trust_badge_count: { type: 'text', testValue: '50+' },
    trust_badge_photo_1: { type: 'url', testValue: 'https://example.com/badge1.jpg' },
    trust_badge_photo_2: { type: 'url', testValue: 'https://example.com/badge2.jpg' },
    trust_badge_photo_3: { type: 'url', testValue: 'https://example.com/badge3.jpg' },
    trust_badge_photo_4: { type: 'url', testValue: 'https://example.com/badge4.jpg' },
    trust_badge_photo_5: { type: 'url', testValue: 'https://example.com/badge5.jpg' },
  },

  // Mini Testimonials Section
  mini_testimonials: {
    mini_testimonial_1: { type: 'text', testValue: 'Great product!' },
    mini_testimonial_2: { type: 'text', testValue: 'Changed my business!' },
    mini_testimonial_3: { type: 'text', testValue: 'Highly recommend!' },
  },

  // Process Steps Section
  process_steps: {
    process_headline: { type: 'text', testValue: 'Our 3-Step Process' },
    guarantee_text: { type: 'text', testValue: '100% satisfaction guaranteed' },
    step_1_title: { type: 'text', testValue: 'Step One Title' },
    step_1_description: { type: 'textarea', testValue: 'Step one description text.' },
    step_image_1: { type: 'url', testValue: 'https://example.com/step1.jpg' },
    step_2_title: { type: 'text', testValue: 'Step Two Title' },
    step_2_description: { type: 'textarea', testValue: 'Step two description text.' },
    step_image_2: { type: 'url', testValue: 'https://example.com/step2.jpg' },
    step_3_title: { type: 'text', testValue: 'Step Three Title' },
    step_3_description: { type: 'textarea', testValue: 'Step three description text.' },
    step_image_3: { type: 'url', testValue: 'https://example.com/step3.jpg' },
  },

  // Google Reviews Section
  google_reviews: {
    review_name_1: { type: 'text', testValue: 'John Doe' },
    review_text_1: { type: 'textarea', testValue: 'Amazing service!' },
    review_avatar_1: { type: 'url', testValue: 'https://example.com/avatar1.jpg' },
    review_name_2: { type: 'text', testValue: 'Jane Smith' },
    review_text_2: { type: 'textarea', testValue: 'Excellent results!' },
    review_avatar_2: { type: 'url', testValue: 'https://example.com/avatar2.jpg' },
    review_name_3: { type: 'text', testValue: 'Bob Johnson' },
    review_text_3: { type: 'textarea', testValue: 'Highly professional!' },
    review_avatar_3: { type: 'url', testValue: 'https://example.com/avatar3.jpg' },
    review_name_4: { type: 'text', testValue: 'Alice Brown' },
    review_text_4: { type: 'textarea', testValue: 'Worth every penny!' },
    review_avatar_4: { type: 'url', testValue: 'https://example.com/avatar4.jpg' },
    review_name_5: { type: 'text', testValue: 'Charlie Wilson' },
    review_text_5: { type: 'textarea', testValue: 'Game changer!' },
    review_avatar_5: { type: 'url', testValue: 'https://example.com/avatar5.jpg' },
    review_name_6: { type: 'text', testValue: 'Diana Davis' },
    review_text_6: { type: 'textarea', testValue: 'Best decision ever!' },
    review_avatar_6: { type: 'url', testValue: 'https://example.com/avatar6.jpg' },
  },

  // Video Testimonials Section
  video_testimonials: {
    reviews_headline: { type: 'text', testValue: 'What Our Clients Say' },
    reviews_subheadline: { type: 'text', testValue: 'Watch their stories' },
    video_format: { type: 'select', testValue: 'landscape' },
    video_testimonial_name_1: { type: 'text', testValue: 'Erik Test' },
    video_testimonial_company_1: { type: 'text', testValue: 'Test Company 1' },
    video_testimonial_thumb_1: { type: 'url', testValue: 'https://example.com/thumb1.jpg' },
    video_testimonial_url_1: { type: 'url', testValue: 'https://player.vimeo.com/video/111111111' },
    video_testimonial_name_2: { type: 'text', testValue: 'Sandra Test' },
    video_testimonial_company_2: { type: 'text', testValue: 'Test Company 2' },
    video_testimonial_thumb_2: { type: 'url', testValue: 'https://example.com/thumb2.jpg' },
    video_testimonial_url_2: { type: 'url', testValue: 'https://player.vimeo.com/video/222222222' },
    video_testimonial_name_3: { type: 'text', testValue: 'Mark Test' },
    video_testimonial_company_3: { type: 'text', testValue: 'Test Company 3' },
    video_testimonial_thumb_3: { type: 'url', testValue: 'https://example.com/thumb3.jpg' },
    video_testimonial_url_3: { type: 'url', testValue: 'https://player.vimeo.com/video/333333333' },
  },

  // Footer CTA Section
  footer_cta: {
    footer_headline: { type: 'text', testValue: 'Ready to Get Started?' },
    footer_subheadline: { type: 'textarea', testValue: 'Contact us today for a free consultation.' },
    company_name: { type: 'text', testValue: 'TEST COMPANY' },
    copyright_text: { type: 'text', testValue: 'All rights reserved.' },
  },

  // Client Logos Section
  client_logos: {
    client_logo_1: { type: 'url', testValue: 'https://example.com/client1.png' },
    client_logo_2: { type: 'url', testValue: 'https://example.com/client2.png' },
    client_logo_3: { type: 'url', testValue: 'https://example.com/client3.png' },
    client_logo_4: { type: 'url', testValue: 'https://example.com/client4.png' },
  },

  // Advanced Options
  advanced: {
    border_radius: { type: 'number', testValue: '24' },
  },

  // Floating Testimonial
  floating_testimonial: {
    testimonial_name: { type: 'text', testValue: 'Floating Test Name' },
    testimonial_company: { type: 'text', testValue: 'Floating Test Company' },
    testimonial_quote: { type: 'textarea', testValue: 'This is a floating testimonial quote.' },
    testimonial_photo_4: { type: 'url', testValue: 'https://example.com/floating.jpg' },
  },
};

// Sections that can be hidden
export const HIDEABLE_SECTIONS = [
  'hero',
  'video',
  'trust_badges',
  'mini_testimonials',
  'process_steps',
  'google_reviews',
  'video_testimonials',
  'footer_cta',
  'client_logos',
];

// Fields that have hide toggle buttons
export const HIDEABLE_FIELDS = Object.entries(FORM_FIELDS).flatMap(([section, fields]) =>
  Object.keys(fields).filter(field => {
    // These fields don't have hide toggles
    const noHideToggle = ['video_format', 'border_radius'];
    return !noHideToggle.includes(field);
  })
);

// Color fields that should apply CSS variables
export const COLOR_FIELDS = [
  { field: 'brand_primary_color', cssVar: '--brand-primary', defaultValue: '#ffcc03' },
  { field: 'brand_secondary_color', cssVar: '--brand-secondary', defaultValue: '#0b9a9a' },
  { field: 'bg_gradient_start', cssVar: '--bg-gradient-start', defaultValue: '#0a2e1f' },
  { field: 'bg_gradient_end', cssVar: '--bg-gradient-end', defaultValue: '#030a07' },
];

// Elements that should use border-radius variable
export const BORDER_RADIUS_ELEMENTS = [
  { selector: '.cta-btn', description: 'CTA buttons' },
  { selector: '.video-frame', description: 'Video frame' },
  { selector: '.review-card', description: 'Review cards' },
  { selector: '.step-card', description: 'Step cards' },
  { selector: '.testimonial-card', description: 'Testimonial cards' },
  { selector: '.modal-iframe', description: 'Modal iframe' },
];

// Test values for copy generation
export const AI_COPY_TEST_DATA = {
  websiteUrl: 'https://example.com',
  prompt: 'We help businesses grow with video testimonials',
  language: 'en',
};

// Test version data
export const VERSION_TEST_DATA = {
  label: 'Test Version Label',
  values: {
    hero_headline: 'Saved Headline',
    hero_subheadline: 'Saved Subheadline',
    brand_primary_color: '#123456',
  },
  hidden: ['logo_url'],
};

// Get all field names as a flat array
export function getAllFieldNames(): string[] {
  return Object.values(FORM_FIELDS).flatMap(section => Object.keys(section));
}

// Get field info by name
export function getFieldInfo(fieldName: string): { type: string; testValue: string } | null {
  for (const section of Object.values(FORM_FIELDS)) {
    if (fieldName in section) {
      return section[fieldName as keyof typeof section];
    }
  }
  return null;
}
