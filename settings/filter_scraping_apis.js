/**
 * Script to filter README files to keep only scraping-related APIs
 */

const fs = require('fs');
const path = require('path');

// Scraping-related keywords
const scrapingKeywords = [
    'scraping', 'scrape', 'scraper', 'crawler', 'crawl', 
    'extract', 'extractor', 'extraction', 'collect', 'collector',
    'harvest', 'harvester', 'gather', 'gatherer', 'download',
    'downloader', 'fetch', 'fetcher', 'parse', 'parser', 'parsing'
];

// Function to check if a line contains scraping-related keywords
function isScrapingRelated(line) {
    const lowerLine = line.toLowerCase();
    return scrapingKeywords.some(keyword => lowerLine.includes(keyword));
}

// Function to filter a README file
function filterReadme(readmePath) {
    console.log(`Processing: ${readmePath}`);
    
    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    
    const filteredLines = [];
    let inTable = false;
    let headerCount = 0;
    let keptCount = 0;
    let removedCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Keep header lines (title, back link, etc.)
        if (line.startsWith('#') || 
            line.includes('Back to') || 
            line.includes('Organized APIs') ||
            line.includes('APIs in this category') ||
            line.trim() === '' ||
            line.startsWith('---') ||
            line.startsWith('<p') ||
            line.startsWith('</p>')) {
            filteredLines.push(line);
            continue;
        }
        
        // Detect table start
        if (line.includes('| API Name |') || line.includes('|----------|')) {
            inTable = true;
            headerCount++;
            filteredLines.push(line);
            continue;
        }
        
        // Process table rows
        if (inTable && line.includes('|')) {
            // Check if this is a table row (has at least 2 pipes)
            const pipeCount = (line.match(/\|/g) || []).length;
            if (pipeCount >= 2) {
                if (isScrapingRelated(line)) {
                    filteredLines.push(line);
                    keptCount++;
                } else {
                    removedCount++;
                }
            } else {
                // End of table or separator line
                filteredLines.push(line);
                if (line.trim() === '' || line.startsWith('---')) {
                    inTable = false;
                }
            }
        } else {
            // Non-table content - keep it
            filteredLines.push(line);
        }
    }
    
    // Update the API count in the file
    let updatedContent = filteredLines.join('\n');
    
    // Update the count line if it exists
    const countMatch = updatedContent.match(/\*\*(\d+(?:,\d+)*) APIs in this category\*\*/);
    if (countMatch) {
        const newCount = keptCount.toLocaleString();
        updatedContent = updatedContent.replace(
            /\*\*(\d+(?:,\d+)*) APIs in this category\*\*/,
            `**${newCount} APIs in this category**`
        );
    }
    
    // Write the filtered content
    fs.writeFileSync(readmePath, updatedContent, 'utf-8');
    
    console.log(`  ✓ Kept: ${keptCount}, Removed: ${removedCount}`);
    
    return { kept: keptCount, removed: removedCount };
}

// Main function
function main() {
    const rootDir = path.join(__dirname, '..');
    const directories = [
        'agents-apis-697',
        'ai-apis-1208',
        'automation-apis-4825',
        'developer-tools-apis-2652',
        'ecommerce-apis-2440',
        'integrations-apis-890',
        'jobs-apis-848',
        'lead-generation-apis-3452',
        'mcp-servers-apis-131',
        'news-apis-590',
        'open-source-apis-768',
        'other-apis-1297',
        'real-estate-apis-851',
        'seo-tools-apis-710',
        'social-media-apis-3268',
        'travel-apis-397',
        'videos-apis-979'
    ];
    
    let totalKept = 0;
    let totalRemoved = 0;
    
    console.log('Filtering README files for scraping-related APIs...\n');
    
    for (const dir of directories) {
        const readmePath = path.join(rootDir, dir, 'README.md');
        if (fs.existsSync(readmePath)) {
            const result = filterReadme(readmePath);
            totalKept += result.kept;
            totalRemoved += result.removed;
        } else {
            console.log(`⚠️  README not found: ${readmePath}`);
        }
    }
    
    console.log(`\n✅ Filtering complete!`);
    console.log(`   Total kept: ${totalKept.toLocaleString()}`);
    console.log(`   Total removed: ${totalRemoved.toLocaleString()}`);
}

main();


