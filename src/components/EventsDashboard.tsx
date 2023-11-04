import { useState } from "react";
import ContractForm from "./ContractForm";
import Events from "./Events";

export interface Event {
  eventName: string;
  subscribed: boolean
}

export type Events = Event[];

// interface EventsDashboardProps {
//   setXmtpAddress: Dispatch<SetStateAction<string>>;
//   xmtpAddress: string;
// }

const EventsDashboard = () => {
  const [contractEvents, setContractEvents] = useState<Events>([]);
  const [contractAddress, setContractAddres] = useState("");

  return (
    <div className="flex flex-col justify-center align-top gap-8">
      <ContractForm setContractEvents={setContractEvents} setContractAddres={setContractAddres} />
      {!!contractEvents.length && contractAddress !== "" && <Events events={contractEvents} contractAddress={contractAddress} />}
    </div>
  )
}

export default EventsDashboard