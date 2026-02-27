
import React, { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import axios from "axios";

// Reuse the same SearchableSelect component
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
  required,
  label,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const MAX_VISIBLE = 80;
  const displayOptions = search ? filteredOptions : filteredOptions.slice(0, MAX_VISIBLE);

  const handleInputChange = (e) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (opt) => {
    onChange(opt);
    setSearch("");
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSearch("");
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setSearch("");
    }, 200);
  };

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={isOpen ? search : value || ""}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                   ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        placeholder={placeholder}
      />

      {isOpen && !disabled && (
        <ul
          className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 
                     max-h-64 overflow-y-auto shadow-xl"
          style={{ top: "100%", left: 0 }}
        >
          {displayOptions.length > 0 ? (
            displayOptions.map((opt, idx) => (
              <li
                key={idx}
                className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm transition-colors duration-100"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-gray-500 text-sm italic">No matching options found</li>
          )}

          {!search && filteredOptions.length > MAX_VISIBLE && (
            <li className="px-4 py-2 text-xs text-gray-500 text-center border-t mt-1">
              Type to see more ({filteredOptions.length - MAX_VISIBLE} hidden)...
            </li>
          )}
        </ul>
      )}

      <input type="hidden" value={value} />
    </div>
  );
};

const OutStanding = () => {
  const [formData, setFormData] = useState({
    siteName: "",
    vendorName: "",
    billNo: "",
    billDate: "",
    expHead: "",
    basicAmount: "",
    cgst: "",
    sgst: "",
    netAmount: "",
  });

  const [siteNames, setSiteNames] = useState([]);
  const [expHeads] = useState([
    "PF Fees",
    "Audit",
    "Bank Charges",
    "Capital Invest By Vipin Chauhan",
    "Capital Withdrawl By Vipin Chauhan",
    "Contractor",
    "GST Paid",
    "Loan EMI",
    "Office Exp",
    "Opening Balance",
    "Purchase",
    "Salary",
    "Security Agency",
    "TDS Payble",
    "TDS Receivable",
    "Tally Update",
    "Transfer Amount",
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`);
        setSiteNames(res.data.siteNames || []);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        setError("Failed to load sites. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto calculate net amount
  useEffect(() => {
    const basic = parseFloat(formData.basicAmount) || 0;
    const cgst = parseFloat(formData.cgst) || 0;
    const sgst = parseFloat(formData.sgst) || 0;
    const net = basic + cgst + sgst;
    setFormData((prev) => ({ ...prev, netAmount: net.toFixed(2) }));
  }, [formData.basicAmount, formData.cgst, formData.sgst]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.siteName ||
      !formData.vendorName ||
      !formData.billNo ||
      !formData.billDate ||
      !formData.expHead ||
      !formData.basicAmount ||
      parseFloat(formData.basicAmount) <= 0 ||
      parseFloat(formData.netAmount) <= 0
    ) {
      alert("All required fields must be filled correctly (Basic Amount > 0)");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/outStading/submit-Outstanding-data`, payload);

      setSuccessMessage("Outstanding entry submitted successfully!");
      resetForm();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      siteName: "",
      vendorName: "",
      billNo: "",
      billDate: "",
      expHead: "",
      basicAmount: "",
      cgst: "",
      sgst: "",
      netAmount: "",
    });
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading sites...</div>;

  if (error) return (
    <div className="text-center mt-10 text-red-500">
      {error}
      <button onClick={() => window.location.reload()} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Retry
      </button>
    </div>
  );

  return (
    <div className="mt-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">

        {/* Basic Information */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
            Bill Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SearchableSelect
              label="Site Name"
              required
              value={formData.siteName}
              onChange={(val) => setFormData((prev) => ({ ...prev, siteName: val }))}
              options={siteNames}
              placeholder="Select Site"
              disabled={siteNames.length === 0}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                placeholder="Enter vendor name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="billNo"
                value={formData.billNo}
                onChange={handleChange}
                placeholder="Enter bill number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dates & Head */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <SearchableSelect
              label="Expense Head"
              required
              value={formData.expHead}
              onChange={(val) => setFormData((prev) => ({ ...prev, expHead: val }))}
              options={expHeads}
              placeholder="Select Expense Head"
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
            Amount Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Basic Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basicAmount"
                value={formData.basicAmount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CGST</label>
              <input
                type="number"
                name="cgst"
                value={formData.cgst}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SGST</label>
              <input
                type="number"
                name="sgst"
                value={formData.sgst}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Net Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.netAmount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 shadow-sm text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={resetForm}
            className="px-5 py-2 border rounded-md hover:bg-gray-50"
          >
            Reset
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : (<> <Send className="w-4 h-4" /> Submit </>)}
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded text-center font-medium">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutStanding;