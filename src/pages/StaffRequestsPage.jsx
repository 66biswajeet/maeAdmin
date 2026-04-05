import StaffRequestsTab from "../components/StaffRequestsTab";

export default function StaffRequestsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Staff Requests</h1>
          <p>Review and manage admin registration requests</p>
        </div>
      </div>

      <div className="card">
        <StaffRequestsTab />
      </div>
    </div>
  );
}
