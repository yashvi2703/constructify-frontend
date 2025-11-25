

// Bill.jsx
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import logoImage from "../../assets/logo.png"; // Ensure this path is correct
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Download, Trash2, Edit, X, Search } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config/api.js";

// UI Components
function Card({ children, className = "" }) {
  return <div className={`rounded-2xl shadow-md bg-white p-4 ${className}`}>{children}</div>;
}

function CardHeader({ children, className = "" }) {
  return <div className={`border-b pb-3 mb-4 ${className}`}>{children}</div>;
}

function CardTitle({ children, className = "" }) {
  return <h2 className={`text-xl font-semibold ${className}`}>{children}</h2>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Button({ children, onClick, className = "", variant = "default", size = "default", disabled = false }) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
  };
  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs"
  };
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
    >
      {children}
    </button>
  );
}

function Input({ placeholder, value, onChange, className = "", type = "text", min, disabled = false }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black ${className}`}
    />
  );
}

function Select({ children, value, onValueChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-black"
    >
      {children}
    </select>
  );
}

function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}

// Main Component
export default function InvoiceGenerator() {
  const [invoices, setInvoices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({
    id: null,
    client: '',
    status: 'pending',
    materials: [{ name: '', quantity: 1, rate: 0 }]
  });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(null);

  const API_URL = API_BASE_URL;

  // Fetch materials from backend
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error("Error fetching materials:", err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/invoices`);
      setInvoices(res.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Calculate total from materials
  const totalAmount = form.materials.reduce(
    (acc, item) => acc + (item.quantity * item.rate),
    0
  );

  // Material handlers
  const addMaterial = () => {
    setForm({
      ...form,
      materials: [...form.materials, { name: '', quantity: 1, rate: 0 }]
    });
  };

  const removeMaterial = (index) => {
    if (form.materials.length > 1) {
      setForm({
        ...form,
        materials: form.materials.filter((_, i) => i !== index)
      });
    }
  };

  const updateMaterial = (index, field, value) => {
    const updated = [...form.materials];
    updated[index][field] = field === 'name' ? value : Number(value) || 0;
    setForm({ ...form, materials: updated });
  };

  // Form validation
  const isFormValid = () => {
    if (!form.client.trim()) return false;
    if (form.materials.length === 0) return false;
    return form.materials.every(m => m.name.trim() && m.quantity > 0 && m.rate >= 0);
  };

  // CRUD operations
  const handleSubmit = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields correctly');
      return;
    }

    // Reduce inventory for each material used in the bill
    try {
      for (const material of form.materials) {
        if (material.name && material.quantity > 0) {
          // Find the material in inventory
          const inventoryResponse = await axios.get(`${API_URL}/api/materials`);
          const inventoryMaterial = inventoryResponse.data.find(m => m.name.toLowerCase() === material.name.toLowerCase());

          if (inventoryMaterial) {
            const newQuantity = Math.max(0, inventoryMaterial.quantity - material.quantity);
            await axios.put(`${API_URL}/api/materials/${inventoryMaterial._id}`, {
              ...inventoryMaterial,
              quantity: newQuantity,
              lastUpdated: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory. Please try again.');
      return;
    }

    const invoiceData = {
      ...form,
      amount: totalAmount,
      date: new Date().toLocaleDateString()
    };

    try {
      if (form.id) {
        const res = await axios.put(`${API_URL}/api/invoices/${form.id}`, invoiceData);
        setInvoices(invoices.map(inv => (inv._id === form.id ? res.data : inv)));
      } else {
        const res = await axios.post(`${API_URL}/api/invoices`, invoiceData);
        setInvoices(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error("Error saving invoice:", err.response?.data || err.message);
      alert('Failed to save invoice. Please try again.');
      return;
    }

    resetForm();
  };

  const resetForm = () => {
    setForm({ 
      id: null, 
      client: '', 
      status: 'pending', 
      materials: [{ name: '', quantity: 1, rate: 0 }] 
    });
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setForm(invoice);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await axios.delete(`${API_URL}/api/invoices/${id}`);
      setInvoices(prev => prev.filter(inv => inv._id !== id));
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const matchesSearch = inv.client.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Helper: load image URL into dataURL (returns null on failure)
  const loadImageAsDataURL = (src) => {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          resolve(dataURL);
        } catch (err) {
          console.warn("Failed to convert logo to dataURL:", err);
          resolve(null);
        }
      };
      img.onerror = (err) => {
        console.warn("Logo load error:", err);
        resolve(null);
      };
      img.src = src;
      if (img.complete) {
        setTimeout(() => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
          } catch (e) { resolve(null); }
        }, 50);
      }
    });
  };
// diagnostic - run before calling generatePDF(invoice)
// logs char codes for every material in every invoice
(invoices || []).forEach((inv, invIdx) => {
  (inv.materials || []).forEach((m, i) => {
    const nameCodes = Array.from(String(m.name ?? "")).map(ch => ch.charCodeAt(0));
    const rateCodes = Array.from(String(m.rate ?? "")).map(ch => ch.charCodeAt(0));
    const qtyCodes  = Array.from(String(m.quantity ?? "")).map(ch => ch.charCodeAt(0));
    console.log(`invoice ${invIdx} row ${i}: name codes:`, nameCodes, 'qty codes:', qtyCodes, 'rate codes:', rateCodes);
  });
});


  // generatePDF with autoTable compatibility and email sending
  const generatePDF = async (invoice) => {
    setGeneratingPDF(invoice._id);

    try {
      const doc = new jsPDF();

      // Try to load logo and add
      const logoDataUrl = await loadImageAsDataURL(logoImage).catch(() => null);
      if (logoDataUrl) {
        try { doc.addImage(logoDataUrl, "PNG", 150, 30, 50, 20); }
        catch (e) { console.warn("doc.addImage failed:", e); }
      }

      // Header
      doc.setFont("times", "bold");
      doc.setFontSize(22);
      doc.text("INVOICE", 105, 25, { align: "center" });

      doc.setFont("times", "normal");
      doc.setFontSize(12);

      doc.text([
          "Vrindavan Traders",
          "Warehouse No. 9,",
          "Happy Street,",
          "Ahmedabad-380001"
        ], 160, 60);


      doc.text(`Status: ${(invoice.status || "pending").toUpperCase()}`, 160, 80); // invoice number add karna hai yaha

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      doc.text(`Bill to:`, 20, 95);
       doc.setFont("times", "normal");
      doc.text(`Client: ${invoice.client || "N/A"}`, 20, 100);
      doc.text([                              // auto fetch the address from DB
          "Warehouse No. 25,",
          "Happy Street,",
          "Ahmedabad-380004"
        ], 20, 105);
      doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 20, 120);
      doc.text(`Status: ${(invoice.status || "pending").toUpperCase()}`, 20, 125);

      // Ensure amount exists — fallback to recomputing from materials
      const amount = typeof invoice.amount === "number"
        ? invoice.amount
        : (invoice.materials || []).reduce((acc, it) => acc + ((it.quantity || 0) * (it.rate || 0)), 0);


      const tableData = (invoice.materials || []).map((item, index) => [
        index + 1,
        item.name || "-",
        item.quantity ?? 0,
        `₹${(item.rate ?? 0)}`,
        `₹${(((item.quantity ?? 0) * (item.rate ?? 0))).toFixed(2)}`,
      ]);

      const tableOptions = {
        startY: 135,
        margin: { left: 25 },
        head: [["#", "Material", "Quantity", "Rate", "Amount"]],
        body: tableData,
        theme: "grid",
        styles: {
            fontSize: 11,
            cellPadding: 4,
            font: "times"  // or another font name that you have added or is supported
          },

        headStyles: {
          fillColor: [63, 81, 181],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "centre" },
          4: { cellWidth: 30, halign: "centre" },
        },
      };

      // Call autoTable in a compatible way
      if (typeof doc.autoTable === "function") {
        doc.autoTable(tableOptions);
      } else if (typeof autoTable === "function") {
        autoTable(doc, tableOptions);
      } else {
        throw new Error("autoTable plugin not available. Check imports/installation.");
      }

      // Total
      const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 160;
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("Total Amount:", 130, finalY);
      doc.setTextColor(63, 81, 181);
      doc.text(`₹${amount.toFixed(2)}`, 165, finalY, { align: "left" });
      doc.setTextColor(0, 0, 0);

      // Footer
      doc.setFontSize(10);
      doc.setFont("times", "italic");
      doc.text("Thank you for your business!", 105, 285, { align: "center" });
      doc.text("Generated by Invoice Generator App", 105, 292, { align: "center" });

      // Get PDF as base64 string for email
      const pdfBuffer = doc.output('datauristring').split(',')[1]; // Remove data:application/pdf;base64,

      // Save file (trigger browser download)
      const safeClient = (invoice.client || "client").replace(/\s+/g, "_");
      const fileName = `invoice_${safeClient}_${invoice._id ?? Date.now()}.pdf`;
      doc.save(fileName);

      // Ask user if they want to send email
      const sendEmail = window.confirm(`PDF generated successfully! Would you like to send this bill via email to the client?`);

      if (sendEmail) {
        const clientEmail = prompt(`Enter email address for ${invoice.client}:`, '');
        if (clientEmail && clientEmail.trim()) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/email/send-bill`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              },
              body: JSON.stringify({
                to: clientEmail.trim(),
                subject: `Invoice from Vrindavan Traders - ${invoice.client}`,
                billData: {
                  id: invoice._id,
                  client: invoice.client,
                  amount: amount.toFixed(2),
                  date: invoice.date || new Date().toLocaleDateString(),
                  status: invoice.status || 'pending'
                },
                pdfBuffer: pdfBuffer
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Response error:', response.status, errorText);
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            alert('Bill sent successfully via email!');
          } catch (emailError) {
            console.error('Email send error:', emailError);
            alert('Failed to send email. Please check your connection and try again.');
          }
        }
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      setGeneratingPDF(null);
    }
  };


  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Header Card */}
      <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Invoice Generator
            </CardTitle>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus size={18} className="mr-2" />
              {showForm ? 'Cancel' : 'New Invoice'}
            </Button>
          </div>
        </CardHeader>

        {/* Search & Filter */}
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search client..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-700">
                  {form.id ? 'Edit Invoice' : 'Create New Invoice'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
                    <Input 
                      placeholder="Enter client name" 
                      value={form.client} 
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val })}>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </Select>
                  </div>
                </div>

                {/* Materials Section */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Materials *</label>
                    <Button onClick={addMaterial} size="sm" variant="outline">
                      <Plus size={16} className="mr-1" />
                      Add Item
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {form.materials.map((material, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-sm font-medium text-gray-600 mb-1">Material</label>
                          <select
                            value={material.name}
                            onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500 text-black"
                          >
                            <option value="">Select Material</option>
                            {materials.map(m => (
                              <option key={m._id} value={m.name}>{m.name}</option>
                            ))}
                          </select>
                        </div>

                        <label className="col-span-5 sm:col-span-3"> Qty
                          <Input
                            type="number"
                            placeholder="Qty"
                            value={material.quantity}
                            onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                            className=""
                            min="1"
                          />
                        </label>
                        <label className="col-span-5 sm:col-span-3"> Rate
                          <Input
                            type="number"
                            placeholder="Rate"
                            value={material.rate}
                            onChange={(e) => updateMaterial(index, 'rate', e.target.value)}
                            className=""
                            min="0"
                          />
                        </label>
                        <Button
                          onClick={() => removeMaterial(index)}
                          size="sm"
                          variant="ghost"
                          className="col-span-2 sm:col-span-1"
                          disabled={form.materials.length === 1}
                        >
                          <X size={16} />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg">
                  <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{totalAmount.toFixed(2)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={!isFormValid()}
                  >
                    {form.id ? 'Update Invoice' : 'Create Invoice'}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card className="shadow-md border-none bg-white/80">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">No invoices found. Create your first invoice!</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map(inv => (
            <motion.div
              key={inv._id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              layout
            >
              <Card className="shadow-md hover:shadow-xl transition-all border-none bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{inv.client}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          inv.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-indigo-600 mb-1">₹{inv.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{inv.date} • {inv.materials.length} item(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generatePDF(inv)}
                        disabled={generatingPDF === inv._id}
                        className="relative"
                      >
                        {generatingPDF === inv._id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Download size={16} />
                          </motion.div>
                        ) : (
                          <Download size={16} />
                        )}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(inv)}>
                        <Edit size={16} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(inv._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
