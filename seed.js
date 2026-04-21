import fetch from "node-fetch";

(async () => {
    try {
        console.log("Creating user admin2@test.com on Port 5000...");
        await fetch("http://localhost:5000/api/v1/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "admin2",
                email: "admin2@test.com",
                password: "securepassword"
            })
        });

        console.log("Logging in...");
        const loginRes = await fetch("http://localhost:5000/api/v1/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "admin2@test.com",
                password: "securepassword"
            })
        });

        const loginData = await loginRes.json();
        const token = loginData?.data?.accessToken;

        if (!token) {
            console.error("Failed to acquire token. Ensure backend is running.", loginData);
            return;
        }

        console.log("Logged in! Sending test log to trigger AI...");

        const logRes = await fetch("http://localhost:5000/api/v1/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                service: "payments",
                level: "error",
                message: "Payment Gateway Timeout for user ID 109312. Transaction reversed!"
            })
        });

        const logData = await logRes.json();
        console.log("Log analysis resulting payload:", JSON.stringify(logData, null, 2));
        console.log("\n✅ SUCCESS! Use email: admin2@test.com and pass: securepassword on http://localhost:5173");

    } catch (e) {
        console.error("Error:", e.message);
    }
})();
