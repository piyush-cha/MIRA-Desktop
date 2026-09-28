?import React, { useState } from 'react';

import { ShieldCheck, Copy, Check, Lock, ArrowRight, X, Mail, Loader2, Key } from 'lucide-react';

import { api, getApiErrorMessage } from '../../../api/client';



interface CredentialDispatchModalProps {

  credentials: {

    cpseName: string;

    cpseCode: string;

    username: string;

    temporaryPassword: string;

    adminEmail: string;

    licenseTier: string;

  };

  onClose: () => void;

  onLoginAsCpseAdmin?: (username: string) => void;

}



export const CredentialDispatchModal: React.FC<CredentialDispatchModalProps> = ({

  credentials,

  onClose,

  onLoginAsCpseAdmin,

}) => {

  const [copied, setCopied] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [generatedPin, setGeneratedPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');



  const handleCopy = () => {

    const credText = `CPSE: ${credentials.cpseName} (${credentials.cpseCode})\nUsername: ${credentials.username}\nTemporary Password: ${credentials.temporaryPassword}\nAssigned License: ${credentials.licenseTier}\nAdmin Email: ${credentials.adminEmail}`;

    navigator.clipboard.writeText(credText);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };



  const handleSendEmail = async () => {

    setIsSending(true);

    setEmailStatus('IDLE');

    setErrorMessage('');

    try {

      const pdf_content = `SECURE CREDENTIALS\n\nCPSE: ${credentials.cpseName} (${credentials.cpseCode})\nUsername: ${credentials.username}\nTemporary Password: ${credentials.temporaryPassword}\nAssigned License: ${credentials.licenseTier}\n\nIMPORTANT: Please reset your password upon first login.`;

      

      const res = await api.sendSecureEmail({

        recipient_email: credentials.adminEmail,

        recipient_name: 'Nodal Officer',

        email_subject: 'Secure Credentials: MIRA System Access',

        email_body: 'Hello,\n\nPlease find your securely encrypted credentials attached. To unlock the PDF, please use your Temporary Password (which is your CPSE code).\n\nBest Regards,\nMIRA System Admin',

        pdf_content: pdf_content,

        pdf_password: credentials.temporaryPassword

      });



      if (res.status === 'SUCCESS') {

        setEmailStatus('SUCCESS');

        setGeneratedPin(res.generated_pin);

      }

    } catch (e: any) {

      setEmailStatus('ERROR');

      setErrorMessage(getApiErrorMessage(e));

    } finally {

      setIsSending(false);

    }

  };





  return (

    <div className="modal-overlay">

      <div className="modal-card">

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(46,204,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <ShieldCheck size={22} color="var(--accent-green)" />

            </div>

            <div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>

                Credentials Dispatched

              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>

                {credentials.cpseName} ({credentials.cpseCode})

              </div>

            </div>

          </div>

          <button className="icon-btn" onClick={onClose}>

            <X size={16} />

          </button>

        </div>



        {/* Security Alert */}

        {emailStatus === 'SUCCESS' ? (

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: 'var(--accent-green)' }}>

            <Key size={16} style={{ flexShrink: 0 }} />

            <div>

              <strong>EMAIL SENT SUCCESSFULLY.</strong> The PDF is encrypted with the CPSE code.

            </div>

          </div>

        ) : (

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: '#92700a' }}>

            <Lock size={16} style={{ flexShrink: 0 }} />

            <div>

              <strong>ONE-TIME CREDENTIAL DISPATCH:</strong> Forward securely to <span style={{ textDecoration: 'underline' }}>{credentials.adminEmail}</span>.

            </div>

          </div>

        )}

        

        {emailStatus === 'ERROR' && (

           <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: 'var(--accent-red)', marginTop: '-2px' }}>

              <strong>Error:</strong> {errorMessage}

           </div>

        )}



        {/* Credentials Grid */}

        <div style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'monospace' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Target CPSE:</span>

            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{credentials.cpseName}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Assigned Username:</span>

            <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{credentials.username}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Temporary Passcode:</span>

            <span style={{ fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '0.04em' }}>{credentials.temporaryPassword}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Licence Tier:</span>

            <span style={{ fontWeight: 700, color: '#92700a' }}>{credentials.licenseTier}</span>

          </div>

        </div>



        {/* Actions */}

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>

          <button className="btn-secondary" onClick={handleCopy} style={{ flex: 1, justifyContent: 'center' }}>

            {copied ? (

              <>

                <Check size={14} color="var(--accent-green)" /> Copied

              </>

            ) : (

              <>

                <Copy size={14} /> Copy

              </>

            )}

          </button>

          

          <button 

            className="btn-primary" 

            onClick={handleSendEmail} 

            disabled={isSending || emailStatus === 'SUCCESS'}

            style={{ flex: 2, justifyContent: 'center' }}

          >

            {isSending ? (

              <><Loader2 size={14} className="spin" /> Sending Secure Email...</>

            ) : emailStatus === 'SUCCESS' ? (

              <><Check size={14} /> Sent</>

            ) : (

              <><Mail size={14} /> Send Secure Email</>

            )}

          </button>



          {onLoginAsCpseAdmin && (

            <button

              className="btn-primary"

              onClick={() => onLoginAsCpseAdmin(credentials.username)}

              style={{ justifyContent: 'center' }}

            >

              <span>Test CPSE Login</span>

              <ArrowRight size={14} />

            </button>

          )}

        </div>

      </div>

    </div>

  );

};

�?import React, { useState } from 'react';

import { ShieldCheck, Copy, Check, Lock, ArrowRight, X, Mail, Loader2, Key } from 'lucide-react';

