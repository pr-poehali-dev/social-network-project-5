"""
Авторизация пользователей СоцСети: регистрация, вход, выход, получение профиля.
Параметр action: register | login | logout | me
"""
import os
import json
import hashlib
import secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
}

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p455903_social_network_proje')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_session_id() -> str:
    return secrets.token_hex(32)


def resp(status: int, body: dict):
    headers = {**CORS, 'Content-Type': 'application/json'}
    return {'statusCode': status, 'headers': headers, 'body': json.dumps(body, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    """Регистрация, вход, выход и получение текущего пользователя через параметр action."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    action = (event.get('queryStringParameters') or {}).get('action') or body.get('action', '')
    session_id = (event.get('headers') or {}).get('x-session-id') or (event.get('headers') or {}).get('X-Session-Id')

    S = SCHEMA
    conn = get_conn()
    cur = conn.cursor()

    try:
        if action == 'register':
            username = (body.get('username') or '').strip().lower()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            display_name = (body.get('display_name') or username).strip()

            if not username or not email or not password:
                return resp(400, {'error': 'Заполните все поля'})
            if len(password) < 6:
                return resp(400, {'error': 'Пароль должен быть не менее 6 символов'})
            if len(username) < 3:
                return resp(400, {'error': 'Имя пользователя не менее 3 символов'})

            cur.execute(f'SELECT id FROM {S}.users WHERE username = %s OR email = %s', (username, email))
            if cur.fetchone():
                return resp(409, {'error': 'Пользователь с таким именем или email уже существует'})

            pw_hash = hash_password(password)
            cur.execute(
                f'INSERT INTO {S}.users (username, email, password_hash, display_name) VALUES (%s, %s, %s, %s) RETURNING id',
                (username, email, pw_hash, display_name)
            )
            user_id = cur.fetchone()[0]
            sid = make_session_id()
            cur.execute(f'INSERT INTO {S}.sessions (id, user_id) VALUES (%s, %s)', (sid, user_id))
            conn.commit()

            return resp(200, {
                'session_id': sid,
                'user': {
                    'id': user_id, 'username': username, 'display_name': display_name,
                    'email': email, 'bio': '', 'avatar_color': 'from-blue-500 to-indigo-600'
                }
            })

        if action == 'login':
            login = (body.get('login') or '').strip().lower()
            password = body.get('password') or ''

            if not login or not password:
                return resp(400, {'error': 'Введите логин и пароль'})

            pw_hash = hash_password(password)
            cur.execute(
                f'''SELECT id, username, email, display_name, bio, avatar_color FROM {S}.users
                   WHERE (username = %s OR email = %s) AND password_hash = %s''',
                (login, login, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return resp(401, {'error': 'Неверный логин или пароль'})

            user_id, username, email, display_name, bio, avatar_color = row
            sid = make_session_id()
            cur.execute(f'INSERT INTO {S}.sessions (id, user_id) VALUES (%s, %s)', (sid, user_id))
            conn.commit()

            return resp(200, {
                'session_id': sid,
                'user': {
                    'id': user_id, 'username': username, 'display_name': display_name,
                    'email': email, 'bio': bio or '', 'avatar_color': avatar_color or 'from-blue-500 to-indigo-600'
                }
            })

        if action == 'me':
            if not session_id:
                return resp(401, {'error': 'Не авторизован'})

            cur.execute(
                f'''SELECT u.id, u.username, u.email, u.display_name, u.bio, u.avatar_color
                   FROM {S}.sessions s JOIN {S}.users u ON s.user_id = u.id
                   WHERE s.id = %s AND s.expires_at > NOW()''',
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return resp(401, {'error': 'Сессия истекла, войдите снова'})

            user_id, username, email, display_name, bio, avatar_color = row
            return resp(200, {
                'user': {
                    'id': user_id, 'username': username, 'display_name': display_name,
                    'email': email, 'bio': bio or '', 'avatar_color': avatar_color or 'from-blue-500 to-indigo-600'
                }
            })

        if action == 'logout':
            if session_id:
                cur.execute(f'UPDATE {S}.sessions SET expires_at = NOW() WHERE id = %s', (session_id,))
                conn.commit()
            return resp(200, {'ok': True})

        return resp(400, {'error': 'Укажите action: register | login | logout | me'})

    finally:
        cur.close()
        conn.close()
