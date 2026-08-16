"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { enhanceImage } from "@/lib/imageEnhance";
import CropTool from "@/components/CropTool";
import { auth, db } from "@/lib/firebase";

export default function NewTripPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    trailerNumber: "",
    proNumber: "",
    blNumber: "",
    pickupCustomer: "",
    pickupCity: "",
    deliveryCustomer: "",
    deliveryCity: "",
    startOdometer: "",
    endOdometer: "",
    notes: "",
    shiftStart: "",
    shiftEnd: "",
  });

  const [fuelEntries, setFuelEntries] = useState([]);
  const [croppingFuelId, setCroppingFuelId] = useState(null);
  const [pendingFuelFile, setPendingFuelFile] = useState(null);
  const [croppingExpenseId, setCroppingExpenseId] = useState(null);
  const [pendingExpenseFile, setPendingExpenseFile] = useState(null);
  const [croppingLoadReceivedIndex, setCroppingLoadReceivedIndex] = useState(null);
  const [pendingLoadReceivedFiles, setPendingLoadReceivedFiles] = useState([]);
  const [croppingLoadDeliveredIndex, setCroppingLoadDeliveredIndex] = useState(null);
  const [pendingLoadDeliveredFiles, setPendingLoadDeliveredFiles] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [borderCrossings, setBorderCrossings] = useState([]);
  const [loadReceivedFiles, setLoadReceivedFiles] = useState([]);
  const [loadDeliveredFiles, setLoadDeliveredFiles] = useState([]);
  const [workEntries, setWorkEntries] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.uid);
      setDriverEmail(user.email || "");

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDriverName(docSnap.data().name || "");
        setCompanyId(docSnap.data().companyId || null);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const addFuelEntry = () => {
    setFuelEntries([
      ...fuelEntries,
      { id: Date.now(), location: "", quantity: "", cost: "", receiptFile: null, receiptPreview: null, enhancing: false },
    ]);
  };

  const handleReceiptChange = (id, file) => {
    if (!file) return;
    setPendingFuelFile(file);
    setCroppingFuelId(id);
  };

  const processFuelFile = async (id, file) => {
    const originalPreview = URL.createObjectURL(file);
    setFuelEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, receiptFile: file, receiptPreview: originalPreview, enhancing: true } : entry
      )
    );

    try {
      const enhancedFile = await enhanceImage(file);
      const enhancedPreview = URL.createObjectURL(enhancedFile);
      setFuelEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, receiptFile: enhancedFile, receiptPreview: enhancedPreview, enhancing: false } : entry
        )
      );
    } catch (err) {
      console.error("Enhance failed:", err);
      setFuelEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, enhancing: false } : entry))
      );
    }
  };

  const handleCropDone = (croppedFile) => {
    const id = croppingFuelId;
    setCroppingFuelId(null);
    setPendingFuelFile(null);
    processFuelFile(id, croppedFile);
  };

  const handleCropCancel = () => {
    const id = croppingFuelId;
    const file = pendingFuelFile;
    setCroppingFuelId(null);
    setPendingFuelFile(null);
    processFuelFile(id, file);
  };

  const updateFuelEntry = (id, field, value) => {
    setFuelEntries(
      fuelEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeFuelEntry = (id) => {
    setFuelEntries(fuelEntries.filter((entry) => entry.id !== id));
  };

  const addExpenseEntry = () => {
    setExpenseEntries([
      ...expenseEntries,
      { id: Date.now(), category: "Toll", amount: "", description: "", receiptFile: null, receiptPreview: null },
    ]);
  };

  const handleExpenseReceiptChange = (id, file) => {
    if (!file) return;
    setPendingExpenseFile(file);
    setCroppingExpenseId(id);
  };

  const processExpenseFile = async (id, file) => {
    const originalPreview = URL.createObjectURL(file);
    setExpenseEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, receiptFile: file, receiptPreview: originalPreview, enhancing: true } : entry
      )
    );

    try {
      const enhancedFile = await enhanceImage(file);
      const enhancedPreview = URL.createObjectURL(enhancedFile);
      setExpenseEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, receiptFile: enhancedFile, receiptPreview: enhancedPreview, enhancing: false } : entry
        )
      );
    } catch (err) {
      console.error("Enhance failed:", err);
      setExpenseEntries((prev) =>
        prev.map((entry) => (entry.id === id ? { ...entry, enhancing: false } : entry))
      );
    }
  };

  const handleExpenseCropDone = (croppedFile) => {
    const id = croppingExpenseId;
    setCroppingExpenseId(null);
    setPendingExpenseFile(null);
    processExpenseFile(id, croppedFile);
  };

  const handleExpenseCropCancel = () => {
    const id = croppingExpenseId;
    const file = pendingExpenseFile;
    setCroppingExpenseId(null);
    setPendingExpenseFile(null);
    processExpenseFile(id, file);
  };

  const updateExpenseEntry = (id, field, value) => {
    setExpenseEntries(
      expenseEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeExpenseEntry = (id) => {
    setExpenseEntries(expenseEntries.filter((entry) => entry.id !== id));
  };

  const addBorderCrossing = () => {
    setBorderCrossings([
      ...borderCrossings,
      { id: Date.now(), jurisdiction: "Ontario", direction: "Entering US", odometer: "" },
    ]);
  };

  const updateBorderCrossing = (id, field, value) => {
    setBorderCrossings(
      borderCrossings.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeBorderCrossing = (id) => {
    setBorderCrossings(borderCrossings.filter((entry) => entry.id !== id));
  };

  const handleLoadReceivedChange = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setPendingLoadReceivedFiles(fileArray);
    setCroppingLoadReceivedIndex(0);
  };

  const processLoadReceivedFile = async (file) => {
    const tempPreview = URL.createObjectURL(file);
    setLoadReceivedFiles((prev) => [...prev, { file, preview: tempPreview, enhancing: true }]);

    try {
      const enhancedFile = await enhanceImage(file);
      const enhancedPreview = URL.createObjectURL(enhancedFile);
      setLoadReceivedFiles((prev) =>
        prev.map((item) =>
          item.preview === tempPreview
            ? { file: enhancedFile, preview: enhancedPreview, enhancing: false }
            : item
        )
      );
    } catch (err) {
      console.error("Enhance failed:", err);
      setLoadReceivedFiles((prev) =>
        prev.map((item) => (item.preview === tempPreview ? { ...item, enhancing: false } : item))
      );
    }
  };

  const handleLoadReceivedCropDone = (croppedFile) => {
    processLoadReceivedFile(croppedFile);
    goToNextLoadReceivedFile();
  };

  const handleLoadReceivedCropCancel = () => {
    processLoadReceivedFile(pendingLoadReceivedFiles[croppingLoadReceivedIndex]);
    goToNextLoadReceivedFile();
  };

  const goToNextLoadReceivedFile = () => {
    const nextIndex = croppingLoadReceivedIndex + 1;
    if (nextIndex < pendingLoadReceivedFiles.length) {
      setCroppingLoadReceivedIndex(nextIndex);
    } else {
      setCroppingLoadReceivedIndex(null);
      setPendingLoadReceivedFiles([]);
    }
  };

  const removeLoadReceivedFile = (index) => {
    setLoadReceivedFiles(loadReceivedFiles.filter((_, i) => i !== index));
  };

  const handleLoadDeliveredChange = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setPendingLoadDeliveredFiles(fileArray);
    setCroppingLoadDeliveredIndex(0);
  };

  const processLoadDeliveredFile = async (file) => {
    const tempPreview = URL.createObjectURL(file);
    setLoadDeliveredFiles((prev) => [...prev, { file, preview: tempPreview, enhancing: true }]);

    try {
      const enhancedFile = await enhanceImage(file);
      const enhancedPreview = URL.createObjectURL(enhancedFile);
      setLoadDeliveredFiles((prev) =>
        prev.map((item) =>
          item.preview === tempPreview
            ? { file: enhancedFile, preview: enhancedPreview, enhancing: false }
            : item
        )
      );
    } catch (err) {
      console.error("Enhance failed:", err);
      setLoadDeliveredFiles((prev) =>
        prev.map((item) => (item.preview === tempPreview ? { ...item, enhancing: false } : item))
      );
    }
  };

  const handleLoadDeliveredCropDone = (croppedFile) => {
    processLoadDeliveredFile(croppedFile);
    goToNextLoadDeliveredFile();
  };

  const handleLoadDeliveredCropCancel = () => {
    processLoadDeliveredFile(pendingLoadDeliveredFiles[croppingLoadDeliveredIndex]);
    goToNextLoadDeliveredFile();
  };

  const goToNextLoadDeliveredFile = () => {
    const nextIndex = croppingLoadDeliveredIndex + 1;
    if (nextIndex < pendingLoadDeliveredFiles.length) {
      setCroppingLoadDeliveredIndex(nextIndex);
    } else {
      setCroppingLoadDeliveredIndex(null);
      setPendingLoadDeliveredFiles([]);
    }
  };

  const removeLoadDeliveredFile = (index) => {
    setLoadDeliveredFiles(loadDeliveredFiles.filter((_, i) => i !== index));
  };

  const addWorkEntry = () => {
    setWorkEntries([
      ...workEntries,
      { id: Date.now(), customerCity: "", arrived: "", departed: "" },
    ]);
  };

  const updateWorkEntry = (id, field, value) => {
    setWorkEntries(
      workEntries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const removeWorkEntry = (id) => {
    setWorkEntries(workEntries.filter((entry) => entry.id !== id));
  };

  const totalShiftHours = (() => {
    if (!form.shiftStart || !form.shiftEnd) return null;
    const [sH, sM] = form.shiftStart.split(":").map(Number);
    const [eH, eM] = form.shiftEnd.split(":").map(Number);
    let minutes = (eH * 60 + eM) - (sH * 60 + sM);
    if (minutes < 0) minutes += 24 * 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  })();

  const calculateDuration = (arrived, departed) => {
    if (!arrived || !departed) return null;
    const [aH, aM] = arrived.split(":").map(Number);
    const [dH, dM] = departed.split(":").map(Number);
    let minutes = (dH * 60 + dM) - (aH * 60 + aM);
    if (minutes < 0) minutes += 24 * 60;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalMiles =
    form.startOdometer && form.endOdometer
      ? (parseFloat(form.endOdometer) - parseFloat(form.startOdometer)).toFixed(1)
      : null;

  const totalFuelCost = fuelEntries.reduce((sum, entry) => {
    const cost = parseFloat(entry.cost);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);

  const totalExpenseCost = expenseEntries.reduce((sum, entry) => {
    const amount = parseFloat(entry.amount);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.endOdometer && form.startOdometer && parseFloat(form.endOdometer) < parseFloat(form.startOdometer)) {
      setError("Ending odometer must be greater than starting odometer.");
      return;
    }

    if (borderCrossings.length > 0 && form.startOdometer && form.endOdometer) {
      const startVal = parseFloat(form.startOdometer);
      const endVal = parseFloat(form.endOdometer);
      for (const crossing of borderCrossings) {
        const crossingVal = parseFloat(crossing.odometer);
        if (crossing.odometer && (crossingVal < startVal || crossingVal > endVal)) {
          setError(`Border crossing odometer (${crossing.odometer}) must be between the starting (${form.startOdometer}) and ending (${form.endOdometer}) odometer.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const storage = getStorage();

      const cleanWorkEntries = workEntries.map((entry) => ({
        customerCity: entry.customerCity,
        arrived: entry.arrived,
        departed: entry.departed,
        duration: calculateDuration(entry.arrived, entry.departed),
      }));

      const uploadedLoadReceived = await Promise.all(
        loadReceivedFiles.map(async (item) => {
          const fileRef = ref(storage, `loads/${userId}/received_${Date.now()}_${item.file.name}`);
          await uploadBytes(fileRef, item.file);
          const url = await getDownloadURL(fileRef);
          return { fileName: item.file.name, fileUrl: url };
        })
      );

      const uploadedLoadDelivered = await Promise.all(
        loadDeliveredFiles.map(async (item) => {
          const fileRef = ref(storage, `loads/${userId}/delivered_${Date.now()}_${item.file.name}`);
          await uploadBytes(fileRef, item.file);
          const url = await getDownloadURL(fileRef);
          return { fileName: item.file.name, fileUrl: url };
        })
      );

      const cleanBorderCrossings = borderCrossings
        .map((entry) => ({
          jurisdiction: entry.jurisdiction,
          direction: entry.direction,
          odometer: entry.odometer ? parseFloat(entry.odometer) : null,
        }))
        .sort((a, b) => (a.odometer || 0) - (b.odometer || 0));

      const jurisdictionSummary = [];
      if (form.startOdometer && cleanBorderCrossings.length > 0) {
        let prevOdometer = parseFloat(form.startOdometer);
        let prevJurisdiction = "Ontario";

        cleanBorderCrossings.forEach((crossing) => {
          if (crossing.odometer) {
            jurisdictionSummary.push({
              jurisdiction: prevJurisdiction,
              miles: (crossing.odometer - prevOdometer).toFixed(1),
            });
            prevOdometer = crossing.odometer;
            prevJurisdiction = crossing.jurisdiction;
          }
        });

        if (form.endOdometer) {
          jurisdictionSummary.push({
            jurisdiction: prevJurisdiction,
            miles: (parseFloat(form.endOdometer) - prevOdometer).toFixed(1),
          });
        }
      }

      const cleanFuelEntries = await Promise.all(
        fuelEntries.map(async (entry) => {
          let receiptUrl = null;

          if (entry.receiptFile) {
            const fileRef = ref(storage, `receipts/${userId}/${Date.now()}_${entry.receiptFile.name}`);
            await uploadBytes(fileRef, entry.receiptFile);
            receiptUrl = await getDownloadURL(fileRef);
          }

          return {
            location: entry.location,
            quantity: entry.quantity ? parseFloat(entry.quantity) : null,
            cost: entry.cost ? parseFloat(entry.cost) : null,
            receiptUrl: receiptUrl,
          };
        })
      );

      const cleanExpenseEntries = await Promise.all(
        expenseEntries.map(async (entry) => {
          let receiptUrl = null;

          if (entry.receiptFile) {
            const fileRef = ref(storage, `receipts/${userId}/${Date.now()}_${entry.receiptFile.name}`);
            await uploadBytes(fileRef, entry.receiptFile);
            receiptUrl = await getDownloadURL(fileRef);
          }

          return {
            category: entry.category,
            amount: entry.amount ? parseFloat(entry.amount) : null,
            description: entry.description,
            receiptUrl: receiptUrl,
          };
        })
      );

      const tripData = {
        driverId: userId,
        driverName: driverName,
        driverEmail: driverEmail,
        companyId: companyId,
        date: form.date,
        trailerNumber: form.trailerNumber,
        proNumber: form.proNumber,
        blNumber: form.blNumber,
        pickupCustomer: form.pickupCustomer,
        pickupCity: form.pickupCity,
        deliveryCustomer: form.deliveryCustomer,
        deliveryCity: form.deliveryCity,
        startOdometer: form.startOdometer ? parseFloat(form.startOdometer) : null,
        endOdometer: form.endOdometer ? parseFloat(form.endOdometer) : null,
        totalMiles: totalMiles ? parseFloat(totalMiles) : null,
        borderCrossings: cleanBorderCrossings,
        jurisdictionSummary: jurisdictionSummary,
        loadReceivedDocs: uploadedLoadReceived,
        loadDeliveredDocs: uploadedLoadDelivered,
        workEntries: cleanWorkEntries,
        shiftStart: form.shiftStart,
        shiftEnd: form.shiftEnd,
        totalShiftHours: totalShiftHours,
        fuelEntries: cleanFuelEntries,
        totalFuelCost: totalFuelCost,
        expenseEntries: cleanExpenseEntries,
        totalExpenseCost: totalExpenseCost,
        notes: form.notes,
        status: "submitted",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "trips"), tripData);

      try {
        await fetch("/api/send-trip-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tripData),
        });
      } catch (emailErr) {
        console.error("Failed to send trip report email:", emailErr);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.6rem", border: "1px solid #ccc", borderRadius: "4px", fontSize: "1rem", boxSizing: "border-box" };
  const labelStyle = { display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", color: "#333", fontWeight: "500" };
  const sectionStyle = { backgroundColor: "white", borderRadius: "8px", padding: "1.5rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" };
  const rowStyle = { marginBottom: "1rem" };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "1.5rem", color: "#1a1a1a" }}>
        New Trip Sheet
      </h1>

      <form onSubmit={handleSubmit}>
        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Trip Info</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={handleChange("date")} required style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Trailer #</label>
            <input type="text" value={form.trailerNumber} onChange={handleChange("trailerNumber")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Pro #</label>
            <input type="text" value={form.proNumber} onChange={handleChange("proNumber")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>B/L #</label>
            <input type="text" value={form.blNumber} onChange={handleChange("blNumber")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Pickup</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Customer</label>
            <input type="text" value={form.pickupCustomer} onChange={handleChange("pickupCustomer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>City, State/Prov</label>
            <input type="text" value={form.pickupCity} onChange={handleChange("pickupCity")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Delivery</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Customer</label>
            <input type="text" value={form.deliveryCustomer} onChange={handleChange("deliveryCustomer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>City, State/Prov</label>
            <input type="text" value={form.deliveryCity} onChange={handleChange("deliveryCity")} style={inputStyle} />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Mileage</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Starting Odometer</label>
            <input type="number" value={form.startOdometer} onChange={handleChange("startOdometer")} style={inputStyle} />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Ending Odometer</label>
            <input type="number" value={form.endOdometer} onChange={handleChange("endOdometer")} style={inputStyle} />
          </div>
          {totalMiles && (
            <p style={{ fontSize: "0.95rem", color: "#1a56db", fontWeight: "600" }}>
              Total Miles: {totalMiles}
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Shift Time</h2>
          <div style={rowStyle}>
            <label style={labelStyle}>Shift Start</label>
            <input
              type="time"
              value={form.shiftStart}
              onChange={handleChange("shiftStart")}
              style={inputStyle}
            />
          </div>
          <div style={rowStyle}>
            <label style={labelStyle}>Shift End</label>
            <input
              type="time"
              value={form.shiftEnd}
              onChange={handleChange("shiftEnd")}
              style={inputStyle}
            />
          </div>
          {totalShiftHours && (
            <p style={{ fontSize: "0.95rem", color: "#1a56db", fontWeight: "600" }}>
              Total Hours Worked: {totalShiftHours}
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a1a" }}>Border Crossings</h2>
            <button
              type="button"
              onClick={addBorderCrossing}
              style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e8f0fe", color: "#1a56db", border: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
            >
              + Add Crossing
            </button>
          </div>

          {borderCrossings.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No border crossings for this trip.</p>
          )}

          {borderCrossings.map((entry, index) => (
            <div key={entry.id} style={{ border: "1px solid #eee", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#666" }}>Crossing {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeBorderCrossing(entry.id)}
                  style={{ background: "none", border: "none", color: "#d32f2f", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Direction</label>
                <select
                  value={entry.direction}
                  onChange={(e) => updateBorderCrossing(entry.id, "direction", e.target.value)}
                  style={inputStyle}
                >
                  <option>Entering US</option>
                  <option>Returning to Canada</option>
                </select>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Jurisdiction Now Entering</label>
                <select
                  value={entry.jurisdiction}
                  onChange={(e) => updateBorderCrossing(entry.id, "jurisdiction", e.target.value)}
                  style={inputStyle}
                >
                  <option>Ontario</option>
                  <option>Quebec</option>
                  <option>Michigan</option>
                  <option>New York</option>
                  <option>Ohio</option>
                  <option>Pennsylvania</option>
                  <option>Indiana</option>
                  <option>Illinois</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Odometer at Crossing</label>
                <input
                  type="number"
                  value={entry.odometer}
                  onChange={(e) => updateBorderCrossing(entry.id, "odometer", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a1a" }}>Hourly Work / Detention Time</h2>
            <button
              type="button"
              onClick={addWorkEntry}
              style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e8f0fe", color: "#1a56db", border: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
            >
              + Add Stop
            </button>
          </div>

          {workEntries.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No stops recorded.</p>
          )}

          {workEntries.map((entry, index) => {
            const duration = calculateDuration(entry.arrived, entry.departed);
            return (
              <div key={entry.id} style={{ border: "1px solid #eee", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#666" }}>Stop {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeWorkEntry(entry.id)}
                    style={{ background: "none", border: "none", color: "#d32f2f", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    Remove
                  </button>
                </div>
                <div style={rowStyle}>
                  <label style={labelStyle}>Customer - City</label>
                  <input
                    type="text"
                    value={entry.customerCity}
                    onChange={(e) => updateWorkEntry(entry.id, "customerCity", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={rowStyle}>
                  <label style={labelStyle}>Arrived</label>
                  <input
                    type="time"
                    value={entry.arrived}
                    onChange={(e) => updateWorkEntry(entry.id, "arrived", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={rowStyle}>
                  <label style={labelStyle}>Departed</label>
                  <input
                    type="time"
                    value={entry.departed}
                    onChange={(e) => updateWorkEntry(entry.id, "departed", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {duration && (
                  <p style={{ fontSize: "0.9rem", color: "#1a56db", fontWeight: "600" }}>
                    Duration: {duration}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Load Received Paperwork</h2>
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            multiple
            onChange={(e) => handleLoadReceivedChange(e.target.files)}
            className="file-upload-btn"
            style={{ marginBottom: "0.75rem" }}
          />
          {loadReceivedFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {loadReceivedFiles.map((item, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img src={item.preview} alt="Load received doc" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc", opacity: item.enhancing ? 0.5 : 1 }} />
                  <button
                    type="button"
                    onClick={() => removeLoadReceivedFile(index)}
                    style={{ position: "absolute", top: "-6px", right: "-6px", background: "#d32f2f", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Load Delivered Paperwork</h2>
          <input
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            multiple
            onChange={(e) => handleLoadDeliveredChange(e.target.files)}
            className="file-upload-btn"
            style={{ marginBottom: "0.75rem" }}
          />
          {loadDeliveredFiles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {loadDeliveredFiles.map((item, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <img src={item.preview} alt="Load delivered doc" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc", opacity: item.enhancing ? 0.5 : 1 }} />
                  <button
                    type="button"
                    onClick={() => removeLoadDeliveredFile(index)}
                    style={{ position: "absolute", top: "-6px", right: "-6px", background: "#d32f2f", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", fontSize: "0.7rem", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a1a" }}>Fuel Purchases</h2>
            <button
              type="button"
              onClick={addFuelEntry}
              style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e8f0fe", color: "#1a56db", border: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
            >
              + Add Fuel
            </button>
          </div>

          {fuelEntries.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No fuel entries yet.</p>
          )}

          {fuelEntries.map((entry, index) => (
            <div key={entry.id} style={{ border: "1px solid #eee", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#666" }}>Entry {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFuelEntry(entry.id)}
                  style={{ background: "none", border: "none", color: "#d32f2f", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Station, City, State</label>
                <input
                  type="text"
                  value={entry.location}
                  onChange={(e) => updateFuelEntry(entry.id, "location", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Quantity (L or G)</label>
                <input
                  type="number"
                  value={entry.quantity}
                  onChange={(e) => updateFuelEntry(entry.id, "quantity", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Total Cost ($)</label>
                <input
                  type="number"
                  value={entry.cost}
                  onChange={(e) => updateFuelEntry(entry.id, "cost", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Receipt Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleReceiptChange(entry.id, e.target.files[0])}
                  className="file-upload-btn"
                />
                {entry.enhancing && (
                  <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>Enhancing photo...</p>
                )}
                {entry.receiptPreview && !entry.enhancing && (
                  <div>
                    <img
                      src={entry.receiptPreview}
                      alt="Receipt preview"
                      style={{ marginTop: "0.5rem", maxWidth: "150px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {fuelEntries.length > 0 && (
            <p style={{ fontSize: "0.95rem", color: "#1a56db", fontWeight: "600", marginTop: "0.5rem" }}>
              Total Fuel Cost: ${totalFuelCost.toFixed(2)}
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#1a1a1a" }}>Expenses</h2>
            <button
              type="button"
              onClick={addExpenseEntry}
              style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e8f0fe", color: "#1a56db", border: "none", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
            >
              + Add Expense
            </button>
          </div>

          {expenseEntries.length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>No expenses yet.</p>
          )}

          {expenseEntries.map((entry, index) => (
            <div key={entry.id} style={{ border: "1px solid #eee", borderRadius: "6px", padding: "1rem", marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#666" }}>Expense {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeExpenseEntry(entry.id)}
                  style={{ background: "none", border: "none", color: "#d32f2f", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Category</label>
                <select
                  value={entry.category}
                  onChange={(e) => updateExpenseEntry(entry.id, "category", e.target.value)}
                  style={inputStyle}
                >
                  <option>Toll</option>
                  <option>Parking</option>
                  <option>Meals</option>
                  <option>Lodging</option>
                  <option>Repairs</option>
                  <option>Scales</option>
                  <option>Permits</option>
                  <option>Other</option>
                </select>
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Amount ($)</label>
                <input
                  type="number"
                  value={entry.amount}
                  onChange={(e) => updateExpenseEntry(entry.id, "amount", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  value={entry.description}
                  onChange={(e) => updateExpenseEntry(entry.id, "description", e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={rowStyle}>
                <label style={labelStyle}>Receipt Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleExpenseReceiptChange(entry.id, e.target.files[0])}
                  className="file-upload-btn"
                />
                {entry.enhancing && (
                  <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>Enhancing photo...</p>
                )}
                {entry.receiptPreview && !entry.enhancing && (
                  <div>
                    <img
                      src={entry.receiptPreview}
                      alt="Receipt preview"
                      style={{ marginTop: "0.5rem", maxWidth: "150px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <p style={{ fontSize: "0.75rem", color: "#1a7d36", marginTop: "0.25rem" }}>✓ Enhanced for clarity</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {expenseEntries.length > 0 && (
            <p style={{ fontSize: "0.95rem", color: "#1a56db", fontWeight: "600", marginTop: "0.5rem" }}>
              Total Expenses: ${totalExpenseCost.toFixed(2)}
            </p>
          )}
        </div>

        <div style={sectionStyle}>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "#1a1a1a" }}>Notes</h2>
          <textarea value={form.notes} onChange={handleChange("notes")} rows={3} style={inputStyle} />
        </div>

        {error && <p style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{ width: "100%", padding: "0.9rem", backgroundColor: "#1a56db", color: "white", border: "none", borderRadius: "8px", fontSize: "1.05rem", fontWeight: "600", cursor: "pointer" }}
        >
          {saving ? "Submitting..." : "Submit Trip"}
        </button>
      </form>

      {croppingFuelId && pendingFuelFile && (
        <CropTool file={pendingFuelFile} onDone={handleCropDone} onCancel={handleCropCancel} />
      )}

      {croppingExpenseId && pendingExpenseFile && (
        <CropTool file={pendingExpenseFile} onDone={handleExpenseCropDone} onCancel={handleExpenseCropCancel} />
      )}

      {croppingLoadReceivedIndex !== null && pendingLoadReceivedFiles[croppingLoadReceivedIndex] && (
        <CropTool
          file={pendingLoadReceivedFiles[croppingLoadReceivedIndex]}
          onDone={handleLoadReceivedCropDone}
          onCancel={handleLoadReceivedCropCancel}
        />
      )}

      {croppingLoadDeliveredIndex !== null && pendingLoadDeliveredFiles[croppingLoadDeliveredIndex] && (
        <CropTool
          file={pendingLoadDeliveredFiles[croppingLoadDeliveredIndex]}
          onDone={handleLoadDeliveredCropDone}
          onCancel={handleLoadDeliveredCropCancel}
        />
      )}
    </div>
  );
}