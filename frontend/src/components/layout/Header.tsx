import { GraduationCap, Wifi } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap size={25} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Northstar University
          </h1>

          <p className="text-xs text-slate-500">
            Virtual Information Centre
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-2">
        <Wifi size={16} className="text-green-600" />

        <span className="text-xs font-medium text-green-700">
          System Online
        </span>
      </div>
    </header>
  );
};

export default Header;