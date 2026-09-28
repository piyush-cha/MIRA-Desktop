import React, { useState, useEffect, useRef } from 'react';
import { 



  Globe2, 



  Building2, 



  Layers, 



  Search, 



  LogOut, 



  ShieldCheck,



  FileCheck,



  Activity,



  AlertTriangle,



  FileText,



  UserCircle,



  FolderTree,



  Network,



  Cpu,



  Lock,



  LayoutDashboard,



  GitPullRequest



} from 'lucide-react';



import { useAuthStore } from '../../store/authStore';



import { api } from '../../api/client';







interface SidebarProps {



  currentPage: string;



  onNavigate: (page: string) => void;



}







import { getOfficerMeta } from '../../utils/userUtils';







export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {



  const { user, logout } = useAuthStore();



  const rawRole = user?.roleCode || '';



  const normalizedRole = 



    rawRole.includes('TIER_5') || rawRole.includes('CPSE_ADMIN') || rawRole.includes('CPSE_HQ') ? 'CPSE_ADMIN' :



    rawRole.includes('TIER_4') || rawRole.includes('ZONE') ? 'ZONE_ADMIN' :



    rawRole.includes('TIER_3') || rawRole.includes('AREA') ? 'AREA_ADMIN' :



    rawRole.includes('TIER_2') || rawRole.includes('TIER_1') || rawRole.includes('PLANT') ? 'PLANT_USER' :



    rawRole.includes('GOV') || rawRole.includes('NATIONAL') ? 'NATIONAL_GOVERNANCE' :



    rawRole;







  const isEnterpriseUser = ['CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER'].includes(normalizedRole);



  const hasRole = (...roles: string[]) => roles.includes(normalizedRole);



  const officer = getOfficerMeta(user?.fullName, user?.roleCode, user?.cpseName || user?.cpseCode || undefined);







  // Search State



  const [searchQuery, setSearchQuery] = useState('');



  const [searchResults, setSearchResults] = useState<any[]>([]);



  const [isSearching, setIsSearching] = useState(false);



  const [showSearchDropdown, setShowSearchDropdown] = useState(false);



  const searchRef = useRef<HTMLDivElement>(null);







  useEffect(() => {



    const handleClickOutside = (e: MouseEvent) => {



      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {



        setShowSearchDropdown(false);



      }



    };



    document.addEventListener('mousedown', handleClickOutside);



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



        if (searchQuery.trim().length === 0) setShowSearchDropdown(false);



      }



    }, 400);



    return () => clearTimeout(timer);



  }, [searchQuery]);







  const [pendingNominationsCount, setPendingNominationsCount] = useState<number>(0);







  useEffect(() => {



    let mounted = true;



    if (isEnterpriseUser) {



      setPendingNominationsCount(0);



      return;



    }







    const fetchCount = async () => {



      try {



        const res = await api.getMasterNominationsCount();



        if (mounted && res && typeof res.count === 'number') {



          setPendingNominationsCount(res.count);



        }



      } catch (e) {



        // silent fallback



      }



    };



    fetchCount();



    window.addEventListener('master-nominations-updated', fetchCount);



    const interval = setInterval(fetchCount, 6000);



    return () => {



      mounted = false;



      window.removeEventListener('master-nominations-updated', fetchCount);



      clearInterval(interval);



    };



  }, [isEnterpriseUser]);







  return (



    <div className="sidebar">



      {/* Brand Header: Bifurcated for CPSE Enterprise vs Sovereign Governance */}



      {isEnterpriseUser ? (



        <div className="sidebar-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px 14px' }}>



          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>



            <img 



              src="/mira-logo.png" 



              alt="MIRA Logo" 



              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }} 



            />



            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="sidebar-logo-text" style={{ fontSize: '13px', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>MIRA ENTERPRISE</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '2px' }}>
                {user?.cpseName || 'Bharat Heavy Electricals Limited'}
              </div>
            </div>



          </div>



          <div style={{ 



            fontSize: '9.5px', 



            fontWeight: 700, 



            padding: '3px 8px', 



            background: 'rgba(255,255,255,0.05)', 



            color: '#94a3b8', 



            borderRadius: '12px', 



            border: '1px solid rgba(255,255,255,0.1)',



            display: 'inline-flex',



            alignItems: 'center',



            gap: '5px',



            width: '100%',



            boxSizing: 'border-box'



          }}>



            <Lock size={10} color="#94a3b8" />



            <span>ENTERPRISE SILO: </span>
            <select 
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontWeight: '700',
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
              defaultValue={user?.cpseCode || 'BHEL'}
            >
              <option value="BHEL">BHEL</option>
              <option value="NTPC">NTPC</option>
              <option value="ONGC">ONGC</option>
              <option value="GAIL">GAIL</option>
              <option value="IOCL">IOCL</option>
            </select>



          </div>



        </div>



      ) : (



        <div className="sidebar-logo">



          <img 



            src="/mira-logo.png" 



            alt="MIRA Logo" 



            style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'contain' }} 



          />



          <div>



            <div className="sidebar-logo-text">MIRA SOVEREIGN</div>



            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>



              National Governance



            </div>



          </div>



        </div>



      )}







      {/* Global or Local Search */}



      <div className="sidebar-search" style={{ position: 'relative' }} ref={searchRef}>



        <Search size={14} />



        <input 



          type="text" 



          placeholder={isEnterpriseUser ? "Search local catalog, plants, PRs..." : "Search materials, CNMC, CPSEs..."}



          value={searchQuery}



          onChange={(e) => setSearchQuery(e.target.value)}



          onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}



          style={{ 



            background: 'transparent', 



            border: 'none', 



            outline: 'none', 



            color: 'var(--text-primary)', 



            fontSize: '12px',



            width: '100%'



          }} 



        />



        



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



              <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>Searching...</div>



            ) : searchResults.length === 0 ? (



              <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>No matches found.</div>



            ) : (



              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>



                {searchResults.map((item, idx) => (



                  <li key={idx} style={{ 



                    padding: '8px 12px', 



                    borderBottom: idx < searchResults.length - 1 ? '1px solid var(--border-light)' : 'none',



                    cursor: 'pointer'



                  }}



                  onClick={() => {



                    setShowSearchDropdown(false);



                    onNavigate('mira-catalog');



                  }}



                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}



                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}



                  >



                    <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600 }}>{item.code}</div>



                    <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, margin: '2px 0' }}>{item.noun}</div>



                  </li>



                ))}



              </ul>



            )}



          </div>



        )}



      </div>







      {/* Navigation */}



      <div className="sidebar-nav">



        {isEnterpriseUser ? (



          <>



            <div className="nav-section-title">Enterprise Operations</div>



            <div className="nav-grid">



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'admin' || currentPage === 'cpse-overview' ? 'active' : ''}`}



                  onClick={() => onNavigate('cpse-overview')}



                >



                  <LayoutDashboard size={16} />



                  <span>Executive Dashboard</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cpse-catalog' ? 'active' : ''}`}



                  onClick={() => onNavigate('cpse-catalog')}



                >



                  <Layers size={16} />



                  <span>Material Catalog Studio</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'mira-catalog' || currentPage === 'national-master' ? 'active' : ''}`}



                  onClick={() => onNavigate('mira-catalog')}



                >



                  <Globe2 size={16} />



                  <span>MIRA Unified Master</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'tier-tickets' ? 'active' : ''}`}



                  onClick={() => onNavigate('tier-tickets')}



                  title="New Material Codification & Unified Code Induction"



                >



                  <GitPullRequest size={16} />



                  <span>New Material & Unified Code</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cpse-hierarchy' ? 'active' : ''}`}



                  onClick={() => onNavigate('cpse-hierarchy')}



                >



                  <FolderTree size={16} />



                  <span>Plant Hierarchy & Nodes</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cpse-collaboration' ? 'active' : ''}`}



                  onClick={() => onNavigate('cpse-collaboration')}



                >



                  <Network size={16} />



                  <span>Inter-Plant Collaboration</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'expert-reviews' ? 'active' : ''}`}



                  onClick={() => onNavigate('expert-reviews')}



                >



                  <ShieldCheck size={16} />



                  <span>Expert Reviews</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'legacy-codes' ? 'active' : ''}`}



                  onClick={() => onNavigate('legacy-codes')}



                >



                  <Layers size={16} />



                  <span>Legacy Codes</span>



                </button>



              )}



            </div>







            <div className="nav-section-title">ERP & Compliance</div>



            <div className="nav-grid">



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cpse-sap' ? 'active' : ''}`}



                  onClick={() => onNavigate('cpse-sap')}



                >



                  <Cpu size={16} />



                  <span>SAP S/4HANA & PRs</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN', 'PLANT_USER') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}



                  onClick={() => onNavigate('audit')}



                >



                  <FileCheck size={16} />



                  <span>Enterprise Audit Trail</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN', 'ZONE_ADMIN', 'AREA_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'users-roles' ? 'active' : ''}`}



                  onClick={() => onNavigate('users-roles')}



                >



                  <UserCircle size={16} />



                  <span>Users & Roles</span>



                </button>



              )}



              {hasRole('CPSE_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'sap-settings' ? 'active' : ''}`}



                  onClick={() => onNavigate('sap-settings')}



                >



                  <Activity size={16} />



                  <span>SAP Gateway Settings</span>



                </button>



              )}



            </div>



          </>



        ) : (



          <>



            <div className="nav-section-title">National Governance</div>



            <div className="nav-grid">



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN', 'DOMAIN_EXPERT') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'national' ? 'active' : ''}`}



                  onClick={() => onNavigate('national')}



                >



                  <Globe2 size={16} />



                  <span>Overview</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'onboarding' ? 'active' : ''}`}



                  onClick={() => onNavigate('onboarding')}



                >



                  <Building2 size={16} />



                  <span>CPSEs Directory</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cnmc' || currentPage === 'mira-catalog' || currentPage === 'national-master' ? 'active' : ''}`}



                  onClick={() => onNavigate('mira-catalog')}



                >



                  <Globe2 size={16} />



                  <span>MIRA Unified Master</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN', 'DOMAIN_EXPERT') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'master-approvals' ? 'active' : ''}`}



                  onClick={() => onNavigate('master-approvals')}



                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}



                >



                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>



                    <ShieldCheck size={16} />



                    <span>Master Approvals</span>



                  </div>



                  {pendingNominationsCount > 0 && (



                    <span style={{



                      background: '#f59e0b',



                      color: '#ffffff',



                      fontSize: '10px',



                      fontWeight: 800,



                      borderRadius: '10px',



                      padding: '2px 7px',



                      lineHeight: 1



                    }}>



                      {pendingNominationsCount}



                    </span>



                  )}



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN', 'DOMAIN_EXPERT') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'tier-tickets' ? 'active' : ''}`}



                  onClick={() => onNavigate('tier-tickets')}



                  title="New Material Codification & Unified Code Induction"



                >



                  <GitPullRequest size={16} />



                  <span>New Material & Unified Code</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'data-quality' ? 'active' : ''}`}



                  onClick={() => onNavigate('data-quality')}



                >



                  <AlertTriangle size={16} />



                  <span>Data Quality</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN', 'DOMAIN_EXPERT') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'cross-cpse' ? 'active' : ''}`}



                  onClick={() => onNavigate('cross-cpse')}



                >



                  <Activity size={16} />



                  <span>Cross-CPSE Intel</span>



                </button>



              )}



              {hasRole('PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'admin' ? 'active' : ''}`}



                  onClick={() => onNavigate('admin')}



                >



                  <Building2 size={16} />



                  <span>CPSE Silo Inspector</span>



                </button>



              )}



            </div>







            <div className="nav-section-title">System & Governance</div>



            <div className="nav-grid">



              <button type="button"



                className={`nav-item ${currentPage === 'legacy-codes' ? 'active' : ''}`}



                onClick={() => onNavigate('legacy-codes')}



              >



                <Layers size={16} />



                <span>Legacy Codes</span>



              </button>



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'policies' ? 'active' : ''}`}



                  onClick={() => onNavigate('policies')}



                >



                  <FileText size={16} />



                  <span>Policies</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'audit' ? 'active' : ''}`}



                  onClick={() => onNavigate('audit')}



                >



                  <FileCheck size={16} />



                  <span>Audit & Compliance</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'users-roles' ? 'active' : ''}`}



                  onClick={() => onNavigate('users-roles')}



                >



                  <UserCircle size={16} />



                  <span>Users & Roles</span>



                </button>



              )}



              {hasRole('NATIONAL_GOVERNANCE', 'PLATFORM_ADMIN') && (



                <button type="button"



                  className={`nav-item ${currentPage === 'sap-settings' ? 'active' : ''}`}



                  onClick={() => onNavigate('sap-settings')}



                >



                  <Activity size={16} />



                  <span>SAP S/4HANA Gateway</span>



                </button>



              )}



            </div>



          </>



        )}



      </div>







      <div style={{ flex: 1 }} />







      {/* Sovereign Officer Profile Bar (SAP S/4HANA Enterprise Layout) */}



      <div className="sidebar-profile-row">



        <div 



          className="sidebar-profile" 



          onClick={() => onNavigate('profile')} 



          title="Open Sovereign Officer Profile & Security MFA"



        >



          <div className="sidebar-avatar-wrapper">



            {user?.avatarUrl && user.avatarUrl !== 'null' ? (



              <img src={user.avatarUrl} alt="Profile" className="profile-avatar" style={{ objectFit: 'cover' }} />



            ) : (



              <div className="profile-avatar">



                {officer.initials}



              </div>



            )}



            <span className="sidebar-avatar-status" title="Active Sovereign Session" />



          </div>







          <div className="sidebar-profile-info">



            <div className="profile-name" title={officer.displayName}>



              {officer.displayName}



            </div>



            <div className="profile-role-meta">



              <span className="profile-designation-badge">{officer.designation}</span>



              <span className="profile-role-text">{officer.roleLabel}</span>



            </div>



          </div>



        </div>







        <button type="button" 



          className="sidebar-logout-btn"



          onClick={async () => {



            try {



              if (user) {



                await api.logActivity({



                  action: 'USER_LOGOUT',



                  target: user.cpseName || 'MIRA National Grid',



                  details: `User ${user.email} terminated sovereign session.`,



                  actor: user.email



                });



              }



            } catch (e) {



              console.error('Failed to log logout activity', e);



            }



            logout();



          }}



          title="Sign Out (Sovereign Session)"



        >



          <LogOut size={15} />



        </button>



      </div>



    </div>



  );



};