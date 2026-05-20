import { Users, MonitorPlay, Activity, Check, X } from "lucide-react";

export function DashboardAdmin() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Manager Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of lab utilization and pending requests.</p>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Widget 
          icon={<Activity className="w-6 h-6 text-orange-600" />} 
          bg="bg-orange-50"
          label="Pending Requests"
          value="12"
          trend="+3 since yesterday"
        />
        <Widget 
          icon={<MonitorPlay className="w-6 h-6 text-blue-600" />} 
          bg="bg-blue-50"
          label="Devices in Use"
          value="45"
          trend="82% utilization"
        />
        <Widget 
          icon={<Users className="w-6 h-6 text-green-600" />} 
          bg="bg-green-50"
          label="Total Capacity"
          value="120"
          trend="Across 8 labs"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-neutral-900">Recent Requests</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lab Room</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Time Requested</th>
                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {[
                { name: "Nguyen Van A", id: "SV01", room: "AI Computing Lab", time: "Oct 25, 08:00 - 10:00" },
                { name: "Tran Thi B", id: "SV02", room: "Chemistry Lab 102", time: "Oct 25, 13:00 - 15:00" },
                { name: "Le Van C", id: "SV03", room: "Robotics Lab A", time: "Oct 26, 09:00 - 12:00" },
                { name: "Pham D", id: "SV04", room: "Physics Lab 301", time: "Oct 26, 14:00 - 16:00" },
              ].map((req, i) => (
                <tr key={i} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-neutral-900">{req.name}</div>
                    <div className="text-xs text-neutral-500">{req.id}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{req.room}</td>
                  <td className="px-6 py-4 text-sm text-neutral-700">{req.time}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-100 transition-colors tooltip-trigger" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded border border-green-100 transition-colors" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Widget({ icon, bg, label, value, trend }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">{label}</h3>
      </div>
      <div>
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
        <div className="text-sm font-medium text-neutral-500 mt-1">{trend}</div>
      </div>
    </div>
  );
}
