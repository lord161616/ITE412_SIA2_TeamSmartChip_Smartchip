
import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerUser,
} from "../services/auth";

import logo from "../assets/smartchip-logo.png";
import mushroomBg from "../assets/mushroom-bg.png";

import "../styles/auth.css";


export default function Register() {

  const navigate =
    useNavigate();


  const [nickname, setNickname] =
    useState("");


  const [phone, setPhone] =
    useState("");


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [confirmPassword, setConfirmPassword] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");


    /*
     * ============================================
     * NORMALIZE INPUT
     * ============================================
     */

    const normalizedNickname =
      nickname.trim();


    const normalizedPhone =
      phone.trim();


    const normalizedEmail =
      email.trim().toLowerCase();


    /*
     * ============================================
     * VALIDATION
     * ============================================
     */

    if (
      normalizedNickname.length < 2
    ) {

      setError(
        "Nickname must be at least 2 characters."
      );

      return;

    }


    if (
      normalizedEmail.length === 0
    ) {

      setError(
        "Please enter your email address."
      );

      return;

    }


    if (
      password.length < 6
    ) {

      setError(
        "Password must be at least 6 characters."
      );

      return;

    }


    if (
      password !== confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;

    }


    setLoading(true);


    try {

      /*
       * registerUser is responsible for:
       *
       * 1. Creating the Firebase Authentication user.
       * 2. Creating the corresponding Firestore profile.
       *
       * The service must force the new account to:
       *
       * role        = customer
       * accountType = customer
       * status      = active
       */

      await registerUser(
        normalizedEmail,
        password,
        {
          nickname:
            normalizedNickname,

          phone:
            normalizedPhone,
        }
      );


      /*
       * Customer registration succeeded.
       */

      navigate(
        "/shop",
        {
          replace: true,
        }
      );


    } catch (err) {

      console.error(
        "Registration failed:",
        err
      );


      switch (err?.code) {

        case "auth/email-already-in-use":

          setError(
            "This email is already registered."
          );

          break;


        case "auth/invalid-email":

          setError(
            "Please enter a valid email address."
          );

          break;


        case "auth/weak-password":

          setError(
            "Password is too weak. Use at least 6 characters."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network connection failed. Check your internet connection."
          );

          break;


        case "permission-denied":

        case "firestore/permission-denied":

          setError(
            "Your account could not be created because Firestore denied the profile operation."
          );

          break;


        default:

          setError(
            err?.message ||
            "Unable to create your account."
          );

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="auth-wrap auth-wrap-reverse">


      <div className="auth-card">

        <h2 className="auth-title">
          Create Account
        </h2>


        <p className="auth-subtitle">
          Create your SmartChip customer account
        </p>


        {error && (

          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>

        )}


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >


          {/* NICKNAME */}

          <div>

            <label
              className="auth-label"
              htmlFor="nickname"
            >
              Nickname
            </label>


            <input
              id="nickname"
              className="auth-input"
              type="text"
              value={nickname}
              onChange={(event) =>
                setNickname(
                  event.target.value
                )
              }
              placeholder="Your name"
              autoComplete="nickname"
              minLength={2}
              required
              disabled={loading}
            />

          </div>


          {/* PHONE */}

          <div>

            <label
              className="auth-label"
              htmlFor="phone"
            >
              Phone number
            </label>


            <input
              id="phone"
              className="auth-input"
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="09xxxxxxxxx"
              autoComplete="tel"
              disabled={loading}
            />

          </div>


          {/* EMAIL */}

          <div>

            <label
              className="auth-label"
              htmlFor="email"
            >
              Email
            </label>


            <input
              id="email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />

          </div>


          {/* PASSWORD */}

          <div>

            <label
              className="auth-label"
              htmlFor="password"
            >
              Password
            </label>


            <input
              id="password"
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="At least 6 characters"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={loading}
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div>

            <label
              className="auth-label"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>


            <input
              id="confirmPassword"
              className="auth-input"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={loading}
            />

          </div>


          {/* SUBMIT */}

          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating account..."
              : "Create Customer Account"}

          </button>

        </form>


        <p className="auth-hint">

          Already have an account?{" "}


          <Link
            className="auth-link"
            to="/login"
          >
            Sign in
          </Link>

        </p>


        <p className="auth-hint">

          Just want to shop?{" "}


          <Link
            className="auth-link"
            to="/shop"
          >
            Continue as guest
          </Link>

        </p>


      </div>


      <div
        className="auth-side"
        style={{
          backgroundImage:
            `url(${mushroomBg})`,
        }}
      >

        <div className="logo-overlay">

          <img
            src={logo}
            alt="SmartChip Logo"
            className="brand-logo"
          />

        </div>

      </div>


    </div>

  );

}

