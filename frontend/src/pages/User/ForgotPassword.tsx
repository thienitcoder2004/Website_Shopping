import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async () => {
    await fetch("http://localhost:5000/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <div>
      <input onChange={(e) => setEmail(e.target.value)} />
      <button onClick={submit}>Gửi</button>
    </div>
  );
}
