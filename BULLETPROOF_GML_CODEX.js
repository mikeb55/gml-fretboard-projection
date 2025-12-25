// BULLETPROOF GML-Codex - Global Music Library System

class GMLCodex {
    constructor() {
        this.library = {
            documents: [],
            tags: new Set(),
            index: {},
            metadata: {
                created: new Date().toISOString(),
                version: '1.0.0',
                totalDocuments: 0,
                categories: {}
            }
        };
        
        // Core taxonomy structure
        this.taxonomy = {
            genre: ['classical', 'jazz', 'popular', 'contemporary', 'world', 'electronic'],
            period: ['medieval', 'renaissance', 'baroque', 'classical', 'romantic', 'modern', 'contemporary'],
            technique: ['harmony', 'counterpoint', 'orchestration', 'arranging', 'analysis', 'composition'],
            level: ['beginner', 'intermediate', 'advanced', 'professional'],
            type: ['textbook', 'analysis', 'score', 'method', 'reference', 'article'],
            theorist: [] // Populated dynamically
        };
        
        // Search index for fast retrieval
        this.searchIndex = {
            titles: {},
            authors: {},
            topics: {},
            harmonicDevices: {},
            instruments: {}
        };
    }
    
    async ingestDocument(file, metadata = {}) {
        const document = {
            id: this.generateId(),
            filename: file.name || 'unknown',
            uploadDate: new Date().toISOString(),
            size: file.size || 0,
            type: this.detectType(file),
            metadata: {
                title: metadata.title || this.extractTitle(file.name),
                author: metadata.author || 'Unknown',
                year: metadata.year || null,
                publisher: metadata.publisher || null,
                isbn: metadata.isbn || null,
                language: metadata.language || 'en',
                pages: metadata.pages || null
            },
            content: {
                raw: null,
                extracted: null,
                structured: {},
                summary: null
            },
            tags: new Set(),
            references: [],
            citations: [],
            harmonicDevices: [],
            theoreticalConcepts: []
        };
        
        // Extract content based on file type
        if (file.type === 'application/pdf') {
            document.content.extracted = await this.extractPDFContent(file);
        } else if (file.type === 'text/plain') {
            document.content.raw = await file.text();
        }
        
        // Auto-tag based on content
        document.tags = this.autoTag(document);
        
        // Index for search
        this.indexDocument(document);
        
        // Add to library
        this.library.documents.push(document);
        this.library.metadata.totalDocuments++;
        
        return {
            success: true,
            documentId: document.id,
            message: `Document "${document.metadata.title}" ingested successfully`
        };
    }
    
    extractPDFContent(file) {
        // Placeholder for PDF extraction
        // In production, would use pdf.js or similar
        return {
            text: 'PDF content would be extracted here',
            pages: [],
            images: [],
            tables: []
        };
    }
    
    autoTag(document) {
        const tags = new Set();
        const content = document.content.raw || document.content.extracted?.text || '';
        const title = document.metadata.title.toLowerCase();
        
        // Genre detection
        if (title.includes('jazz') || content.includes('jazz')) tags.add('jazz');
        if (title.includes('classical') || content.includes('sonata')) tags.add('classical');
        if (title.includes('pop') || content.includes('popular')) tags.add('popular');
        
        // Technique detection
        if (content.includes('counterpoint')) tags.add('counterpoint');
        if (content.includes('harmony') || content.includes('harmonic')) tags.add('harmony');
        if (content.includes('orchestration')) tags.add('orchestration');
        if (content.includes('arranging') || content.includes('arrangement')) tags.add('arranging');
        
        // Composer/theorist detection
        const theorists = [
            'schoenberg', 'schenker', 'riemann', 'forte',
            'persichetti', 'hindemith', 'messiaen', 'bartok',
            'berklee', 'levine', 'russell', 'mehegan'
        ];
        
        theorists.forEach(theorist => {
            if (content.toLowerCase().includes(theorist)) {
                tags.add(theorist);
                this.taxonomy.theorist.push(theorist);
            }
        });
        
        // Harmonic device detection
        const devices = [
            'augmented sixth', 'neapolitan', 'modal interchange',
            'tritone substitution', 'altered dominant', 'quartal harmony',
            'cluster', 'polytonality', 'serialism', 'set theory'
        ];
        
        devices.forEach(device => {
            if (content.toLowerCase().includes(device)) {
                tags.add(device.replace(' ', '_'));
                document.harmonicDevices.push(device);
            }
        });
        
        return tags;
    }
    
