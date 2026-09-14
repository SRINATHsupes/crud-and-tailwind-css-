import { useState } from "react";
import { z } from "zod";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";



const employeeSchema = z.object({
  id: z
    .string()
    .min(1, "Employee ID is required"),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .regex(
      /^[A-Za-z ]+$/,
      "Name must contain only letters"
    ),

  department: z
    .string()
    .min(1, "Please select a department"),

  salary: z
    .coerce
    .number()
    .int("Salary must be a whole number")
    .min(1, "Salary must be a positive number"),
});


const emptyForm = {
  id: "",
  name: "",
  department: "",
  salary: "",
};

const initialEmployees = [
  {
    id: "E001",
    name: "Srinath",
    department: "Other",
    salary: 25000,
  },

  {
    id: "E002",
    name: "ram",
    department: "Backend",
    salary: 30000,
  },

  {
    id: "E003",
    name: "Rahul",
    department: "Other",
    salary: 20000,
  },
];

function EmployeeList({ employees, setEmployees }) {
  const navigate = useNavigate();

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    setEmployees(
      employees.filter(
        (employee) => employee.id !== id
      )
    );
  };

  return (
    <div className="container">

      <h1>Employee Management</h1>

      <button
        className="add-button"
        onClick={() =>
          navigate("/employees/add")
        }
      >
        + Add Employee
      </button>

      <table>

        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {employees.map((employee) => (

            <tr key={employee.id}>

              <td>
                {employee.id}
              </td>

              <td>
                {employee.name}
              </td>

              <td>
                {employee.department}
              </td>

              <td>
                ₹{employee.salary.toLocaleString("en-IN")}
              </td>

              <td>

                <button
                  className="update-button"
                  onClick={() =>
                    navigate("/employees/edit/" + employee.id)
                  }
                >
                  Update
                </button>

                <button
                  className="delete-button"
                  onClick={() =>
                    handleDelete(employee.id)
                  }
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
}

function EmployeeForm({
  employees,
  setEmployees,
  mode,
}) {
  const navigate = useNavigate();

  const { id } = useParams();

  const employeeToEdit =
    employees.find(
      (employee) => employee.id === id
    );

  const [formData, setFormData] = useState(
    mode === "edit" && employeeToEdit
      ? employeeToEdit
      : emptyForm
  );

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const result =
      employeeSchema.safeParse(formData);

    if (!result.success) {

      const newErrors = {};

      result.error.issues.forEach(
        (issue) => {

          const field =
            issue.path[0];

          newErrors[field] =
            issue.message;
        }
      );

      setErrors(newErrors);

      return false;
    }

    setErrors({});

    return true;
  };

  const handleAdd = () => {

    if (!validateForm()) {
      return;
    }

    const duplicate =
      employees.some(
        (employee) =>
          employee.id === formData.id
      );

    if (duplicate) {

      setErrors({
        id: "Employee ID already exists",
      });

      return;
    }

    setEmployees([
      ...employees,
      {
        ...formData,
        salary: Number(formData.salary),
      },
    ]);

    navigate("/employees");
  };

  const handleUpdate = () => {

    if (!validateForm()) {
      return;
    }

    setEmployees(
      employees.map((employee) =>
        employee.id === id
          ? {
              ...formData,
              id: employee.id,
              salary: Number(
                formData.salary
              ),
            }
          : employee
      )
    );

    navigate("/employees");
  };

  const validId =
    formData.id.trim() !== "";

  const validName =
    formData.name.trim() !== "" &&
    formData.name.length >= 2 &&
    /^[A-Za-z ]+$/.test(
      formData.name
    );

  const validDepartment =
    formData.department !== "";

  const validSalary =
    formData.salary !== "" &&
    Number.isInteger(
      Number(formData.salary)
    ) &&
    Number(formData.salary) >= 1 &&
    Number(formData.salary) <= 1000000;

  if (
    mode === "edit" &&
    !employeeToEdit
  ) {

    return (
      <div className="container">

        <h2>
          Employee Not Found
        </h2>

        <button
          className="cancel-button"
          onClick={() =>
            navigate("/employees")
          }
        >
          Back
        </button>

      </div>
    );
  }

  return (
    <div className="container">

      <div className="form-container">

        <h2>
          {mode === "edit"
            ? "Update Employee"
            : "Add Employee"}
        </h2>

        <label>
          Employee ID
        </label>

        <input
          type="text"
          name="id"
          placeholder="Employee ID"
          value={formData.id}
          onChange={handleChange}
          disabled={mode === "edit"}
        />

        {errors.id && (
          <p className="error">
            {errors.id}
          </p>
        )}

        <label>
          Name
        </label>

        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={formData.name}
          onChange={handleChange}
        />

        {errors.name && (
          <p className="error">
            {errors.name}
          </p>
        )}

        <label>
          Department
        </label>

        <div className="radio-group">

          <label>
            <input
              type="radio"
              name="department"
              value="Frontend"
              checked={
                formData.department ===
                "Frontend"
              }
              onChange={handleChange}
            />
            Frontend
          </label>

          <label>
            <input
              type="radio"
              name="department"
              value="Backend"
              checked={
                formData.department ===
                "Backend"
              }
              onChange={handleChange}
            />
            Backend
          </label>

          <label>
            <input
              type="radio"
              name="department"
              value="Other"
              checked={
                formData.department ===
                "Other"
              }
              onChange={handleChange}
            />
            Other
          </label>

        </div>

        {errors.department && (
          <p className="error">
            {errors.department}
          </p>
        )}

        <label>
          Salary
        </label>

        <input
          type="number"
          name="salary"
          placeholder="₹ in rupees "
          value={formData.salary}
          onChange={handleChange}
          min="1"
          step="1"
        />

        {errors.salary && (
          <p className="error">
            {errors.salary}
          </p>
        )}

        <h3 className="validation-title">
          Validation Status
        </h3>

        <div className="validation-checks">

          <div className="validation-item">

            <input
              type="checkbox"
              checked={validId}
              readOnly
            />

            <span>
              Employee ID
            </span>

            <span
              className={
                validId
                  ? "status-valid"
                  : "status-invalid"
              }
            >
              {validId ? "✓" : "✗"}
            </span>

          </div>

          <div className="validation-item">

            <input
              type="checkbox"
              checked={validName}
              readOnly
            />

            <span>
              Name
            </span>

            <span
              className={
                validName
                  ? "status-valid"
                  : "status-invalid"
              }
            >
              {validName ? "✓" : "✗"}
            </span>

          </div>

          <div className="validation-item">

            <input
              type="checkbox"
              checked={validDepartment}
              readOnly
            />

            <span>
              Department
            </span>

            <span
              className={
                validDepartment
                  ? "status-valid"
                  : "status-invalid"
              }
            >
              {validDepartment
                ? "✓"
                : "✗"}
            </span>

          </div>

          <div className="validation-item">

            <input
              type="checkbox"
              checked={validSalary}
              readOnly
            />

            <span>
              Salary
            </span>

            <span
              className={
                validSalary
                  ? "status-valid"
                  : "status-invalid"
              }
            >
              {validSalary
                ? "✓"
                : "✗"}
            </span>

          </div>

        </div>

        {mode === "edit" ? (

          <button
            className="save-button"
            onClick={handleUpdate}
          >
            Save Update
          </button>

        ) : (

          <button
            className="save-button"
            onClick={handleAdd}
          >
            Add Employee
          </button>

        )}

        <button
          className="cancel-button"
          onClick={() =>
            navigate("/employees")
          }
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

function App() {

  const [employees, setEmployees] =
    useState(initialEmployees);

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/employees"
          element={
            <EmployeeList
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />

        <Route
          path="/employees/add"
          element={
            <EmployeeForm
              employees={employees}
              setEmployees={setEmployees}
              mode="add"
            />
          }
        />

        <Route
          path="/employees/edit/:id"
          element={
            <EmployeeForm
              employees={employees}
              setEmployees={setEmployees}
              mode="edit"
            />
          }
        />

        <Route
          path="*"
          element={
            <EmployeeList
              employees={employees}
              setEmployees={setEmployees}
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App; 