import { OpsTerminalDemo } from '../features/ops-terminal/OpsTerminalDemo';

export default function OpsTerminalDemoPage() {
  return (
    <div className="-m-8 flex h-[calc(100vh-5rem)] min-h-[760px] flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 bg-black/45" />
      <OpsTerminalDemo />
    </div>
  );
}
