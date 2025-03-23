import logging
import random
import string
from datetime import datetime, timedelta
from flask import current_app, render_template
from flask_mail import Message
from app import mail, db
from app.models import Admin, User, VerificationCode

class MailService:
    """邮件服务类"""
    
    def __init__(self):
        self._logger = logging.getLogger(__name__)
        
    def send_verification_code(self, email, purpose='register', expires_in=10):
        """发送验证码
        
        Args:
            email: 收件人邮箱
            purpose: 用途(register/reset_password/login)
            expires_in: 有效期(分钟)
            
        Returns:
            操作结果
        """
        try:
            # 生成验证码
            code = ''.join(random.choices(string.digits, k=5))
            
            # 保存到数据库
            verification = VerificationCode(
                email=email,
                code=code,
                purpose=purpose,
                expires_at=datetime.utcnow() + timedelta(minutes=expires_in)
            )
            db.session.add(verification)
            db.session.commit()
            
            # 发送邮件
            result = self.send_email(
                subject='ALYS 验证码',
                recipients=[email],
                template='emails/verification_code',
                code=code,
                purpose_text=self._get_purpose_text(purpose),
                expires_in=expires_in
            )
            
            return {
                'success': True,
                'message': '验证码已发送'
            }
        except Exception as e:
            self._logger.error(f"Failed to send verification code to {email}: {str(e)}")
            return {
                'success': False,
                'message': f'发送验证码失败: {str(e)}'
            }
    
    def verify_code(self, email, code, purpose='register'):
        """验证验证码
        
        Args:
            email: 邮箱
            code: 验证码
            purpose: 用途
            
        Returns:
            验证结果
        """
        # 查询最新的未使用验证码
        verification = VerificationCode.query.filter_by(
            email=email, 
            code=code, 
            purpose=purpose, 
            is_used=False
        ).order_by(VerificationCode.created_at.desc()).first()
        
        if not verification:
            return {
                'success': False,
                'message': '验证码不存在或已使用'
            }
            
        if not verification.is_valid():
            return {
                'success': False,
                'message': '验证码已过期'
            }
            
        # 标记为已使用
        verification.is_used = True
        db.session.commit()
        
        return {
            'success': True,
            'message': '验证通过'
        }
    
    def send_task_success_email(self, user_email, user_name, task_name, folder_name, files_total, files_saved, files_skipped):
        """发送任务成功邮件
        
        Args:
            user_email: 用户邮箱
            user_name: 用户昵称
            task_name: 任务名称
            folder_name: 文件夹名称
            files_total: 总文件数
            files_saved: 已保存文件数
            files_skipped: 已跳过文件数
            
        Returns:
            操作结果
        """
        try:
            result = self.send_email(
                subject=f'【{task_name}】更新完成',
                recipients=[user_email],
                template='emails/task_success',
                user_name=user_name,
                task_name=task_name,
                folder_name=folder_name,
                files_total=files_total,
                files_saved=files_saved,
                files_skipped=files_skipped
            )
            
            return {
                'success': True,
                'message': '邮件已发送'
            }
        except Exception as e:
            self._logger.error(f"Failed to send task success email to {user_email}: {str(e)}")
            return {
                'success': False,
                'message': f'发送邮件失败: {str(e)}'
            }
    
    def send_task_error_email(self, user_email, user_name, task_name, error_message):
        """发送任务失败邮件
        
        Args:
            user_email: 用户邮箱
            user_name: 用户昵称
            task_name: 任务名称
            error_message: 错误信息
            
        Returns:
            操作结果
        """
        try:
            result = self.send_email(
                subject=f'【{task_name}】更新出错',
                recipients=[user_email],
                template='emails/task_error',
                user_name=user_name,
                task_name=task_name,
                error_message=error_message
            )
            
            return {
                'success': True,
                'message': '邮件已发送'
            }
        except Exception as e:
            self._logger.error(f"Failed to send task error email to {user_email}: {str(e)}")
            return {
                'success': False,
                'message': f'发送邮件失败: {str(e)}'
            }
    
    def send_account_recovery_email(self, user_email, user_name, username, password):
        """发送账号找回邮件
        
        Args:
            user_email: 用户邮箱
            user_name: 用户昵称
            username: 用户名
            password: 密码
            
        Returns:
            操作结果
        """
        try:
            result = self.send_email(
                subject='ALYS 账号找回',
                recipients=[user_email],
                template='emails/account_recovery',
                user_name=user_name,
                username=username,
                password='******' # 安全考虑，不直接发送密码
            )
            
            return {
                'success': True,
                'message': '邮件已发送'
            }
        except Exception as e:
            self._logger.error(f"Failed to send account recovery email to {user_email}: {str(e)}")
            return {
                'success': False,
                'message': f'发送邮件失败: {str(e)}'
            }
    
    def send_email(self, subject, recipients, template, **kwargs):
        """发送邮件
        
        Args:
            subject: 邮件主题
            recipients: 收件人列表
            template: 模板名称
            **kwargs: 模板变量
            
        Returns:
            发送结果
        """
        try:
            # 获取系统管理员信息
            admin = Admin.query.first()
            website = admin.website if admin else ''
            
            # 添加公共变量
            kwargs.update({
                'now': datetime.utcnow(),
                'website': website,
                'app_name': 'ALYS - 阿里云盘订阅系统'
            })
            
            # 创建邮件消息
            msg = Message(
                subject=subject,
                recipients=recipients,
                html=render_template(f'{template}.html', **kwargs),
                sender=current_app.config['MAIL_USERNAME']
            )
            
            # 发送邮件
            mail.send(msg)
            return True
        except Exception as e:
            self._logger.error(f"Failed to send email: {str(e)}")
            raise
    
    def _get_purpose_text(self, purpose):
        """获取验证码用途文本
        
        Args:
            purpose: 用途
            
        Returns:
            用途文本
        """
        purpose_map = {
            'register': '注册账号',
            'reset_password': '重置密码',
            'login': '登录验证',
            'change_email': '更改邮箱'
        }
        return purpose_map.get(purpose, '验证') 