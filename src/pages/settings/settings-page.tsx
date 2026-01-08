import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { SettingsContent } from './settings-content';

export function SettingsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settings"
            description="Manage your account settings and preferences"
          />
        </Toolbar>
      </Container>
      <Container>
        <SettingsContent />
      </Container>
    </Fragment>
  );
}
