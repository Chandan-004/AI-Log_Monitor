document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const logsTableBody = document.getElementById('logs-table-body');
    const filterLevel = document.getElementById('filter-level');
    const createLogForm = document.getElementById('create-log-form');
    const logoutBtn = document.getElementById('logout-btn');
    const searchInput = document.getElementById('search-logs');
    const modal = document.getElementById('log-modal');

    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statCritical = document.getElementById('stat-critical');
    const statWarning = document.getElementById('stat-warning');

    // State
    let logs = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    // --- Initialization ---

    init();

    async function init() {
        checkAuth();
        await fetchLogs();
        setupEventListeners();
        updateStats(); // Initial stats calculation
    }

    function checkAuth() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = 'login.html';
        }
    }

    // --- Data Fetching ---

    async function fetchLogs() {
        try {
            logsTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">Loading logs...</td></tr>';

            const level = filterLevel.value;
            const query = { limit: 100 }; // Fetch last 100 for now
            if (level) query.level = level;

            const response = await api.get('/logs', query);

            if (response && response.data) {
                logs = response.data; // Assuming API returns { data: [...] }
                renderLogs(logs);
                updateStats();
            } else {
                logsTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>';
            }
        } catch (error) {
            logsTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-red-400">Error loading logs: ${error.message}</td></tr>`;
        }
    }

    // --- Rendering ---

    function renderLogs(logsToRender) {
        logsTableBody.innerHTML = '';

        if (logsToRender.length === 0) {
            logsTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>';
            return;
        }

        logsToRender.forEach(log => {
            const row = document.createElement('tr');
            row.className = 'log-row border-b border-gray-800/50 hover:bg-gray-800/30';

            const date = new Date(log.created_at || Date.now()).toLocaleString();
            const badgeColor = getLevelBadgeColor(log.level);

            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-gray-400 text-xs">${date}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${badgeColor}">
                        ${log.level.toUpperCase()}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-300 font-medium">${log.source || 'Unknown'}</td>
                <td class="px-6 py-4 text-gray-300 text-sm truncate max-w-xs" title="${log.message}">
                    ${log.message}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                        <span class="w-1.5 h-1.5 rounded-full ${getSeverityColor(log.severity)}"></span>
                        <span class="text-xs text-gray-400">${log.category || 'Unclassified'}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-gray-500 hover:text-red-400 transition-colors" onclick="deleteLog('${log.id}')">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            logsTableBody.appendChild(row);
        });

        // Re-initialize icons for newly added elements
        lucide.createIcons();
    }

    function getLevelBadgeColor(level) {
        switch (level) {
            case 'critical': return 'bg-red-500/20 text-red-300 border border-red-500/30';
            case 'error': return 'bg-orange-500/20 text-orange-300 border border-orange-500/30';
            case 'warning': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
            default: return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
        }
    }

    function getSeverityColor(severity) {
        if (!severity) return 'bg-gray-500';
        if (severity >= 7) return 'bg-red-500';
        if (severity >= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    function updateStats() {
        const total = logs.length;
        const critical = logs.filter(l => l.level === 'critical' || l.severity >= 7).length;
        const warning = logs.filter(l => l.level === 'warning').length;

        statTotal.textContent = total;
        statCritical.textContent = critical;
        statWarning.textContent = warning;
    }

    // --- Actions ---

    window.deleteLog = async (id) => {
        if (!confirm('Are you sure you want to delete this log?')) return;

        try {
            await api.delete(`/logs/${id}`);
            // Optimistic update
            logs = logs.filter(l => l.id != id); // Handle string/int variance
            renderLogs(logs); // Re-render without refetching
            updateStats();
        } catch (error) {
            alert('Failed to delete log');
        }
    };

    createLogForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = createLogForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Analyzing...';

        const source = document.getElementById('log-source').value;
        const level = document.getElementById('log-level').value;
        const message = document.getElementById('log-message').value;

        try {
            await api.post('/logs', { source, level, message });

            // Close modal
            document.getElementById('log-modal').classList.add('hidden');
            createLogForm.reset();

            // Refresh logs
            await fetchLogs();

        } catch (error) {
            alert(error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // --- Search & Filter Listeners ---

    filterLevel.addEventListener('change', fetchLogs);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = logs.filter(log =>
            log.message.toLowerCase().includes(term) ||
            (log.source && log.source.toLowerCase().includes(term))
        );
        renderLogs(filtered);
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = 'index.html';
    });
});
