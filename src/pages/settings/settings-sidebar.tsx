import {
  ScrollspyMenu,
  ScrollspyMenuItems,
} from '@/partials/navbar/scrollspy-menu';

export function SettingsSidebar() {
  const items: ScrollspyMenuItems = [
    {
      title: 'Personal Info',
      target: 'personal_info',
      active: true,
    },
    {
      title: 'Business Info',
      target: 'business_info',
    },
    {
      title: 'Webhook & API',
      target: 'webhook_api',
    },
    {
      title: 'Account Options',
      target: 'account_options',
    },
  ];

  return <ScrollspyMenu items={items} />;
}
