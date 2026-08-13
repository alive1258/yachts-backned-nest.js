export interface MenuActionFlags {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface ActiveUserData {
  sub: string;
  email: string;
  /** Role slug, e.g. "super_admin", "hr_manager" */
  role: string;
  /** True only for the built-in Super Admin role — bypasses every permission check */
  isSuperAdmin: boolean;
  /** True for roles that participate in the admin-dashboard permission system */
  isStaff: boolean;
  /** Per-menu-key View/Create/Edit/Delete grants, computed from the role's permissions */
  permissions: Record<string, MenuActionFlags>;
  status?: string;
}
