export interface DefaultMenuItem {
  label: string;
  href?: string;
  icon?: string;
  key?: string;
  order: number;
  is_active?: boolean;
  children?: DefaultMenuItem[];
}

/**
 * Synced on every boot (see MenuService.onModuleInit, which inserts any
 * key here that's missing from the table and leaves existing rows alone)
 * — mirrors every dashboard route that actually exists in
 * frontend/src/app/(dashboardLayout)/dashboard, so the sidebar never links
 * to a page that isn't there.
 */
export const defaultMenus: DefaultMenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    key: 'dashboard',
    order: 0,
  },
  {
    label: 'Video Gallary',
    icon: 'Video',
    key: 'video-gallery-group',
    order: 1,
    children: [
      {
        label: 'Video Gallary Category',
        href: '/dashboard/video-gallary-category/all-video-gallary-categories',
        icon: 'Tags',
        key: 'video-gallery-category',
        order: 0,
      },
      {
        label: 'Video Gallaries',
        href: '/dashboard/video-gallaries/all-video-gallaries',
        icon: 'PlayCircle',
        key: 'video-gallery',
        order: 1,
      },
    ],
  },
  {
    label: 'Blog',
    icon: 'Newspaper',
    key: 'blog-group',
    order: 2,
    children: [
      {
        label: 'Blog Category',
        href: '/dashboard/blog/blog-category/all-blog-category',
        icon: 'Tags',
        key: 'blog-category',
        order: 0,
      },
      {
        label: 'Blog Posts',
        href: '/dashboard/blog/blog-posts/all-blog-posts',
        icon: 'FileText',
        key: 'blog',
        order: 1,
      },
      {
        label: 'Blog Details',
        href: '/dashboard/blog/blog-details/all-blog-details',
        icon: 'Layers',
        key: 'blog-details',
        order: 2,
      },
    ],
  },
  {
    label: 'Testimonials',
    href: '/dashboard/testimonials/all-testimonials',
    icon: 'Quote',
    key: 'testimonials',
    order: 3,
  },
  {
    label: 'Hero Section',
    href: '/dashboard/hero/all-hero',
    icon: 'PanelTop',
    key: 'hero',
    order: 8,
  },
  {
    label: 'Sustainability Section',
    href: '/dashboard/sustainability/all-sustainability',
    icon: 'Leaf',
    key: 'sustainability',
    order: 17,
  },
  {
    label: 'Sustainability Page Intro',
    href: '/dashboard/sustainability-intro/all-sustainability-intro',
    icon: 'BookOpen',
    key: 'sustainability-intro',
    order: 22,
  },
  {
    label: 'Sustainability Pillars',
    href: '/dashboard/sustainability-pillars/all-sustainability-pillars',
    icon: 'Leaf',
    key: 'sustainability-pillars',
    order: 23,
  },
  {
    label: 'Sustainability Roadmap',
    href: '/dashboard/sustainability-roadmap/all-sustainability-roadmap',
    icon: 'Milestone',
    key: 'sustainability-roadmap',
    order: 24,
  },
  {
    label: 'Events & Boat Shows',
    href: '/dashboard/events/all-events',
    icon: 'CalendarDays',
    key: 'events',
    order: 25,
  },
  {
    label: 'Luxury Charter Portfolio',
    href: '/dashboard/portfolio/all-portfolio',
    icon: 'Gem',
    key: 'portfolio',
    order: 26,
  },
  {
    label: 'Innovation Concepts',
    href: '/dashboard/innovation-concepts/all-innovation-concepts',
    icon: 'Sparkles',
    key: 'innovation-concepts',
    order: 27,
  },
  {
    label: 'Life Aboard Photos',
    href: '/dashboard/life-aboard-photos/all-life-aboard-photos',
    icon: 'Images',
    key: 'life-aboard-photos',
    order: 28,
  },
  {
    label: 'Yacht Fleet',
    href: '/dashboard/yachts/all-yachts',
    icon: 'Ship',
    key: 'yachts',
    order: 29,
  },
  {
    label: 'Destinations',
    href: '/dashboard/destinations/all-destinations',
    icon: 'MapPin',
    key: 'destinations',
    order: 18,
  },
  {
    label: 'Experiences',
    href: '/dashboard/experiences/all-experiences',
    icon: 'Compass',
    key: 'experiences',
    order: 30,
  },
  {
    label: 'About Section',
    href: '/dashboard/about/all-about',
    icon: 'UserRound',
    key: 'about',
    order: 9,
  },
  {
    label: 'About Explore Cards',
    href: '/dashboard/about-explore/all-about-explore',
    icon: 'Compass',
    key: 'about-explore',
    order: 19,
  },
  {
    label: 'About Stats',
    href: '/dashboard/about-stats/all-about-stats',
    icon: 'BarChart3',
    key: 'about-stats',
    order: 20,
  },
  {
    label: 'About Story',
    href: '/dashboard/about-story/all-about-story',
    icon: 'BookOpen',
    key: 'about-story',
    order: 21,
  },
  {
    label: 'Our Services',
    href: '/dashboard/services/all-services',
    icon: 'Stethoscope',
    key: 'services',
    order: 11,
  },
  {
    label: 'Gallery',
    href: '/dashboard/gallery/all-gallery',
    icon: 'GalleryHorizontal',
    key: 'gallery',
    order: 12,
  },
  {
    label: 'Client Video Reviews',
    href: '/dashboard/client-video-reviews/all-client-video-reviews',
    icon: 'Clapperboard',
    key: 'client-video-reviews',
    order: 13,
  },
  {
    label: 'question-answers',
    href: '/dashboard/question-answers/all-question-answers',
    icon: 'HelpCircle',
    key: 'question-answer',
    order: 4,
  },
  {
    label: 'Employees',
    href: '/dashboard/employees/all-employees',
    icon: 'Users',
    key: 'employees',
    order: 5,
  },
  {
    label: 'Roles',
    href: '/dashboard/roles/all-roles',
    icon: 'ShieldCheck',
    key: 'roles',
    order: 6,
  },
  {
    label: 'Account',
    href: '/dashboard/account',
    icon: 'UserCircle',
    key: 'account',
    order: 7,
  },
  {
    label: 'Bookings',
    href: '/dashboard/bookings/all-bookings',
    icon: 'CalendarDays',
    key: 'bookings',
    order: 8,
  },
  {
    label: 'Payments',
    href: '/dashboard/payments/all-payments',
    icon: 'CreditCard',
    key: 'payments',
    order: 9,
  },
  {
    label: 'Support Chat',
    href: '/dashboard/support-chat',
    icon: 'MessageCircle',
    key: 'support-chat',
    order: 10,
  },
];
