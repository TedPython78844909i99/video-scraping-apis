/**
 * Script to generate a clean, organized README.md with all Apify Actors
 */

const fs = require('fs');

// Read the JSON file
const actors = JSON.parse(fs.readFileSync('apify_actors.json', 'utf-8'));

console.log(`Processing ${actors.length} actors...`);
console.log(`Filtering out test/placeholder actors...`);

// Function to check if an actor should be filtered out (test/placeholder actors)
function shouldFilterActor(actor) {
    const title = (actor.title || actor.name || '').toLowerCase();
    const name = (actor.name || '').toLowerCase();
    
    // Filter patterns
    const filterPatterns = [
        /^my actor/i,           // "My Actor", "My Actor 1", "My Actor 29", etc.
        /^testactor/i,          // "testactor", "TestActor"
        /^test crawler/i,       // "test Crawler", "TEST CRAWLER"
        /^test actor/i,         // "Test Actor"
        /^my actorrr/i,         // "My Actorrr"
        /^my actor\s*\d+$/i,   // "My Actor 1", "My Actor 29", etc.
        /^test\s*$/i,          // Just "test"
        /^test\s+crawler/i,    // "test crawler", "TEST CRAWLER CMS"
    ];
    
    // Check if title matches any filter pattern
    for (const pattern of filterPatterns) {
        if (pattern.test(title) || pattern.test(name)) {
            return true;
        }
    }
    
    // Also filter if description is just "test" or very short placeholder text
    const description = (actor.description || '').toLowerCase().trim();
    if (description === 'test' || description === '') {
        // Only filter if title also looks like a placeholder
        if (title.includes('my actor') || title.includes('test')) {
            return true;
        }
    }
    
    return false;
}

