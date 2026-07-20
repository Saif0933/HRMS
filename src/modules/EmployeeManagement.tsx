import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileDown,
  FileSignature,
  FileText,
  Filter,
  Grid,
  Landmark,
  List,
  Mail,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Upload,
  User
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  Department,
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment
} from '../api/hook/useDepartment';
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployeePersonal,
  useEmployees,
  useEmployeeSalary,
  useUpdateEmployeePersonal,
  useUpdateEmployeeSalary
} from '../api/hook/useEmployee';
import {
  useAssignRole,
  useCreatePermission,
  useCreateRole,
  useDeleteRole,
  usePermissions,
  useRoles,
  useUpdateRole
} from '../api/hook/useRole';
import { Employee, useApp } from '../context/AppContext';

interface RoleManagementPanelProps {
  employees: Employee[];
}

const RoleManagementPanel: React.FC<RoleManagementPanelProps> = ({ employees }) => {
  const { data: rolesResponse, isLoading: rolesLoading } = useRoles();
  const { data: permissionsResponse, isLoading: permissionsLoading } = usePermissions();

  const createRoleMutation = useCreateRole();
  const createPermissionMutation = useCreatePermission();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignRoleMutation = useAssignRole();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [newPermName, setNewPermName] = useState('');
  const [newPermAction, setNewPermAction] = useState('manage');
  const [newPermSubject, setNewPermSubject] = useState('all');
  const [newPermDesc, setNewPermDesc] = useState('');

  const [assignUser, setAssignUser] = useState('');
  const [assignRoleVal, setAssignRoleVal] = useState('');

  const roles = rolesResponse?.data || [];
  const permissions = permissionsResponse?.data || [];

  const activeRole = roles.find(r => r.id === selectedRoleId);

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    createRoleMutation.mutate({
      name: newRoleName.toUpperCase(),
      description: newRoleDesc,
      permissionIds: []
    }, {
      onSuccess: () => {
        setNewRoleName('');
        setNewRoleDesc('');
        alert("Role created successfully!");
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermName || !newPermAction || !newPermSubject) return;
    createPermissionMutation.mutate({
      name: newPermName,
      action: newPermAction,
      subject: newPermSubject,
      description: newPermDesc
    }, {
      onSuccess: () => {
        setNewPermName('');
        setNewPermDesc('');
        alert("Permission node created successfully!");
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleTogglePermission = (permissionId: string) => {
    if (!activeRole) return;
    const currentPermissionIds = (activeRole.permissions || []).map((p: any) => p.permission?.id || p.id || p);
    
    let updatedIds: string[];
    if (currentPermissionIds.includes(permissionId)) {
      updatedIds = currentPermissionIds.filter((id: string) => id !== permissionId);
    } else {
      updatedIds = [...currentPermissionIds, permissionId];
    }

    updateRoleMutation.mutate({
      id: activeRole.id,
      data: { permissionIds: updatedIds }
    }, {
      onSuccess: () => {
        alert("Permissions updated for role " + activeRole.name);
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleDeleteRole = (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      deleteRoleMutation.mutate(id, {
        onSuccess: () => {
          if (selectedRoleId === id) setSelectedRoleId(null);
          alert("Role deleted successfully!");
        },
        onError: (err) => alert(err.message)
      });
    }
  };

  const handleAssignRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUser) return;
    const selectedEmp = employees.find(emp => emp.id === assignUser);
    if (!selectedEmp) return;
    
    const userIdentifier = selectedEmp.userId || selectedEmp.email || selectedEmp.phone;
    if (!userIdentifier) {
      alert("This employee does not have a user ID, email, or phone to identify their user account.");
      return;
    }

    assignRoleMutation.mutate({
      userId: userIdentifier,
      roleId: assignRoleVal === 'clear' ? null : assignRoleVal
    }, {
      onSuccess: () => {
        alert("Role assigned to user successfully!");
      },
      onError: (err) => alert(err.message)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Roles list & Creation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Roles & Authorization Profiles</h3>
          {rolesLoading ? (
            <p className="text-slate-405">Loading roles list...</p>
          ) : roles.length === 0 ? (
            <p className="text-slate-405">No admin-defined roles found. Create one below to begin.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {roles.map((role) => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedRoleId === role.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{role.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{role.description || 'No description'}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteRole(role.id); }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleCreateRole} className="border-t pt-4 space-y-3">
            <h4 className="font-bold text-slate-700 dark:text-white text-xs">Create New Role</h4>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Role Code / Name</label>
              <input 
                type="text" 
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. HR_GENERALIST"
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold">Role Description</label>
              <textarea 
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Brief description of the role access scope..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
              />
            </div>
            <button 
              type="submit"
              disabled={createRoleMutation.isPending}
              className="w-full py-2 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:scale-102 transition-all shadow-md shadow-primary/20"
            >
              Add Role Profile
            </button>
          </form>
        </div>

        {/* Center/Right Column: Role Details & Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Role Access Rights & Node Permissions</h3>
            {activeRole && (
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                {activeRole.name}
              </span>
            )}
          </div>

          {!activeRole ? (
            <div className="h-full flex items-center justify-center py-10 text-slate-400">
              Select a role from the left panel to assign permission nodes.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Permission Assignment Checklist */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 dark:text-white text-xs">Assigned Permissions</h4>
                {permissionsLoading ? (
                  <p className="text-slate-400">Loading permission nodes...</p>
                ) : permissions.length === 0 ? (
                  <p className="text-slate-405">No system permissions found. Define one in the creation panel.</p>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto border p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                    {permissions.map((perm) => {
                      const isAssigned = (activeRole.permissions || []).some(
                        (p: any) => (p.permission?.id || p.id || p) === perm.id
                      );
                      return (
                        <label key={perm.id} className="flex items-start gap-2.5 p-1 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleTogglePermission(perm.id)}
                            className="rounded text-primary focus:ring-0 mt-0.5"
                          />
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-350">{perm.name}</span>
                            <span className="block text-[9px] text-slate-400">
                              Action: <span className="font-mono text-primary">{perm.action}</span> | Subject: <span className="font-mono text-indigo-500">{perm.subject}</span>
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Permission Creator Form */}
              <form onSubmit={handleCreatePermission} className="space-y-3 border-l md:pl-6 border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-white text-xs">Register System Permission Node</h4>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Permission Name</label>
                  <input 
                    type="text" 
                    value={newPermName}
                    onChange={(e) => setNewPermName(e.target.value)}
                    placeholder="e.g. Approve Leave Applications"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Action</label>
                    <select 
                      value={newPermAction}
                      onChange={(e) => setNewPermAction(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                    >
                      <option value="read">read</option>
                      <option value="write">write</option>
                      <option value="create">create</option>
                      <option value="delete">delete</option>
                      <option value="manage">manage</option>
                      <option value="approve">approve</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Subject / Module</label>
                    <input 
                      type="text" 
                      value={newPermSubject}
                      onChange={(e) => setNewPermSubject(e.target.value)}
                      placeholder="e.g. leaves"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Description</label>
                  <textarea 
                    value={newPermDesc}
                    onChange={(e) => setNewPermDesc(e.target.value)}
                    placeholder="Permission description..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={createPermissionMutation.isPending}
                  className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:scale-102 transition-all shadow-md shadow-indigo-600/20"
                >
                  Create Node
                </button>
              </form>

            </div>
          )}
        </div>

      </div>

      {/* User Role Assignment Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Assign Role Profiles to Users</h3>
        <form onSubmit={handleAssignRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block mb-1">Select Employee</label>
            <select
              value={assignUser}
              onChange={(e) => setAssignUser(e.target.value)}
              required
              className="w-full px-3 py-2.5 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.role} - {emp.department})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block mb-1">Assign Role Profile</label>
            <select
              value={assignRoleVal}
              onChange={(e) => setAssignRoleVal(e.target.value)}
              required
              className="w-full px-3 py-2.5 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
            >
              <option value="">-- Select Role --</option>
              <option value="clear">-- None (Clear Role) --</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit"
            disabled={assignRoleMutation.isPending}
            className="w-full py-2.5 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:scale-102 transition-all shadow-md shadow-primary/20"
          >
            Update Role Assignment
          </button>
        </form>
      </div>
    </div>
  );
};

interface DepartmentManagementPanelProps {
  employees: Employee[];
}

const DepartmentManagementPanel: React.FC<DepartmentManagementPanelProps> = ({ employees }) => {
  const { data: deptsResponse, isLoading: deptsLoading } = useDepartments();

  const createDeptMutation = useCreateDepartment();
  const updateDeptMutation = useUpdateDepartment();
  const deleteDeptMutation = useDeleteDepartment();

  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptManagerId, setNewDeptManagerId] = useState('');
  const [newDeptParentId, setNewDeptParentId] = useState('');

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [editParentId, setEditParentId] = useState('');

  const departments = deptsResponse?.data || [];
  const activeDept = departments.find(d => d.id === selectedDeptId);

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;
    createDeptMutation.mutate({
      name: newDeptName,
      code: newDeptCode.toUpperCase(),
      description: newDeptDesc,
      managerId: newDeptManagerId || null,
      parentId: newDeptParentId || null
    }, {
      onSuccess: () => {
        setNewDeptName('');
        setNewDeptCode('');
        setNewDeptDesc('');
        setNewDeptManagerId('');
        setNewDeptParentId('');
        alert("Department created successfully!");
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleUpdateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptId || !editName || !editCode) return;
    updateDeptMutation.mutate({
      id: selectedDeptId,
      data: {
        name: editName,
        code: editCode.toUpperCase(),
        description: editDesc,
        managerId: editManagerId || null,
        parentId: editParentId || null
      }
    }, {
      onSuccess: () => {
        setEditMode(false);
        alert("Department updated successfully!");
      },
      onError: (err) => alert(err.message)
    });
  };

  const handleDeleteDepartment = (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      deleteDeptMutation.mutate(id, {
        onSuccess: () => {
          if (selectedDeptId === id) setSelectedDeptId(null);
          alert("Department deleted successfully!");
        },
        onError: (err) => alert(err.message)
      });
    }
  };

  const startEdit = (dept: Department) => {
    setSelectedDeptId(dept.id);
    setEditName(dept.name);
    setEditCode(dept.code);
    setEditDesc(dept.description || '');
    setEditManagerId(dept.managerId || '');
    setEditParentId(dept.parentId || '');
    setEditMode(true);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Departments list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Departments Registry</h3>
          {deptsLoading ? (
            <p className="text-slate-400">Loading departments list...</p>
          ) : departments.length === 0 ? (
            <p className="text-slate-400">No departments found. Create one below to begin.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {departments.map((dept) => (
                <div 
                  key={dept.id}
                  onClick={() => { setSelectedDeptId(dept.id); setEditMode(false); }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedDeptId === dept.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 text-slate-700 dark:text-slate-350'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs">{dept.name} ({dept.code})</p>
                    {dept.description && <p className="text-[10px] text-slate-400 mt-0.5">{dept.description}</p>}
                    {dept.manager && <p className="text-[10px] text-indigo-500 mt-0.5">Head: {dept.manager.name}</p>}
                  </div>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); startEdit(dept); }}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteDepartment(dept.id); }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center & Right Column: Details / Forms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
          {editMode ? (
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Edit Department</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Department Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Department Code</label>
                  <input 
                    type="text" 
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Description</label>
                <textarea 
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Head of Department (Manager)</label>
                  <select 
                    value={editManagerId}
                    onChange={(e) => setEditManagerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  >
                    <option value="">-- Select Manager --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Parent Department</label>
                  <select 
                    value={editParentId}
                    onChange={(e) => setEditParentId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  >
                    <option value="">-- None --</option>
                    {departments.filter(d => d.id !== selectedDeptId).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updateDeptMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Form to create a department */}
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Add New Department</h3>
                
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Department Name</label>
                  <input 
                    type="text" 
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    placeholder="e.g. Quality Assurance"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Department Code</label>
                  <input 
                    type="text" 
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="e.g. QA"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Description</label>
                  <textarea 
                    value={newDeptDesc}
                    onChange={(e) => setNewDeptDesc(e.target.value)}
                    placeholder="Brief scope/objective of the department..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Head / Manager</label>
                    <select 
                      value={newDeptManagerId}
                      onChange={(e) => setNewDeptManagerId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                    >
                      <option value="">-- Choose Head --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Parent Dept</label>
                    <select 
                      value={newDeptParentId}
                      onChange={(e) => setNewDeptParentId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-750 dark:text-slate-300"
                    >
                      <option value="">-- None --</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={createDeptMutation.isPending}
                  className="w-full py-2 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-1.5 hover:scale-102 transition-all shadow-md shadow-primary/20"
                >
                  Create Department
                </button>
              </form>

              {/* Detail view of active/selected department */}
              <div className="space-y-4 border-l md:pl-6 border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Department Overview</h3>
                {activeDept ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Department Name</p>
                      <p className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{activeDept.name}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Code</p>
                      <p className="font-mono font-bold text-indigo-500 mt-0.5">{activeDept.code}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Scope Description</p>
                      <p className="text-slate-650 dark:text-slate-350 mt-0.5">{activeDept.description || 'No description provided'}</p>
                    </div>
                    {activeDept.manager && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Head of Department (HoD)</p>
                        <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{activeDept.manager.name}</p>
                      </div>
                    )}
                    {activeDept.parent && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Reporting Department (Parent)</p>
                        <p className="font-semibold text-slate-850 dark:text-white mt-0.5">{activeDept.parent.name}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">Select a department from the registry list to see details.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const EmployeeManagement: React.FC = () => {
  const { 
    employees: contextEmployees, setEmployees, activeSubModule, setActiveSubModule, 
    addAuditLog, selectedEmployeeId, setSelectedEmployeeId 
  } = useApp();

  const { data: deptsResponse } = useDepartments();
  const dbDepartments = deptsResponse?.data || [];
  const departmentOptions = dbDepartments.length > 0 
    ? dbDepartments.map(d => d.name) 
    : ['Engineering', 'Design', 'Product', 'Human Resources', 'Finance'];

  // TanStack Query Hooks for Employee Modules
  const { data: employeesResponse, isLoading: employeesLoading } = useEmployees();
  const createEmployeeMutation = useCreateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const updateSalaryMutation = useUpdateEmployeeSalary();
  const updatePersonalMutation = useUpdateEmployeePersonal();

  const dbEmployees = employeesResponse?.data || [];

  const employees = dbEmployees.length > 0 ? dbEmployees.map(emp => {
    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      avatar: emp.avatar || (emp.gender === 'Female' 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"),
      status: emp.status === 'ACTIVE' ? 'Active' :
              emp.status === 'ON_LEAVE' ? 'On Leave' :
              emp.status === 'PROBATION' ? 'Probation' :
              emp.status === 'RESIGNED' ? 'Resigned' : 'Terminated',
      joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      location: emp.location || 'Mumbai',
      role: emp.designation || 'Software Engineer',
      department: emp.department?.name || 'Engineering',
      manager: emp.manager?.name || 'Neha Patel',
      basic: emp.basic ?? 0,
      hra: emp.hra ?? 0,
      allowance: emp.allowance ?? 0,
      deductions: emp.deductions ?? 0,
      netSalary: emp.netSalary ?? 0,
      bankName: emp.bankName || '',
      bankAccount: emp.bankAccount || '',
      ifsc: emp.ifsc || '',
      pan: emp.pan || '',
      aadhaar: emp.aadhaar || '',
      uan: emp.uan || '',
      pfNumber: emp.pfNumber || '',
      gender: emp.gender || 'Male',
      dob: emp.dob ? new Date(emp.dob).toISOString().split('T')[0] : '',
      bloodGroup: emp.bloodGroup || 'O+',
      maritalStatus: emp.maritalStatus || 'Single',
      qualification: emp.qualification || '',
      university: emp.university || '',
      passingYear: emp.passingYear || '',
      pastCompanies: (emp as any).pastCompanies || [],
      promotions: (emp as any).promotions || [],
      transfers: (emp as any).transfers || [],
      probationDuration: emp.probationDuration || '6 Months',
      probationEnd: emp.probationEnd ? new Date(emp.probationEnd).toISOString().split('T')[0] : '',
      confirmationStatus: emp.confirmationStatus === 'CONFIRMED' ? 'Confirmed' :
                          emp.confirmationStatus === 'EXTENDED' ? 'Extended' : 'Pending',
      assets: (emp as any).assets || ['AST-100 (ID Card)'],
      clearanceStatus: (emp.clearanceStatus === 'APPROVED' ? 'Approved' : 'Pending') as any,
      exitDate: emp.exitDate ? new Date(emp.exitDate).toISOString().split('T')[0] : undefined,
      userId: emp.userId
    } as Employee;
  }) : contextEmployees;

  // Helper selectors
  const activeEmployee = employees.find(e => e.id === selectedEmployeeId) || employees[0] || contextEmployees[0];

  const { data: salaryResponse } = useEmployeeSalary(activeEmployee?.id);
  const { data: personalResponse } = useEmployeePersonal(activeEmployee?.id);

  const salaryDetails = salaryResponse?.data || activeEmployee;
  const personalDetails = personalResponse?.data || activeEmployee;

  // Personal Details Edit State
  const [editPersonalMode, setEditPersonalMode] = useState(false);
  const [pGender, setPGender] = useState('');
  const [pDob, setPDob] = useState('');
  const [pBloodGroup, setPBloodGroup] = useState('');
  const [pMaritalStatus, setPMaritalStatus] = useState('');
  const [pQualification, setPQualification] = useState('');
  const [pUniversity, setPUniversity] = useState('');
  const [pPassingYear, setPPassingYear] = useState('');

  // Salary Details Edit State
  const [editSalaryMode, setEditSalaryMode] = useState(false);
  const [sBasic, setSBasic] = useState<number>(0);
  const [sHra, setSHra] = useState<number>(0);
  const [sAllowance, setSAllowance] = useState<number>(0);
  const [sDeductions, setSDeductions] = useState<number>(0);
  const [sBankName, setSBankName] = useState('');
  const [sBankAccount, setSBankAccount] = useState('');
  const [sIfsc, setSIfsc] = useState('');
  const [sPan, setSPan] = useState('');
  const [sAadhaar, setSAadhaar] = useState('');
  const [sUan, setSUan] = useState('');
  const [sPfNumber, setSPfNumber] = useState('');

  // Documents Upload Refs & State
  const documentFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{ [empId: string]: { name: string; size: string; date: string }[] }>({
    'EMP001': [
      { name: "Experience_Letter.pdf", size: "340 KB", date: "2026-05-10" },
      { name: "Educational_Degree.pdf", size: "1.2 MB", date: "2026-05-11" }
    ]
  });

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      const newDoc = {
        name: file.name,
        size: sizeStr,
        date: new Date().toISOString().split('T')[0]
      };
      setUploadedDocs(prev => ({
        ...prev,
        [activeEmployee.id]: [newDoc, ...(prev[activeEmployee.id] || [])]
      }));
      addAuditLog("Uploaded Document", "Employee Center", `Uploaded document "${file.name}" for employee ${activeEmployee.name}`);
      alert(`Document "${file.name}" uploaded successfully!`);
    }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addAuditLog("Bulk Import File Selected", "Employee Center", `Selected bulk import file: ${file.name}`);
      alert(`File "${file.name}" selected successfully! Click 'Process Upload' to sync records.`);
    }
  };

  // Component state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [profileTab, setProfileTab] = useState<'overview' | 'documents' | 'attendance' | 'payroll' | 'leave' | 'performance' | 'assets' | 'timeline' | 'notes'>('overview');
  
  // Master Onboarding Stepper State
  const [stepperStep, setStepperStep] = useState(1);
  const [newEmp, setNewEmp] = useState<Partial<Employee>>({
    id: `EMP0${employees.length + 1}`,
    name: '', role: '', department: 'Engineering', status: 'Probation',
    joiningDate: new Date().toISOString().split('T')[0], location: 'Mumbai',
    manager: 'Neha Patel', basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
    bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
    gender: 'Male', dob: '', bloodGroup: 'O+', maritalStatus: 'Single',
    qualification: '', university: '', passingYear: '', pastCompanies: [],
    promotions: [], transfers: [], probationDuration: '6 Months', probationEnd: '',
    confirmationStatus: 'Pending', assets: ['AST-100 (ID Card)']
  });

  // Exit & Clearance Workflow State
  const [selectedExitEmpId, setSelectedExitEmpId] = useState('EMP009');
  const [resignationReason, setResignationReason] = useState('Personal Growth');
  const [itClearance, setItClearance] = useState(false);
  const [financeClearance, setFinanceClearance] = useState(false);
  const [adminClearance, setAdminClearance] = useState(false);

  // Bulk Actions State
  const [bulkMailSubject, setBulkMailSubject] = useState('');
  const [bulkMailBody, setBulkMailBody] = useState('');
  const [selectedBulkEmpIds, setSelectedBulkEmpIds] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Filtering Directory
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleDeleteEmployee = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this employee?")) {
      deleteEmployeeMutation.mutate(id, {
        onSuccess: () => {
          setSelectedEmployeeId('');
          setActiveSubModule('directory');
          alert("Employee profile deleted successfully!");
        },
        onError: (err) => {
          alert("Failed to delete employee: " + err.message);
        }
      });
    }
  };

  const handleUpdatePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updatePersonalMutation.mutate({
      id: activeEmployee.id,
      data: {
        gender: pGender,
        dob: pDob || null,
        bloodGroup: pBloodGroup || null,
        maritalStatus: pMaritalStatus || null,
        qualification: pQualification || null,
        university: pUniversity || null,
        passingYear: pPassingYear || null
      }
    }, {
      onSuccess: () => {
        setEditPersonalMode(false);
        alert("Personal Details updated successfully in database!");
      },
      onError: (err) => {
        alert("Failed to update personal details: " + err.message);
      }
    });
  };

  const handleUpdateSalary = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalaryMutation.mutate({
      id: activeEmployee.id,
      data: {
        basic: sBasic,
        hra: sHra,
        allowance: sAllowance,
        deductions: sDeductions,
        bankName: sBankName || null,
        bankAccount: sBankAccount || null,
        ifsc: sIfsc || null,
        pan: sPan || null,
        aadhaar: sAadhaar || null,
        uan: sUan || null,
        pfNumber: sPfNumber || null
      }
    }, {
      onSuccess: () => {
        setEditSalaryMode(false);
        alert("Salary Details updated successfully in database!");
      },
      onError: (err) => {
        alert("Failed to update salary details: " + err.message);
      }
    });
  };

  const handleCreateEmployee = () => {
    const finalEmp = {
      employeeId: newEmp.id!,
      name: newEmp.name!,
      email: newEmp.email || `${newEmp.name?.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: newEmp.phone || null,
      avatar: newEmp.avatar || (newEmp.gender === 'Female' 
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
        : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"),
      status: (newEmp.status?.toUpperCase() || 'PROBATION') as any,
      joiningDate: newEmp.joiningDate || new Date().toISOString().split('T')[0],
      location: newEmp.location || null,
      designation: newEmp.role || null,
      basic: newEmp.basic || null,
      hra: newEmp.hra || null,
      allowance: newEmp.allowance || null,
      deductions: newEmp.deductions || null,
      netSalary: newEmp.netSalary || null,
      bankName: newEmp.bankName || null,
      bankAccount: newEmp.bankAccount || null,
      ifsc: newEmp.ifsc || null,
      pan: newEmp.pan || null,
      aadhaar: newEmp.aadhaar || null,
      uan: newEmp.uan || null,
      pfNumber: newEmp.pfNumber || null,
      gender: newEmp.gender || null,
      dob: newEmp.dob || null,
      bloodGroup: newEmp.bloodGroup || null,
      maritalStatus: newEmp.maritalStatus || null,
      qualification: newEmp.qualification || null,
      university: newEmp.university || null,
      passingYear: newEmp.passingYear || null,
      probationDuration: newEmp.probationDuration || null,
      probationEnd: newEmp.probationEnd || null,
      confirmationStatus: (newEmp.confirmationStatus?.toUpperCase() || 'PENDING') as any,
    };

    createEmployeeMutation.mutate(finalEmp, {
      onSuccess: () => {
        addAuditLog("Onboarded Employee", "Employee Center", `Successfully registered employee ${finalEmp.name} (${finalEmp.employeeId})`);
        
        // Reset Stepper
        setStepperStep(1);
        setNewEmp({
          id: `EMP0${employees.length + 2}`,
          name: '', role: '', department: 'Engineering', status: 'Probation',
          joiningDate: new Date().toISOString().split('T')[0], location: 'Mumbai',
          manager: 'Neha Patel', basic: 30000, hra: 12000, allowance: 8000, deductions: 2000, netSalary: 38000,
          bankName: '', bankAccount: '', ifsc: '', pan: '', aadhaar: '', uan: '', pfNumber: '',
          gender: 'Male', dob: '', bloodGroup: 'O+', maritalStatus: 'Single',
          qualification: '', university: '', passingYear: '', pastCompanies: [],
          promotions: [], transfers: [], probationDuration: '6 Months', probationEnd: '',
          confirmationStatus: 'Pending', assets: ['AST-100 (ID Card)']
        });
        
        setActiveSubModule('directory');
        alert("Employee onboarded successfully to database!");
      },
      onError: (err) => {
        alert("Error onboarding employee: " + err.message);
      }
    });
  };

  const handleSendBulkMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBulkEmpIds.length === 0) {
      alert("Please select employees first!");
      return;
    }
    addAuditLog("Sent Bulk Email", "Employee Center", `Sent communication email to ${selectedBulkEmpIds.length} employees. Subject: "${bulkMailSubject}"`);
    setBulkMailSubject('');
    setBulkMailBody('');
    setSelectedBulkEmpIds([]);
    alert("Emails queued and dispatched successfully!");
  };

  const handleToggleSelectBulk = (id: string) => {
    setSelectedBulkEmpIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const calculateFullFinal = (emp: Employee) => {
    // Basic calculation for presentation
    const totalEarnings = emp.basic + emp.hra + emp.allowance;
    const leaveEncashment = Math.round((emp.basic / 30) * 12); // Mock 12 days leave
    const gratuity = emp.joiningDate.startsWith('201') ? Math.round((emp.basic / 26) * 15 * 5) : 0; // Mock 5 years if joined in 201x
    const deductions = emp.deductions;
    const netPayable = totalEarnings + leaveEncashment + gratuity - deductions;
    return { earnings: totalEarnings, leaveEncash: leaveEncashment, gratuity, deductions, netPayable };
  };

  const handleProcessClearance = () => {
    setEmployees(prev => prev.map(emp => 
      emp.id === selectedExitEmpId ? { ...emp, status: 'Terminated', clearanceStatus: 'Approved' } : emp
    ));
    addAuditLog("F&F Settlement Processed", "Employee Center", `Processed Full & Final settlement for ${employees.find(e => e.id === selectedExitEmpId)?.name}`);
    alert("Clearance checklists approved. F&F statement processed successfully!");
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button 
          onClick={() => setActiveSubModule('directory')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'directory' || activeSubModule === 'profile'
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Employee Directory
        </button>
        <button 
          onClick={() => setActiveSubModule('master')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'master' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Employee Onboarding Master
        </button>
        <button 
          onClick={() => setActiveSubModule('orgchart')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'orgchart' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Organization Chart
        </button>
        <button 
          onClick={() => setActiveSubModule('exit')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'exit' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Exit Management & F&F
        </button>
        <button 
          onClick={() => setActiveSubModule('bulk')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'bulk' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Bulk Actions & Mailing
        </button>
        <button 
          onClick={() => setActiveSubModule('roles')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'roles' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Role & Permissions
        </button>
        <button 
          onClick={() => setActiveSubModule('departments')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'departments' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Departments
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. EMPLOYEE DIRECTORY                   */}
      {/* ======================================= */}
      {activeSubModule === 'directory' && (
        <div className="space-y-4 animate-fade-in">
          {employeesLoading && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500 font-medium">
              Syncing with backend database...
            </div>
          )}
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, role or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 dark:text-slate-300"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg px-2 bg-slate-50 dark:bg-slate-950">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select 
                  value={deptFilter} 
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs py-1.5 focus:outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Departments</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-800 rounded-lg px-2 bg-slate-50 dark:bg-slate-950">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-0 text-xs py-1.5 focus:outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Probation">Probation</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>

              <div className="flex border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'bg-transparent text-slate-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-primary' : 'bg-transparent text-slate-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button 
                onClick={() => {
                  alert("Exporting current directory view to Excel...");
                  addAuditLog("Exported Directory", "Employee Center", "Exported filtered employee directory database");
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredEmployees.map((emp) => (
                <div 
                  key={emp.id} 
                  onClick={() => { setSelectedEmployeeId(emp.id); setActiveSubModule('profile'); }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm interactive-card cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <img src={emp.avatar} alt={emp.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/10 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block">{emp.id}</span>
                      <h3 className="font-bold text-slate-850 dark:text-white text-sm hover:text-primary transition-colors">{emp.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{emp.role}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{emp.department}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                      emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      emp.status === 'Probation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                      'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase">
                  <tr>
                    <th className="p-4">ID / Employee</th>
                    <th className="p-4">Department & Role</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Joining Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                  {filteredEmployees.map((emp) => (
                    <tr 
                      key={emp.id} 
                      onClick={() => { setSelectedEmployeeId(emp.id); setActiveSubModule('profile'); }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <img src={emp.avatar} alt={emp.name} className="h-8 w-8 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white leading-none">{emp.name}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{emp.id}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{emp.role}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </td>
                      <td className="p-4">{emp.location}</td>
                      <td className="p-4">{emp.joiningDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          emp.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' :
                          emp.status === 'On Leave' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                          emp.status === 'Probation' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' :
                          'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-400 inline" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================= */}
      {/* 2. DETAIL PROFILE PAGE                  */}
      {/* ======================================= */}
      {activeSubModule === 'profile' && (
        <div className="space-y-6 animate-fade-in">
          {/* Back button and profile header */}
          <button 
            onClick={() => setActiveSubModule('directory')}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary font-bold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
              <img src={activeEmployee.avatar} alt={activeEmployee.name} className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20 shrink-0" />
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-none">{activeEmployee.name}</h2>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{activeEmployee.id}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">{activeEmployee.role} • {activeEmployee.department}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{activeEmployee.location}</span>
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />Manager: {activeEmployee.manager}</span>
                  <span className="flex items-center gap-1"><Landmark className="h-3.5 w-3.5" />Joined: {activeEmployee.joiningDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleDeleteEmployee(activeEmployee.id)}
                disabled={deleteEmployeeMutation.isPending}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all shadow-md shadow-red-500/10 disabled:opacity-50"
              >
                Delete Profile
              </button>
              <button 
                onClick={() => {
                  alert("Triggering warning letter generation for " + activeEmployee.name);
                }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl text-xs font-semibold transition-colors"
              >
                Issue Letter
              </button>
              <button 
                onClick={() => {
                  // Switch to salary master edit
                  alert("Opening salary revision options...");
                }}
                className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all shadow-md shadow-primary/10"
              >
                Promote / Transfer
              </button>
            </div>
          </div>

          {/* Profile Tab selectors */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto gap-2">
            {(['overview', 'documents', 'attendance', 'payroll', 'leave', 'performance', 'assets', 'timeline', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`py-2.5 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  profileTab === tab 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Profile Tab Contents */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-64">
            
            {profileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* Personal details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Personal Details</h3>
                    <button 
                      onClick={() => {
                        setPGender(personalDetails.gender || 'Male');
                        setPDob(personalDetails.dob ? new Date(personalDetails.dob).toISOString().split('T')[0] : '');
                        setPBloodGroup(personalDetails.bloodGroup || 'O+');
                        setPMaritalStatus(personalDetails.maritalStatus || 'Single');
                        setPQualification(personalDetails.qualification || '');
                        setPUniversity(personalDetails.university || '');
                        setPPassingYear(personalDetails.passingYear || '');
                        setEditPersonalMode(!editPersonalMode);
                      }}
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      {editPersonalMode ? 'Cancel' : 'Edit Details'}
                    </button>
                  </div>
                  {editPersonalMode ? (
                    <form onSubmit={handleUpdatePersonal} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-medium">Gender</label>
                          <select 
                            value={pGender} 
                            onChange={(e) => setPGender(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-medium">Date of Birth</label>
                          <input 
                            type="date" 
                            value={pDob} 
                            onChange={(e) => setPDob(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-medium">Blood Group</label>
                          <input 
                            type="text" 
                            value={pBloodGroup} 
                            onChange={(e) => setPBloodGroup(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-medium">Marital Status</label>
                          <select 
                            value={pMaritalStatus} 
                            onChange={(e) => setPMaritalStatus(e.target.value)}
                            className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={updatePersonalMutation.isPending}
                        className="w-full py-2 bg-primary text-white rounded font-bold hover:opacity-90"
                      >
                        Save Personal Details
                      </button>
                    </form>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div><span className="text-slate-400 block">Gender</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.gender}</p></div>
                      <div><span className="text-slate-400 block">Date of Birth</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.dob}</p></div>
                      <div><span className="text-slate-400 block">Blood Group</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.bloodGroup}</p></div>
                      <div><span className="text-slate-400 block">Marital Status</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.maritalStatus}</p></div>
                      <div><span className="text-slate-400 block">Contact Email</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.email}</p></div>
                      <div><span className="text-slate-400 block">Contact Phone</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{activeEmployee.phone}</p></div>
                    </div>
                  )}
                </div>
                
                {/* Qualifications & Past Work */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Academic & Career Background</h3>
                  </div>
                  {editPersonalMode ? (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium">Highest Degree</label>
                        <input 
                          type="text" 
                          value={pQualification} 
                          onChange={(e) => setPQualification(e.target.value)}
                          className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium">University</label>
                        <input 
                          type="text" 
                          value={pUniversity} 
                          onChange={(e) => setPUniversity(e.target.value)}
                          className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-medium">Passing Year</label>
                        <input 
                          type="text" 
                          value={pPassingYear} 
                          onChange={(e) => setPPassingYear(e.target.value)}
                          className="w-full px-2 py-1.5 border rounded bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3.5 mb-4">
                        <div><span className="text-slate-400 block">Highest Degree</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.qualification}</p></div>
                        <div><span className="text-slate-400 block">University</span><p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-150">{personalDetails.university}</p></div>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Past Companies</span>
                        {activeEmployee.pastCompanies.length === 0 ? (
                          <p className="text-slate-450 italic">No past companies listed (Fresher)</p>
                        ) : (
                          activeEmployee.pastCompanies.map((c: { company: string; role: string; duration: string; ctc: string }, i: number) => (
                            <div key={i} className="mb-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              <p className="font-bold text-slate-800 dark:text-white">{c.company}</p>
                              <p className="text-[10px] text-slate-400">{c.role} • {c.duration} • CTC: ₹{c.ctc}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {profileTab === 'documents' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Identity Documents & Verification</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={documentFileInputRef} 
                      className="hidden" 
                      onChange={handleDocumentFileChange}
                    />
                    <button 
                      onClick={() => documentFileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl hover:scale-105 transition-all font-semibold shadow-sm"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSignature className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">Aadhaar Card</p>
                        <p className="text-[10px] text-slate-400">{activeEmployee.aadhaar}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">VERIFIED</span>
                  </div>
                  <div className="p-3 border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">PAN Card</p>
                        <p className="text-[10px] text-slate-400">{activeEmployee.pan}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">VERIFIED</span>
                  </div>

                  {/* Uploaded Documents */}
                  {(uploadedDocs[activeEmployee.id] || []).map((doc, idx) => (
                    <div key={idx} className="p-3 border rounded-xl flex items-center justify-between animate-fade-in col-span-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-bold text-slate-850 dark:text-white">{doc.name}</p>
                          <p className="text-[10px] text-slate-400">Size: {doc.size} • Uploaded: {doc.date}</p>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded-full text-[9px] font-bold">UPLOADED</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'attendance' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Attendance Summary (Current Cycle)</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Days</p>
                    <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">30</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold">Present</p>
                    <p className="text-xl font-bold mt-1 text-green-700 dark:text-green-400">22</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">Leaves</p>
                    <p className="text-xl font-bold mt-1 text-amber-700 dark:text-amber-400">2</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl text-center border">
                    <p className="text-[10px] text-red-600 dark:text-red-400 uppercase font-bold">Absent</p>
                    <p className="text-xl font-bold mt-1 text-red-700 dark:text-red-400">0</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Shift Schedule</h4>
                  <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">General Day Shift (G-01)</p>
                      <p className="text-[10px] text-slate-400">09:30 AM to 06:30 PM • 9 Hours (1 Hr break included)</p>
                    </div>
                    <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">ROSTERED</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'payroll' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Salary Master Structure & CTC</h3>
                  <button 
                    onClick={() => {
                      setSBasic(salaryDetails.basic || 0);
                      setSHra(salaryDetails.hra || 0);
                      setSAllowance(salaryDetails.allowance || 0);
                      setSDeductions(salaryDetails.deductions || 0);
                      setSBankName(salaryDetails.bankName || '');
                      setSBankAccount(salaryDetails.bankAccount || '');
                      setSIfsc(salaryDetails.ifsc || '');
                      setSPan(salaryDetails.pan || '');
                      setSAadhaar(salaryDetails.aadhaar || '');
                      setSUan(salaryDetails.uan || '');
                      setSPfNumber(salaryDetails.pfNumber || '');
                      setEditSalaryMode(!editSalaryMode);
                    }}
                    className="text-xs text-primary hover:underline font-bold"
                  >
                    {editSalaryMode ? 'Cancel' : 'Edit Structure'}
                  </button>
                </div>
                {editSalaryMode ? (
                  <form onSubmit={handleUpdateSalary} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950 space-y-3">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2">Edit Monthly Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span>Basic Salary</span>
                            <input 
                              type="number" 
                              value={sBasic} 
                              onChange={(e) => setSBasic(Number(e.target.value))}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>HRA</span>
                            <input 
                              type="number" 
                              value={sHra} 
                              onChange={(e) => setSHra(Number(e.target.value))}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Special Allowance</span>
                            <input 
                              type="number" 
                              value={sAllowance} 
                              onChange={(e) => setSAllowance(Number(e.target.value))}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950 space-y-3">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2">Edit Monthly Deductions & Bank</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span>Total Deductions</span>
                            <input 
                              type="number" 
                              value={sDeductions} 
                              onChange={(e) => setSDeductions(Number(e.target.value))}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Bank Name</span>
                            <input 
                              type="text" 
                              value={sBankName} 
                              onChange={(e) => setSBankName(e.target.value)}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span>Bank Account No</span>
                            <input 
                              type="text" 
                              value={sBankAccount} 
                              onChange={(e) => setSBankAccount(e.target.value)}
                              className="w-32 px-2 py-1 border rounded bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                      <div className="space-y-1">
                        <span className="text-slate-400">IFSC Code</span>
                        <input 
                          type="text" 
                          value={sIfsc} 
                          onChange={(e) => setSIfsc(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400">PAN</span>
                        <input 
                          type="text" 
                          value={sPan} 
                          onChange={(e) => setSPan(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400">Aadhaar</span>
                        <input 
                          type="text" 
                          value={sAadhaar} 
                          onChange={(e) => setSAadhaar(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400">UAN</span>
                        <input 
                          type="text" 
                          value={sUan} 
                          onChange={(e) => setSUan(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <span className="text-slate-400">PF Number</span>
                        <input 
                          type="text" 
                          value={sPfNumber} 
                          onChange={(e) => setSPfNumber(e.target.value)}
                          className="w-full px-2 py-1 border rounded bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={updateSalaryMutation.isPending}
                      className="w-full py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90"
                    >
                      Save Salary Structure Changes
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Earnings table */}
                      <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2.5">Monthly Earnings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between"><span>Basic Salary</span><span className="font-bold text-slate-800 dark:text-white">₹{(salaryDetails.basic ?? 0).toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>HRA</span><span className="font-bold text-slate-800 dark:text-white">₹{(salaryDetails.hra ?? 0).toLocaleString()}</span></div>
                          <div className="flex justify-between"><span>Special Allowance</span><span className="font-bold text-slate-800 dark:text-white">₹{(salaryDetails.allowance ?? 0).toLocaleString()}</span></div>
                          <div className="border-t pt-2 flex justify-between font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            <span>Gross Salary</span>
                            <span>₹{((salaryDetails.basic ?? 0) + (salaryDetails.hra ?? 0) + (salaryDetails.allowance ?? 0)).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Deductions and Bank */}
                      <div className="space-y-4">
                        <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-2.5">Monthly Deductions</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between"><span>Provident Fund (PF)</span><span className="font-bold text-slate-800 dark:text-white">₹3,200</span></div>
                            <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-bold text-slate-800 dark:text-white">₹200</span></div>
                            <div className="flex justify-between"><span>Income Tax (TDS mock)</span><span className="font-bold text-slate-800 dark:text-white">₹{((salaryDetails.deductions ?? 0) - 3400).toLocaleString()}</span></div>
                            <div className="border-t pt-2 flex justify-between font-bold text-rose-600 dark:text-rose-400 text-sm">
                              <span>Total Deductions</span>
                              <span>₹{(salaryDetails.deductions ?? 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 border rounded-xl flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">Net Credited</p>
                            <p className="text-[10px] text-slate-400">Direct Bank Deposit</p>
                          </div>
                          <span className="text-lg font-extrabold text-primary">₹{(salaryDetails.netSalary ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border rounded-xl p-4">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-2">PF & Bank Remittance Codes</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                        <div><span className="text-slate-400">Bank</span><p className="font-semibold text-slate-800 dark:text-white">{salaryDetails.bankName}</p></div>
                        <div><span className="text-slate-400">Account No</span><p className="font-semibold text-slate-800 dark:text-white">{salaryDetails.bankAccount}</p></div>
                        <div><span className="text-slate-400">Universal Account No (UAN)</span><p className="font-semibold text-slate-800 dark:text-white">{salaryDetails.uan}</p></div>
                        <div><span className="text-slate-400">PF Member ID</span><p className="font-semibold text-slate-800 dark:text-white">{salaryDetails.pfNumber}</p></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {profileTab === 'leave' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Leave Summary Info</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Casual Leave (CL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">8 / 12 Days</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Sick Leave (SL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">5 / 10 Days</p>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950">
                    <p className="text-slate-400">Earned Leave (EL)</p>
                    <p className="text-lg font-bold mt-1 text-slate-800 dark:text-white">12 / 18 Days</p>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'performance' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">KRA & KPI Performance Ratings</h3>
                <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white">Q1 2026 Core Goal Cycle</p>
                    <p className="text-[10px] text-slate-400">Reviewed by {activeEmployee.manager}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-primary">4.2 / 5.0</p>
                    <span className="bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 px-2 py-0.5 rounded-full text-[9px] font-bold">EXCEEDS EXPECTATIONS</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'assets' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Assigned Hardware & IT Assets</h3>
                <div className="space-y-2">
                  {activeEmployee.assets.map((ast: string, idx: number) => (
                    <div key={idx} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <QrCode className="h-5 w-5 text-slate-400" />
                        <span className="font-bold text-slate-800 dark:text-white">{ast}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Verified Auto-Sync • Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'timeline' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Lifecycle History & Transfers</h3>
                <div className="space-y-4 relative pl-5 border-l">
                  <div className="relative pb-2">
                    <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-primary border-2 border-white dark:border-slate-900"></span>
                    <p className="font-bold text-slate-850 dark:text-white">Joined Company</p>
                    <p className="text-[10px] text-slate-400">{activeEmployee.joiningDate}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Hired as {activeEmployee.role} in {activeEmployee.department} team located in {activeEmployee.location}.</p>
                  </div>
                  {activeEmployee.promotions.map((p: { date: string; oldRole: string; newRole: string; salaryIncrement: string }, idx: number) => (
                    <div key={idx} className="relative pb-2">
                      <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></span>
                      <p className="font-bold text-green-600 dark:text-green-400">Promotion / Salary Revision</p>
                      <p className="text-[10px] text-slate-400">{p.date}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Promoted from {p.oldRole} to {p.newRole} with an increment of {p.salaryIncrement}.</p>
                    </div>
                  ))}
                  {activeEmployee.transfers.map((t: { date: string; oldDept: string; newDept: string; location: string }, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6.5 top-0.5 h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></span>
                      <p className="font-bold text-blue-600 dark:text-blue-400">Departmental Transfer</p>
                      <p className="text-[10px] text-slate-400">{t.date}</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Transferred from {t.oldDept} to {t.newDept} in {t.location} office.</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'notes' && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b pb-2">Internal HR & Performance Notes</h3>
                <textarea 
                  placeholder="Type an internal note regarding performance, disciplinary actions or awards..." 
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                  rows={4}
                />
                <button 
                  onClick={() => alert("Note saved successfully!")}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-sm"
                >
                  Save Internal Note
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. ONBOARDING STEPPER MASTER            */}
      {/* ======================================= */}
      {activeSubModule === 'master' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Employee Onboarding Master Setup</h2>
            <p className="text-slate-400 mt-1">Create a new employee master registry record through a step-by-step confirmation wizard.</p>
          </div>

          {/* Stepper Steps UI */}
          <div className="flex items-center justify-between border-b pb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold border ${
                  stepperStep === step 
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                    : stepperStep > step 
                    ? 'bg-green-500 text-white border-green-500' 
                    : 'border-slate-200 dark:border-slate-800 text-slate-400'
                }`}>
                  {step}
                </div>
                <span className={`font-semibold ${stepperStep === step ? 'text-primary' : 'text-slate-400'}`}>
                  {step === 1 ? 'Personal Details' : step === 2 ? 'Remittance & Work' : 'Confirmation'}
                </span>
                {step < 3 && <ChevronRight className="h-4 w-4 text-slate-400 mx-2 hidden md:block" />}
              </div>
            ))}
          </div>

          {/* Step 1 Content */}
          {stepperStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 1: Personal Details & Academics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    value={newEmp.name} 
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="Enter full name" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Phone Number</label>
                  <input 
                    type="tel" 
                    value={newEmp.phone || ''} 
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="Enter phone number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Job Designation Role</label>
                  <input 
                    type="text" 
                    value={newEmp.role} 
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                    placeholder="e.g. Frontend Developer" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Gender</label>
                  <select 
                    value={newEmp.gender} 
                    onChange={(e) => setNewEmp({ ...newEmp, gender: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Department</label>
                  <select 
                    value={newEmp.department} 
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  >
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Date of Birth</label>
                  <input 
                    type="date" 
                    value={newEmp.dob} 
                    onChange={(e) => setNewEmp({ ...newEmp, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Highest Academic Degree</label>
                  <input 
                    type="text" 
                    value={newEmp.qualification} 
                    onChange={(e) => setNewEmp({ ...newEmp, qualification: e.target.value })}
                    placeholder="e.g. MBA in HR" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Content */}
          {stepperStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 2: Remittance Details & Banking</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bank Name</label>
                  <input 
                    type="text" 
                    value={newEmp.bankName} 
                    onChange={(e) => setNewEmp({ ...newEmp, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Bank Account Number</label>
                  <input 
                    type="text" 
                    value={newEmp.bankAccount} 
                    onChange={(e) => setNewEmp({ ...newEmp, bankAccount: e.target.value })}
                    placeholder="Enter account number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">IFSC Code</label>
                  <input 
                    type="text" 
                    value={newEmp.ifsc} 
                    onChange={(e) => setNewEmp({ ...newEmp, ifsc: e.target.value })}
                    placeholder="e.g. HDFC0000240" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">PAN Card Number</label>
                  <input 
                    type="text" 
                    value={newEmp.pan} 
                    onChange={(e) => setNewEmp({ ...newEmp, pan: e.target.value })}
                    placeholder="10-digit alphanumeric" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Aadhaar Card Number</label>
                  <input 
                    type="text" 
                    value={newEmp.aadhaar} 
                    onChange={(e) => setNewEmp({ ...newEmp, aadhaar: e.target.value })}
                    placeholder="12-digit number" 
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Basic Salary (Monthly)</label>
                  <input 
                    type="number" 
                    value={newEmp.basic} 
                    onChange={(e) => {
                      const b = Number(e.target.value);
                      const h = Math.round(b * 0.4);
                      const a = Math.round(b * 0.3);
                      const d = Math.round(b * 0.15);
                      setNewEmp({ ...newEmp, basic: b, hra: h, allowance: a, deductions: d, netSalary: b + h + a - d });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 Content */}
          {stepperStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Step 3: Confirm Master Record Information</h3>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-3.5">
                <p className="font-bold text-slate-800 dark:text-white">Verify all fields match legal physical documents:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><span className="text-slate-400">Name</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.name || "N/A"}</p></div>
                  <div><span className="text-slate-400">Role</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.role || "N/A"}</p></div>
                  <div><span className="text-slate-400">Department</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.department}</p></div>
                  <div><span className="text-slate-400">Salary Package (Net)</span><p className="font-semibold text-slate-800 dark:text-white">₹{newEmp.netSalary?.toLocaleString()}</p></div>
                  <div><span className="text-slate-400">Bank Account</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.bankAccount || "N/A"}</p></div>
                  <div><span className="text-slate-400">PAN</span><p className="font-semibold text-slate-800 dark:text-white">{newEmp.pan || "N/A"}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex justify-between border-t pt-4">
            <button 
              disabled={stepperStep === 1}
              onClick={() => setStepperStep(prev => prev - 1)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50"
            >
              Previous Step
            </button>
            {stepperStep < 3 ? (
              <button 
                onClick={() => setStepperStep(prev => prev + 1)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all"
              >
                Next Step
              </button>
            ) : (
              <button 
                onClick={handleCreateEmployee}
                disabled={!newEmp.name || !newEmp.role}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold hover:scale-105 transition-all disabled:opacity-50"
              >
                Onboard Employee Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. ORGANIZATION CHART                   */}
      {/* ======================================= */}
      {activeSubModule === 'orgchart' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 text-center animate-fade-in text-xs">
          <div>
            <h2 className="text-md font-bold text-slate-800 dark:text-white">Organization Hierarchy Chart</h2>
            <p className="text-slate-400 mt-1">Corporate reporting structures from Board executive down to development teams.</p>
          </div>

          <div className="overflow-x-auto py-8">
            <div className="inline-block min-w-full align-middle">
              <div className="flex flex-col items-center">
                {/* Level 0: CEO */}
                <div className="bg-primary border border-primary/20 p-3 rounded-2xl text-center w-52 shadow-md org-node">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" alt="CEO" className="h-10 w-10 rounded-full mx-auto object-cover ring-2 ring-white/20 mb-2" />
                  <p className="font-bold text-white leading-none">Vikram Malhotra</p>
                  <p className="text-[9px] text-white/70 mt-1 uppercase font-bold">Chief Executive Officer</p>
                </div>

                <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                {/* Level 1: Directors/VP */}
                <div className="flex gap-16 relative">
                  {/* Left Column: VP Engineering & Manager */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-950 border p-3 rounded-2xl text-center w-48 shadow-sm org-node">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120" alt="Mgr" className="h-9 w-9 rounded-full mx-auto object-cover mb-2" />
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Neha Patel</p>
                      <p className="text-[9px] text-slate-400 mt-1">Engineering Manager</p>
                    </div>
                    
                    <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                    {/* Level 2: Engineering Team */}
                    <div className="flex gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                        <p className="font-bold text-slate-800 dark:text-white leading-none">Aarav Sharma</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Senior Dev</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                        <p className="font-bold text-slate-800 dark:text-white leading-none">Ananya Roy</p>
                        <p className="text-[8px] text-slate-400 mt-0.5">Intern UI Dev</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: HR Director & Team */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white dark:bg-slate-950 border p-3 rounded-2xl text-center w-48 shadow-sm org-node">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120" alt="Mgr" className="h-9 w-9 rounded-full mx-auto object-cover mb-2" />
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Shalini Sen</p>
                      <p className="text-[9px] text-slate-400 mt-1">HR Director</p>
                    </div>

                    <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-800 my-1"></div>

                    <div className="bg-slate-50 dark:bg-slate-900 border p-2.5 rounded-xl text-center w-36 shadow-sm org-node org-node-last">
                      <p className="font-bold text-slate-800 dark:text-white leading-none">Karan Johar</p>
                      <p className="text-[8px] text-slate-400 mt-0.5">HR Generalist</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. EXIT MANAGEMENT & RESIGNATION        */}
      {/* ======================================= */}
      {activeSubModule === 'exit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Left Column: Exit Initiation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Trigger Employee Exit</h3>
            
            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Select Resigning Employee</label>
              <select 
                value={selectedExitEmpId} 
                onChange={(e) => setSelectedExitEmpId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.id})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium">Reason for Resignation</label>
              <textarea 
                value={resignationReason} 
                onChange={(e) => setResignationReason(e.target.value)}
                rows={3} 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              />
            </div>

            <div className="space-y-3.5 pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Clearance Checklist</span>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={itClearance} onChange={(e) => setItClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">IT Asset & System Revocation</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={financeClearance} onChange={(e) => setFinanceClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Finance & Expense Claims Match</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={adminClearance} onChange={(e) => setAdminClearance(e.target.checked)} className="rounded text-primary focus:ring-0" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Admin & Key Handover Completed</span>
              </label>
            </div>

            <button 
              onClick={handleProcessClearance}
              disabled={!itClearance || !financeClearance || !adminClearance}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 disabled:opacity-50"
            >
              Approve F&F Settlement
            </button>
          </div>

          {/* Right Column: Full & Final Settlement Calculator Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Full & Final (F&F) Settlement Statement</h3>
            {(() => {
              const emp = employees.find(e => e.id === selectedExitEmpId);
              if (!emp) return <p className="text-slate-400">Employee not found.</p>;
              const details = calculateFullFinal(emp);
              
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 border rounded-xl">
                    <div><span className="text-slate-400">Employee</span><p className="font-bold text-slate-850 dark:text-white">{emp.name}</p></div>
                    <div><span className="text-slate-400">Designation</span><p className="font-semibold text-slate-700 dark:text-slate-300">{emp.role}</p></div>
                    <div><span className="text-slate-400">Resigned On</span><p className="font-semibold text-slate-700 dark:text-slate-300">2026-06-30</p></div>
                    <div><span className="text-slate-400">Clearance Status</span><p className="font-bold text-amber-500">{emp.clearanceStatus || "Pending Checks"}</p></div>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 border-b font-semibold">
                        <tr>
                          <th className="p-3">Salary Component Item</th>
                          <th className="p-3 text-right">Addition Amount</th>
                          <th className="p-3 text-right">Deduction Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-650 dark:text-slate-350">
                        <tr>
                          <td className="p-3">Notice Period Earned (1 Month)</td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.earnings.toLocaleString()}</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                        <tr>
                          <td className="p-3">Leave Encashment (12 Accrued Days)</td>
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.leaveEncash.toLocaleString()}</td>
                          <td className="p-3 text-right">-</td>
                        </tr>
                        {details.gratuity > 0 && (
                          <tr>
                            <td className="p-3">Gratuity Settlement (5 Years completed)</td>
                            <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">₹{details.gratuity.toLocaleString()}</td>
                            <td className="p-3 text-right">-</td>
                          </tr>
                        )}
                        <tr>
                          <td className="p-3">Provident Fund Deducted</td>
                          <td className="p-3 text-right">-</td>
                          <td className="p-3 text-right text-rose-500 font-medium">₹{details.deductions.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-slate-50 dark:bg-slate-950 font-bold text-slate-800 dark:text-white border-t">
                          <td className="p-3 text-sm">Net Payable F&F Amount</td>
                          <td className="p-3 text-right text-primary text-sm" colSpan={2}>
                            ₹{details.netPayable.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 6. BULK ACTIONS & MAILING               */}
      {/* ======================================= */}
      {activeSubModule === 'bulk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          {/* Left Column: Upload and File import */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Bulk Excel/CSV Import</h3>
            <input 
              type="file" 
              ref={bulkFileInputRef} 
              className="hidden" 
              accept=".csv,.xlsx,.xls"
              onChange={handleBulkFileChange}
            />
            <div 
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); alert("File dropped! Parsing data structure..."); }}
              onClick={() => bulkFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-950/40'
              }`}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200">Drag & drop your CSV template</p>
              <p className="text-[10px] text-slate-400 mt-1">or click to browse local files</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Downloading Employee Onboarding Template (CSV)...")}
                className="w-full py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg font-bold flex items-center justify-center gap-1.5"
              >
                <FileDown className="h-4 w-4" />
                Template
              </button>
              <button 
                onClick={() => {
                  alert("Syncing 12 records from Excel file...");
                  addAuditLog("Bulk Import Sync", "Employee Center", "Synchronized 12 employee records via excel file upload");
                }}
                className="w-full py-1.5 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Process Upload
              </button>
            </div>
          </div>

          {/* Right Column: Bulk Email Communication */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Dispatch Bulk Email & Alert</h3>
            
            <form onSubmit={handleSendBulkMail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-slate-400 font-bold block mb-1">Select Recipients ({selectedBulkEmpIds.length} chosen)</span>
                  <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5 bg-slate-50 dark:bg-slate-950">
                    {employees.map(e => (
                      <label key={e.id} className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={selectedBulkEmpIds.includes(e.id)} 
                          onChange={() => handleToggleSelectBulk(e.id)}
                          className="rounded text-primary focus:ring-0" 
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{e.name} ({e.department})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Subject Title</label>
                    <input 
                      type="text" 
                      value={bulkMailSubject} 
                      onChange={(e) => setBulkMailSubject(e.target.value)}
                      placeholder="e.g. Q2 Performance Review Kickoff" 
                      required 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Email Content Body</label>
                    <textarea 
                      value={bulkMailBody} 
                      onChange={(e) => setBulkMailBody(e.target.value)}
                      placeholder="Write your corporate announcements or reminders here..." 
                      rows={3} 
                      required 
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
                <button 
                  type="submit" 
                  disabled={selectedBulkEmpIds.length === 0}
                  className="px-4 py-2 bg-primary text-white rounded-xl font-bold flex items-center gap-1.5 hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Emails & Notifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 5. ROLE & PERMISSION MANAGEMENT         */}
      {/* ======================================= */}
      {activeSubModule === 'roles' && (
        <RoleManagementPanel employees={employees} />
      )}

      {/* ======================================= */}
      {/* 7. DEPARTMENT MANAGEMENT                */}
      {/* ======================================= */}
      {activeSubModule === 'departments' && (
        <DepartmentManagementPanel employees={employees} />
      )}

    </div>
  );
};
