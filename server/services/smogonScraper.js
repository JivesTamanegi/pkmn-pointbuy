const axios = require('axios');
const cheerio = require('cheerio');
const tierPointsMap = require('../config/tier_points.json');

/**
 * Scrapes Smogon Dex for available formats (generations).
 */
async function getSmogonFormats() {
  try {
    const url = 'https://www.smogon.com/dex/sv/pokemon/';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const html = response.data;
    const startIndex = html.indexOf('dexSettings =');
    if (startIndex === -1) throw new Error('Could not find dexSettings in HTML');
    
    const jsonStart = html.indexOf('{', startIndex);
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < html.length; i++) {
        if (html[i] === '{') braceCount++;
        else if (html[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
        }
    }
    
    if (jsonEnd === -1) throw new Error('Could not parse dexSettings JSON');
    
    const settings = JSON.parse(html.substring(jsonStart, jsonEnd));
    const gensRpc = settings.injectRpcs.find(rpc => rpc[0].includes('dump-gens'));
    
    if (gensRpc && gensRpc[1]) {
        return gensRpc[1].map(g => ({
            name: g.name,
            shorthand: g.shorthand.toLowerCase()
        }));
    }
    
    return [{ name: 'Scarlet/Violet', shorthand: 'sv' }]; // Fallback
  } catch (error) {
    console.error('Error fetching Smogon formats:', error.message);
    return [{ name: 'Scarlet/Violet', shorthand: 'sv' }];
  }
}

/**
 * Gets specific tiers/formats for a generation (e.g., OU, UU, VGC).
 */
async function getTiersForGen(gen = 'sv') {
  try {
    const url = `https://www.smogon.com/dex/${gen}/pokemon/`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const html = response.data;
    const startIndex = html.indexOf('dexSettings =');
    if (startIndex === -1) throw new Error('Could not find dexSettings in HTML');
    
    const jsonStart = html.indexOf('{', startIndex);
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < html.length; i++) {
        if (html[i] === '{') braceCount++;
        else if (html[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
        }
    }
    
    if (jsonEnd === -1) throw new Error('Could not parse dexSettings JSON');
    
    const settings = JSON.parse(html.substring(jsonStart, jsonEnd));
    const basicsRpc = settings.injectRpcs.find(rpc => rpc[0].includes('dump-basics'));
    
    if (!basicsRpc || !basicsRpc[1]) return [];
    
    const basics = typeof basicsRpc[1] === 'string' ? JSON.parse(basicsRpc[1]) : basicsRpc[1];
    if (!basics.formats) return [];

    // List of allowed tiers as requested by the user
    const allowedTiers = ["OU", "Uber", "Ubers", "UU", "RU", "NU", "PU", "ZU", "OverUsed", "Uber", "UnderUsed", "RarelyUsed", "NeverUsed", "PU", "ZU"];
    
    // Map Smogon shorthand to our tier shorthand for easier comparison
    const genUpper = gen.toUpperCase();
    return basics.formats
      .filter(f => f.genfamily && f.genfamily.includes(genUpper))
      .filter(f => allowedTiers.includes(f.name) || allowedTiers.includes(f.shorthand))
      .map(f => ({
        name: f.name,
        shorthand: f.shorthand
      }));
  } catch (error) {
    console.error(`Error fetching tiers for gen ${gen}:`, error.message);
    return [];
  }
}

/**
 * Scrapes Smogon Dex for Pokemon tier information for a specific generation.
 */
async function scrapeSmogonTiers(gen = 'sv', selectedTier = null, customTierPoints = null) {
  try {
    const url = `https://www.smogon.com/dex/${gen}/pokemon/`;
    
    console.log(`Fetching Smogon Dex from: ${url} (Tier: ${selectedTier || 'All'})`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    const html = response.data;
    const startIndex = html.indexOf('dexSettings =');
    if (startIndex === -1) throw new Error('Could not find dexSettings in HTML');
    
    const jsonStart = html.indexOf('{', startIndex);
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < html.length; i++) {
        if (html[i] === '{') braceCount++;
        else if (html[i] === '}') braceCount--;
        
        if (braceCount === 0) {
            jsonEnd = i + 1;
            break;
        }
    }
    
    if (jsonEnd === -1) throw new Error('Could not parse dexSettings JSON');
    
    const settings = JSON.parse(html.substring(jsonStart, jsonEnd));
    
    // Look for dump-pokemon or dump-basics
    const pokemonRpc = settings.injectRpcs.find(rpc => 
      rpc[0].includes('dump-pokemon') || rpc[0].includes('dump-basics')
    );
    
    let dexData = null;
    if (pokemonRpc && pokemonRpc[1]) {
        dexData = typeof pokemonRpc[1] === 'string' ? JSON.parse(pokemonRpc[1]) : pokemonRpc[1];
    }

    if (!dexData || !dexData.pokemon) {
      throw new Error(`Could not extract Smogon Dex data for gen ${gen} from HTML response.`);
    }

    const pokemonList = dexData.pokemon;
    const results = {};

    // Define tier order for filtering (from highest to lowest)
    const tierOrder = ["AG", "Uber", "OU", "UUBL", "UU", "RUBL", "RU", "NUBL", "NU", "PUBL", "PU", "ZU", "Untiered"];
    
    // List of allowed tiers as requested by the user
    // We include AG because it's higher than Ubers, and BL tiers as they are part of the competitive landscape for these tiers
    const allowedTiers = ["AG", "Uber", "Ubers", "OU", "UUBL", "UU", "RUBL", "RU", "NUBL", "NU", "PUBL", "PU", "ZU", "OverUsed", "UnderUsed", "RarelyUsed", "NeverUsed", "ZeroUsed"];
    
    const maxTierIndex = selectedTier ? tierOrder.indexOf(selectedTier) : -1;

    pokemonList.forEach(p => {
      // Exclude CAP and non-standard (illegal) Pokemon
      // Explicitly check for 'CAP' in isNonstandard or formats
      if (p.isNonstandard && p.isNonstandard !== 'Standard') {
        return;
      }
      
      if (p.formats && p.formats.includes('CAP')) {
        return;
      }

      const name = p.name;
      const tier = p.tier || (p.formats && p.formats[0]) || 'Untiered';

      // Even if "All Tiers" is selected, we only want to show Pokemon from the allowed formats
      // This excludes things like LC, NFE, Untiered, etc.
      if (!allowedTiers.includes(tier)) {
        return;
      }

      // If a specific tier is selected, exclude Pokemon in higher tiers
      if (selectedTier && maxTierIndex !== -1) {
        const currentTierIndex = tierOrder.indexOf(tier);
        // If current tier is higher than selected tier (lower index in tierOrder), exclude it
        // Or if it's not in the list at all (like LC which we treat separately)
        if (currentTierIndex !== -1 && currentTierIndex < maxTierIndex) {
          return;
        }
        
        // Special case for formats like VGC or BH that might not be in tierOrder
        // If selectedTier is not in tierOrder, we might need a different filtering logic
        // But the user probably means Smogon tiers (OU, UU, etc.)
      }
      
      const cost = (customTierPoints && customTierPoints[tier] !== undefined) 
        ? customTierPoints[tier] 
        : (tierPointsMap[tier] || 0);
      results[name] = cost;
    });

    console.log(`Successfully fetched ${Object.keys(results).length} Pokemon for gen ${gen}.`);
    return results;
  } catch (error) {
    console.error('Error fetching Smogon tiers:', error.message);
    throw error;
  }
}

module.exports = { scrapeSmogonTiers, getSmogonFormats, getTiersForGen };