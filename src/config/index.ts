import rbacMatrixData from './rbac-matrix.json';
import { UserRole } from '../types';

export interface ModulePermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface ReportsPermissions {
  operational: boolean;
  financial: boolean;
  export: boolean;
}

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
  access: {
    read: string[];
    create: string[];
    update: string[];
    delete: string[];
    reports: string[];
  };
  modules: {
    products: ModulePermissions;
    categories: ModulePermissions;
    inventory: ModulePermissions;
    sales: ModulePermissions;
    customers: ModulePermissions;
    suppliers: ModulePermissions;
    expenses: ModulePermissions;
    members: ModulePermissions;
    store: ModulePermissions;
  };
  reports: ReportsPermissions;
  constraints: string[];
}

export interface RbacMatrixSchema {
  name: string;
  version: string;
  description: string;
  securityPolicy: {
    defaultDeny: boolean;
    preventSelfPrivilegeEscalation: boolean;
    tenantIsolation: string;
    forbiddenTargetRolesForAdmins: string[];
    ownerOnlyPermissions: string[];
  };
  roles: Record<string, RoleConfig>;
}

export const RBAC_CONFIG: RbacMatrixSchema = rbacMatrixData as unknown as RbacMatrixSchema;

export default RBAC_CONFIG;
