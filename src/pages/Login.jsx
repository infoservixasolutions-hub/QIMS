import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import "../styles/layout.css";
import logo from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">

         {/* TITLE */}
  <h2 style={{ textAlign: "center", marginBottom: 10, color: "#b7b9bf"}}>
    Quotation and Invoice Management System
  </h2>

  {/* LOGO */}
  <img src={logo} alt="logo" style={{ width: 150, height: 75}} />


        

        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={{ width: "100%" }} onClick={login}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;