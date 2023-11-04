import { type Events as EventsType } from "./EventsDashboard";
import { FormInput } from "./FormInput";

import { Button, Form } from 'antd';
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { Switch } from "antd";
import { useState } from "react";

interface EventsFormData {
  events: EventsType;
}

interface EventsProps {
  events: EventsType,
  contractAddress: string,
}

const Events = ({ events, contractAddress }: EventsProps) => {
  const [loading, setLoading] = useState(false)
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<EventsFormData>({
    defaultValues: {
      events: events
    }
  })

  const { fields } = useFieldArray({
    name: "events",
    control
  });

  const onSubmit: SubmitHandler<EventsFormData> = async (data) => {
    if (!data.events.length) throw new Error("No events found in the events table.")
    console.log(data);
    // setLoading(true)
    // try {
    //   const headers = { "Content-Type": "application/json" };
    //   const response = await axios.post("/api/watchForEvents", { events: data.events, address: contractAddress }, { headers });
    //   console.log(response);
    //   toast.success("Great Success! Your settings have been saved.");
    // } catch (error: any) {
    //   toast.error("Something went wrong saving your settings.")
    //   console.error(error.message);
    // } finally {
    //   setLoading(false)
    // }
  };

  return (
    <div className='w-[600px] shadow p-8 rounded-xl bg-white'>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ul>
            <li key={-1}>
              <div className="flex justify-between border-0 border-b border-slate-800 pb-2 mb-2">
                <div className="text-bold">Event Name</div>
                <div className="text-bold">Notifications (on/off)</div>
              </div>
            </li>
            {
              fields.map((field, index) => {
                return (
                  <li key={field.id}>
                    <div className="flex justify-between border-0 border-b border-slate-300 py-2 mb-2">
                      <div>{events[index].eventName}</div>
                      <div>
                        <FormInput
                          className="mb-0"
                          control={control}
                          name={`events.${index}.eventName`}
                          id={`events.${index}.name`}
                        >
                          <Switch defaultChecked onChange={(value) => {
                            setValue(`events.${index}.subscribed`, value)
                            setValue(`events.${index}.eventName`, events[index].eventName)
                          }} />
                        </FormInput>
                      </div>
                    </div>
                  </li>
                )
              })
            }
          </ul>
          <div className="flex justify-center mt-8">
            <Form.Item className="">
              <Button htmlType='submit' disabled={loading} type="primary" className="h-9 w-52">Save Settings</Button>
            </Form.Item>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Events