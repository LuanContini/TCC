class User:
    def __init__(self, id, username, password, role):
        self.id = id
        self.username = username
        self.password = password  
        self.role = role

users_db = {
    'admin': User(1, 'admin', '1234', 'admin'),
    'user': User(2, 'user', 'abcd', 'user')
}

def get_user_by_username(username):
    return users_db.get(username)
