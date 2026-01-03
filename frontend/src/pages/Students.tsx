import { useStudents } from "../hooks/useStudents";

const Students = () => {
    const { students, loading, error } = useStudents();

    if(loading) return <p>Loading Students...</p>
    if(error) return <p>{error}</p>

    return (
        <div>
            <h2>Student Directory ({students.length})</h2>

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll</th>
                        <th>Class</th>
                        <th>Guardian</th>
                        <th>Contact</th>   
                    </tr>
                </thead>
                <tbody>
                    {students.map((s) => (
                        <tr key={s.uuid}>
                        <td>{s.name}</td>
                        <td>{s.roll_number}</td>
                        <td>{s.class_standard}</td>
                        <td>{s.father_name}</td>
                        <td>{s.father_contact}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Students;