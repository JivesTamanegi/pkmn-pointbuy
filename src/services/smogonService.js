import axios from 'axios';

// Default CORS proxy to bypass Smogon's CORS policy in a browser environment
const DEFAULT_PROXY = 'https://corsproxy.io/?';

/**
 * Scrapes Smogon Dex for available formats (generations) directly from the browser.
 */
export async function getSmogonFormats(proxyUrl = DEFAULT_PROXY) {
  try {
    const targetUrl = 'https://www.smogon.com/dex/sv/pokemon/';
    const url = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    
    const response = await axios.get(url);

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
    
    return [{ name: 'Scarlet/Violet', shorthand: 'sv' }];
  } catch (error) {
    console.error('Error fetching Smogon formats via proxy:', error.message);
    return [{ name: 'Scarlet/Violet', shorthand: 'sv' }];
  }
}

/**
 * Gets specific tiers/formats for a generation (e.g., OU, UU, VGC) from the browser.
 */
export async function getTiersForGen(gen = 'sv', proxyUrl = DEFAULT_PROXY) {
  try {
    const targetUrl = `https://www.smogon.com/dex/${gen}/pokemon/`;
    const url = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    
    const response = await axios.get(url);

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

    const allowedTiers = ["OU", "Uber", "Ubers", "UU", "RU", "NU", "PU", "ZU", "OverUsed", "UnderUsed", "RarelyUsed", "NeverUsed", "ZeroUsed"];
    const genUpper = gen.toUpperCase();
    
    return basics.formats
      .filter(f => f.genfamily && f.genfamily.includes(genUpper))
      .filter(f => allowedTiers.includes(f.name) || allowedTiers.includes(f.shorthand))
      .map(f => ({
        name: f.name,
        shorthand: f.shorthand
      }));
  } catch (error) {
    console.error(`Error fetching tiers for gen ${gen} via proxy:`, error.message);
    return [];
  }
}

/**
 * Scrapes Smogon Dex for Pokemon tier information for a specific generation from the browser.
 */
export async function scrapeSmogonTiers(gen = 'sv', selectedTier = null, customTierPoints = null, proxyUrl = DEFAULT_PROXY) {
  try {
    const targetUrl = `https://www.smogon.com/dex/${gen}/pokemon/`;
    const url = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    
    const response = await axios.get(url);

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
    const pokemonRpc = settings.injectRpcs.find(rpc => 
      rpc[0].includes('dump-pokemon') || rpc[0].includes('dump-basics')
    );
    
    let dexData = null;
    if (pokemonRpc && pokemonRpc[1]) {
        dexData = typeof pokemonRpc[1] === 'string' ? JSON.parse(pokemonRpc[1]) : pokemonRpc[1];
    }

    if (!dexData || !dexData.pokemon) {
      throw new Error(`Could not extract Smogon Dex data for gen ${gen} via proxy.`);
    }

    const pokemonList = dexData.pokemon;
    const results = {};
    const tierOrder = ["AG", "Uber", "OU", "UUBL", "UU", "RUBL", "RU", "NUBL", "NU", "PUBL", "PU", "ZU", "Untiered"];
    const allowedTiers = ["AG", "Uber", "Ubers", "OU", "UUBL", "UU", "RUBL", "RU", "NUBL", "NU", "PUBL", "PU", "ZU", "OverUsed", "UnderUsed", "RarelyUsed", "NeverUsed", "ZeroUsed"];
    const maxTierIndex = selectedTier ? tierOrder.indexOf(selectedTier) : -1;

    pokemonList.forEach(p => {
      if (p.isNonstandard && p.isNonstandard !== 'Standard') return;
      if (p.formats && p.formats.includes('CAP')) return;

      const name = p.name;
      const tier = p.tier || (p.formats && p.formats[0]) || 'Untiered';

      if (!allowedTiers.includes(tier)) return;

      if (selectedTier && maxTierIndex !== -1) {
        const currentTierIndex = tierOrder.indexOf(tier);
        if (currentTierIndex !== -1 && currentTierIndex < maxTierIndex) return;
      }
      
      const cost = (customTierPoints && customTierPoints[tier] !== undefined) 
        ? customTierPoints[tier] 
        : ((customTierPoints && customTierPoints[tier.replace('OverUsed', 'OU').replace('UnderUsed', 'UU').replace('RarelyUsed', 'RU').replace('NeverUsed', 'NU').replace('ZeroUsed', 'ZU').replace('Uber', 'Uber')]) || 0);
      
      results[name] = cost;
    });

    return results;
  } catch (error) {
    console.error('Error fetching Smogon tiers via proxy:', error.message);
    throw error;
  }
}
