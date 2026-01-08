import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { ComplianceContent } from './compliance-content';

export function CompliancePage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Compliance"
            description="Complete your merchant compliance requirements for payment processing in Nigeria"
          />
        </Toolbar>
      </Container>
      <Container>
        <ComplianceContent />
      </Container>
    </Fragment>
  );
}
