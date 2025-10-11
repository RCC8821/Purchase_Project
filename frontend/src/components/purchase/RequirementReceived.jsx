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
    }, 150);
  };

  return (
    <div className="relative">
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
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        placeholder={placeholder}
      />
      {isOpen && !disabled && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => handleSelect(opt)}
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">No options found</li>
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
    supervisorNames: [],
    materialTypes: [],
    materialNames: [],
    units: [],
  });

  const [materialMap, setMaterialMap] = useState({});
  const [unitMap, setUnitMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dropdowns`
        );
        console.log("Full API Response:", response.data);

        const {
          siteNames = [],
          supervisorNames = [],
          materialTypes = [],
          materialNames = [],
          units = [],
          skuCodes = [],
        } = response.data;

        const uniqueSiteNames = [...new Set(siteNames)];
        const uniqueSupervisorNames = [...new Set(supervisorNames)];
        const uniqueMaterialTypes = [...new Set(materialTypes)];

        const newMaterialMap = {};
        materialTypes.forEach((type, index) => {
          const normalizedType = type.toLowerCase();
          if (!newMaterialMap[normalizedType]) {
            newMaterialMap[normalizedType] = [];
          }
          if (
            materialNames[index] &&
            !newMaterialMap[normalizedType].includes(materialNames[index])
          ) {
            newMaterialMap[normalizedType].push(materialNames[index]);
          }
        });

        const newUnitMap = {};
        materialNames.forEach((name, index) => {
          if (name && units[index]) {
            newUnitMap[name.toLowerCase()] = {
              unit: units[index],
              skuCode: skuCodes[index] || "",
            };
          }
        });

        setDropdownOptions({
          siteNames: uniqueSiteNames,
          supervisorNames: uniqueSupervisorNames,
          materialTypes: uniqueMaterialTypes,
          materialNames: [],
          units: [],
        });
        setMaterialMap(newMaterialMap);
        setUnitMap(newUnitMap);
        console.log("Material Map:", newMaterialMap);
        console.log("Unit Map:", newUnitMap);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        setError("Failed to load dropdown data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDropdownData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === "materialType") {
      const normalizedType = value.toLowerCase();
      updatedItems[index].materialName = "";
      updatedItems[index].units = "";
      updatedItems[index].skuCode = "";
    }

    if (field === "materialName") {
      const normalizedName = value.toLowerCase();
      updatedItems[index].units = unitMap[normalizedName]?.unit || "";
      updatedItems[index].skuCode = unitMap[normalizedName]?.skuCode || "";
    }

    setItems(updatedItems);
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

  const removeItem = (index) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.siteName || !formData.supervisorName) {
      alert("Please fill in all required fields");
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
        alert(`Please fill in all required fields for Item ${i + 1}`);
        return;
      }
    }

    const submissionData = {
      ...formData,
      items: items.map((item) => ({
        materialType: item.materialType,
        materialName: item.materialName,
        quantity: item.quantity,
        units: item.units,
        reqDays: item.reqDays,
        reason: item.reason,
        skuCode: item.skuCode,
      })),
    };

    setLoading(true);
    setSuccessMessage("");

    try {
      const fullUrl = `${import.meta.env.VITE_BACKEND_URL}/api/submit-requirement`;
      console.log("Submitting to:", fullUrl);
      console.log("Submission Data (including SKU codes):", submissionData);
      const response = await axios.post(fullUrl, submissionData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Submission Response:", response.data);
      setSuccessMessage("Requirement submitted successfully!"); // Updated message
      resetForm();

      // Optional: Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error("Error submitting requirement:", error);
      alert(
        error.response?.data?.error ||
          "Failed to submit requirement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      siteName: "",
      supervisorName: "",
      remark: "",
    });
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
  };

  if (loading) {
    return (
      <div className="mt-6 max-w-7xl mx-auto text-center">
        <p className="text-gray-600">Loading dropdown data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 max-w-7xl mx-auto text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-4 text-gray-800 border-b pb-2">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              value={formData.siteName}
              onChange={(val) =>
                handleInputChange({ target: { name: "siteName", value: val } })
              }
              options={dropdownOptions.siteNames}
              placeholder="Select Site"
              required
              label="Site Name"
              disabled={dropdownOptions.siteNames.length === 0}
            />
            <SearchableSelect
              value={formData.supervisorName}
              onChange={(val) =>
                handleInputChange({
                  target: { name: "supervisorName", value: val },
                })
              }
              options={dropdownOptions.supervisorNames}
              placeholder="Select Supervisor"
              required
              label="Supervisor Name"
              disabled={dropdownOptions.supervisorNames.length === 0}
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-800 border-b pb-2">
              Material Items
            </h4>
          </div>

          {items.map((item, index) => {
            const normalizedType = item.materialType.toLowerCase();
            const materialNameOptions = materialMap[normalizedType] || [];
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-md font-medium text-gray-700">
                    Item {index + 1}
                  </h5>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SearchableSelect
                    value={item.materialType}
                    onChange={(val) =>
                      handleItemChange(index, "materialType", val)
                    }
                    options={dropdownOptions.materialTypes}
                    placeholder="Select Type"
                    required
                    label="Material Type"
                    disabled={dropdownOptions.materialTypes.length === 0}
                  />
                  <SearchableSelect
                    key={item.materialType}
                    value={item.materialName}
                    onChange={(val) =>
                      handleItemChange(index, "materialName", val)
                    }
                    options={materialNameOptions}
                    placeholder={
                      item.materialType
                        ? materialNameOptions.length > 0
                          ? "Select Material"
                          : `No materials for ${item.materialType}`
                        : "Select Material Type First"
                    }
                    required
                    label="Material Name"
                    disabled={
                      !item.materialType || materialNameOptions.length === 0
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.units}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                      placeholder="Units auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.skuCode}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
                      placeholder="SKU code auto-filled"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Req Days <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={item.reqDays}
                      onChange={(e) =>
                        handleItemChange(index, "reqDays", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select days</option>
                      <option value="0">
                        0 - 🔴 Bahut Zaruri (Same Day Delivery)
                      </option>
                      <option value="1">1 - 🔶 Next Day Required</option>
                      <option value="2">2 - 2 Days Mein Chahiye</option>
                      <option value="3">3 - 3 Din Mein Chahiye</option>
                      <option value="4">4 - 4 Din Mein Chahiye</option>
                      <option value="5">
                        5 - Normal Priority (5 Din Mein)
                      </option>
                      <option value="6">6 - 6 Din Mein Chahiye</option>
                      <option value="7">7 - 1 Week Mein Chahiye</option>
                      <option value="8">8 - 8 Din Mein Chahiye</option>
                      <option value="9">9 - 9 Din Mein Chahiye</option>
                      <option value="10">
                        10 - Low Priority (10 Din Mein)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.reason}
                      onChange={(e) =>
                        handleItemChange(index, "reason", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for this item"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 bg-blue-500 text-white px-2 py-2 mt-5 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={dropdownOptions.materialTypes.length === 0}
                  >
                    <Plus className="w-2 h-2" />
                    Add Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-6">
          <label
            htmlFor="remark"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Remarks
          </label>
          <textarea
            id="remark"
            name="remark"
            value={formData.remark}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any additional remarks or notes"
          ></textarea>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
            disabled={dropdownOptions.materialTypes.length === 0 || loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Requirement
              </>
            )}
          </button>
        </div>

        {/* Success Message Box */}
        {successMessage && (
          <div className="mt-4 flex justify-center">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md max-w-md w-full">
              <p className="font-medium">{successMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementReceived;