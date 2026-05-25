import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/magic-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Jokin meni pieleen");
      }

      setMessage(
        "Kirjautumislinkki on lähetetty sähköpostiisi! Voit sulkea tämän välilehden.",
      );
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Kirjaudu sovellukseen</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Sähköpostiosoite"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" disabled={loading} className="login-button">
          {loading ? "Lähetetään..." : "Tilaa kirjautumislinkki"}
        </button>
      </form>
      {message && <p className="login-message">{message}</p>}
    </div>
  );
}
