import React, { useState, useEffect } from "react";

const Vendor_followup_billing = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedPONumber, setSelectedPONumber] = useState("");
  const [poDetails, setPoDetails] = useState(null);
  const [poNumbers, setPoNumbers] = useState([]);
  const [status, setStatus] = useState("");
  const [remark, setRemark] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/vendor-FollowUp-Billing`;
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRequests(data.data);
        const uniquePOs = [...new Set(data.data.map((r) => r.poNumber))].filter(
          Boolean
        );
        setPoNumbers(uniquePOs);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      setRequests([]);
      setPoNumbers([]);
    } finally {
      setLoading(false);
    }
  };

  const setPoDetailsFromRequests = () => {
    if (!selectedPONumber) return;
    const details = requests.filter((r) => r.poNumber === selectedPONumber);
    if (details.length > 0) {
      setPoDetails(details);
      setIsModalOpen(false);
      setDetailsModalOpen(true);
    } else {
      setError("No items found for this PO");
    }
  };

  const handleSubmitFollowUp = async () => {
    if (!status || !remark) {
      setError("Status and Remark are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData = poDetails
        .filter((item) => item.UID)
        .map((item) => ({
          UID: item.UID,
          status12: status,
          remark12: remark,
        }));

      if (updateData.length === 0) throw new Error("No valid items to update");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/update-followup-Billing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Update failed");
      }

      alert(
        `Successfully updated ${
          result.updatedRows || updateData.length
        } item(s)`
      );
      resetModals();
      fetchRequests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModals = () => {
    setDetailsModalOpen(false);
    setIsModalOpen(false);
    setSelectedPONumber("");
    setPoDetails(null);
    setStatus("");
    setRemark("");
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Follow-Up Billing Data</h2> */}

      <button
        onClick={() => setIsModalOpen(true)}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Bill Follow Up
      </button>

      {/* PO Selection Modal - FIXED AT TOP */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
            <div
              className="bg-white rounded-lg shadow-xl w-80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800">
                  Select PO Number
                </h3>
              </div>

              <div className="p-4">
                <select
                  value={selectedPONumber}
                  onChange={(e) => setSelectedPONumber(e.target.value)}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-- Select PO Number --</option>
                  {poNumbers.map((po) => (
                    <option key={po} value={po}>
                      {po}
                    </option>
                  ))}
                </select>
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-lg">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={setPoDetailsFromRequests}
                  disabled={!selectedPONumber}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  Fetch Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Details Modal - FIXED AT TOP */}
      {detailsModalOpen && poDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={resetModals}
        >
          <div className="min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Update Follow-Up (PO: {selectedPONumber})
                </h2>
                <button
                  onClick={resetModals}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-3">
                  Updating <strong>{poDetails.length}</strong> item(s):
                </p>

                <div className="bg-gray-50 p-3 rounded border mb-4 max-h-32 overflow-y-auto">
                  <ul className="text-sm space-y-1">
                    {/* Header - justify-between रखते हुए */}
                    <div className="flex justify-between font-bold mb-1 px-1">
                      <div className="w-1/3 text-center">Material Name</div>
                      <div className="w-1/3 text-center">Vendor Firm</div>
                      <div className="w-1/3 text-center">UID</div>
                    </div>

                    {/* Data rows - same width & center alignment */}
                    {poDetails.map((item, i) => (
                      <li
                        key={i}
                        className="flex justify-between text-gray-700"
                      >
                        <div className="w-1/3 text-center">
                          {item.materialName}
                        </div>
                        <div className="w-1/3 text-center">
                          {item.vendorFirmName}
                        </div>
                        <div className="w-1/3 text-center text-gray-500 text-xs">
                          UID: {item.UID}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status 12 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="">-- Select Status --</option>
                      <option value="Received">Received</option>
                      <option value="Hold">Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remark 12 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      rows="3"
                      placeholder="Enter your remark..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
                <button
                  onClick={resetModals}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFollowUp}
                  disabled={loading || !status || !remark}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Updating..." : "Update All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
        {loading && !requests.length ? (
          <div className="p-8 text-center text-gray-500">Loading data...</div>
        ) : error && !requests.length ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending follow-ups.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y ">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <tr>
                  {[
                    "Planned 12",
                    "UID",
                    "Site Name",
                    "Supervisor",
                    "Material Name",
                    "Revised Qty",
                    "Received Qty",
                    "Unit",
                    "Vendor Firm",
                    "PO Number",
                    "Status 12",
                    "Follow-Up Count 12",
                    "Remark 12",
                    "Vendor Contact",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((r, i) => (
                  <tr
                    key={`${r.UID}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-2 text-sm">{r.planned12}</td>
                    <td className="px-4 py-2 text-sm font-mono">{r.UID}</td>
                    <td className="px-4 py-2 text-sm">{r.siteName}</td>
                    <td className="px-4 py-2 text-sm">{r.supervisorName}</td>
                    <td className="px-4 py-2 text-sm">{r.materialName}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      {r.revisedQuantity}
                    </td>
                    <td className="px-4 py-2 text-sm text-right">
                      {r.finalReceivedQuantity}
                    </td>
                    <td className="px-4 py-2 text-sm">{r.unitName}</td>
                    <td className="px-4 py-2 text-sm">{r.vendorFirmName}</td>
                    <td className="px-4 py-2 text-sm font-semibold">
                      {r.poNumber}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm font-medium ${
                        r.status12 === "Hold"
                          ? "text-red-600"
                          : r.status12 === "Received"
                          ? "text-green-600"
                          : "text-gray-700"
                      }`}
                    >
                      {r.status12 || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {r.followUpCount12}
                    </td>
                    <td className="px-4 py-2 text-sm italic">
                      {r.remark12 || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm">{r.vendorContact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendor_followup_billing;
