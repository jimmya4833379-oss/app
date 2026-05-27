document.addEventListener('DOMContentLoaded', () => {
    const statusCard = document.getElementById('api-status');
    const dietForm = document.getElementById('diet-form');
    const dietList = document.getElementById('diet-list');
    const totalCaloriesEl = document.getElementById('total-calories');
    
    const weightForm = document.getElementById('weight-form');
    const bmiResult = document.getElementById('bmi-result');

    // 檢查後端狀態
    fetch('/api/status')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

    // 載入今日飲食紀錄
    const loadDietRecords = () => {
        fetch('/api/diet')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // 更新總熱量
                    totalCaloriesEl.textContent = `總熱量: ${data.totalCalories} 大卡`;
                    
                    // 更新清單
                    dietList.innerHTML = '';
                    if (data.records.length === 0) {
                        dietList.innerHTML = '<li style="justify-content: center; color: #7f8c8d;">今日尚未有紀錄</li>';
                        return;
                    }
                    
                    data.records.forEach(record => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <div class="record-info">
                                <span class="record-time">${record.time}</span>
                                <span class="record-food">${record.foodName} <small>x ${record.portion}</small></span>
                            </div>
                            <div class="record-calorie">${record.calories} kcal</div>
                        `;
                        dietList.appendChild(li);
                    });
                }
            })
            .catch(err => console.error('Error loading records:', err));
    };

    // 表單送出處理
    dietForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = {
            foodName: document.getElementById('foodName').value,
            time: document.getElementById('time').value,
            portion: document.getElementById('portion').value
        };

        fetch('/api/diet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                dietForm.reset();
                // 設定預設時間為現在時間
                const now = new Date();
                const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
                document.getElementById('time').value = timeString;
                document.getElementById('portion').value = "1";
                
                loadDietRecords(); // 重新載入清單
            } else {
                alert(data.error || '新增失敗');
            }
        })
        .catch(err => console.error('Error posting record:', err));
    });

    // 體重表單送出處理
    if (weightForm) {
        weightForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value
            };

            fetch('/api/weight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    // 顯示 BMI 結果
                    bmiResult.style.display = 'block';
                    bmiResult.innerHTML = `計算成功！您的 BMI 值為：<span style="color: #e74c3c; font-size: 1.2em;">${data.record.bmi}</span>`;
                    weightForm.reset();
                } else {
                    alert(data.error || '紀錄失敗');
                }
            })
            .catch(err => console.error('Error posting weight:', err));
        });
    }

    // 初始化載入
    loadDietRecords();
    
    // 設定預設時間為當下
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    document.getElementById('time').value = timeString;
});
