import React, { useEffect, useState } from "react";
import { BiSave } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { useSubscriptionScopes, useW3iAccount } from "@web3inbox/widget-react";
import toast from "react-hot-toast";
import { Button, Collapse, Form, Switch } from "antd";
import Panel from "antd/es/cascader/Panel";

function Preferences() {
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
    <Collapse accordion className="p-5 my-6 bg-white">
      <Form className="bg-transparent" onFinish={onSubmitPreferences}>
        {Object.entries(scopes).map(([scopeKey, scope]) => (
          <Form.Item key={scopeKey} label={scope.name} className="flex mb-2 justify-between">
            <Switch
              defaultChecked={scope.enabled}
            // name={scopeKey}
            />
          </Form.Item>
        ))}
        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          loading={false}  // Replace with your loading state
        >
          Save preferences
        </Button>
      </Form>
    </Collapse>
  );
}

export default Preferences;
