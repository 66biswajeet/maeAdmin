import { useState } from "react";
import { Outlet } from "react-router-dom";
import VendorSidebar from "./VendorSidebar";
import VendorTopbar from "./VendorTopbar";

export default function VendorLayout() {
  return (
    <div className="admin-shell">
      <VendorSidebar />
      <div className="main-area">
        <VendorTopbar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
