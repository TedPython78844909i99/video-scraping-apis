/**
 * Script to update the main README.md with correct counts and focus on scraping APIs
 */

const fs = require('fs');
const path = require('path');

// Category counts from the filtering script results
const categoryCounts = {
    'agents-apis-697': 496,
    'ai-apis-1208': 775,
    'automation-apis-4825': 4091,
    'developer-tools-apis-2652': 2023,
    'ecommerce-apis-2440': 2214,
    'integrations-apis-890': 620,
    'jobs-apis-848': 791,
    'lead-generation-apis-3452': 3102,
    'mcp-servers-apis-131': 49,
    'news-apis-590': 524,
    'open-source-apis-768': 504,
    'other-apis-1297': 1007,
    'real-estate-apis-851': 779,
    'seo-tools-apis-710': 466,
    'social-media-apis-3268': 2929,
    'travel-apis-397': 363,
    'videos-apis-979': 899
};

const categoryNames = {
    'agents-apis-697': 'Agents',
    'ai-apis-1208': 'AI',
    'automation-apis-4825': 'Automation',
    'developer-tools-apis-2652': 'Developer Tools',
    'ecommerce-apis-2440': 'Ecommerce',
    'integrations-apis-890': 'Integrations',
    'jobs-apis-848': 'Jobs',
    'lead-generation-apis-3452': 'Lead Generation',
    'mcp-servers-apis-131': 'MCP Servers',
    'news-apis-590': 'News',
    'open-source-apis-768': 'Open Source',
    'other-apis-1297': 'Other',
    'real-estate-apis-851': 'Real Estate',
    'seo-tools-apis-710': 'SEO Tools',
    'social-media-apis-3268': 'Social Media',
    'travel-apis-397': 'Travel',
    'videos-apis-979': 'Videos'
};

const totalAPIs = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);
const totalCategories = Object.keys(categoryCounts).length;

// Scraping-related keywords
const scrapingKeywords = [
    'scraping', 'scrape', 'scraper', 'crawler', 'crawl', 
    'extract', 'extractor', 'extraction', 'collect', 'collector',
    'harvest', 'harvester', 'gather', 'gatherer', 'download',
    'downloader', 'fetch', 'fetcher', 'parse', 'parser', 'parsing'
];

function isScrapingRelated(line) {
    const lowerLine = line.toLowerCase();
    return scrapingKeywords.some(keyword => lowerLine.includes(keyword));
}