// Function to convert category name to readable format and anchor
function formatCategoryName(category) {
    const acronyms = {
        'AI': 'AI',
        'MCP': 'MCP',
        'SEO': 'SEO',
        'API': 'API'
    };
    
    let readable = category
        .split('_')
        .map(word => {
            const upper = word.toUpperCase();
            if (acronyms[upper]) {
                return acronyms[upper];
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
    
    if (readable === 'Ai') readable = 'AI';
    if (readable === 'Mcp Servers') readable = 'MCP Servers';
    if (readable === 'Seo Tools') readable = 'SEO Tools';
    
    const anchor = readable.toLowerCase().replace(/\s+/g, '-');
    
    return { readable, anchor };
}

// Organize actors by category
const actorsByCategory = {};
const uncategorized = [];
let filteredCount = 0;

for (const actor of actors) {
    // Filter out test/placeholder actors
    if (shouldFilterActor(actor)) {
        filteredCount++;
        continue;
    }
    const categories = actor.categories || [];
    if (categories.length > 0) {
        for (const category of categories) {
            if (!actorsByCategory[category]) {
                actorsByCategory[category] = [];
            }
            const exists = actorsByCategory[category].some(a => 
                a.name === actor.name && a.username === actor.username
            );
            if (!exists) {
                actorsByCategory[category].push(actor);
            }
        }
    } else {
        uncategorized.push(actor);
    }
}

const sortedCategories = Object.keys(actorsByCategory).sort();
const totalActors = actors.length - filteredCount;

// Generate README content
let content = `# 🚀 API Mega List\n\n`;
content += `> **The most comprehensive collection of APIs on GitHub** - ${totalActors.toLocaleString()} ready-to-use APIs for building everything from simple automations to full-scale applications.\n\n`;

content += `---\n\n`;

// Statistics section with badges
content += `## 📊 Collection Statistics\n\n`;
content += `| Metric | Count |\n`;
content += `|--------|-------|\n`;
content += `| **Total APIs** | **${totalActors.toLocaleString()}** |\n`;
content += `| **Categories** | **${sortedCategories.length}** |\n`;
content += `| **Last Updated** | ${new Date().toISOString().split('T')[0]} |\n\n`;

content += `### 📁 Available Formats\n\n`;
content += `- **[APIFY_ACTORS.md](APIFY_ACTORS.md)** - Complete markdown list (~8.3 MB)\n`;
content += `- **[apify_actors.json](apify_actors.json)** - Full JSON dataset (~11.6 MB)\n`;
content += `- **[apify_actors_simple.txt](apify_actors_simple.txt)** - Simple text format (~996 KB)\n\n`;

content += `---\n\n`;

// What are Apify Actors section
content += `## 🤔 What are Apify Actors?\n\n`;
content += `Apify Actors are pre-built web scraping and automation tools that can extract data from websites, automate workflows, and integrate with AI applications. Each actor is a ready-to-use API that you can run via the Apify platform.\n\n`;
content += `**All links in this collection include affiliate tracking** (\`?fpr=p2hrc6\`) - clicking any API link supports this project! 🎉\n\n`;

content += `---\n\n`;

// Table of Contents - simple list format
content += `## 📚 Table of Contents\n\n`;

for (const category of sortedCategories) {
    const count = actorsByCategory[category].length;
    const { anchor, readable } = formatCategoryName(category);
    content += `- [${readable}](#${anchor}) - ${count.toLocaleString()} APIs\n`;
}

if (uncategorized.length > 0) {
    content += `- [Uncategorized](#uncategorized) - ${uncategorized.length.toLocaleString()} APIs\n`;
}

content += `\n`;

content += `---\n\n`;

// Write categorized actors with better formatting
for (const category of sortedCategories) {
    const categoryActors = actorsByCategory[category];
    const { readable, anchor } = formatCategoryName(category);
    
    content += `<a id="${anchor}"></a>\n\n`;
    content += `## ${readable}\n\n`;
    content += `<p align="right"><a href="#-table-of-contents">↑ Back to top</a></p>\n\n`;
    content += `**${categoryActors.length.toLocaleString()} APIs in this category**\n\n`;
    
    // Sort actors by title
    const sortedActors = categoryActors.sort((a, b) => 
        (a.title || a.name || '').localeCompare(b.title || b.name || '')
    );
    
    // Create table header
    content += `| API Name | Description |\n`;
    content += `|----------|-------------|\n`;
    
    // Add each actor as a table row
    for (const actor of sortedActors) {
        const title = actor.title || actor.name || 'Unknown';
        const affiliateUrl = actor.affiliate_url || actor.url || '';
        const description = actor.description || '';
        
        // Truncate descriptions at word boundaries
        const maxDescLength = 200;
        let shortDescription = description;
        if (description.length > maxDescLength) {
            let cutPoint = maxDescLength;
            const lastSpace = description.lastIndexOf(' ', maxDescLength);
            if (lastSpace > maxDescLength * 0.8) {
                cutPoint = lastSpace;
            }
            shortDescription = description.substring(0, cutPoint).trim() + '...';
        }
        
        // Clean up title - remove extra brackets if present
        let cleanTitle = title;
        if (cleanTitle.startsWith('[') && cleanTitle.includes(']')) {
            cleanTitle = cleanTitle.replace(/^\[([^\]]+)\]\s*/, '$1 ');
        }
        
        // Escape pipe characters and newlines for table format
        cleanTitle = cleanTitle.replace(/\|/g, '&#124;').replace(/\n/g, ' ');
        const safeDescription = (shortDescription || '').replace(/\|/g, '&#124;').replace(/\n/g, ' ');
        
        if (safeDescription) {
            content += `| [${cleanTitle}](${affiliateUrl}) | ${safeDescription} |\n`;
        } else {
            content += `| [${cleanTitle}](${affiliateUrl}) | - |\n`;
        }
    }
    
    content += `\n`;
}

// Write uncategorized actors
if (uncategorized.length > 0) {
    content += `<a id="uncategorized"></a>\n\n`;
    content += `## Uncategorized\n\n`;
    content += `<p align="right"><a href="#-table-of-contents">↑ Back to top</a></p>\n\n`;
    content += `**${uncategorized.length.toLocaleString()} APIs in this category**\n\n`;
    
    const sortedUncategorized = uncategorized.sort((a, b) => 
        (a.title || a.name || '').localeCompare(b.title || b.name || '')
    );
    
    // Create table header
    content += `| API Name | Description |\n`;
    content += `|----------|-------------|\n`;
    
    for (const actor of sortedUncategorized) {
        const title = actor.title || actor.name || 'Unknown';
        const affiliateUrl = actor.affiliate_url || actor.url || '';
        const description = actor.description || '';
        
        const maxDescLength = 200;
        let shortDescription = description;
        if (description.length > maxDescLength) {
            let cutPoint = maxDescLength;
            const lastSpace = description.lastIndexOf(' ', maxDescLength);
            if (lastSpace > maxDescLength * 0.8) {
                cutPoint = lastSpace;
            }
            shortDescription = description.substring(0, cutPoint).trim() + '...';
        }
        
        let cleanTitle = title;
        if (cleanTitle.startsWith('[') && cleanTitle.includes(']')) {
            cleanTitle = cleanTitle.replace(/^\[([^\]]+)\]\s*/, '$1 ');
        }
        
        // Escape pipe characters and newlines for table format
        cleanTitle = cleanTitle.replace(/\|/g, '&#124;').replace(/\n/g, ' ');
        const safeDescription = (shortDescription || '').replace(/\|/g, '&#124;').replace(/\n/g, ' ');
        
        if (safeDescription) {
            content += `| [${cleanTitle}](${affiliateUrl}) | ${safeDescription} |\n`;
        } else {
            content += `| [${cleanTitle}](${affiliateUrl}) | - |\n`;
        }
    }
    content += `\n`;
}

content += `---\n\n`;

// Usage section
content += `## 🚀 How to Use\n\n`;
content += `1. **Browse by Category** - Use the table of contents above to jump to any category\n`;
content += `2. **Click Any API** - All links include affiliate tracking and take you to the Apify platform\n`;
content += `3. **View Documentation** - Each API page has full documentation, examples, and pricing\n`;
content += `4. **Run via API** - All actors can be run programmatically via Apify's API\n`;
content += `5. **Schedule Runs** - Set up automated schedules for regular data collection\n\n`;

content += `---\n\n`;

// Notes section
content += `## 📝 Notes\n\n`;
content += `- ✅ All APIs are sorted alphabetically within their categories\n`;
content += `- ✅ Descriptions are optimized for readability (truncated to ~150 characters)\n`;
content += `- ✅ For full descriptions and details, visit the individual API pages\n`;
content += `- ✅ This list is automatically generated from the Apify Store API\n`;
content += `- ✅ All links include affiliate tracking (\`?fpr=p2hrc6\`)\n\n`;

content += `---\n\n`;

// Footer
content += `<div align="center">\n\n`;
content += `**Total APIs: ${totalActors.toLocaleString()}** | `;
content += `**Categories: ${sortedCategories.length}** | `;
content += `**Last Updated: ${new Date().toISOString().split('T')[0]}**\n\n`;
content += `*One of the most valuable API lists on GitHub—period.* 💪\n\n`;
content += `</div>\n`;

// Write to README.md
fs.writeFileSync('README.md', content, 'utf-8');
console.log(`✅ Clean README.md generated successfully!`);
console.log(`   - ${sortedCategories.length} categories`);
console.log(`   - ${(actors.length - filteredCount).toLocaleString()} total APIs (${filteredCount} filtered out)`);
console.log(`   - ${uncategorized.length.toLocaleString()} uncategorized APIs`);

