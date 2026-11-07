import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, ChevronRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const { admin } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case "/dashboard":
        return {
          title: "Overview",
          breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }],
        };
      case "/documents":
        return {
          title: "Documents",
          breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Documents", href: "/documents" },
          ],
        };
      default:
        return {
          title: "Knowledge Hub",
          breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }],
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title & Breadcrumbs */}
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
            {pageInfo.breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.href}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                {idx === pageInfo.breadcrumbs.length - 1 ? (
                  <span className="font-medium text-slate-800">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-blue-600 transition"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight leading-none mt-0.5">
            {pageInfo.title}
          </h2>
        </div>
      </div>

      {/* Right Header Status / Admin Pill */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-xs font-semibold text-slate-800">
            {admin?.full_name || "Administrator"}
          </p>
          <p className="text-[11px] text-slate-500">
            {admin?.role === "admin" ? "System Admin" : admin?.role}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;

