import { BaggageClaim, BarChart3, Calendar, CreditCard, FileText, IdCardLanyard, LayoutDashboard, LucideListOrdered, MapPinned, MessageSquare, Package, Settings, ShoppingBag, Truck, Users } from "lucide-react";

const menuItems=[
  {
    id: "dashboard",
    icon : LayoutDashboard,
    label :"Dashboard",
    active: true,
    badge:"New"
  },
  {
    id:"analytics",
    icon:BarChart3,
    label: "Analytics",
    subMenu:[
      {id: "overview",label:"Overview"},
      // {id:"reports",label:"Reports"},
      // {id: "insights", label:"Insights"},
    ],
  },
  // {
  //   id:"users",
  //   icon:Users,
  //   label:"Users",
  //   count: " 5 ",
  //   subMenu:[
  //     {id:"all users",label:"All users"},
  //     {id:"roles",label:"Roles and Permissions"},
  //     {id:"activity", label:"User Activity"}
  //   ],
  // },
  {
    id:"Billing",
    icon: ShoppingBag,
    label:"Billing",
    subMenu: [
      // {id:"products", label: "Products"},
      // {id:"orders", label:"Orders"},
      // {id:"customers", label:"Customers"},
      {id:"bill", label:"Generate New Bill"},
    ],

  },
  {
    id:"inventory",
    icon: Package,
    label: "Inventory",
    count:"99",
  },
  {
    id:"orders",
    icon: BaggageClaim,
    label: "Orders",
    count:"99",
  },
  {
    id:"employees",
    icon:IdCardLanyard,
    label:"Employees",
    count: " 5 ",
    // subMenu:[
    //   {id:"all users",label:"All users"},
    //   {id:"roles",label:"Roles and Permissions"},
    //   {id:"activity", label:"User Activity"}
    // ],
  },
  {
    id:"transporation",
    icon:Truck,
    label:"Transporation",
  },
  // {
  //   id:"messages",
  //   icon:MessageSquare,
  //   label:"Messages",
  //   badge:"9"
  // },
  // {
  //   id:" calender",
  //   icon: Calendar,
  //   label:"Calender",
  // },
  // {
  //   id:"reports",
  //   icon: FileText,
  //   label:"Reports",
  // },
  {
    id:"settings",
    icon:Settings,
    label:"Settings"
  }
]

export default menuItems