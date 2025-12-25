import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaSearch,
  FaFilePdf,
  FaTimes,
  FaChevronDown,
  FaArrowDown,
} from "react-icons/fa";

const Payment = () => {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [siteSearch, setSiteSearch] = useState("");
  const [showVendorList, setShowVendorList] = useState(false);
  const [showSiteList, setShowSiteList] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [paidAmounts, setPaidAmounts] = useState({});

  const [bankDetails, setBankDetails] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const vendorRef = useRef(null);
  const siteRef = useRef(null);
  const paymentSectionRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
    const handleClickOutside = (event) => {
      if (vendorRef.current && !vendorRef.current.contains(event.target))
        setShowVendorList(false);
      if (siteRef.current && !siteRef.current.contains(event.target))
        setShowSiteList(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInitialData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/Payment`
      );
      if (response.data.success) {
        const processedData = response.data.data.map((item) => {
          // Helper function to convert comma-separated string to number
          const parseAmount = (value) => {
            if (!value) return 0;
            const cleaned = value.toString().replace(/,/g, "").trim();
            return cleaned === "" ? 0 : Number(cleaned);
          };

          const netAmount = parseAmount(
            item.netAmount16 || item.netAmount17 || 0
          );

          const latestPaid = parseAmount(item.latestPaidAmount || 0);

          return {
            ...item,
            netAmount16: netAmount, // Ab sahi number hoga
            latestPaidAmount: latestPaid,
            latestBalanceAmount:
              latestPaid > 0 ? netAmount - latestPaid : netAmount,
          };
        });

        setAllData(processedData);
        setVendors(response.data.uniqueVendors);
        setSites(response.data.uniqueSites);
      }
    } catch (error) {
      console.error(error);
      alert("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!vendorSearch) return alert("Please select a vendor");
    const results = allData.filter(
      (item) =>
        item.vendorFirmName.toLowerCase() === vendorSearch.toLowerCase() &&
        (siteSearch
          ? item.siteName.toLowerCase() === siteSearch.toLowerCase()
          : true)
    );
    setFilteredData(results);
    setShowData(true);
    setSelectedBills([]);
    setPaidAmounts({});
  };

  const toggleBillSelection = (uid) => {
    setSelectedBills((prev) => {
      if (prev.includes(uid)) {
        setPaidAmounts((current) => {
          const newPaid = { ...current };
          delete newPaid[uid];
          return newPaid;
        });
        return prev.filter((id) => id !== uid);
      } else {
        setPaidAmounts((current) => ({ ...current, [uid]: 0 }));
        return [...prev, uid];
      }
    });
  };

  const handlePaidAmountChange = (uid, value) => {
    let numValue = value === "" ? 0 : Number(value);
    if (numValue < 0) numValue = 0;

    const bill = filteredData.find((b) => b.UID === uid);
    if (!bill) return;

    const currentBalance = calculateCurrentBalance(bill);
    if (numValue > currentBalance) {
      alert(
        `Cannot pay more than current balance (₹${currentBalance.toLocaleString(
          "en-IN"
        )})`
      );
      numValue = currentBalance;
    }

    setPaidAmounts((prev) => ({ ...prev, [uid]: numValue }));
  };

  const calculateCurrentBalance = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    return previousPaid > 0 ? netAmount - previousPaid : netAmount;
  };

  const calculateNewBalance = (bill) => {
    const currentPaid = paidAmounts[bill.UID] || 0;
    const currentBalance = calculateCurrentBalance(bill);
    return currentBalance - currentPaid;
  };

  const calculateTotalPaidAfter = (bill) => {
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const currentPaid = paidAmounts[bill.UID] || 0;
    return previousPaid + currentPaid;
  };

  const grandTotal = Object.values(paidAmounts).reduce(
    (sum, amt) => sum + amt,
    0
  );

  const paymentDetailsLabel =
    paymentMode === "Cheque" ? "CHEQUE NUMBER" : "PAYMENT DETAILS";

 const handleSubmit = async () => {
  // 1. कम से कम एक bill select होना चाहिए
  if (selectedBills.length === 0) {
    alert("कृपया कम से कम एक बिल चुनें");
    return;
  }

  // 2. Global payment details भरें
  if (!bankDetails || !paymentMode || !paymentDetails.trim() || !paymentDate) {
    alert("सभी global payment details भरें: Bank Details, Payment Mode, Details, Payment Date");
    return;
  }

  // 3. Paid Amount खाली है या नहीं? (सबसे महत्वपूर्ण)
  const emptyPaidBills = selectedBills.filter((uid) => {
    const amount = paidAmounts[uid];
    return (
      amount === undefined ||
      amount === null ||
      amount === "" ||
      String(amount).trim() === "" ||
      isNaN(amount)
    );
  });

  // अगर कोई भी paid amount खाली है → सिर्फ alert दिखाओ, OK/Cancel नहीं
  if (emptyPaidBills.length > 0) {
    alert(
      `ध्यान दें!\n${emptyPaidBills.length} बिल(s) में Paid Amount खाली है।\n\nसभी बिल्स में payment amount भरें तभी submit हो सकेगा।`
    );
    return; // Submit बिल्कुल नहीं होगा, OK दबाने पर भी नहीं
  }

  // 4. अब सब filled है → ₹0 payment पर confirm माँगो (ये OK/Cancel वाला confirm है, क्योंकि user choose कर सकता है)
  const zeroPaidBills = selectedBills.filter((uid) => Number(paidAmounts[uid]) === 0);

  if (zeroPaidBills.length > 0) {
    const confirmZero = window.alert(
      `${zeroPaidBills.length} Paid amount fill karo `
    );
    if (!confirmZero) {
      return; // Cancel किया तो submit नहीं
    }
  }

  // अब सब सही है → submit करो
  setSubmitting(true);

  try {
    const payload = selectedBills.map((uid) => {
      const bill = filteredData.find((item) => item.UID === uid);
      const currentPaid = Number(paidAmounts[uid]) || 0;
      const netAmount = Number(bill.netAmount16 || 0);
      const previousPaid = Number(bill.latestPaidAmount || 0);
      const totalPaidAfter = previousPaid + currentPaid;
      const newBalance = netAmount - totalPaidAfter;

      return {
        UID: bill.UID,
        planned17: bill.planned17 || "",
        siteName: bill.siteName || "",
        vendorFirmName16: bill.vendorFirmName || "",
        billNo: bill.invoice13,
        billDate16: bill.billDate || bill.planned16 || "",
        netAmount16: netAmount,
        currentPaid: currentPaid,
        paidAmount17: totalPaidAfter,
        balanceAmount17: newBalance,
        bankDetails17: bankDetails,
        paymentMode17: paymentMode,
        paymentDetails17: paymentDetails,
        paymentDate18: paymentDate,
        grandTotal: grandTotal,
      };
    });

    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/Update-Payment`,
      payload
    );

    if (response.data.success) {
      alert(`सफल! ${response.data.addedToPaymentSheet} payments दर्ज हो गए।`);
      fetchInitialData();
      setSelectedBills([]);
      setPaidAmounts({});
      setBankDetails("");
      setPaymentMode("");
      setPaymentDetails("");
      setPaymentDate("");
      setShowData(false);
    } else {
      alert("Error: " + (response.data.error || "कुछ गलत हो गया"));
    }
  } catch (error) {
    alert("Submit करने में समस्या: " + (error.response?.data?.error || error.message));
  } finally {
    setSubmitting(false);
  }
};

  const getPaymentSummary = (bill) => {
    const netAmount = Number(bill.netAmount16 || 0);
    const previousPaid = Number(bill.latestPaidAmount || 0);
    const currentBalance = calculateCurrentBalance(bill);
    const currentPaid = paidAmounts[bill.UID] || 0;
    const newBalance = calculateNewBalance(bill);
    const totalPaidAfter = calculateTotalPaidAfter(bill);

    return {
      netAmount,
      previousPaid,
      currentBalance,
      currentPaid,
      newBalance,
      totalPaidAfter,
    };
  };

  const scrollToPaymentSection = () => {
    if (paymentSectionRef.current) {
      paymentSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
        Loading...
      </div>
    );

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* Selection Area */}
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "25px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}>
          <div style={{ flex: 1, position: "relative" }} ref={vendorRef}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#555",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Viewing Bills for:
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search Vendor..."
                value={vendorSearch}
                onFocus={() => setShowVendorList(true)}
                onChange={(e) => setVendorSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
              <FaChevronDown
                style={{ position: "absolute", right: "15px", color: "#888" }}
              />
            </div>
            {showVendorList && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginTop: "5px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 100,
                  listStyle: "none",
                  padding: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {vendors
                  .filter((v) =>
                    v.vendorFirmName
                      .toLowerCase()
                      .includes(vendorSearch.toLowerCase())
                  )
                  .map((v, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setVendorSearch(v.vendorFirmName);
                        setShowVendorList(false);
                      }}
                      style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#f0f7ff")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      {v.vendorFirmName}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div style={{ flex: 1, position: "relative" }} ref={siteRef}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#555",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Site Name:
            </label>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="Search Site..."
                value={siteSearch}
                onFocus={() => setShowSiteList(true)}
                onChange={(e) => setSiteSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  fontSize: "16px",
                  outline: "none",
                }}
              />
              <FaChevronDown
                style={{ position: "absolute", right: "15px", color: "#888" }}
              />
            </div>
            {showSiteList && (
              <ul
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginTop: "5px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  zIndex: 100,
                  listStyle: "none",
                  padding: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {sites
                  .filter((s) =>
                    s.siteName.toLowerCase().includes(siteSearch.toLowerCase())
                  )
                  .map((s, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setSiteSearch(s.siteName);
                        setShowSiteList(false);
                      }}
                      style={{
                        padding: "10px 15px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.backgroundColor = "#f0f7ff")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      {s.siteName}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleFilter}
            style={{
              padding: "12px 35px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            <FaSearch style={{ marginRight: "8px" }} /> Filter
          </button>
        </div>
      </div>

      {showData && (
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: "bold" }}>
              {vendorSearch}{" "}
              <span style={{ color: "#888", fontWeight: "normal" }}>
                | {siteSearch || "All Sites"}
              </span>
            </div>
            <div
              style={{
                color: "#d32f2f",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={() => {
                setShowData(false);
                setSelectedBills([]);
                setPaidAmounts({});
              }}
            >
              <FaTimes style={{ marginRight: "8px" }} /> Change Contractor
            </div>
          </div>

          {filteredData.map((item) => {
            const summary = getPaymentSummary(item);
            return (
              <div
                key={item.UID}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "25px",
                  marginBottom: "20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  borderLeft: selectedBills.includes(item.UID)
                    ? "10px solid #2e7d32"
                    : "1px solid #eee",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      onClick={() => toggleBillSelection(item.UID)}
                      style={{
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        padding: "10px 15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: selectedBills.includes(item.UID)
                          ? "#e8f5e9"
                          : "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(item.UID)}
                        readOnly
                      />
                      <span style={{ fontWeight: "bold" }}>Select Bill</span>
                    </div>
                    <div>
                      <h2 style={{ margin: 0, color: "#333" }}>
                        {item.siteName}
                      </h2>
                      <span style={{ fontSize: "14px", color: "#666" }}>
                        Invoice No:{" "}
                        <b
                          style={{
                            backgroundColor: "#f0f7ff",
                            padding: "2px 6px",
                            color: "#1a73e8",
                          }}
                        >
                          {item.invoice13 || "-"}
                        </b>
                        {item.UID && ` | UID: ${item.UID}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {/* ← Yaha label NET AMOUNT 17 kiya */}
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: "bold",
                        color: "#2e7d32",
                      }}
                    >
                      ₹{summary.netAmount.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      Planned Date: {item.planned17}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "20px",
                  }}
                >
                  <DetailItem label="MATERIAL TYPE" value={item.materialType} />
                  <DetailItem
                    label="VENDOR FIRM NAME"
                    value={item.vendorFirmName}
                  />
                  <DetailItem
                    label="INVOICE NO"
                    value={item.invoice13}
                    color="#1a73e8"
                  />
                  <DetailItem
                    label="BILL DATE"
                    value={item.billDate}
                    color="#1a73e8"
                  />
                  <DetailItem
                    label="FINAL INDENT NO"
                    value={item.finalIndentNo}
                  />
                  <DetailItem label="PO NUMBER" value={item.poNumber} />
                  <DetailItem label="MRN NO" value={item.mrnNo} />
                  <DetailItem label="PLANNED 17" value={item.planned17} />
                  {/* ← Yaha bhi label change kiya */}
                  <DetailItem
                    label="NET AMOUNT 17"
                    value={`₹${summary.netAmount.toLocaleString("en-IN")}`}
                  />
                  <DetailItem
                    label="Previous Paid Amount"
                    value={`₹${summary.previousPaid.toLocaleString("en-IN")}`}
                    color="green"
                  />
                  <DetailItem
                    label="Remaining Amount"
                    value={`₹${
                      summary.previousPaid == 0
                        ? 0
                        : summary.currentBalance.toLocaleString("en-IN")
                    }`}
                    color="green"
                  />
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    gap: "15px",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  {item.finalIndentPDF && (
                    <DocLink
                      icon={<FaFilePdf />}
                      label="Indent PDF"
                      url={item.finalIndentPDF}
                    />
                  )}
                  {item.poPDF && (
                    <DocLink
                      icon={<FaFilePdf />}
                      label="PO PDF"
                      url={item.poPDF}
                    />
                  )}
                  {item.mrnPDF && (
                    <DocLink
                      icon={<FaFilePdf />}
                      label="MRN PDF"
                      url={item.mrnPDF}
                    />
                  )}
                  {item.invoicePhoto && (
                    <DocLink
                      icon={<FaFilePdf />}
                      label="Invoice Photo PDF"
                      url={item.invoicePhoto}
                    />
                  )}
                </div>

                {selectedBills.includes(item.UID) && (
                  <div
                    style={{
                      marginTop: "30px",
                      padding: "20px",
                      backgroundColor: "#f8fff8",
                      borderRadius: "10px",
                      border: "1px solid #c8e6c9",
                    }}
                  >
                    <h4 style={{ margin: "0 0 20px 0", color: "#2e7d32" }}>
                      Payment Details for Invoice:{" "}
                      <strong>{item.invoice13}</strong> (UID: {item.UID})
                    </h4>

                    <div
                      style={{
                        marginBottom: "20px",
                        padding: "15px",
                        backgroundColor: "#e3f2fd",
                        borderRadius: "8px",
                        borderLeft: "4px solid #1976d2",
                      }}
                    >
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "15px",
                          fontSize: "14px",
                        }}
                      >
                        {/* ← Label NET AMOUNT 17 */}
                        <div>
                          <span style={{ color: "#555", fontWeight: "bold" }}>
                            Original Net Amount (17):
                          </span>{" "}
                          <span
                            style={{
                              marginLeft: "10px",
                              fontWeight: "bold",
                              color: "#1976d2",
                              fontSize: "16px",
                            }}
                          >
                            ₹{summary.netAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#555", fontWeight: "bold" }}>
                            Previously Paid:
                          </span>{" "}
                          <span
                            style={{
                              marginLeft: "10px",
                              fontWeight: "bold",
                              color: "#388e3c",
                              fontSize: "16px",
                            }}
                          >
                            ₹{summary.previousPaid.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#555", fontWeight: "bold" }}>
                            Current Balance:
                          </span>{" "}
                          <span
                            style={{
                              marginLeft: "10px",
                              fontWeight: "bold",
                              color: "#d32f2f",
                              fontSize: "16px",
                            }}
                          >
                            ₹{summary.currentBalance.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: "#555", fontWeight: "bold" }}>
                            Total Paid After:
                          </span>{" "}
                          <span
                            style={{
                              marginLeft: "10px",
                              fontWeight: "bold",
                              color: "#388e3c",
                              fontSize: "16px",
                            }}
                          >
                            ₹{summary.totalPaidAfter.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "20px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#555",
                            display: "block",
                          }}
                        >
                          CURRENT PAID AMOUNT ₹
                        </label>
                        <input
                          type="number"
                          value={paidAmounts[item.UID] || ""}
                          onChange={(e) =>
                            handlePaidAmountChange(item.UID, e.target.value)
                          }
                          placeholder="Enter amount"
                          min="0"
                          max={summary.currentBalance}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #4caf50",
                            marginTop: "8px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: "#555",
                            display: "block",
                          }}
                        >
                          NEW BALANCE
                        </label>
                        <input
                          type="number"
                          value={summary.newBalance}
                          readOnly
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            border: "1px solid #d32f2f",
                            backgroundColor: "#ffebee",
                            marginTop: "8px",
                            fontWeight: "bold",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                      <div
                        style={{
                          height: "8px",
                          backgroundColor: "#e0e0e0",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            backgroundColor: "#2196f3",
                            width: `${
                              (summary.totalPaidAfter / summary.netAmount) * 100
                            }%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={scrollToPaymentSection}
                      style={{
                        marginTop: "20px",
                        padding: "12px 25px",
                        backgroundColor: "#1976d2",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FaArrowDown /> Go to Global Payment Section (Fill Bank,
                      Mode, Date)
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {selectedBills.length > 0 && (
            <div
              style={{
                backgroundColor: "#e8f5e9",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "30px",
                border: "2px solid #4caf50",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#2e7d32" }}>
                Grand Total (Current Payment)
                <span
                  style={{
                    float: "right",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                >
                  ₹{grandTotal.toLocaleString("en-IN")}
                </span>
              </h3>
            </div>
          )}

          {selectedBills.length > 0 && (
            <div
              ref={paymentSectionRef}
              style={{
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "12px",
                marginTop: "30px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "25px", color: "#333" }}>
                Global Payment Details ({selectedBills.length} Bill
                {selectedBills.length > 1 ? "s" : ""} Selected)
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#555",
                      display: "block",
                    }}
                  >
                    BANK DETAILS
                  </label>
                  <select
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginTop: "8px",
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="SVC Main A/C(202)">SVC Main A/C(202)</option>
                    <option value="SVC VENDER PAY A/C(328)">
                      SVC VENDOR PAY A/C(328)
                    </option>
                    <option value="HDFC Kabir Ahuja(341)">HDFC Kabir Ahuja(341)</option>
                    <option value="HDFC Rajeev Abott(313)">HDFC Rajeev Abott(313)</option>
                    <option value="HDFC Madhav Gupta (375)">HDFC Madhav Gupta (375)</option>
                    <option value="HDFC  Scope Clg(215)">HDFC  Scope Clg(215)</option>
                    <option value="ICICI RNTU(914)">ICICI RNTU(914)</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#555",
                      display: "block",
                    }}
                  >
                    PAYMENT MODE
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginTop: "8px",
                    }}
                  >
                    <option value="">-- Select --</option>
                    <option value="Cheque">Cheque</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#555",
                      display: "block",
                    }}
                  >
                    {paymentDetailsLabel}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      paymentMode === "Cheque"
                        ? "Enter Cheque Number"
                        : "Enter detail"
                    }
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginTop: "8px",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#555",
                      display: "block",
                    }}
                  >
                    PAYMENT DATE
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      marginTop: "8px",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "8px",
                  border: "1px solid #ffeaa7",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontWeight: "bold", color: "#856404" }}>
                    ⚠️ How it works:
                  </span>
                  <span style={{ color: "#856404" }}>
                    First payment = Full amount • Next payments deduct from
                    balance
                  </span>
                </div>
              </div>

              <button
                disabled={submitting}
                style={{
                  padding: "15px 40px",
                  backgroundColor: submitting ? "#999" : "#2e7d32",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "18px",
                  marginTop: "30px",
                  opacity: submitting ? 0.7 : 1,
                }}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "SUBMIT ALL PAYMENT DATA"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value, color = "#333" }) => (
  <div>
    <div
      style={{
        fontSize: "10px",
        color: "#aaa",
        fontWeight: "bold",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "14px", fontWeight: "bold", color }}>
      {value || "-"}
    </div>
  </div>
);

const DocLink = ({ icon, label, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontSize: "12px",
      padding: "6px 12px",
      borderRadius: "4px",
      border: "1px solid #1a73e8",
      color: "#1a73e8",
      fontWeight: "bold",
      backgroundColor: "#f0f7ff",
    }}
  >
    {icon} {label}
  </a>
);

export default Payment;
