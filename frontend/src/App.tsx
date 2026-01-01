import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/health")
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus("Backend not reachable"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Fee Management System</h1>
      <p>{status}</p>
    </div>
  );
}

export default App;