    indexDocument(document) {
        // Title index
        const titleWords = document.metadata.title.toLowerCase().split(' ');
        titleWords.forEach(word => {
            if (!this.searchIndex.titles[word]) {
                this.searchIndex.titles[word] = [];
            }
            this.searchIndex.titles[word].push(document.id);
        });
        
        // Author index
        const author = document.metadata.author.toLowerCase();
        if (!this.searchIndex.authors[author]) {
            this.searchIndex.authors[author] = [];
        }
        this.searchIndex.authors[author].push(document.id);
        
        // Topic index
        document.tags.forEach(tag => {
            if (!this.searchIndex.topics[tag]) {
                this.searchIndex.topics[tag] = [];
            }
            this.searchIndex.topics[tag].push(document.id);
        });
        
        // Harmonic devices index
        document.harmonicDevices.forEach(device => {
            if (!this.searchIndex.harmonicDevices[device]) {
                this.searchIndex.harmonicDevices[device] = [];
            }
            this.searchIndex.harmonicDevices[device].push(document.id);
        });
    }
    
    search(query, filters = {}) {
        const results = [];
        const queryLower = query.toLowerCase();
        
        // Search in titles
        Object.keys(this.searchIndex.titles).forEach(word => {
            if (word.includes(queryLower)) {
                results.push(...this.searchIndex.titles[word]);
            }
        });
        
        // Search in topics
        Object.keys(this.searchIndex.topics).forEach(topic => {
            if (topic.includes(queryLower)) {
                results.push(...this.searchIndex.topics[topic]);
            }
        });
        
        // Remove duplicates
        const uniqueResults = [...new Set(results)];
        
        // Apply filters
        let filtered = uniqueResults.map(id => 
            this.library.documents.find(doc => doc.id === id)
        );
        
        if (filters.genre) {
            filtered = filtered.filter(doc => doc.tags.has(filters.genre));
        }
        if (filters.year) {
            filtered = filtered.filter(doc => doc.metadata.year === filters.year);
        }
        if (filters.technique) {
            filtered = filtered.filter(doc => doc.tags.has(filters.technique));
        }
        
        return filtered;
    }
    
    export(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.library, (key, value) => {
                if (value instanceof Set) {
                    return Array.from(value);
                }
                return value;
            }, 2);
        } else if (format === 'csv') {
            let csv = 'ID,Title,Author,Year,Tags,Harmonic Devices\n';
            this.library.documents.forEach(doc => {
                csv += `"${doc.id}","${doc.metadata.title}","${doc.metadata.author}",`;
                csv += `"${doc.metadata.year}","${Array.from(doc.tags).join(';')}",`;
                csv += `"${doc.harmonicDevices.join(';')}"\n`;
            });
            return csv;
        } else if (format === 'llm_training') {
            // Format optimized for LLM training
            return this.library.documents.map(doc => ({
                prompt: `Analyze ${doc.metadata.title} by ${doc.metadata.author}`,
                completion: doc.content.summary || doc.content.extracted?.text || '',
                metadata: {
                    tags: Array.from(doc.tags),
                    devices: doc.harmonicDevices,
                    concepts: doc.theoreticalConcepts
                }
            }));
        }
    }
    
    generateId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    extractTitle(filename) {
        return filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
    }
    
    detectType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'textbook',
            'txt': 'notes',
            'md': 'notes',
            'xml': 'score',
            'musicxml': 'score',
            'json': 'data'
        };
        return typeMap[extension] || 'document';
    }
    
    // Advanced queries for compositional assistance
    getHarmonicProgressions(style = 'all') {
        const progressions = [];
        this.library.documents.forEach(doc => {
            if (style === 'all' || doc.tags.has(style)) {
                // Extract progression patterns from content
                // This would parse actual content in production
                progressions.push({
                    source: doc.metadata.title,
                    progressions: doc.harmonicDevices
                });
            }
        });
        return progressions;
    }
    
    getOrchestrationTechniques(instrument = 'all') {
        const techniques = [];
        this.library.documents.forEach(doc => {
            if (doc.tags.has('orchestration')) {
                techniques.push({
                    source: doc.metadata.title,
                    instrument: instrument,
                    techniques: doc.theoreticalConcepts.filter(c => 
                        instrument === 'all' || c.includes(instrument)
                    )
                });
            }
        });
        return techniques;
    }
}