import { api, getApiErrorMessage } from '../../../api/client';



interface CredentialDispatchModalProps {

  credentials: {

    cpseName: string;

    cpseCode: string;

    username: string;

    temporaryPassword: string;

    adminEmail: string;

    licenseTier: string;

  };

  onClose: () => void;

  onLoginAsCpseAdmin?: (username: string) => void;

}



export const CredentialDispatchModal: React.FC<CredentialDispatchModalProps> = ({

  credentials,

  onClose,

  onLoginAsCpseAdmin,

}) => {

  const [copied, setCopied] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  const [generatedPin, setGeneratedPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');



  const handleCopy = () => {

    const credText = `CPSE: ${credentials.cpseName} (${credentials.cpseCode})\nUsername: ${credentials.username}\nTemporary Password: ${credentials.temporaryPassword}\nAssigned License: ${credentials.licenseTier}\nAdmin Email: ${credentials.adminEmail}`;

    navigator.clipboard.writeText(credText);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };



  const handleSendEmail = async () => {

    setIsSending(true);

    setEmailStatus('IDLE');

    setErrorMessage('');

    try {

      const pdf_content = `SECURE CREDENTIALS\n\nCPSE: ${credentials.cpseName} (${credentials.cpseCode})\nUsername: ${credentials.username}\nTemporary Password: ${credentials.temporaryPassword}\nAssigned License: ${credentials.licenseTier}\n\nIMPORTANT: Please reset your password upon first login.`;

      

      const res = await api.sendSecureEmail({

        recipient_email: credentials.adminEmail,

        recipient_name: 'Nodal Officer',

        email_subject: 'Secure Credentials: MIRA System Access',

        email_body: 'Hello,\n\nPlease find your securely encrypted credentials attached. To unlock the PDF, please use your Temporary Password (which is your CPSE code).\n\nBest Regards,\nMIRA System Admin',

        pdf_content: pdf_content,

        pdf_password: credentials.temporaryPassword

      });



      if (res.status === 'SUCCESS') {

        setEmailStatus('SUCCESS');

        setGeneratedPin(res.generated_pin);

      }

    } catch (e: any) {

      setEmailStatus('ERROR');

      setErrorMessage(getApiErrorMessage(e));

    } finally {

      setIsSending(false);

    }

  };





  return (

    <div className="modal-overlay">

      <div className="modal-card">

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'rgba(46,204,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              <ShieldCheck size={22} color="var(--accent-green)" />

            </div>

            <div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>

                Credentials Dispatched

              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>

                {credentials.cpseName} ({credentials.cpseCode})

              </div>

            </div>

          </div>

          <button className="icon-btn" onClick={onClose}>

            <X size={16} />

          </button>

        </div>



        {/* Security Alert */}

        {emailStatus === 'SUCCESS' ? (

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(46,204,113,0.15)', border: '1px solid rgba(46,204,113,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: 'var(--accent-green)' }}>

            <Key size={16} style={{ flexShrink: 0 }} />

            <div>

              <strong>EMAIL SENT SUCCESSFULLY.</strong> The PDF is encrypted with the CPSE code.

            </div>

          </div>

        ) : (

          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(245,200,66,0.15)', border: '1px solid rgba(245,200,66,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: '#92700a' }}>

            <Lock size={16} style={{ flexShrink: 0 }} />

            <div>

              <strong>ONE-TIME CREDENTIAL DISPATCH:</strong> Forward securely to <span style={{ textDecoration: 'underline' }}>{credentials.adminEmail}</span>.

            </div>

          </div>

        )}

        

        {emailStatus === 'ERROR' && (

           <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11.5px', color: 'var(--accent-red)', marginTop: '-2px' }}>

              <strong>Error:</strong> {errorMessage}

           </div>

        )}



        {/* Credentials Grid */}

        <div style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'monospace' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Target CPSE:</span>

            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{credentials.cpseName}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Assigned Username:</span>

            <span style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{credentials.adminEmail || `${credentials.username}@cpse.gov.in`}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Temporary Passcode:</span>

            <span style={{ fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '0.04em' }}>{credentials.temporaryPassword}</span>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>

            <span style={{ color: 'var(--text-muted)' }}>Licence Tier:</span>

            <span style={{ fontWeight: 700, color: '#92700a' }}>{credentials.licenseTier}</span>

          </div>

        </div>



        {/* Actions */}

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>

          <button className="btn-secondary" onClick={handleCopy} style={{ flex: 1, justifyContent: 'center' }}>

            {copied ? (

              <>

                <Check size={14} color="var(--accent-green)" /> Copied

              </>

            ) : (

              <>

                <Copy size={14} /> Copy

              </>

            )}

          </button>

          

          <button 

            className="btn-primary" 

            onClick={handleSendEmail} 

            disabled={isSending || emailStatus === 'SUCCESS'}

            style={{ flex: 2, justifyContent: 'center' }}

          >

            {isSending ? (

              <><Loader2 size={14} className="spin" /> Sending Secure Email...</>

            ) : emailStatus === 'SUCCESS' ? (

              <><Check size={14} /> Sent</>

            ) : (

              <><Mail size={14} /> Send Secure Email</>

            )}

          </button>



          {onLoginAsCpseAdmin && (

            <button

              className="btn-primary"

              onClick={() => onLoginAsCpseAdmin(credentials.username)}

              style={{ justifyContent: 'center' }}

            >

              <span>Test CPSE Login</span>

              <ArrowRight size={14} />

            </button>

          )}

        </div>

      </div>

    </div>

  );

};

2�����ˇ�8��"y