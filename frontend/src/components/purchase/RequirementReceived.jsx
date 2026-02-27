
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import axios from "axios";

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

const RequirementReceived = () => {
  const [formData, setFormData] = useState({
    siteName: "",
    supervisorName: "",
    remark: "",
  });

  const [items, setItems] = useState([
    {
      materialType: "",
      materialName: "",
      quantity: "",
      units: "",
      reqDays: "",
      reason: "",
      skuCode: "",
    },
  ]);

  const [dropdownOptions, setDropdownOptions] = useState({
    siteNames: [],
    materialTypes: [],
    remarks: [],
    siteSupervisorMap: {},
  });

  const [filteredSupervisors, setFilteredSupervisors] = useState([]);

  const [materialMap, setMaterialMap] = useState({});
  const [unitMap, setUnitMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`);

  

        const data = res.data;

        setDropdownOptions({
          siteNames: data.siteNames || [],
          materialTypes: data.materialTypes || [],
          remarks: data.remarks || [],
          siteSupervisorMap: data.siteSupervisorMap || {},
        });

        setMaterialMap(data.materialMap || {});
        setUnitMap(data.unitMap || {});

      } catch (err) {
        console.error("Dropdown fetch error:", err);
        setError("Failed to load dropdown data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSiteChange = (val) => {
    setFormData((prev) => ({ ...prev, siteName: val, supervisorName: "" }));

    if (!val) {
      setFilteredSupervisors([]);
      return;
    }

    const key = val.trim().toLowerCase();
    const supervisors = dropdownOptions.siteSupervisorMap[key] || [];
    setFilteredSupervisors(supervisors);

    if (supervisors.length === 1) {
      setFormData((prev) => ({ ...prev, supervisorName: supervisors[0] }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    if (field === "materialType") {
      updated[index].materialName = "";
      updated[index].units = "";
      updated[index].skuCode = "";
    }

    if (field === "materialName") {
      const norm = value.trim().toLowerCase();
      const found = unitMap[norm] || {};
      updated[index].units = found.unit || "";
      updated[index].skuCode = found.skuCode || "";
    }

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        materialType: "",
        materialName: "",
        quantity: "",
        units: "",
        reqDays: "",
        reason: "",
        skuCode: "",
      },
    ]);
  };

  const removeItem = (i) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.siteName || !formData.supervisorName) {
      alert("Site and Supervisor are required");
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        !item.materialType ||
        !item.materialName ||
        !item.quantity ||
        !item.units ||
        !item.reqDays ||
        !item.reason ||
        !item.skuCode
      ) {
        alert(`Item ${i + 1} is incomplete`);
        return;
      }
    }

    const payload = { ...formData, items };
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/submit-requirement`, payload);
      setSuccessMessage("Requirement submitted successfully!");
      resetForm();
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      alert(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ siteName: "", supervisorName: "", remark: "" });
    setItems([
      {
        materialType: "",
        materialName: "",
        quantity: "",
        units: "",
        reqDays: "",
        reason: "",
        skuCode: "",
      },
    ]);
    setFilteredSupervisors([]);
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading dropdowns...</div>;

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
          <h4 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="Site Name"
              required
              value={formData.siteName}
              onChange={handleSiteChange}
              options={dropdownOptions.siteNames}
              placeholder="Select Site"
              disabled={!dropdownOptions.siteNames.length}
            />

            <SearchableSelect
              label="Supervisor Name"
              required
              value={formData.supervisorName}
              onChange={(val) => setFormData((prev) => ({ ...prev, supervisorName: val }))}
              options={filteredSupervisors}
              placeholder={
                formData.siteName
                  ? filteredSupervisors.length === 0
                    ? "No supervisors found for this site"
                    : `Select Supervisor (${filteredSupervisors.length})`
                  : "Select site first"
              }
              disabled={!formData.siteName || filteredSupervisors.length === 0}
            />
          </div>
        </div>

        {/* Material Items */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">Material Items</h4>

          {items.map((item, idx) => {
            // Fixed matching: trim + lowercase to match API keys
            const cleanType = (item.materialType || "").trim().toLowerCase();
            const matOptions = materialMap[cleanType] || [];

            // Debug log (you can remove this after confirming it works)
            // console.log(
            //   `Item ${idx + 1} | Selected: "${item.materialType}" → Cleaned: "${cleanType}" → Found: ${matOptions.length} items`
            // );

            return (
              <div key={idx} className="border p-4 mb-4 rounded bg-gray-50">
                <div className="flex justify-between mb-3">
                  <h5 className="font-medium">Item {idx + 1}</h5>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SearchableSelect
                    label="Material Type"
                    required
                    value={item.materialType}
                    onChange={(val) => handleItemChange(idx, "materialType", val)}
                    options={dropdownOptions.materialTypes}
                    placeholder="Select Type"
                  />

                  <SearchableSelect
                    label="Material Name"
                    required
                    value={item.materialName}
                    onChange={(val) => handleItemChange(idx, "materialName", val)}
                    options={matOptions}
                    placeholder={cleanType ? "Select Material" : "First select type"}
                    disabled={!cleanType}
                  />

                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Units *</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                      value={item.units}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">SKU Code *</label>
                    <input
                      type="text"
                      readOnly
                      className="w-full px-3 py-2 border rounded-md bg-gray-100"
                      value={item.skuCode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Req Days *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.reqDays}
                      onChange={(e) => handleItemChange(idx, "reqDays", e.target.value)}
                    >
                      <option value="">Select</option>
                      {[...Array(11)].map((_, i) => (
                        <option key={i} value={i}>
                          {i === 0 ? "0 - Urgent (Same Day)" : `${i} - ${i} Day${i > 1 ? "s" : ""}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Use For Reason *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={item.reason}
                      onChange={(e) => handleItemChange(idx, "reason", e.target.value)}
                    />
                  </div>
                </div>

                {idx === items.length - 1 && (
                  <button
                    onClick={addItem}
                    className="mt-4 flex items-center gap-1 text-blue-600 text-sm hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Remark / Contractor */}
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
            <p className="text-xs text-yellow-800 font-medium leading-tight">
              यह Item केवल उसी ठेकेदार (Contractor) के कार्य हेतु है जिसे ‘With Material’ का कार्य दिया गया है। 
              ठेकेदार (Contractor) का नाम उसी के अनुसार चयनित (Select) किया जाए। 
              अन्य साइट के Engineer इस विकल्प को चयनित (Select) न करें।
            </p>
          </div>

          <SearchableSelect
            label="Contractor"
            value={formData.remark}
            onChange={(val) => setFormData((prev) => ({ ...prev, remark: val }))}
            options={dropdownOptions.remarks}
            placeholder="Search or select remark..."
            disabled={!dropdownOptions.remarks.length}
          />
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

export default RequirementReceived;