// Export for use
if (typeof module !== 'undefined') module.exports = GMLCodex;
if (typeof window !== 'undefined') window.GMLCodex = GMLCodex;

// Create HTML interface
const codexHTML = `<!DOCTYPE html>
<html>
<head>
    <title>GML-Codex Library System</title>
    <style>
        body { font-family: Arial; background: #1a1a2e; color: white; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #4CAF50; }
        input, select { padding: 10px; margin: 5px; }
        button { background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; }
        #results { background: rgba(0,0,0,0.5); padding: 20px; margin-top: 20px; border-radius: 10px; }
        .document { background: rgba(255,255,255,0.1); padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>GML-Codex: Musical Knowledge Library</h1>
        
        <div>
            <input type="file" id="fileInput" accept=".pdf,.txt,.md" multiple>
            <button onclick="uploadDocuments()">Upload Documents</button>
        </div>
        
        <div>
            <input type="text" id="searchInput" placeholder="Search library...">
            <select id="filterGenre">
                <option value="">All Genres</option>
                <option value="classical">Classical</option>
                <option value="jazz">Jazz</option>
                <option value="popular">Popular</option>
            </select>
            <button onclick="searchLibrary()">Search</button>
        </div>
        
        <div>
            <button onclick="exportLibrary('json')">Export JSON</button>
            <button onclick="exportLibrary('csv')">Export CSV</button>
            <button onclick="exportLibrary('llm_training')">Export for LLM Training</button>
        </div>
        
        <div id="results"></div>
    </div>
    
    <script src="BULLETPROOF_GML_CODEX.js"></script>
    <script>
        const codex = new GMLCodex();
        
        async function uploadDocuments() {
            const files = document.getElementById('fileInput').files;
            for (let file of files) {
                const result = await codex.ingestDocument(file);
                console.log(result.message);
            }
            alert('Documents uploaded: ' + files.length);
        }
        
        function searchLibrary() {
            const query = document.getElementById('searchInput').value;
            const genre = document.getElementById('filterGenre').value;
            const results = codex.search(query, { genre: genre });
            
            let html = '<h3>Search Results (' + results.length + ')</h3>';
            results.forEach(doc => {
                html += '<div class="document">';
                html += '<h4>' + doc.metadata.title + '</h4>';
                html += '<p>Author: ' + doc.metadata.author + '</p>';
                html += '<p>Tags: ' + Array.from(doc.tags).join(', ') + '</p>';
                html += '</div>';
            });
            
            document.getElementById('results').innerHTML = html;
        }
        
        function exportLibrary(format) {
            const data = codex.export(format);
            const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], 
                { type: format === 'csv' ? 'text/csv' : 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gml_codex_export.' + (format === 'csv' ? 'csv' : 'json');
            a.click();
        }
    </script>
</body>
</html>`;

// Save HTML interface
require('fs').writeFileSync('gml_codex_interface.html', codexHTML);
console.log('GML-Codex system created successfully');
