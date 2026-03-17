import React, { useState, useMemo } from 'react';
import {
  useGetSiteApprovalQuery,
  usePostSiteApprovalMutation,
} from '../../redux/SiteExpenses/SiteExpensesSlice';

const SiteApprovel = () => {
  const { data = [], isLoading, isError, refetch } = useGetSiteApprovalQuery();
  const [postSiteApproval, { isLoading: isSubmitting }] = usePostSiteApprovalMutation();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Modal State
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    status: '',
    Approve_Amount: '',
    Confirm_Head: '',
    remark: '',
  });

  // Image Preview
  const [imagePreview, setImagePreview] = useState(null);

  // Get unique project names for filter dropdown
  const projectNames = useMemo(() => {
    const names = [...new Set(data.map((item) => item.projectName).filter(Boolean))];
    return names.sort();
  }, [data]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.payeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.uid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.RccBillNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ContractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detailsOfWork?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProject = !filterProject || item.projectName === filterProject;

      return matchesSearch && matchesProject;
    });
  }, [data, searchTerm, filterProject]);

  // Open Modal
  const handleOpenModal = (row) => {
    setSelectedRow(row);
    setFormData({
      status: '',
      Approve_Amount: row.costAmount || '',
      Confirm_Head: row.EXPHead || '',
      remark: '',
    });
    setModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRow(null);
    setFormData({ status: '', Approve_Amount: '', Confirm_Head: '', remark: '' });
  };

  // Submit Approval
  const handleSubmit = async (statusValue) => {
    if (!selectedRow) return;

    try {
      await postSiteApproval({
        uid: selectedRow.uid,
        status: statusValue,
        Approve_Amount: formData.Approve_Amount,
        Confirm_Head: formData.Confirm_Head,
        remark: formData.remark,
      }).unwrap();

      alert(`✅ Successfully ${statusValue === 'Approved' ? 'Approved' : 'Rejected'}!`);
      handleCloseModal();
      refetch();
    } catch (err) {
      alert('❌ Error: ' + (err?.data?.message || 'Something went wrong'));
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    if (!val) return '—';
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return '₹' + num.toLocaleString('en-IN');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading site approvals...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <p className="text-red-600 font-semibold text-lg mb-2">Failed to load data</p>
          <p className="text-red-400 text-sm mb-4">Please check your connection and try again.</p>
          <button
            onClick={refetch}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs font-medium uppercase tracking-wide">Total Pending</p>
          <p className="text-2xl font-bold mt-1">{data.length}</p>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-md">
          <p className="text-amber-100 text-xs font-medium uppercase tracking-wide">Filtered</p>
          <p className="text-2xl font-bold mt-1">{filteredData.length}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-green-100 text-xs font-medium uppercase tracking-wide">Total Amount</p>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(
              filteredData.reduce((sum, item) => sum + (parseFloat(item.costAmount) || 0), 0)
            )}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, UID, bill no, contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]"
        >
          <option value="">All Projects</option>
          {projectNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <button
          onClick={refetch}
          className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-medium flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No pending approvals found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">RCC Bill No</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Payee Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Project</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Engineer</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Head Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Details</th>
                  <th className="text-right px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Bill No</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Bill Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Exp Head</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Contractor</th>
                  <th className="text-left px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Firm</th>
                  <th className="text-center px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Bill Photo</th>
                  <th className="text-center px-4 py-3 font-semibold text-indigo-900 text-xs uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((row, index) => (
                  <tr key={row.uid || index} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.RccBillNo || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{row.payeeName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md">
                        {row.projectName || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.projectEngineerName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.headType || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate" title={row.detailsOfWork}>
                      {row.detailsOfWork || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(row.costAmount)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.BillNO || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.BillDate || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.EXPHead || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.ContractorName || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{row.ContractorFirmName || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      {row.billPhoto ? (
                        <button
                          onClick={() => setImagePreview(row.billPhoto)}
                          className="text-indigo-600 hover:text-indigo-800 underline text-xs font-medium"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleOpenModal(row)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-medium shadow-sm"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {modalOpen && selectedRow && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">Review Approval</h3>
                <p className="text-indigo-200 text-xs mt-0.5">UID: {selectedRow.uid}</p>
              </div>
              <button onClick={handleCloseModal} className="text-white/80 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Info Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Payee Name</span>
                  <span className="font-medium text-gray-800">{selectedRow.payeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Project</span>
                  <span className="font-medium text-gray-800">{selectedRow.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Head Type</span>
                  <span className="font-medium text-gray-800">{selectedRow.headType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contractor</span>
                  <span className="font-medium text-gray-800">{selectedRow.ContractorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Requested Amount</span>
                  <span className="font-bold text-green-700">{formatCurrency(selectedRow.costAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Details of Work</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%]">{selectedRow.detailsOfWork}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Approve Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.Approve_Amount}
                    onChange={(e) => setFormData({ ...formData, Approve_Amount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter approved amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Confirm Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.Confirm_Head}
                    onChange={(e) => setFormData({ ...formData, Confirm_Head: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter confirmed head"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Remark
                  </label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Enter remark (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition text-sm font-medium"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit('Rejected')}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Reject'}
              </button>
              <button
                onClick={() => handleSubmit('Approved')}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-3 max-w-2xl max-h-[85vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2 px-2">
              <p className="text-sm font-semibold text-gray-700">Bill Photo</p>
              <button onClick={() => setImagePreview(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img src={imagePreview} alt="Bill" className="rounded-xl max-w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteApprovel;