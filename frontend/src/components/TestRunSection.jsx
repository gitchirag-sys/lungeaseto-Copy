// src/components/TestRunSection.jsx
import React, { useState } from "react";
import axios from "axios";

const TestRunSection = ({ user }) => {
  const [testMethod, setTestMethod] = useState("");
  const [formData, setFormData] = useState({
    Baseline_FEV1_L: "",
    Baseline_FVC_L: "",
    Baseline_FEV1_FVC_Ratio: "",
    Baseline_PEF_Ls: "",
    Baseline_FEF2575_Ls: "",
    Age: "",
    Height: "",
    Weight: "",
    Sex: "",
  });
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await window.localStorage.getItem("token");

      const features = [
        parseFloat(formData.Baseline_FEV1_L),
        parseFloat(formData.Baseline_FVC_L),
        parseFloat(formData.Baseline_FEV1_FVC_Ratio),
        parseFloat(formData.Baseline_PEF_Ls),
        parseFloat(formData.Baseline_FEF2575_Ls),
        parseInt(formData.Age),
        parseFloat(formData.Height),
        parseFloat(formData.Weight),
        formData.Sex.trim().toLowerCase() === "male" ? 1 : 0,
      ];

      const response = await axios.post(
        "/api/predict",
        {
          features,
          user_id: user?.uid || "anonymous",
          comment: "Manual input test",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error("Prediction failed:", error.response?.data || error.message);
      alert("Prediction failed. Check console for details.");
    }
  };

  const handleHardwareTest = () => {
    alert("Hardware test initiated (simulated).");
    setResult(null);
  };

  return (
    <div className="w-full py-10 bg-gradient-to-r from-green-50 via-teal-50 to-green-100">
      <div className="w-full max-w-2xl mx-auto p-10 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-200 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Run a Lung Test
        </h2>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              testMethod === "manual"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setTestMethod("manual")}
          >
            Manual Input
          </button>
          <button
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              testMethod === "hardware"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => {
              setTestMethod("hardware");
              handleHardwareTest();
            }}
          >
            Hardware Input
          </button>
        </div>

        {testMethod === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-5">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.replace(/_/g, " ")}
                </label>
                <input
                  type={key === "Sex" ? "text" : "number"}
                  name={key}
                  value={formData[key]}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded w-full transition"
            >
              Submit
            </button>
          </form>
        )}

        {result && (
          <div className="mt-8 bg-blue-100 p-6 rounded-lg shadow-inner text-center">
            <h3 className="text-xl font-bold mb-2 text-blue-800">Prediction Result</h3>
            <p className="text-lg">
              Diagnosis:{" "}
              <span className="text-blue-700 font-semibold">{result.prediction}</span>
            </p>
            <p className="text-gray-700 mt-2">
              Confidence:{" "}
              <span className="font-medium">
                {(result.confidence * 100).toFixed(2)}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRunSection;