function main() {
    const readmePath = path.join(__dirname, '..', 'README.md');
    let content = fs.readFileSync(readmePath, 'utf-8');
    
    // Update title and description
    content = content.replace(
        /# 🚀 API Mega List/g,
        '# 🚀 Scraping APIs for Developers'
    );
    
    content = content.replace(
        /\*\*The most comprehensive collection of APIs on GitHub\*\* - \d+ ready-to-use APIs/g,
        `**The most comprehensive collection of scraping APIs on GitHub** - ${totalAPIs.toLocaleString()} ready-to-use scraping APIs`
    );
    
    // Update badges
    content = content.replace(
        /<img src="https:\/\/img\.shields\.io\/badge\/APIs-\d+(?:,\d+)*-blue/g,
        `<img src="https://img.shields.io/badge/APIs-${totalAPIs.toLocaleString()}-blue`
    );
    
    content = content.replace(
        /<img src="https:\/\/img\.shields\.io\/badge\/Categories-\d+-green/g,
        `<img src="https://img.shields.io/badge/Categories-${totalCategories}-green`
    );
    
    // Update statistics table
    content = content.replace(
        /\|\s*\*\*Total APIs\*\*\s*\|\s*\*\*\d+(?:,\d+)*\*\*\s*\|/,
        `| **Total APIs** | **${totalAPIs.toLocaleString()}** |`
    );
    
    content = content.replace(
        /\|\s*\*\*Categories\*\*\s*\|\s*\*\*\d+\*\*\s*\|/,
        `| **Categories** | **${totalCategories}** |`
    );
    
    // Update "What Can You Build" section
    content = content.replace(
        /This collection contains \*\*\d+(?:,\d+)* ready-to-use APIs\*\*/g,
        `This collection contains **${totalAPIs.toLocaleString()} ready-to-use scraping APIs**`
    );
    
    // Update table of contents
    const tocStart = content.indexOf('## 📚 Table of Contents');
    const tocEnd = content.indexOf('---', tocStart + 1);
    
    if (tocStart !== -1 && tocEnd !== -1) {
        let newTOC = '## 📚 Table of Contents\n\n';
        
        // Sort categories by name
        const sortedCategories = Object.keys(categoryCounts).sort((a, b) => 
            categoryNames[a].localeCompare(categoryNames[b])
        );
        
        for (const dir of sortedCategories) {
            const name = categoryNames[dir];
            const count = categoryCounts[dir];
            newTOC += `- [${name}](./${dir}/) - ${count.toLocaleString()} APIs\n`;
        }
        
        newTOC += '\n---\n\n';
        
        content = content.substring(0, tocStart) + newTOC + content.substring(tocEnd);
    }
    
    // Remove Business category section if it exists
    content = content.replace(/- \[Business\]\(\.\/business-apis-2\/\) - \d+ APIs\n/g, '');
    content = content.replace(/<a id="business"><\/a>\n\n## Business[\s\S]*?---\n\n/g, '');
    
    // Filter all API entries in the main content to only show scraping-related ones
    const lines = content.split('\n');
    const filteredLines = [];
    let inCategorySection = false;
    let currentCategory = '';
    let skipUntilNextCategory = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect category section start
        if (line.match(/^<a id="[^"]+"><\/a>$/)) {
            inCategorySection = true;
            skipUntilNextCategory = false;
            filteredLines.push(line);
            continue;
        }
        
        if (line.match(/^## [^#]/) && inCategorySection) {
            // New category or end of category section
            const categoryMatch = line.match(/^## (.+)$/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1];
                // Check if this is Business category
                if (currentCategory === 'Business') {
                    skipUntilNextCategory = true;
                    continue;
                }
            }
            filteredLines.push(line);
            continue;
        }
        
        if (skipUntilNextCategory) {
            // Skip until we hit the next category or section
            if (line.match(/^## [^#]/) || line.match(/^---$/)) {
                skipUntilNextCategory = false;
                if (line.match(/^## [^#]/)) {
                    filteredLines.push(line);
                }
            }
            continue;
        }
        
        // In a category section, filter table rows
        if (inCategorySection && line.includes('|') && line.includes('https://apify.com')) {
            if (isScrapingRelated(line)) {
                filteredLines.push(line);
            }
            // Skip non-scraping entries
        } else {
            // Keep all other lines
            filteredLines.push(line);
        }
        
        // Detect end of category section
        if (line.match(/^---$/) && inCategorySection && i > 0 && lines[i-1].trim() === '') {
            inCategorySection = false;
        }
    }
    
    content = filteredLines.join('\n');
    
    // Update category counts in the main content sections
    for (const [dir, count] of Object.entries(categoryCounts)) {
        const name = categoryNames[dir];
        // Update count in category header
        const regex = new RegExp(`(\\*\\*${name}[^|]*\\| [^\\n]*\\*\\*\\d+(?:,\\d+)* APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex, `**${count.toLocaleString()} APIs in this category**`);
        
        // Also update standalone count lines
        const regex2 = new RegExp(`(## ${name}[\\s\\S]*?\\*\\*)\\d+(?:,\\d+)*( APIs in this category\\*\\*)`, 'g');
        content = content.replace(regex2, `$1${count.toLocaleString()}$2`);
    }
    
    // Write updated content
    fs.writeFileSync(readmePath, content, 'utf-8');
    
    console.log('✅ Main README.md updated successfully!');
    console.log(`   Total APIs: ${totalAPIs.toLocaleString()}`);
    console.log(`   Categories: ${totalCategories}`);
}

main();


