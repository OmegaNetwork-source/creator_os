/**
 * Paste this entire script into your browser console to get your TikTok access token
 * 
 * Open: https://creator-os-h4vg.onrender.com
 * Press F12 → Console tab
 * Paste this entire file and press Enter
 */

(function() {
    console.log('\n🔍 TikTok Token Finder\n');
    console.log('='.repeat(50));
    
    // Check all possible token keys
    const possibleKeys = [
        'tiktok_access_token',
        'tiktok_refresh_token',
        'tiktok_accessToken',
        'tiktok_refreshToken',
        'access_token',
        'refresh_token'
    ];
    
    console.log('\n📋 Checking localStorage keys...\n');
    
    let foundToken = null;
    let foundKey = null;
    
    // Check each possible key
    possibleKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`✅ Found: ${key}`);
            console.log(`   Value: ${value.substring(0, 30)}...`);
            if (key.includes('access') && !foundToken) {
                foundToken = value;
                foundKey = key;
            }
        } else {
            console.log(`❌ Not found: ${key}`);
        }
    });
    
    // Check all localStorage keys
    console.log('\n📦 All localStorage keys:');
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
        if (key.toLowerCase().includes('tiktok') || key.toLowerCase().includes('token')) {
            const value = localStorage.getItem(key);
            console.log(`   ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
        }
    });
    
    // Check sessionStorage too
    console.log('\n📦 Checking sessionStorage...');
    const sessionKeys = Object.keys(sessionStorage);
    sessionKeys.forEach(key => {
        if (key.toLowerCase().includes('tiktok') || key.toLowerCase().includes('token')) {
            const value = sessionStorage.getItem(key);
            console.log(`   ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
        }
    });
    
    // Final result
    console.log('\n' + '='.repeat(50));
    if (foundToken) {
        console.log('\n✅ ACCESS TOKEN FOUND!');
        console.log(`\nKey: ${foundKey}`);
        console.log(`Token: ${foundToken}`);
        console.log(`\n📋 Copy this for testing:`);
        console.log(`\n${foundToken}\n`);
        
        // Also copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(foundToken).then(() => {
                console.log('✅ Token copied to clipboard!');
            }).catch(() => {
                console.log('⚠️  Could not copy to clipboard automatically');
            });
        }
    } else {
        console.log('\n❌ NO ACCESS TOKEN FOUND');
        console.log('\nPossible reasons:');
        console.log('1. You are not logged in');
        console.log('2. You are on the wrong domain');
        console.log('3. localStorage is disabled (incognito mode?)');
        console.log('4. Token was cleared');
        console.log('\n💡 Try:');
        console.log('   1. Make sure you see "Connected as: [username]" on the page');
        console.log('   2. Refresh the page');
        console.log('   3. Log out and log back in');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
})();
