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
    label: 'Appointments',
    href: '/dashboard/appointments/all-appointments',
    icon: 'CalendarClock',
    key: 'appointments',
    order: 14,
  },
  {
    label: 'Prescriptions',
    href: '/dashboard/prescriptions/all-prescriptions',
    icon: 'ClipboardList',
    key: 'prescriptions',
    order: 16,
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
    label: 'About Section',
    href: '/dashboard/about/all-about',
    icon: 'UserRound',
    key: 'about',
    order: 9,
  },
  {
    label: 'Education Section',
    href: '/dashboard/education/all-education',
    icon: 'GraduationCap',
    key: 'education',
    order: 10,
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
    label: 'Chambers',
    href: '/dashboard/chambers/all-chambers',
    icon: 'CalendarDays',
    key: 'chambers',
    order: 15,
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
];
