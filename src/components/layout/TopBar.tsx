gimport React, { useState, useEffect, useRef } from 'react';

import { Bell, HelpCircle, ChevronDown, Search, Loader2 } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

import { getOfficerMeta } from '../../utils/userUtils';

import { api } from '../../api/client';



interface TopBarProps {

  title: string;

  subtitle?: string;

  onNavigate?: (page: string) => void;

}



export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onNavigate }) => {

  const { user } = useAuthStore();

  const [showDropdown, setShowDropdown] = useState(false);

  const officer = getOfficerMeta(user?.fullName, user?.roleCode, user?.cpseName || user?.cpseCode || undefined);

  

  // Search State

  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);



  // Notification State

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);



  // Help State

  const [showHelpDropdown, setShowHelpDropdown] = useState(false);

  const helpRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {

      const target = e.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) setShowSearchDropdown(false);

      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifDropdown(false);

      if (helpRef.current && !helpRef.current.contains(target)) setShowHelpDropdown(false);

    };

    document.addEventListener('mousedown', handleClickOutside);

    

    api.getNotifications().then(res => {

      if (res.status === 'SUCCESS' && res.data) {

        setNotifications(res.data);

      }

    }).catch(console.error);

    

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);



  useEffect(() => {

    const timer = setTimeout(async () => {

      if (searchQuery.trim().length >= 2) {

        setIsSearching(true);

        setShowSearchDropdown(true);

        try {

          const res = await api.searchMaster(searchQuery);

          setSearchResults(res.data || []);

        } catch (err) {

          console.error("Search failed:", err);

        } finally {

          setIsSearching(false);

        }

      } else {

        setSearchResults([]);

        if (searchQuery.trim().length === 0) {

           setShowSearchDropdown(false);

        }

      }

    }, 400); // 400ms debounce

    return () => clearTimeout(timer);

  }, [searchQuery]);



  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter' && searchQuery.trim()) {

      setShowSearchDropdown(true);

    }

  };



  return (

    <div className="top-bar">

      <div className="breadcrumb">

        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap' }}>

          {title}

        </span>

        {subtitle && (

          <span style={{ 

            marginLeft: '8px', 

            color: 'var(--text-muted)', 

            fontSize: '12px',

            whiteSpace: 'nowrap',

            overflow: 'hidden',

            textOverflow: 'ellipsis'

          }}>

            / {subtitle}

          </span>

        )}

      </div>



      <div className="top-bar-actions">

        {user?.roleCode === 'CPSE_ADMIN' && (

          <span style={{ 

            fontSize: '10.5px', 

            fontWeight: 700, 

            color: '#059669', 

            background: 'rgba(16, 185, 129, 0.08)', 

            padding: '3px 9px', 

            borderRadius: '12px', 

            border: '1px solid rgba(16, 185, 129, 0.25)',

            display: 'inline-flex',

            alignItems: 'center',

            gap: '5px',

            whiteSpace: 'nowrap',

            flexShrink: 0

          }}>

            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />

            <span>ENTERPRISE SILO</span>

          </span>

        )}

        {user?.scope && (

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '16px', whiteSpace: 'nowrap' }}>

            Scope: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.scope}</span>

          </div>

        )}

        

        <div style={{ position: 'relative' }} ref={helpRef}>

          <button className="icon-btn" title="Help" onClick={() => setShowHelpDropdown(!showHelpDropdown)}>

            <HelpCircle size={16} />

          </button>

          

          {showHelpDropdown && (

            <div style={{

              position: 'absolute', top: '100%', right: 0, marginTop: '8px',

              width: '240px', background: 'white', border: '1px solid var(--border-light)',

              borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',

              zIndex: 100, padding: '12px'

            }}>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-primary)' }}>Help & Shortcuts</h4>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>

                <li style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>

                  <span>Global Search</span> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>Ctrl + K</kbd>

                </li>

                <li style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>

                  <span>Close Menus</span> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>Esc</kbd>

                </li>

                <li style={{ padding: '6px 0', paddingTop: '10px' }}>

                  <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Documentation & SOPs &rarr;</a>

                </li>

              </ul>

            </div>

          )}

        </div>



        <div style={{ position: 'relative' }} ref={notifRef}>

          <button className="icon-btn" title="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ position: 'relative' }}>

            <Bell size={16} />

            {notifications.length > 0 && (

              <span style={{

                position: 'absolute', top: '2px', right: '4px', width: '8px', height: '8px',

                background: '#ef4444', borderRadius: '50%', border: '2px solid white'

              }}></span>

            )}

          </button>

          

          {showNotifDropdown && (

            <div style={{

              position: 'absolute', top: '100%', right: 0, marginTop: '8px',

              width: '320px', background: 'white', border: '1px solid var(--border-light)',

              borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',

              zIndex: 100

            }}>

              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>Requires Attention</h4>

                {notifications.length > 0 && (

                  <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>

                    {notifications.length} alerts

                  </span>

                )}

              </div>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '300px', overflowY: 'auto' }}>

                {notifications.length === 0 ? (

                  <li style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>

                    All caught up! No pending actions.

                  </li>

                ) : (

                  notifications.map((n: any, i: number) => (

                    <li key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: 'white' }}

                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}

                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>

                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>

                        <span style={{ fontSize: '10px', color: n.severity === 'HIGH' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{n.severity}</span>

                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.description}</div>

                    </li>

                  ))

                )}

              </ul>

            </div>

          )}

        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '12px' }} ref={searchRef}>

          <div style={{

            display: 'flex',

            alignItems: 'center',

            background: 'var(--bg-secondary)',

            border: '1px solid var(--border-light)',

            borderRadius: '6px',

            padding: '4px 12px',

            minWidth: '250px'

          }}>

            {isSearching ? (

               <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)', marginRight: '8px' }} />

            ) : (

               <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />

            )}

            <input 

              type="text" 

              placeholder="Search MIRA National DB..." 

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              onKeyDown={handleSearch}

              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}

              style={{

                border: 'none',

                background: 'transparent',

                outline: 'none',

                fontSize: '12px',

                width: '100%',

                color: 'var(--text-primary)'

              }}

            />

            <div style={{ 

              fontSize: '10px', 

              color: 'var(--text-muted)', 

              background: 'var(--bg-tertiary)', 

              padding: '2px 6px', 

              borderRadius: '4px',

              border: '1px solid var(--border-light)'

            }}>

              Enter ↵

            </div>

          </div>

          

          {showSearchDropdown && (

            <div style={{

              position: 'absolute',

              top: '100%',

              left: 0,

              right: 0,

              marginTop: '4px',

              background: 'white',

              border: '1px solid var(--border-light)',

              borderRadius: '6px',

              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',

              zIndex: 100,

              maxHeight: '300px',

              overflowY: 'auto'

            }}>

              {isSearching ? (

                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>Searching Cryptographic Vault...</div>

              ) : searchResults.length === 0 ? (

                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>No matches found in National DB.</div>

              ) : (

                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>

                  {searchResults.map((item, idx) => (

                    <li key={idx} style={{ 

                      padding: '10px 12px', 

                      borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-light)' : 'none',

                      cursor: 'pointer'

                    }}

                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}

                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}

                    >

                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>{item.code}</div>

                      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, margin: '2px 0' }}>{item.noun}</div>

                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Status: {item.status}</div>

                    </li>

                  ))}

                </ul>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

