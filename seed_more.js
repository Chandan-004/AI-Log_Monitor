import fetch from "node-fetch";

(async () => {
    try {
        const API_URL = process.env.API_URL || "http://localhost:5000";
        console.log(`Logging in to get token from ${API_URL}...`);
        const loginRes = await fetch(`${API_URL}/api/v1/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin2@test.com",
                password: "securepassword"
            })
        });
        
        const loginData = await loginRes.json();
        const token = loginData?.data?.accessToken || loginData?.accessToken;
        
        if(!token) {
            console.error("Login failed. Is the backend on Port 5000?");
            return;
        }

        const logs = [
            { source: "auth-service", level: "info", message: "User admin@company.com successfully changed their password." },
            { source: "database", level: "warning", message: "Query execution took 4500ms on table 'users'. Consider indexing." },
            { source: "security", level: "critical", message: "Multiple failed root login attempts detected from IP 192.168.1.55! Possible brute force." },
            { source: "frontend", level: "error", message: "React hydration mismatch on route /dashboard. User interface crashed." },
            { source: "storage", level: "warning", message: "Disk space on Volume D: is at 88% capacity. Please clear old backup files." }
        ];

        console.log("Injecting 5 highly varied logs to test AI intelligence...\n");

        for (const log of logs) {
            console.log(`Sending [${log.level.toUpperCase()}] log: ${log.source}...`);
            await fetch(`${API_URL}/api/v1/logs`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(log)
            });
            await new Promise(r => setTimeout(r, 1000)); 
        }
        
        console.log("\n✅ ALL POSTS INJECTED! Go click 'Refresh Feed' on your React Dashboard to see the AI analyze them!");

    } catch (e) {
        console.error("Error:", e.message);
    }
})();
