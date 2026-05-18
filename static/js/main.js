document.addEventListener('DOMContentLoaded', () => {
    const statusCard = document.getElementById('api-status');

    // 呼叫 Flask 後端 API
    fetch('/api/status')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                statusCard.textContent = data.message;
            } else {
                throw new Error('API 狀態錯誤');
            }
        })
        .catch(error => {
            console.error('Error fetching API status:', error);
            statusCard.textContent = '無法連線到後端 API。請確認 Flask 伺服器是否正在運行。';
            statusCard.classList.add('status-error');
        });
});
