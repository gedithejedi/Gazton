import { Collapse } from 'antd';
import { useSubscription, useW3iAccount } from "@web3inbox/widget-react";
import React from "react";
import Card from './Card';
import SectionTitle from './SectionTitle';

const { Panel } = Collapse;

function Subscription() {
  const { account } = useW3iAccount();
  const { subscription } = useSubscription(account);

  return (
    <Card className='w-1/2'>
      <SectionTitle className="mb-2">
        Subscriptions
      </SectionTitle>
      <div className="pb-4">
        <div
          className="w-full max-w-lg md:max-w-full"
          // bordered={false}
          style={{ overflow: 'scroll' }}
        >
          <div>
            <pre>{JSON.stringify(subscription, undefined, 2)}</pre>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default Subscription;
