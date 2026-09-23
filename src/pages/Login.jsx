import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  loginUser,
} from "../services/auth";

import {
  useAuth,
} from "../context/AuthContext";

import logo from "../assets/smartchip-logo.png";
import mushroomBg from "../assets/mushroom-bg.png";

import "../styles/auth.css";


export default function Login() {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    user,
    profile,
    profileError,
  } = useAuth();


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState("");


  /*
   * If the user is already authenticated and
   * their profile has loaded, send them to the
   * appropriate area.
   */

  useEffect(() => {

    if (!user || !profile) {
      return;
    }


    if (profile.role === "customer") {

      navigate(
        "/shop",
        {
          replace: true,
        }
      );

      return;

    }


    if (
      [
        "viewer",
        "operator",
        "administrator",
      ].includes(profile.role)
    ) {

      const requestedPath =
        location.state?.from;


      /*
       * Only allow internal application paths.
       *
       * This prevents arbitrary external redirects.
       */

      if (
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/")
      ) {

        navigate(
          requestedPath,
          {
            replace: true,
          }
        );

      } else {

        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );

      }

    }

  }, [
    user,
    profile,
    navigate,
    location.state,
  ]);


  useEffect(() => {

    if (profileError) {

      setError(
        profileError
      );

    }

  }, [profileError]);


  async function handleSubmit(event) {

    event.preventDefault();

    setError("");

    setLoading(true);


    try {

      await loginUser(
        email,
        password
      );


      /*
       * We intentionally do not navigate here.
       *
       * AuthContext receives the Firebase Auth event,
       * loads the Firestore profile, and this component
       * redirects based on the verified role.
       */

    } catch (err) {

      console.error(
        "Login failed:",
        err
      );


      switch (err.code) {

        case "auth/invalid-credential":

          setError(
            "Invalid email or password."
          );

          break;


        case "auth/user-disabled":

          setError(
            "This account has been disabled."
          );

          break;


        case "auth/too-many-requests":

          setError(
            "Too many login attempts. Please try again later."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network connection failed. Check your internet connection."
          );

          break;


        case "auth/invalid-email":

          setError(
            "Please enter a valid email address."
          );

          break;


        default:

          setError(
            err.message ||
            "Unable to sign in."
          );

      }

    } finally {

      setLoading(false);

    }

  }


  return (

    <div className="auth-wrap">

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


      <div className="auth-card">

        <h2 className="auth-title">
          Welcome Back
        </h2>


        <p className="auth-subtitle">
          Sign in to your SmartChip account
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

          <div>

            <label className="auth-label">
              Email
            </label>


            <input
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


          <div>

            <label className="auth-label">
              Password
            </label>


            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />

          </div>


          <button
            className="auth-btn"
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "Sign In"}

          </button>

        </form>


        <p className="auth-hint">

          Don't have an account?{" "}

          <Link
            className="auth-link"
            to="/register"
          >
            Create one
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

    </div>

  );

}