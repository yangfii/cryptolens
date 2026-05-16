import { cookies } from "next/headers";
import PicksPerformance from "./picks-performance";
import TrackRecordGate from "./track-record-gate";
import { BROKERS, BROKER_COOKIE, type BrokerId } from "@/lib/brokers";

export default async function TrackRecordSection() {
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(BROKER_COOKIE)?.value;
  const broker =
    cookieVal && cookieVal in BROKERS ? BROKERS[cookieVal as BrokerId] : null;

  if (!broker) {
    return <TrackRecordGate />;
  }

  return (
    <PicksPerformance
      connectedBroker={{ name: broker.name, color: broker.color }}
    />
  );
}
