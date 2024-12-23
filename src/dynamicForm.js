import React, { useState, useEffect } from "react";
import "./index.css";

// Function to store data in local storage
const saveToLocalStorage = (data) => {
  localStorage.setItem("submittedData", JSON.stringify(data));
}; // Save data in local storage

const loadFromLocalStorage = () => {
  const data = localStorage.getItem("submittedData");
  if (!data) {
    return {};
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error Parsing JSON from localStorage:", error);
    return {};
  }
}; // Load data from local storage

const DynamicForm = () => {
  const [formFields, setFormFields] = useState([]);
  const [formType, setFormType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(loadFromLocalStorage()); // Store submitted data
  const [editIndex, setEditIndex] = useState(null); // Index of the entry edited
  const [progress, setProgress] = useState(0); //State Progress
  const [sucessMessage, setSuccessMessage] = useState(""); //State user feedback
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    // Simulate API response based on formType
    const apiResponses = {
      "User Information": [
        {
          name: "firstName",
          type: "text",
          label: "First Name",
          required: true,
        },
        { name: "lastName", type: "text", label: "Last Name", required: true },
        { name: "age", type: "number", label: "Age", required: false },
      ],
      "Address Information": [
        { name: "street", type: "text", label: "Street", required: true },
        { name: "city", type: "text", label: "City", required: true },
        {
          name: "state",
          type: "dropdown",
          label: "State",
          options: [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
          ],
          required: true,
        },
        { name: "zipCode", type: "text", label: "Zip Code", required: false },
      ],
      "Payment Information": [
        {
          name: "cardNumber",
          type: "text",
          label: "Card Number",
          required: true,
        },
        {
          name: "expiryDate",
          type: "date",
          label: "Expiry Date",
          required: true,
        },
        { name: "cvv", type: "password", label: "CVV", required: true },
        {
          name: "cardholderName",
          type: "text",
          label: "Cardholder Name",
          required: true,
        },
      ],
    };

    setFormFields(apiResponses[formType] || []);
    setFormData({});
    setErrors({});
  }, [formType]);

  useEffect(() => {
    //Calculate Progress
    const totalRequired = formFields.filter((field) => field.required).length;
    const completed = formFields.filter(
      (field) => field.required && formData[field.name]
    ).length;
    const progress = totalRequired > 0 ? (completed / totalRequired) * 100 : 0;
    setProgress(progress);
  }, [formData, formFields]);

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field.name === "cardNumber") {
      const regex = /^[0-9\s]*$/;
      if (!regex.test(value)) return;
    }

    setFormData({
      ...formData,
      [field.name]: value,
    });
    setErrors({
      ...errors,
      [field.name]: "",
    });

    setSuccessMessage(""); // Clear success message on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};
    formFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        validationErrors[field.name] = `${field.label} is required`;
      }
      // Custom validation for specific fields
      if (
        field.name === "age" &&
        formData[field.name] &&
        (formData[field.name] <= 0 || formData[field.name] > 120)
      ) {
        validationErrors[field.name] =
          "Please enter a valid age between 1 and 120";
      }
      if (
        field.name === "cardNumber" &&
        formData[field.name] &&
        !/^\d{4}[\s\d]{13,16}$/.test(formData[field.name]) &&
        formData[field.name].length !== 16
      ) {
        validationErrors[field.name] =
          "Card Number must be 13 to 16 digits with space";
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Handle form submission
    console.log("Form submitted successfully", formData);
    let updatedData = { ...submittedData };
    if (editIndex !== null) {
      updatedData[formType][editIndex] = formData;
      setSubmittedData(updatedData);
      setEditIndex(null);
      setSuccessMessage("Changes Saved Sucessfully");
      setMessageType("success");
    } else {
      if (!updatedData[formType]) {
        updatedData[formType] = [];
      }
      updatedData[formType] = [...updatedData[formType], formData]; // Append new data to existing data
      setSubmittedData(updatedData);
      setSuccessMessage("Form Submitted succesfully!"); // Clear success message on submission
      setMessageType("done");
    }
    saveToLocalStorage(updatedData); // Save updated data to local storage

    // Clear input fields after submission
    setFormData({});
  };

  const handleEdit = (formType, index) => {
    setFormData(submittedData[formType][index]);
    setEditIndex(index);
    setFormType(formType);
    setSuccessMessage("");
  };

  const handleDelete = (formType, index) => {
    const updatedData = { ...submittedData };
    updatedData[formType] = updatedData[formType].filter((_, i) => i !== index);
    setSubmittedData(updatedData);
    saveToLocalStorage(updatedData); // Save updated data to local storage
    setSuccessMessage("Entry deleted successfully!");
    setMessageType("remove");
  };

  const renderTable = (formType, data) => {
    if (!data || data.length === 0) return null;
    const headers = Object.keys(data[0]);

    return (
      <div className="mt-8" key={formType}>
        <h2 className="text-xl mb-4">{formType}</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {headers.map((key) => (
                <th key={key} className="py-2 px-4 bg-gray-200">
                  {key}
                </th>
              ))}
              <th className="py-2 px-4 bg-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {headers.map((key) => (
                  <td key={key} className="border px-4 py-2">
                    {row[key]}
                  </td>
                ))}
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(formType, index)}
                    className="mr-2 bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(formType, index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex p-4 bg-white rounded-lg shadow-md">
      <div className="w-full p-4 form-container">
        {/* Progress Bar*/}
        <div className="mb-4">
          <div className="h-4 bg-gray-200 rounded-full">
            <div
              className="h-4 bg-green-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-right mt-1">
            {Math.round(progress)}% completed
          </p>
        </div>
        {sucessMessage && (
          <div
            className={`mb-4 p-2 rounded ${
              messageType === "done"
                ? "bg-green-100 text-green-700"
                : messageType === "remove"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {sucessMessage}
          </div>
        )}
        <select
          onChange={(e) => setFormType(e.target.value)}
          className="mb-4 p-2 border rounded"
          value={formType}
        >
          <option value="">Select Form Type</option>
          <option value="User Information">User Information</option>
          <option value="Address Information">Address Information</option>
          <option value="Payment Information">Payment Information</option>
        </select>
        <form onSubmit={handleSubmit} noValidate>
          {formFields.map((field) => (
            <div key={field.name} className="mb-4">
              <label className="block mb-2">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === "dropdown" ? (
                <select
                  required={field.required}
                  className="p-2 border rounded w-full"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(e, field)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  className="p-2 border rounded w-full"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(e, field)}
                />
              )}
              {errors[field.name] && (
                <p className="text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Submit
          </button>
        </form>
      </div>
      <div className="w-full p-4">
        {Object.keys(submittedData)
          .filter(
            (formType) =>
              submittedData[formType] && submittedData[formType].length > 0
          )
          .map((formType) => renderTable(formType, submittedData[formType]))}
      </div>
    </div>
  );
};
export default DynamicForm;
