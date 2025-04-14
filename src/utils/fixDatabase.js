import { supabase } from '@/lib/supabase';

/**
 * Database Fix Tool
 * 
 * This script fixes inconsistencies in the database by ensuring that all approved
 * lawyer requests have their cases properly assigned to the lawyer.
 * 
 * Usage:
 * 1. Open the fix-database.html file in your browser
 * 2. Make sure you are logged in to the application
 * 3. Click the "Fix Database" button
 * 4. Check the log area for results
 */

/**
 * Fixes database inconsistencies by ensuring all approved lawyer requests
 * have their cases properly assigned to the lawyer
 * 
 * @param {string} userId - The ID of the user to fix cases for
 * @returns {Promise<number>} - The number of cases fixed
 */
async function fixDatabaseInconsistencies(userId) {
  console.log(`Starting database fix for user: ${userId}`);
  
  // Step 1: Get all approved lawyer requests for this user
  const { data: approvedRequests, error: requestsError } = await supabase
    .from('lawyer_requests')
    .select('*')
    .eq('lawyer_id', userId)
    .eq('status', 'approved');
  
  if (requestsError) {
    console.error('Error fetching approved requests:', requestsError);
    return 0;
  }
  
  console.log(`Found ${approvedRequests.length} approved lawyer requests`);
  
  if (approvedRequests.length === 0) {
    console.log('No approved requests found. Nothing to fix.');
    return 0;
  }
  
  // Step 2: Get all case IDs from these requests
  const caseIds = approvedRequests.map(request => request.case_id);
  console.log(`Found ${caseIds.length} cases to check`);
  
  // Step 3: Get all cases that should be assigned to this lawyer
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('*')
    .in('id', caseIds);
  
  if (casesError) {
    console.error('Error fetching cases:', casesError);
    return 0;
  }
  
  console.log(`Retrieved ${cases.length} cases from the database`);
  
  // Step 4: Check which cases need to be updated
  const casesToUpdate = cases.filter(caseItem => 
    caseItem.lawyer_id !== userId
  );
  
  console.log(`${casesToUpdate.length} cases need to be updated`);
  
  if (casesToUpdate.length === 0) {
    console.log('All cases are already correctly assigned. Nothing to fix.');
    return 0;
  }
  
  // Step 5: Update the cases
  let fixedCount = 0;
  
  for (const caseItem of casesToUpdate) {
    console.log(`Updating case ${caseItem.id} (current lawyer: ${caseItem.lawyer_id || 'none'})`);
    
    const { error: updateError } = await supabase
      .from('cases')
      .update({ lawyer_id: userId })
      .eq('id', caseItem.id);
    
    if (updateError) {
      console.error(`Error updating case ${caseItem.id}:`, updateError);
    } else {
      console.log(`Successfully updated case ${caseItem.id}`);
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} out of ${casesToUpdate.length} cases`);
  return fixedCount;
}

/**
 * Main function to run the database fix
 * This function is called when the user clicks the "Fix Database" button
 */
window.fixDatabase = async function() {
  try {
    // Get the current user from localStorage
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.error('No user found in localStorage. Please log in first.');
      return;
    }
    
    const user = JSON.parse(userJson);
    console.log(`Running fix for user: ${user.id} (${user.email})`);
    
    // Run the fix
    const fixedCount = await fixDatabaseInconsistencies(user.id);
    
    console.log(`Database fix completed. Fixed ${fixedCount} cases.`);
    console.log('The page will reload in 3 seconds...');
    
    // Reload the page after a delay
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    console.error('Error running database fix:', error);
  }
};

// Add a button to the page if we're on the cases page
if (window.location.pathname.includes('/cases')) {
  const button = document.createElement('button');
  button.textContent = 'Fix Database';
  button.style.position = 'fixed';
  button.style.bottom = '20px';
  button.style.right = '20px';
  button.style.padding = '10px 20px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '9999';
  
  button.addEventListener('click', window.fixDatabase);
  
  document.body.appendChild(button);
  console.log('Added Fix Database button to the page');
} 