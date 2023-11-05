import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSubscriptionScopes, useW3iAccount } from "@web3inbox/widget-react";
import toast from "react-hot-toast";
import { Button, Form, Switch } from "antd";
import Card from "./Card";
import SectionTitle from "./SectionTitle";

function Preferences({
  unsubscribe,
  isW3iInitialized,
  loading
}: {
  unsubscribe: () => Promise<void>,
  isW3iInitialized: boolean,
  loading: boolean
}) {
  const { account } = useW3iAccount();
  const { scopes, updateScopes } = useSubscriptionScopes(account);

  const { register, setValue, handleSubmit } = useForm();
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const onSubmitPreferences = handleSubmit(async (formData) => {
    setIsSavingPreferences(true);
    const enabledScopes = Object.entries(formData)
      .filter(([key, isEnabled]) => isEnabled)
      .map(([key]) => key);
    try {
      const isUpdated = await updateScopes(enabledScopes);
      if (isUpdated) {
        toast.success("Preferences updated");
      }
    } catch (error) {
      toast("Failed to update preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  });

  // Set default values of selected preferences
  useEffect(() => {
    Object.entries(scopes).forEach(([scopeKey, scope]) => {
      const s: any = scope;
      setValue(scopeKey, s.enabled);
    });
  }, [scopes, setValue]);

  return (
    <Card className='w-full shadow p-4 rounded-xl bg-white'>
      <SectionTitle >Settings</SectionTitle>
      <div className="flex items-end">
        <Form className="bg-transparent w-full" onFinish={onSubmitPreferences}>
          {Object.entries(scopes).map(([scopeKey, scope]) => (
            <Form.Item key={scopeKey} label={scope.name} className="flex mb-2 justify-between w-full">
              <Switch
                defaultChecked={scope.enabled}
              />
            </Form.Item>
          ))}
          <Button
            className="mt-8"
            type="primary"
            htmlType="submit"
            loading={false}  // Replace with your loading state
          >
            Save preferences
          </Button>
        </Form>

        <div className="mt-6">
          <Button
            onClick={unsubscribe}
            type="primary"
            className="bg-red-500 hover:!bg-red-400"
            disabled={!isW3iInitialized || !account}
            loading={loading}
          >
            Remove all events
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default Preferences;
