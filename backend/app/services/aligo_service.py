import logging
import qrcode
import os
from pathlib import Path
from aligo import Aligo
from app import cache, db
from app.models import User, Log

class AligoService:
    """阿里云盘服务封装"""
    
    def __init__(self):
        self._clients = {}
        self._logger = logging.getLogger(__name__)
        self._qrcode_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                          'static', 'img', 'qrcode')
        
        # 确保二维码目录存在
        if not os.path.exists(self._qrcode_dir):
            os.makedirs(self._qrcode_dir, exist_ok=True)
    
    def get_client(self, user_id):
        """获取用户的阿里云盘客户端
        
        Args:
            user_id: 用户ID
            
        Returns:
            Aligo实例或None
        """
        if user_id in self._clients:
            return self._clients[user_id]
            
        user = User.query.get(user_id)
        if not user:
            return None
            
        # 检查用户是否已经登录过阿里云盘
        if self._check_user_login(user.username):
            try:
                client = Aligo(name=user.username, level=logging.INFO)
                self._clients[user_id] = client
                
                # 更新用户状态
                user.is_online = True
                db.session.commit()
                
                # 记录日志
                self._log_message(user_id, 'info', 'auth', f'用户{user.username}阿里云盘登录成功')
                return client
            except Exception as e:
                self._logger.error(f"Failed to initialize Aligo for user {user.username}: {str(e)}")
                self._log_message(user_id, 'error', 'auth', f'阿里云盘登录失败', details=str(e))
                return None
        
        return None
    
    def login(self, user_id, callback_url=None):
        """登录阿里云盘
        
        Args:
            user_id: 用户ID
            callback_url: 登录回调URL
            
        Returns:
            dict: 包含二维码URL和登录状态
        """
        user = User.query.get(user_id)
        if not user:
            return {'success': False, 'message': '用户不存在'}
        
        try:
            # 保存二维码图片的回调函数
            def save_qrcode(qr_link):
                qr_img = qrcode.make(qr_link)
                qr_path = os.path.join(self._qrcode_dir, f"{user.username}.png")
                qr_img.save(qr_path)
                return qr_path
            
            # 初始化阿里云盘客户端
            client = Aligo(
                name=user.username,
                show=save_qrcode,
                level=logging.INFO,
                login_timeout=60
            )
            
            if client:
                self._clients[user_id] = client
                user.is_online = True
                db.session.commit()
                self._log_message(user_id, 'success', 'auth', f'用户{user.username}通过扫码登录阿里云盘成功')
                
                return {
                    'success': True, 
                    'message': '登录成功',
                    'qrcode_url': f"/static/img/qrcode/{user.username}.png"
                }
            else:
                self._log_message(user_id, 'error', 'auth', f'用户{user.username}登录阿里云盘失败')
                return {'success': False, 'message': '登录失败，请重试'}
                
        except Exception as e:
            self._logger.error(f"Login error for user {user.username}: {str(e)}")
            self._log_message(user_id, 'error', 'auth', f'登录出错: {str(e)}')
            return {'success': False, 'message': f'登录出错: {str(e)}'}
    
    @cache.memoize(timeout=300)
    def get_folder_files(self, user_id, folder_id):
        """获取文件夹内容(带缓存)
        
        Args:
            user_id: 用户ID
            folder_id: 文件夹ID
            
        Returns:
            文件列表或None
        """
        client = self.get_client(user_id)
        if not client:
            return None
            
        try:
            return client.get_file_list(parent_file_id=folder_id)
        except Exception as e:
            self._logger.error(f"Failed to get folder files for user {user_id}: {str(e)}")
            return None
    
    def save_shared_files(self, user_id, share_id, source_folder_id, target_folder_id, share_password=None):
        """保存分享文件到用户云盘
        
        Args:
            user_id: 用户ID
            share_id: 分享ID
            source_folder_id: 源文件夹ID
            target_folder_id: 目标文件夹ID
            share_password: 分享密码
            
        Returns:
            dict: 包含成功保存的文件数量和状态
        """
        client = self.get_client(user_id)
        if not client:
            return {'success': False, 'message': '未登录阿里云盘'}
            
        try:
            # 获取分享token
            if share_password:
                share_token = client.get_share_token(share_id=share_id, share_pwd=share_password)
            else:
                share_token = client.get_share_token(share_id=share_id)
                
            # 获取分享文件夹内容
            shared_files = client.get_share_file_list(share_token=share_token, parent_file_id=source_folder_id)
            
            # 获取目标文件夹内容
            target_files = client.get_file_list(parent_file_id=target_folder_id)
            
            # 比对文件，找出需要保存的新文件
            files_to_save = []
            target_filenames = [file.name for file in target_files]
            
            for file in shared_files:
                if file.name not in target_filenames:
                    files_to_save.append(file)
            
            # 保存文件
            saved_count = 0
            for file in files_to_save:
                client.share_file_saveto_drive(
                    file_id=file.file_id,
                    share_token=share_token,
                    to_parent_file_id=target_folder_id
                )
                saved_count += 1
            
            # 记录结果
            self._log_message(
                user_id, 
                'success' if saved_count > 0 else 'info', 
                'file', 
                f'保存共享文件成功: 跳过{len(shared_files) - saved_count}个已存在文件，保存了{saved_count}个文件'
            )
            
            return {
                'success': True,
                'total': len(shared_files),
                'saved': saved_count,
                'skipped': len(shared_files) - saved_count
            }
            
        except Exception as e:
            self._logger.error(f"Failed to save shared files for user {user_id}: {str(e)}")
            self._log_message(user_id, 'error', 'file', f'保存共享文件失败: {str(e)}')
            return {'success': False, 'message': f'保存失败: {str(e)}'}
    
    def get_user_folders(self, user_id, parent_folder_id='root'):
        """获取用户文件夹列表
        
        Args:
            user_id: 用户ID
            parent_folder_id: 父文件夹ID
            
        Returns:
            文件夹列表或None
        """
        client = self.get_client(user_id)
        if not client:
            return None
            
        try:
            files = client.get_file_list(parent_file_id=parent_folder_id)
            folders = [file for file in files if file.type == 'folder']
            return folders
        except Exception as e:
            self._logger.error(f"Failed to get folders for user {user_id}: {str(e)}")
            return None
    
    def _check_user_login(self, username):
        """检查用户是否已登录过阿里云盘
        
        Args:
            username: 用户名
            
        Returns:
            bool: 是否已登录
        """
        aligo_path = str(Path.home().joinpath(".aligo")) + "/" + username + ".json"
        return os.path.exists(aligo_path)
    
    def _log_message(self, user_id, level, category, message, details=None):
        """记录日志
        
        Args:
            user_id: 用户ID
            level: 日志级别
            category: 日志类别
            message: 日志消息
            details: 详细信息
        """
        log = Log(
            user_id=user_id,
            level=level,
            category=category,
            message=message,
            details=details
        )
        db.session.add(log)
        db.session.commit() 