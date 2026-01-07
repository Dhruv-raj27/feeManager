const API_URL = "http://localhost:3001";

/* ---------------- TYPES ---------------- */

export interface Student {
  uuid: string;
  name: string;
  roll_number: string;
  dob: string;
  gender: string;
  class_standard: string;
  admission_session: string;
  is_new_admission?: number;
  father_name?: string;
  father_contact?: string;
  mother_name?: string;
  mother_contact?: string;
  created_at?: string;
}

/* ---------------- FETCH ---------------- */

export const fetchStudents = async (token: string): Promise<Student[]> => {
  const res = await fetch(`${API_URL}/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
};

/* ---------------- ADD ---------------- */

export const addStudent = async (
  data: Omit<Student, "uuid">,
  token: string
) => {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to add student");
  }

  return res.json();
};

/* ---------------- UPDATE ---------------- */

export const updateStudent = async (
  uuid: string,
  data: Partial<Student>,
  token: string
) => {
  const res = await fetch(`${API_URL}/students/${uuid}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update student");
};

/* ---------------- DELETE ---------------- */

export const deleteStudent = async (uuid: string, token: string) => {
  const res = await fetch(`${API_URL}/students/${uuid}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete student");
};
