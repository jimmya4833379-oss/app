import os
from datetime import datetime
from flask import Flask, render_template, jsonify, request
from tinydb import TinyDB, Query

app = Flask(__name__)

# Ensure database directory exists
os.makedirs('database', exist_ok=True)

# Initialize TinyDB
db = TinyDB('database/db.json')
diet_table = db.table('diet')

# Mock 食物熱量字典 (每份大卡)
MOCK_CALORIES = {
    "蘋果": 50,
    "香蕉": 90,
    "漢堡": 500,
    "便當": 700,
    "沙拉": 150,
    "拿鐵": 120,
    "珍珠奶茶": 400
}

@app.route('/')
def index():
    """
    根路由，回傳靜態首頁。
    """
    return render_template('index.html')

@app.route('/api/status')
def get_status():
    """
    測試用 API，確認後端與資料庫連線。
    """
    return jsonify({
        "status": "success",
        "message": "Flask 後端與 TinyDB 運作正常！"
    })

@app.route('/api/diet', methods=['GET', 'POST'])
def handle_diet():
    if request.method == 'POST':
        data = request.json
        food_name = data.get('foodName', '').strip()
        time_str = data.get('time', '')
        try:
            portion = float(data.get('portion', 1))
        except ValueError:
            portion = 1.0
            
        if not food_name or not time_str:
            return jsonify({"error": "請填寫食物名稱與時間"}), 400
            
        # 取得今天日期
        today = datetime.now().strftime('%Y-%m-%d')
        
        # 系統自動計算熱量
        base_calorie = MOCK_CALORIES.get(food_name, 100) # 若不在字典預設 100 大卡
        total_calorie = int(base_calorie * portion)
        
        record = {
            "date": today,
            "time": time_str,
            "foodName": food_name,
            "portion": portion,
            "calories": total_calorie
        }
        
        diet_table.insert(record)
        return jsonify({"status": "success", "message": "紀錄新增成功！", "record": record}), 201

    elif request.method == 'GET':
        today = datetime.now().strftime('%Y-%m-%d')
        Record = Query()
        records = diet_table.search(Record.date == today)
        
        # 依照時間排序
        records.sort(key=lambda x: x['time'])
        
        total_calories = sum(r['calories'] for r in records)
        
        return jsonify({
            "status": "success",
            "date": today,
            "records": records,
            "totalCalories": total_calories
        })

if __name__ == '__main__':
    app.run(debug=True)
