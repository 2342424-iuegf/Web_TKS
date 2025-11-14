#!/usr/bin/env python3
"""
测试RTSP地址是否可访问的脚本
使用方法: python scripts/test_rtsp.py <rtsp_url>
"""
import sys
import subprocess
import os

def test_rtsp(rtsp_url: str):
    """测试RTSP地址是否可访问"""
    print(f"正在测试RTSP地址: {rtsp_url}")
    print("-" * 60)
    
    # 检查FFmpeg是否可用
    try:
        result = subprocess.run(
            ['ffmpeg', '-version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5
        )
        if result.returncode != 0:
            print("❌ FFmpeg不可用")
            return False
        print("✅ FFmpeg可用")
    except FileNotFoundError:
        print("❌ FFmpeg未找到，请确保FFmpeg已安装并在PATH中")
        return False
    
    # 创建临时文件
    import tempfile
    temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
    temp_path = temp_file.name
    temp_file.close()
    
    try:
        # 构建FFmpeg命令（简化版本，快速测试）
        ffmpeg_cmd = [
            'ffmpeg',
            '-y',
            '-rtsp_transport', 'tcp',
            '-i', rtsp_url,
            '-vframes', '1',  # 只获取一帧
            '-q:v', '2',
            '-an',  # 不处理音频
            temp_path
        ]
        
        print(f"\n执行命令: {' '.join(ffmpeg_cmd)}")
        print("正在连接RTSP流...")
        
        # 执行FFmpeg命令，设置较短的超时时间用于快速测试
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        stdout, stderr = process.communicate(timeout=30)  # 30秒超时
        
        if process.returncode == 0:
            if os.path.exists(temp_path) and os.path.getsize(temp_path) > 0:
                file_size = os.path.getsize(temp_path)
                print(f"✅ RTSP地址可访问！")
                print(f"✅ 成功获取图像，文件大小: {file_size} 字节")
                return True
            else:
                print("❌ FFmpeg执行成功，但图像文件无效")
                return False
        else:
            error_msg = stderr.decode('utf-8', errors='ignore')
            print(f"❌ FFmpeg执行失败 (返回码: {process.returncode})")
            print(f"错误信息:\n{error_msg}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ 连接RTSP流超时（30秒）")
        print("   可能的原因：")
        print("   1. RTSP地址不可访问")
        print("   2. 网络连接问题")
        print("   3. 摄像头未开启或RTSP服务未启动")
        process.kill()
        return False
    except Exception as e:
        print(f"❌ 测试过程中出错: {str(e)}")
        return False
    finally:
        # 清理临时文件
        try:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        except:
            pass

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("使用方法: python scripts/test_rtsp.py <rtsp_url>")
        print("示例: python scripts/test_rtsp.py rtsp://192.168.1.100:554/stream")
        sys.exit(1)
    
    rtsp_url = sys.argv[1]
    success = test_rtsp(rtsp_url)
    sys.exit(0 if success else 1)

