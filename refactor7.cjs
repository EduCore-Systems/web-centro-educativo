const fs = require('fs');

let adminContent = fs.readFileSync('src/pages/AdminPanel.jsx', 'utf8');

// Normalize
adminContent = adminContent.replace(/\r\n/g, '\n');

const startStr = "        {/* Dashboard Tab Content */}";
const endStr = "        {/* Creation Tab Content */}";

const startIdx = adminContent.indexOf(startStr);
const endIdx = adminContent.indexOf(endStr);

if (startIdx !== -1 && endIdx !== -1) {
  let dashboardBlock = adminContent.substring(startIdx, endIdx);
  
  // Clean up
  dashboardBlock = dashboardBlock.replace("        {/* Dashboard Tab Content */}\n", "");
  dashboardBlock = dashboardBlock.replace("        {activeTab === 'dashboard' && (\n", "");
  // Remove the last `        )}\n\n`
  dashboardBlock = dashboardBlock.substring(0, dashboardBlock.lastIndexOf("        )}"));

  // Create AdminDashboardTab.jsx
  const componentCode = `import React from 'react';
import Icon from '../../atoms/Icon';

const AdminDashboardTab = ({
  activeTab,
  dashboardSubTab,
  setDashboardSubTab,
  searchFilter,
  setSearchFilter,
  levelFilter,
  setLevelFilter,
  isLoadingData,
  dataError,
  filteredStudents,
  filteredStaff,
  solicitudesPendientes,
  parentsList,
  setAprobandoSolicitud,
  handleRechazarSolicitud,
  setEditingUser,
  handleResetPassword,
  handleDeleteUser
}) => {
  if (activeTab !== 'dashboard') return null;

  return (
    <>
${dashboardBlock}
    </>
  );
};

export default AdminDashboardTab;
`;

  fs.writeFileSync('src/components/organisms/admin/AdminDashboardTab.jsx', componentCode);

  // Update AdminPanel.jsx
  const replacement = `        {/* Dashboard Tab Content */}
        <AdminDashboardTab
          activeTab={activeTab}
          dashboardSubTab={dashboardSubTab}
          setDashboardSubTab={setDashboardSubTab}
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          isLoadingData={isLoadingData}
          dataError={dataError}
          filteredStudents={filteredStudents}
          filteredStaff={filteredStaff}
          solicitudesPendientes={solicitudesPendientes}
          parentsList={parentsList}
          setAprobandoSolicitud={setAprobandoSolicitud}
          handleRechazarSolicitud={handleRechazarSolicitud}
          setEditingUser={setEditingUser}
          handleResetPassword={handleResetPassword}
          handleDeleteUser={handleDeleteUser}
        />\n\n`;
  
  adminContent = adminContent.substring(0, startIdx) + replacement + adminContent.substring(endIdx);
  
  // Add import
  adminContent = adminContent.replace(
    "import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';",
    "import AdminCreationTab from '../components/organisms/admin/AdminCreationTab';\nimport AdminDashboardTab from '../components/organisms/admin/AdminDashboardTab';"
  );
  
  fs.writeFileSync('src/pages/AdminPanel.jsx', adminContent);
  console.log("AdminDashboardTab extracted!");
} else {
  console.log("Could not find start/end bounds for dashboard tab");
}
