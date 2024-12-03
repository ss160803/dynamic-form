import React, { useState, useEffect } from "react";
import "./index.css";

//Function to store data in local storage
const saveToLocalStorage = (data) => {
  localStorage.setItem("submittedData", JSON.stringify(data));
}; //save data in local storage

const loadFromLocalStorage = () => {
  const data = localStorage.getItem("submittedData");
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Error Parsing JSON from localStorage:", error);
    return [];
  }
}; //load data from local storage

const DynamicForm = () => {
  const [formFields, setFormFields] = useState([]);
  const [formType, setFormType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(loadFromLocalStorage); //Store submitted data
  const [editIndex, setEditIndex] = useState(null); //Index of the entry edited

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
          options: ["California", "Texas", "New York"],
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
    setIsSubmitted(false);
  }, [formType]);

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    if (field.name === "cardNumber") {
      const regex = /^[0-9\s]*$/;
      if (!regex.test(value)) return;
    }

    setFormData({
      ...formData,
      [field.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [field.name]: "",
    });
    setIsSubmitted(false);
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
      setIsSubmitted(false);
      return;
    }

    // Handle form submission
    console.log("Form submitted successfully", formData);
    let updatedData;
    if (editIndex !== null) {
      const updatedData = [...submittedData];
      updatedData[editIndex] = formData;
      setSubmittedData(updatedData);
      setEditIndex(null);
    } else {
      updatedData = [...submittedData, formData]; //Appends new data to existing data
      setSubmittedData(updatedData);
    }
    setIsSubmitted(true);
    saveToLocalStorage(updatedData); //save updated data to local storage

    setFormData({}); // Clear input fields
  };

  const handleEdit = (index) => {
    setFormData(submittedData[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedData = submittedData.filter((_, i) => i !== index);
    setSubmittedData(updatedData);
    saveToLocalStorage(updatedData); //Save updated data to local storage
  };

  const headers = submittedData.length > 0 ? Object.keys(submittedData[0]): [];

  return (
    <div className="p-4 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <select
        onChange={(e) => setFormType(e.target.value)}
        className="mb-4 p-2 border rounded"
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
      {isSubmitted && (
        //   Object.keys(errors).length === 0 && Object.keys(formData).length > 0 &&
        <p className="text-green-500">Sign-up Successfull</p>
      )}

      {/* Tabular Display of form data */}
      {submittedData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl mb-4">Submitted Data</h2>
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
              {submittedData.map((data, index) => (
                <tr key={index}>
                  {Object.values(data).map((value, i) => (
                    <td key={i} className="border px-4 py-2">
                      {value}
                    </td>
                  ))}
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="mr-2 bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
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
      )}
    </div>
  );
};

export default DynamicForm;