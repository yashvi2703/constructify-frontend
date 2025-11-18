import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ToolCase } from "lucide-react";
import Logo from "./Logo";
import menuItems from './sideBarMenu';

function AppSidebar({collapsed, onToggle}) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.substring(1) || "dashboard";
  const [expandedItems, setExpandedItems] =useState(new Set(["analytics"]));

    const toggleExpanded = (itemId) =>{
      const newExpanded= new Set(expandedItems);

      if(newExpanded.has(itemId)){
        newExpanded.delete(itemId);
      } else{
        newExpanded.add(itemId);
      }

      setExpandedItems(newExpanded);
    }
  return (
    <div className={`${collapsed? "w-20": "w-72"} transition duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
    border-r border-slate-200/5 dark:border-slate-700/50 flex flex-col relative z-10`}>
      <div>
        {/* logo */}
        <div className=" p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center space-x-2">
          {/* <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl 
          flex items-center justify-center shadow-lg">
            <HardHat className="w-6 h-6 text-white "/>
         </div> */}
         <Logo/>
              {/* conditional rendering */}
              {!collapsed &&
               (
         <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white"> Constructify </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 "> Admin Panel</p>
         </div> 
         )}
      
        </div>
        </div>  
     </div>

      {/* Navigation  */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item)=>{
          const isParentActive = currentPage === item.id || item.active || (item.subMenu && item.subMenu.some(si => si.id === currentPage));
          return(
          <div key={item.id}>
            <button 
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 ${currentPage === item.id || item.active ?
              "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25":"text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50" }`}
              onClick={()=>{
                if(item.subMenu){
                  toggleExpanded(item.id);
                }else{
                  navigate('/' + item.id);
                }
              }}
              >
              <div className="flex items-center space-x-2 dark:text-slate-300">
                <item.icon className={`w-5 h-5`}/>

                {/* Conditional rendering */}
                <>
                {!collapsed && ( 
                  <>
                
                  <span className="font-medium ml-2">
                    {item.label}
                  </span>
             
                
           {item.badge &&(
             <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-full">
           {item.badge} </span> )} 
              

                {item.count && (<span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                  {item.count}</span>
                  )}    
                  </>
                 )}
                </>
              </div>
              {!collapsed && item.subMenu && (
                  <ChevronDown className={`w-4 h-4 transition-transform dark:text-slate-300 ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}/>
                )}
            </button>


            {/* sub menu */}
            {!collapsed && item.subMenu && expandedItems.has(item.id) && (
              <div className="ml-8 mt-2 space-y-1">
              {item.subMenu.map((subitem) => {
                const isActiveSub = currentPage === subitem.id;
                return (
                  <button
                    key={subitem.id}
                    onClick={() => navigate('/' + subitem.id)}
                    className={`w-full text-left p-2 text-sm rounded-lg transition-all ${isActiveSub ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                  >
                    {subitem.label}
                  </button>
                );
              })}
            </div>
            )}
          </div>
        )})}
      </nav>
          {/* user profile */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <img src="https://images.pexels.com/photos/33718010/pexels-photo-33718010.jpeg? auto=compress&cs=tinysrgb&w=64&h=64&dpr=2" alt="user" className="w-10 h-10  rounded-full ring-2 ring-blue-500 "/>
{/* https://images.pexels.com/photos/8882164/pexels-photo-8882164.jpeg */}
{/* https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg */}
{/* https://images.pexels.com/photos/33718010/pexels-photo-33718010.jpeg */}
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                Yashvi
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate"> Administrator</p>
            </div>
          </div>
            {/*  */}
          </div>
      
    </div>
  )
}

export default AppSidebar
