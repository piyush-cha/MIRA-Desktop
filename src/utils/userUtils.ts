export const getOfficerMeta = (fullName?: string, roleCode?: string, cpseName?: string) => {

  if (!fullName) {

    return {

      displayName: 'Authorized Officer',

      designation: roleCode === 'CPSE_ADMIN' ? (cpseName || 'CPSE Admin') : (roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance'),

      initials: 'AO',

      roleLabel: roleCode === 'CPSE_ADMIN' ? 'Enterprise' : 'Governance'

    };

  }



  // Handle compound titles like "Dr. A. P. Sharma — DG, DPE"

  const parts = fullName.split(/\s*[—–-]\s*/);

  const displayName = parts[0].trim();

  const designation = parts[1]?.trim() || (

    roleCode === 'CPSE_ADMIN' ? (cpseName || 'CPSE Enterprise Nodal') :

    roleCode === 'ZONE_ADMIN' ? 'Zone Officer' :

    roleCode === 'AREA_ADMIN' ? 'Area / Subsidiary Officer' :

    roleCode === 'PLANT_USER' ? 'Plant Head' :

    roleCode === 'DAILY_OPERATOR' ? 'Daily Operator' :

    roleCode === 'NATIONAL_GOVERNANCE' ? 'DG, DPE' : 

    roleCode ? roleCode.replace(/_/g, ' ') : 'National Governance'

  );



  // Compute smart monogram initials: "Dr. A. P. Sharma" -> "AS", "COALINDIA Nodal Administrator" -> "CA"

  const nameWithoutHonorific = displayName.replace(/^(Dr\.|Prof\.|Shri\.|Smt\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();

  const tokens = nameWithoutHonorific.split(/\s+/).filter(Boolean);



  let initials = 'AO';

  if (tokens.length === 1) {

    initials = tokens[0].slice(0, 2).toUpperCase();

  } else if (tokens.length >= 2) {

    const firstChar = tokens[0].replace(/[^a-zA-Z]/g, '')[0] || tokens[0][0];

    const lastChar = tokens[tokens.length - 1].replace(/[^a-zA-Z]/g, '')[0] || tokens[tokens.length - 1][0];

    initials = (firstChar + lastChar).toUpperCase();

  } else {

    initials = displayName.slice(0, 2).toUpperCase();

  }



  const roleLabel = roleCode === 'CPSE_ADMIN' ? 'CPSE Admin' : 

                    roleCode === 'ZONE_ADMIN' ? 'Zone Admin' :

                    roleCode === 'AREA_ADMIN' ? 'Area Admin' :

                    roleCode === 'PLANT_USER' ? 'Plant User' :

                    roleCode === 'DAILY_OPERATOR' ? 'Daily Operator' :

                    (roleCode === 'NATIONAL_GOVERNANCE' ? 'National Governance' : 

                    roleCode ? roleCode.replace(/_/g, ' ') : 'Sovereign');



  return { displayName, designation, initials, roleLabel };

};



export const getRoleTier = (roleCode: string): number => {

  const code = roleCode?.toUpperCase() || '';

  if (code.includes('NATIONAL') || code.includes('GOV') || code.includes('PLATFORM')) return 6;

  if (code.includes('CPSE') || code.includes('TIER_5')) return 5;

  if (code.includes('ZONE') || code.includes('TIER_4')) return 4;

  if (code.includes('AREA') || code.includes('TIER_3')) return 3;

  if (code.includes('PLANT') || code.includes('TIER_2')) return 2;

  if (code.includes('DAILY') || code.includes('OPERATOR') || code.includes('TIER_1')) return 1;

  return 0; // Unknown

};