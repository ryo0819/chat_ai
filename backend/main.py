import time
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db
from models import SessionModel, MessageModel
import schemas

# データベースのテーブルを作成
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Agent Console API")

# CORS設定 (Next.jsの開発サーバーなどからのアクセスを許可)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発用。本番環境では適切に制限します
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/sessions", response_model=List[schemas.SessionList])
def get_sessions(db: Session = Depends(get_db)):
    # 新しいセッションが上に来るように作成日時降順で取得
    sessions = db.query(SessionModel).order_by(SessionModel.created_at.desc()).all()
    return sessions

@app.post("/api/sessions", response_model=schemas.Session)
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    title = session.title or "新しいチャット"
    db_session = SessionModel(title=title)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(db_session)
    db.commit()
    return {"status": "success", "message": "Session deleted"}

@app.get("/api/sessions/{session_id}/messages", response_model=List[schemas.Message])
def get_messages(session_id: int, db: Session = Depends(get_db)):
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return db_session.messages

@app.post("/api/sessions/{session_id}/messages", response_model=schemas.Message)
def post_message(session_id: int, message: schemas.MessageCreate, db: Session = Depends(get_db)):
    # 1. セッションが存在するか確認
    db_session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. ユーザーメッセージを保存
    user_msg = MessageModel(session_id=session_id, role="user", content=message.content)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 3. 最初のメッセージの場合、またはデフォルトタイトルの場合、セッションタイトルを自動更新
    msg_count = db.query(MessageModel).filter(MessageModel.session_id == session_id).count()
    if msg_count == 1 or db_session.title == "新しいチャット":
        # メッセージの先頭からタイトルを作成 (最大15文字)
        new_title = message.content[:15]
        if len(message.content) > 15:
            new_title += "..."
        db_session.title = new_title
        db.commit()

    # 4. AI (model) の返答を生成 (思考ディレイをシミュレート)
    time.sleep(1.0)
    
    ai_content = generate_mock_response(message.content)
    ai_msg = MessageModel(session_id=session_id, role="model", content=ai_content)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

def generate_mock_response(user_content: str) -> str:
    content_lower = user_content.lower()
    
    if "こんにちは" in content_lower or "hello" in content_lower:
        return (
            "こんにちは！私はAIとのチャットを模したダッシュボードのプロトタイプです。✨\n\n"
            "本日はどのようなお手伝いをしましょうか？\n"
            "以下のようなトピックについてお手伝いできます：\n"
            "- 💻 プログラミングのアドバイスやコード作成\n"
            "- ✍️ テキストの要約や文章の作成\n"
            "- 💡 新しいプロジェクトのアイデア出し\n\n"
            "何でもお気軽にお尋ねください！"
        )
    
    if "自己紹介" in content_lower or "紹介" in content_lower or "誰" in content_lower:
        return (
            "私は、Next.jsとFastAPI、SQLiteで構築された **AIエージェントチャットシステム** のプロトタイプAIです。🤖\n\n"
            "### 主な機能\n"
            "1. **永続的なセッション管理**: チャット履歴はSQLiteデータベースに自動保存されます。\n"
            "2. **自動命名機能**: 最初のメッセージ内容に応じて、チャットのタイトルが自動的に更新されます。\n"
            "3. **モダンなダークモード**: 開発コンソールのようなクールなインターフェースを提供します。\n\n"
            "お好みの質問を入力して、機能をお試しください！"
        )
    
    if any(k in content_lower for k in ["コード", "プログラミング", "プログラム", "関数", "実装"]):
        return (
            "プログラミングに関するご質問ですね！コードの書き方やエラーの解決、アルゴリズムの解説などに対応できます。\n\n"
            "例えば、以下はPythonでFastAPIを使って簡単なAPIを作るコード例です：\n\n"
            "```python\n"
            "from fastapi import FastAPI\n\n"
            "app = FastAPI()\n\n"
            "@app.get(\"/\")\n"
            "def read_root():\n"
            "    return {\"message\": \"Hello from FastAPI!\"}\n"
            "```\n\n"
            "このようにマークダウン形式でコードをきれいに表示できます。何か具体的なコードで解説が必要なものはありますか？"
        )
        
    # デフォルトのレスポンス
    return (
        f"「{user_content}」についてのご質問ですね！素晴らしい着眼点です。\n\n"
        "AIとしての回答をシミュレートしています：\n\n"
        "1. **概要**: 入力されたテキストの意図を分析し、最適な解説を構成します。\n"
        "2. **特徴**: このインターフェースは最新のAI開発コンソールに似せて、メッセージ送信時に滑らかなロード演出や、美しいメッセージバブルが表示されるよう調整されています。\n"
        "3. **次のステップ**: フロントエンドとバックエンドの連携により、リアルタイムでスムーズな対話体験が得られます。\n\n"
        "さらに知りたい詳細や、他の質問がありましたら、どうぞご入力ください！ 🚀"
    )
