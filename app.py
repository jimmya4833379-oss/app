import os
from flask import Flask, render_template, jsonify
from tinydb import TinyDB, Query

app = Flask(__name__)

# Ensure database directory exists
os.makedirs('database', exist_ok=True)

# Initialize TinyDB
db = TinyDB('database/db.json')

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

if __name__ == '__main__':
    app.run(debug=True)