מimport React, { useState, useEffect, useRef } from 'react';

import { Bell, HelpCircle, ChevronDown, Search, Loader2, Hash, ShieldCheck, Building2, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

import { getOfficerMeta } from '../../utils/userUtils';

import { api } from '../../api/client';



interface TopBarProps {

  title: string;

  subtitle?: string;

  onNavigate?: (page: string) => void;

}



export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onNavigate }) => {

  const { user } = useAuthStore();

  const [showDropdown, setShowDropdown] = useState(false);

  const officer = getOfficerMeta(user?.fullName, user?.roleCode, user?.cpseName || user?.cpseCode || undefined);

  

  // Search State

  const [searchQuery, setSearchQuery] = useState('');

  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [isSearching, setIsSearching] = useState(false);

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);



  // Notification State

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);

  const notifRef = useRef<HTMLDivElement>(null);



  // Help State

  const [showHelpDropdown, setShowHelpDropdown] = useState(false);

  const helpRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    const handleClickOutside = (e: MouseEvent) => {

      const target = e.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) setShowSearchDropdown(false);

      if (notifRef.current && !notifRef.current.contains(target)) setShowNotifDropdown(false);

      if (helpRef.current && !helpRef.current.contains(target)) setShowHelpDropdown(false);

    };

    document.addEventListener('mousedown', handleClickOutside);

    

    api.getNotifications().then(res => {

      if (res.status === 'SUCCESS' && res.data) {

        setNotifications(res.data);

      }

    }).catch(console.error);

    

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);



  useEffect(() => {

    const timer = setTimeout(async () => {

      if (searchQuery.trim().length >= 2) {

        setIsSearching(true);

        setShowSearchDropdown(true);

        try {

          const activeCpse = user?.cpseCode || 'BHEL';

          const res = await api.searchMaster(searchQuery, activeCpse);

          setSearchResults(res.data || []);

        } catch (err) {

          console.error("Search failed:", err);

        } finally {

          setIsSearching(false);

        }

      } else {

        setSearchResults([]);

        if (searchQuery.trim().length === 0) {

           setShowSearchDropdown(false);

        }

      }

    }, 350); // 350ms debounce

    return () => clearTimeout(timer);

  }, [searchQuery, user?.cpseCode]);



  const handleItemClick = (item: any) => {

    window.dispatchEvent(new CustomEvent('mira-select-material', { detail: item }));

    if (onNavigate) {

      onNavigate('cnmc');

    }

    setShowSearchDropdown(false);

  };



  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {

    if (e.key === 'Enter' && searchQuery.trim()) {

      setShowSearchDropdown(true);

    }

  };



  return (

    <div className="top-bar">

      <div className="breadcrumb">

        <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap' }}>

          {title}

        </span>

        {subtitle && (

          <span style={{ 

            marginLeft: '8px', 

            color: 'var(--text-muted)', 

            fontSize: '12px',

            whiteSpace: 'nowrap',

            overflow: 'hidden',

            textOverflow: 'ellipsis'

          }}>

            / {subtitle}

          </span>

        )}

      </div>



      <div className="top-bar-actions">

        {user?.roleCode === 'CPSE_ADMIN' && (

          <span style={{ 

            fontSize: '10.5px', 

            fontWeight: 700, 

            color: '#059669', 

            background: 'rgba(16, 185, 129, 0.08)', 

            padding: '3px 9px', 

            borderRadius: '12px', 

            border: '1px solid rgba(16, 185, 129, 0.25)',

            display: 'inline-flex',

            alignItems: 'center',

            gap: '5px',

            whiteSpace: 'nowrap',

            flexShrink: 0

          }}>

            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />

            <span>ENTERPRISE SILO</span>

          </span>

        )}

        {user?.scope && (

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '16px', whiteSpace: 'nowrap' }}>

            Scope: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.scope}</span>

          </div>

        )}

        

        <div style={{ position: 'relative' }} ref={helpRef}>

          <button className="icon-btn" title="Help" onClick={() => setShowHelpDropdown(!showHelpDropdown)}>

            <HelpCircle size={16} />

          </button>

          

          {showHelpDropdown && (

            <div style={{

              position: 'absolute', top: '100%', right: 0, marginTop: '8px',

              width: '240px', background: 'white', border: '1px solid var(--border-light)',

              borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',

              zIndex: 100, padding: '12px'

            }}>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-primary)' }}>Help & Shortcuts</h4>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>

                <li style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>

                  <span>Global Search</span> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>Ctrl + K</kbd>

                </li>

                <li style={{ padding: '6px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>

                  <span>Close Menus</span> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 4px', borderRadius: '4px' }}>Esc</kbd>

                </li>

                <li style={{ padding: '6px 0', paddingTop: '10px' }}>

                  <a href="#" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Documentation & SOPs &rarr;</a>

                </li>

              </ul>

            </div>

          )}

        </div>



        <div style={{ position: 'relative' }} ref={notifRef}>

          <button className="icon-btn" title="Notifications" onClick={() => setShowNotifDropdown(!showNotifDropdown)} style={{ position: 'relative' }}>

            <Bell size={16} />

            {notifications.length > 0 && (

              <span style={{

                position: 'absolute', top: '2px', right: '4px', width: '8px', height: '8px',

                background: '#ef4444', borderRadius: '50%', border: '2px solid white'

              }}></span>

            )}

          </button>

          

          {showNotifDropdown && (

            <div style={{

              position: 'absolute', top: '100%', right: 0, marginTop: '8px',

              width: '320px', background: 'white', border: '1px solid var(--border-light)',

              borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',

              zIndex: 100

            }}>

              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>Requires Attention</h4>

                {notifications.length > 0 && (

                  <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontWeight: 600 }}>

                    {notifications.length} alerts

                  </span>

                )}

              </div>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '300px', overflowY: 'auto' }}>

                {notifications.length === 0 ? (

                  <li style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>

                    All caught up! No pending actions.

                  </li>

                ) : (

                  notifications.map((n: any, i: number) => (

                    <li key={i} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', background: 'white' }}

                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}

                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>

                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</span>

                        <span style={{ fontSize: '10px', color: n.severity === 'HIGH' ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{n.severity}</span>

                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.description}</div>

                    </li>

                  ))

                )}

              </ul>

            </div>

          )}

        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '12px' }} ref={searchRef}>

          <div style={{

            display: 'flex',

            alignItems: 'center',

            background: 'var(--bg-secondary)',

            border: '1px solid var(--border-light)',

            borderRadius: '6px',

            padding: '4px 12px',

            minWidth: '250px'

          }}>

            {isSearching ? (

               <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)', marginRight: '8px' }} />

            ) : (

               <Search size={14} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />

            )}

            <input 

              type="text" 

              placeholder="Search MIRA National DB..." 

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              onKeyDown={handleSearch}

              onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}

              style={{

                border: 'none',

                background: 'transparent',

                outline: 'none',

                fontSize: '12px',

                width: '100%',

                color: 'var(--text-primary)'

              }}

            />

            <div style={{ 

              fontSize: '10px', 

              color: 'var(--text-muted)', 

              background: 'var(--bg-tertiary)', 

              padding: '2px 6px', 

              borderRadius: '4px',

              border: '1px solid var(--border-light)'

            }}>

              Enter ↵

            </div>

          </div>

          

          {showSearchDropdown && (

            <div style={{

              position: 'absolute',

              top: '100%',

              right: 0,

              width: '460px',

              marginTop: '6px',

              background: 'white',

              border: '1px solid var(--border-light)',

              borderRadius: '10px',

              boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.16)',

              zIndex: 1000,

              maxHeight: '440px',

              overflowY: 'auto'

            }}>

              <div style={{

                padding: '10px 14px',

                background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',

                borderBottom: '1px solid var(--border-light)',

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'center'

              }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                  <Sparkles size={13} color="#2563eb" />

                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.3px' }}>

                    NATIONAL MASTER SEARCH

                  </span>

                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                  <span style={{ fontSize: '10.5px', color: '#059669', background: '#dcfce7', padding: '2px 7px', borderRadius: '4px', fontWeight: 700 }}>

                    🏢 Active: {user?.cpseCode || 'BHEL'}

                  </span>

                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>

                    ({searchResults.length} match{searchResults.length === 1 ? '' : 'es'})

                  </span>

                </div>

              </div>



              {isSearching ? (

                <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>

                  <Loader2 size={18} className="animate-spin" style={{ margin: '0 auto 8px', color: '#2563eb' }} />

                  Searching Sovereign Cryptographic Master Vault...

                </div>

              ) : searchResults.length === 0 ? (

                <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>

                  No matches found for "{searchQuery}" in National Master.

                </div>

              ) : (

                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>

                  {searchResults.map((item, idx) => {

                    const activeCpse = user?.cpseCode || 'BHEL';

                    return (

                      <li 

                        key={idx} 

                        onClick={() => handleItemClick(item)}

                        style={{ 

                          padding: '12px 14px', 

                          borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-light)' : 'none',

                          cursor: 'pointer',

                          transition: 'background-color 0.15s ease'

                        }}

                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #f8fafc)')}

                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}

                      >

                        {/* Sovereign Code Row */}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                            <span style={{ 

                              fontSize: '11px', 

                              fontWeight: 800, 

                              fontFamily: 'monospace', 

                              background: '#eff6ff', 

                              color: '#1d4ed8', 

                              padding: '2px 6px', 

                              borderRadius: '4px',

                              border: '1px solid #bfdbfe'

                            }}>

                              #{item.code || item.human_code}

                            </span>

                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>

                              RATIFIED

                            </span>

                          </div>

                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>

                            {item.domain || 'Engineering Spares'}

                          </span>

                        </div>



                        {/* Standard Item Noun & Core Physics */}

                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700, margin: '2px 0' }}>

                          {item.noun}

                        </div>

                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '6px' }}>

                          {item.description}

                        </div>



                        {/* Own Enterprise ERP Details Badge */}

                        <div style={{ 

                          padding: '6px 10px', 

                          borderRadius: '6px', 

                          background: item.has_own_code ? '#f0fdf4' : '#fffbeb',

                          border: item.has_own_code ? '1px solid #bbf7d0' : '1px solid #fef3c7',

                          marginBottom: '6px'

                        }}>

                          {item.has_own_code ? (

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d' }}>

                                  🏢 Your {activeCpse} Code: <code style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>{item.own_code}</code>

                                </span>

                                {item.own_price && (

                                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', fontFamily: 'monospace' }}>

                                    {item.own_price}

                                  </span>

                                )}

                              </div>

                              <div style={{ fontSize: '10.5px', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>

                                <span>Facility: {item.own_plant || 'Primary Strategic Hub'}</span>

                                <span style={{ fontWeight: 600 }}>✓ 100% Equivalence</span>

                              </div>

                            </div>

                          ) : (

                            <div style={{ fontSize: '10.5px', color: '#b45309' }}>

                              🏢 <b>Your {activeCpse} Code:</b> <i>Not Yet Linked in Local ERP</i> &nbsp;•&nbsp; Click to view sovereign specs & request bridge indent

                            </div>

                          )}

                        </div>



                        {/* Footer row with sister CPSEs & action */}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

                            <span>Pooled in:</span>

                            {(item.linked_cpses || []).map((cp: string, cIdx: number) => (

                              <span key={cIdx} style={{ fontWeight: 700, background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px', color: '#475569' }}>

                                {cp}

                              </span>

                            ))}

                          </div>

                          <span style={{ color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>

                            Inspect Details <ArrowRight size={10} />

                          </span>

                        </div>

                      </li>

                    );

                  })}

                </ul>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

2����ȁȭ8�"L