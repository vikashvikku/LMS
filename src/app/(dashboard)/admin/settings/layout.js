import { SettingsNav } from "./SettingsNav";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Settings | Admin Portal",
  description: "Manage CampusOS Settings",
};

export default function SettingsLayout({ children }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-lg">
          Manage your organization profile, academic structure, and application preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <SettingsNav />
        </aside>
        <div className="flex-1 max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
