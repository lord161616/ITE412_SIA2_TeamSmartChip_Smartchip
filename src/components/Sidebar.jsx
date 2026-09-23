import { NavLink, useNavigate } from "react-router-dom";
import { sidebarSections } from "./sidebarData";

import { logoutUser } from "../services/auth";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/smartchip-logo-noname.png";

import "../styles/sidebar.css";

export default function Sidebar({ open, setOpen }) {

  const navigate = useNavigate();

  const {
    user,
    role,
    accountType,
    loading,
  } = useAuth();


  async function handleLogout() {

    try {

      await logoutUser();

      navigate("/login", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    }

  }


  /*
   * Determine whether the current user
   * is allowed to see a sidebar item.
   *
   * IMPORTANT:
   * This only controls visibility.
   *
   * ProtectedRoute remains responsible
   * for actual route security.
   */
  function canAccessItem(item) {

    /*
     * Items without a roles restriction
     * are available to authenticated users.
     */
    if (!item.roles) {
      return true;
    }


    /*
     * Customer account.
     */
    if (
      item.roles.includes("customer") &&
      (
        role === "customer" ||
        accountType === "customer"
      )
    ) {
      return true;
    }


    /*
     * Staff roles.
     */
    if (
      role &&
      item.roles.includes(role)
    ) {
      return true;
    }


    return false;

  }


  /*
   * Filter the sidebar before rendering it.
   *
   * Empty sections are removed so the user
   * doesn't see headings with no available pages.
   */
  const visibleSections =
    sidebarSections
      .map((section) => ({

        ...section,

        items:
          section.items.filter(
            canAccessItem
          ),

      }))
      .filter(
        (section) =>
          section.items.length > 0
      );


  return (

    <aside
      className={`sidebar ${
        open ? "open" : ""
      }`}
    >


      {/* ================================
          HEADER
          ================================= */}

      <div className="sidebar-header">

        <img
          src={logo}
          alt="SmartChip Logo"
          className="sidebar-logo"
        />


        <div>

          <h2 className="sidebar-title">
            SmartChip
          </h2>

          <p className="sidebar-subtitle">
            Mushroom Drying System
          </p>

        </div>

      </div>


      {/* ================================
          MENU
          ================================= */}

      <div className="sidebar-menu">

        {loading ? (

          <div className="sidebar-loading">
            Loading menu...
          </div>

        ) : (

          visibleSections.map(
            (section) => (

              <div
                key={section.title}
                className="sidebar-section"
              >

                <p className="sidebar-sectionTitle">
                  {section.title}
                </p>


                {section.items.map(
                  (item) => {

                    const Icon =
                      item.icon;


                    return (

                      <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() =>
                          setOpen(false)
                        }
                        className={({
                          isActive,
                        }) =>
                          isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                        }
                      >

                        <Icon size={16} />

                        <span>
                          {item.label}
                        </span>

                      </NavLink>

                    );

                  }
                )}

              </div>

            )
          )

        )}

      </div>


      {/* ================================
          FOOTER
          ================================= */}

      <div className="sidebar-footer">

        <div>

          <div className="sidebar-userLabel">
            Signed in as
          </div>


          <div className="sidebar-userEmail">

            {user?.email || "—"}

          </div>

        </div>


        <button
          className="sidebar-logout"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>

      </div>

    </aside>

  );

}