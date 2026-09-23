import {
  LayoutDashboard,
  Bell,
  Calendar,
  Activity,
  Box,
  History,
  BarChart3,
  Users,
  ShoppingCart,
} from "lucide-react";


/*
 * SmartChip Sidebar Permissions
 *
 * viewer:
 *   Monitoring and analytics only
 *
 * operator:
 *   Viewer permissions + Scheduler + Inventory
 *
 * administrator:
 *   Full staff access
 *
 * customer:
 *   Public shop only
 */

export const sidebarSections = [

  /* =====================================
     OVERVIEW
     ===================================== */

  {
    title: "Overview",

    items: [

      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",

        roles: [
          "viewer",
          "operator",
          "administrator",
        ],
      },


      {
        label: "Notifications",
        icon: Bell,
        path: "/notifications",

        roles: [
          "viewer",
          "operator",
          "administrator",
        ],
      },

    ],
  },


  /* =====================================
     OPERATIONS
     ===================================== */

  {
    title: "Operations",

    items: [

      {
        label: "Scheduler",
        icon: Calendar,
        path: "/scheduler",

        roles: [
          "operator",
          "administrator",
        ],
      },


      {
        label: "Sensor Monitoring",
        icon: Activity,
        path: "/sensors",

        roles: [
          "viewer",
          "operator",
          "administrator",
        ],
      },


      {
        label: "Inventory",
        icon: Box,
        path: "/inventory",

        roles: [
          "operator",
          "administrator",
        ],
      },

    ],
  },


  /* =====================================
     ANALYTICS
     ===================================== */

  {
    title: "Analytics",

    items: [

      {
        label: "History",
        icon: History,
        path: "/history",

        roles: [
          "viewer",
          "operator",
          "administrator",
        ],
      },


      {
        label: "Analytics",
        icon: BarChart3,
        path: "/analytics",

        roles: [
          "viewer",
          "operator",
          "administrator",
        ],
      },

    ],
  },


  /* =====================================
     SALES
     ===================================== */

  {
    title: "Sales",

    items: [

      {
        label: "Shop",
        icon: ShoppingCart,
        path: "/shop",

        roles: [
          "customer",
          "viewer",
          "operator",
          "administrator",
        ],
      },

    ],
  },


  /* =====================================
     ADMINISTRATION
     ===================================== */

  {
    title: "Administration",

    items: [

      {
        label: "User Management",
        icon: Users,
        path: "/users",

        roles: [
          "administrator",
        ],
      },

    ],
  },

];