import re
from datetime import datetime
import random
import string

def get_share_id_from_url(url):
    """从分享链接中提取分享ID
    
    Args:
        url: 分享链接
        
    Returns:
        分享ID或None
    """
    try:
        # 如果输入已经是share_id格式，直接返回
        if not url.startswith('http'):
            return url
            
        return re.search(r's/([A-Za-z0-9]+)', url).group(1)
    except:
        return None

def get_folder_id_from_url(url):
    """从分享链接中提取文件夹ID
    
    Args:
        url: 分享链接
        
    Returns:
        文件夹ID或None
    """
    try:
        # 如果输入已经是folder_id格式，直接返回
        if not url.startswith('http'):
            return url
            
        return re.search(r'folder/([A-Za-z0-9_-]+)', url).group(1)
    except:
        return None

def is_valid_aliyun_url(url):
    """检查是否是有效的阿里云盘链接或ID
    
    Args:
        url: 链接或ID
        
    Returns:
        是否有效
    """
    # 如果已经是 share_id 格式 (不含http前缀)，认为是有效的
    if not url.startswith('http'):
        # 简单检查是否符合阿里云盘分享ID的格式
        return bool(re.match(r'^[A-Za-z0-9]+$', url))
    
    # 否则检查是否是完整的URL
    pattern = r'https?://www\.aliyundrive\.com/s/[A-Za-z0-9]+'
    basic_match = re.match(pattern, url)
    if not basic_match:
        return False
        
    # 如果包含文件夹部分，检查是否包含文件夹ID
    if 'folder' in url:
        folder_id = get_folder_id_from_url(url)
        if not folder_id:
            return False
            
    return True

def generate_verification_code(length=5):
    """生成数字验证码
    
    Args:
        length: 验证码长度
        
    Returns:
        验证码字符串
    """
    return ''.join(random.choices(string.digits, k=length))

def format_datetime(dt, format='%Y-%m-%d %H:%M:%S'):
    """格式化日期时间
    
    Args:
        dt: datetime对象
        format: 格式化字符串
        
    Returns:
        格式化后的字符串
    """
    if not dt:
        return ''
    return dt.strftime(format)

def is_valid_cron_expression(expression):
    """检查是否是有效的Cron表达式
    
    Args:
        expression: Cron表达式
        
    Returns:
        是否有效
    """
    parts = expression.split()
    if len(parts) < 6:
        return False
        
    # 简单检查每部分是否符合格式
    patterns = [
        r'^(\*|([0-9]|[1-5][0-9]))$',  # 秒 (0-59)
        r'^(\*|([0-9]|[1-5][0-9]))$',  # 分 (0-59)
        r'^(\*|([0-9]|1[0-9]|2[0-3]))$',  # 时 (0-23)
        r'^(\*|\?|([1-9]|[12][0-9]|3[01]))$',  # 日 (1-31)
        r'^(\*|([1-9]|1[0-2]))$',  # 月 (1-12)
        r'^(\*|\?|[0-6])$'  # 周 (0-6)
    ]
    
    for i, pattern in enumerate(patterns):
        if not re.match(pattern, parts[i]):
            return False
            
    return True

def seconds_to_human_readable(seconds):
    """将秒数转换为人类可读格式
    
    Args:
        seconds: 秒数
        
    Returns:
        人类可读的时间字符串
    """
    if seconds < 60:
        return f"{seconds}秒"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        if remaining_seconds == 0:
            return f"{minutes}分钟"
        return f"{minutes}分钟{remaining_seconds}秒"
    else:
        hours = seconds // 3600
        remaining = seconds % 3600
        minutes = remaining // 60
        seconds = remaining % 60
        
        result = f"{hours}小时"
        if minutes > 0:
            result += f"{minutes}分钟"
        if seconds > 0:
            result += f"{seconds}秒"
            
        return result 