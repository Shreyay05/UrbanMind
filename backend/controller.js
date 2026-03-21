const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const axios = require('axios');

let complaints = [];

// --- 1. LOAD CSV DATA (municipal_complaints.csv) ---
// This fills your dashboard with 1,000 pins so it looks demo-ready
const loadCSVData = () => {
    const filePath = path.join(__dirname, 'municipal_complaints.csv');
    
    console.log("🔍 [DEBUG] Searching for CSV at:", filePath);

    if (fs.existsSync(filePath)) {
        complaints = []; // Prevent duplicates on nodemon restart
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                // Mapping CSV columns: 'complaints' and 'category'
                const rawText = row.complaints || "";
                
                // Logic to assign priority to CSV data for realistic visuals
                let priority = "Medium";
                if (/urgent|emergency|danger|fire|immediate/i.test(rawText)) priority = "High";

                complaints.push({
                    id: complaints.length + 1,
                    text: rawText,
                    category: row.category || "General",
                    priority: priority,
                    location: "City Sector " + (complaints.length % 10), // Randomizes locations for the map
                    status: "Resolved",
                    timestamp: new Date()
                });
            })
            .on('end', () => {
                console.log(`✅ [DB LOADED] ${complaints.length} historical rows ready.`);
            });
    } else {
        console.log("❌ [ERROR] municipal_complaints.csv NOT found in backend folder!");
    }
};

loadCSVData();

// --- 2. CREATE NEW COMPLAINT (Connects to your friend's app.py) ---
exports.createComplaint = async (req, res) => {
    const { text, location, citizenName } = req.body;

    if (!text) return res.status(400).json({ error: "Complaint text is required" });

    try {
        // 🔥 BRIDGE TO FASTAPI (app.py)
        // Sends {"text": "..."} to match TicketRequest in Python
        console.log("🤖 Asking AI for prediction...");
        const mlResponse = await axios.post('http://127.0.0.1:8000/predict', {
            text: text
        });

        // Your app.py returns: { "prediction": { "category": "...", "priority": "..." } }
        const { predicted_department: category, priority_level: priority } = mlResponse.data.prediction;

        const newEntry = {
            id: complaints.length + 1,
            text,
            category: category || "General",
            priority: priority || "Medium",
            location: location || "Default Zone",
            citizenName: citizenName || "Anonymous User",
            status: "Pending",
            timestamp: new Date()
        };

        complaints.push(newEntry);
        console.log(`✅ [AI SUCCESS] Category: ${category} | Priority: ${priority}`);
        res.status(201).json(newEntry);

    } catch (error) {
        console.error("⚠️ [ML OFFLINE] FastAPI is not responding. Using Fallback.");
        
        // Manual Fallback so the demo doesn't crash if the AI branch is off
        let fallbackCat = "General";
        if (/water|leak|pipe/i.test(text)) fallbackCat = "Water";
        else if (/light|power|electric/i.test(text)) fallbackCat = "Electricity";

        const fallbackEntry = {
            id: complaints.length + 1,
            text,
            category: fallbackCat,
            priority: "Low",
            location: location || "Unknown",
            status: "Pending",
            timestamp: new Date()
        };

        complaints.push(fallbackEntry);
        res.status(201).json(fallbackEntry);
    }
};

// --- 3. GET ALL COMPLAINTS ---
exports.getAllComplaints = (req, res) => {
    res.status(200).json(complaints);
};

// --- 4. GET STATS (For Dashboard Charts/Gauges) ---
exports.getStats = (req, res) => {
    const stats = {
        total: complaints.length,
        byCategory: {},
        byPriority: { High: 0, Medium: 0, Low: 0 }
    };

    complaints.forEach(c => {
        // Count by category
        stats.byCategory[c.category] = (stats.byCategory[c.category] || 0) + 1;
        // Count by priority
        if (stats.byPriority[c.priority] !== undefined) {
            stats.byPriority[c.priority]++;
        }
    });

    res.status(200).json(stats);
};