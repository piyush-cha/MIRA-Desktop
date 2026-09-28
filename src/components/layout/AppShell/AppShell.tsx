import React from 'react';

import { Sidebar } from './Sidebar';

import { TopBar } from './TopBar';



interface AppShellProps {

  currentPage: string;

  onNavigate: (page: string) => void;

  title: string;

  subtitle?: string;

  children: React.ReactNode;

}



export const AppShell: React.FC<AppShellProps> = ({

  currentPage,

  onNavigate,

  title,

  subtitle,

  children,

}) => {

  return (

    <div className="app-shell">

      {/* Sovereign Sidebar */}

      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />



      {/* Main Content Area */}

      <div className="main-content">

        <TopBar title={title} subtitle={subtitle} onNavigate={onNavigate} />

        <div className="content-scroll">

          {children}

        </div>

      </div>

    </div>

  );

};

�import React from 'react';

import { Sidebar } from '../Sidebar/Sidebar';

import { TopBar } from '../TopBar/TopBar';



interface AppShellProps {

  currentPage: string;

  onNavigate: (page: string) => void;

  title: string;

  subtitle?: string;

  children: React.ReactNode;

}



export const AppShell: React.FC<AppShellProps> = ({

  currentPage,

  onNavigate,

  title,

  subtitle,

  children,

}) => {

  return (

    <div className="app-shell">

      {/* Sovereign Sidebar */}

      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />



      {/* Main Content Area */}

      <div className="main-content">

        <TopBar title={title} subtitle={subtitle} onNavigate={onNavigate} />

        <div className="content-scroll">

          {children}

        </div>

      </div>

    </div>

  );

};

2������߷8�"W