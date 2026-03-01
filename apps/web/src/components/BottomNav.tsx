import { NavLink } from "react-router-dom";
import { Camera, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", icon: Camera, label: "Camera" },
  { to: "/memories", icon: ImageIcon, label: "Memories" },
] as const;

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-vox-border bg-vox-surface/95 backdrop-blur-md pb-safe-bottom">
      <div className="flex">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] transition-colors",
                isActive ? "text-vox-primary" : "text-white/40",
              )
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
