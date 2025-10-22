@echo off
echo ========================================
echo Minit - 배포용 패키지 생성
echo ========================================
echo.

REM 배포 폴더 생성
if not exist "release" mkdir release

REM 기존 파일 삭제
if exist "release\Minit-v1.0.0.zip" del "release\Minit-v1.0.0.zip"

REM ZIP 압축 (PowerShell 사용)
echo 압축 중...
powershell -command "Compress-Archive -Path 'dist-electron\win-unpacked\*' -DestinationPath 'release\Minit-v1.0.0.zip' -Force"

echo.
echo ========================================
echo 완료!
echo 파일 위치: release\Minit-v1.0.0.zip
echo 파일 크기:
powershell -command "(Get-Item 'release\Minit-v1.0.0.zip').Length / 1MB | ForEach-Object { '{0:N2} MB' -f $_ }"
echo ========================================
pause
