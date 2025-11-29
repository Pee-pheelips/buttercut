#Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py

#Frontend
cd frontend
npm install
npx expo start
