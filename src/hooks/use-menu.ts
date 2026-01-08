import { useCallback } from 'react';
import { MenuItem } from '@/config/types';
import { usePermissions } from '@/providers/permission-provider';

type MenuConfig = MenuItem[];

interface UseMenuReturn {
  isActive: (path: string | undefined) => boolean;
  hasActiveChild: (children: MenuItem[] | undefined) => boolean;
  isItemActive: (item: MenuItem) => boolean;
  getCurrentItem: (items: MenuConfig) => MenuItem | undefined;
  getBreadcrumb: (items: MenuConfig) => MenuItem[];
  getChildren: (items: MenuConfig, level: number) => MenuConfig | null;
  filterMenu: (items: MenuConfig) => MenuConfig;
}

export const useMenu = (pathname: string): UseMenuReturn => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const isPermitted = useCallback(
    (item: MenuItem): boolean => {
      if (!item.permission) return true;
      if (Array.isArray(item.permission)) {
        return item.permissionMode === 'all'
          ? hasAllPermissions(item.permission)
          : hasAnyPermission(item.permission);
      }
      return hasPermission(item.permission);
    },
    [hasAllPermissions, hasAnyPermission, hasPermission],
  );

  const filterMenu = useCallback(
    (items: MenuConfig): MenuConfig =>
      items
        .map((item) => {
          if (item.heading) {
            return item;
          }
          if (!isPermitted(item)) return null;
          if (item.children) {
            const filteredChildren = filterMenu(item.children);
            if (filteredChildren.length === 0) return null;
            return { ...item, children: filteredChildren };
          }
          return item;
        })
        .filter(Boolean) as MenuConfig,
    [isPermitted],
  );

  const isActive = (path: string | undefined): boolean => {
    if (path && path === '/') {
      return path === pathname;
    } else {
      return !!path && pathname.startsWith(path);
    }
  };

  const hasActiveChild = (children: MenuItem[] | undefined): boolean => {
    if (!children || !Array.isArray(children)) return false;
    return filterMenu(children).some(
      (child: MenuItem) =>
        (child.path && isActive(child.path)) ||
        (child.children && hasActiveChild(child.children)),
    );
  };

  const isItemActive = (item: MenuItem): boolean => {
    return (
      (item.path ? isActive(item.path) : false) ||
      (item.children ? hasActiveChild(item.children) : false)
    );
  };

  const getCurrentItem = (items: MenuConfig): MenuItem | undefined => {
    const filteredItems = filterMenu(items);
    for (const item of filteredItems) {
      if (item.path && isActive(item.path)) {
        if (item.children && item.children.length > 0) {
          const childMatch = getCurrentItem(item.children);
          return childMatch || item;
        }
        return item;
      }
      if (item.children && item.children.length > 0) {
        const childMatch = getCurrentItem(item.children);
        if (childMatch) {
          return childMatch;
        }
      }
    }
    return undefined;
  };

  const getBreadcrumb = (items: MenuConfig): MenuItem[] => {
    const findBreadcrumb = (
      nodes: MenuItem[],
      breadcrumb: MenuItem[] = [],
    ): MenuItem[] => {
      for (const item of filterMenu(nodes)) {
        const currentBreadcrumb = [...breadcrumb, item];

        // Check if this item is active
        if (item.path && isActive(item.path)) {
          return currentBreadcrumb; // Return the breadcrumb up to this point
        }

        // If item has children, recurse and check them
        if (item.children && item.children.length > 0) {
          const childBreadcrumb = findBreadcrumb(
            item.children,
            currentBreadcrumb,
          );
          if (childBreadcrumb.length > currentBreadcrumb.length) {
            return childBreadcrumb; // Return the deeper breadcrumb if found
          }
        }
      }
      return breadcrumb; // Return current breadcrumb if no match found
    };

    const breadcrumb = findBreadcrumb(items);
    return breadcrumb.length > 0 ? breadcrumb : [];
  };

  const getChildren = (items: MenuConfig, level: number): MenuConfig | null => {
    const hasActiveChildAtLevel = (items: MenuConfig): boolean => {
      for (const item of filterMenu(items)) {
        if (
          (item.path &&
            (item.path === pathname ||
              (item.path !== '/' &&
                item.path !== '' &&
                pathname.startsWith(item.path)))) ||
          (item.children && hasActiveChildAtLevel(item.children))
        ) {
          return true;
        }
      }
      return false;
    };

    const findChildren = (
      items: MenuConfig,
      targetLevel: number,
      currentLevel: number = 0,
    ): MenuConfig | null => {
      for (const item of filterMenu(items)) {
        if (item.children) {
          if (
            targetLevel === currentLevel &&
            hasActiveChildAtLevel(item.children)
          ) {
            return filterMenu(item.children);
          }
          const children = findChildren(
            item.children,
            targetLevel,
            currentLevel + 1,
          );
          if (children) {
            return children;
          }
        } else if (
          targetLevel === currentLevel &&
          item.path &&
          (item.path === pathname ||
            (item.path !== '/' &&
              item.path !== '' &&
              pathname.startsWith(item.path)))
        ) {
          return filterMenu(items);
        }
      }
      return null;
    };

    return findChildren(items, level);
  };

  return {
    isActive,
    hasActiveChild,
    isItemActive,
    getCurrentItem,
    getBreadcrumb,
    getChildren,
    filterMenu,
  };
};
