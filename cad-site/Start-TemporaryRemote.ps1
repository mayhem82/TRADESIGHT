param([int]$Port=8766, [string]$FreeCadPython='C:\Program Files\FreeCAD 1.1\bin\python.exe', [switch]$NoBrowser)
$ErrorActionPreference='Stop'
$cadLocal=Join-Path $PSScriptRoot '.local'
New-Item -ItemType Directory -Force $cadLocal | Out-Null
$cadTunnel=Join-Path $cadLocal 'cloudflared.exe'
if (!(Test-Path -LiteralPath $FreeCadPython)) { throw 'FreeCAD bundled python.exe is missing.' }
$cadProbe=New-Object Net.Sockets.TcpClient
try { $cadProbe.Connect('127.0.0.1',$Port); throw "Port $Port is already running. Stop the old CAD service before starting a new temporary connection." } catch [Net.Sockets.SocketException] {} finally { $cadProbe.Dispose() }
if (!(Test-Path -LiteralPath $cadTunnel)) {
    # Official Cloudflare release, pinned and hash checked. Never execute an unchecked download.
    Invoke-WebRequest 'https://github.com/cloudflare/cloudflared/releases/download/2026.10.1/cloudflared-windows-amd64.exe' -OutFile $cadTunnel
}
if ((Get-FileHash -LiteralPath $cadTunnel -Algorithm SHA256).Hash -ne '4D2490E74082C5D48DBFEDAF92576FA5BD1702379AB88EB7FAA0CFBE8DC891B6') { throw 'Cloudflared checksum mismatch. The executable was not started.' }
$cadLog=Join-Path $cadLocal ('tunnel-'+[Guid]::NewGuid().ToString('N')+'.log')
$cadArgs=@('tunnel','--url',"http://127.0.0.1:$Port",'--protocol','http2','--no-autoupdate','--logfile',('"'+$cadLog+'"'))
$cadProcess=Start-Process -FilePath $cadTunnel -ArgumentList $cadArgs -WindowStyle Hidden -PassThru
try {
    $cadUrl=$null
    for ($cadAttempt=0;$cadAttempt -lt 60;$cadAttempt++) {
        if ($cadProcess.HasExited) { throw 'Temporary connection exited. See the tunnel log in cad-site/.local.' }
        if (Test-Path -LiteralPath $cadLog) {
            $cadMatch=[regex]::Match([IO.File]::ReadAllText($cadLog),'https://[a-z0-9-]+\.trycloudflare\.com')
            if ($cadMatch.Success) { $cadUrl=$cadMatch.Value; break }
        }
        Start-Sleep -Seconds 1
    }
    if (!$cadUrl) { throw 'Temporary HTTPS address was not allocated within one minute.' }
    $env:TRADESIGHT_CAD_ORIGIN=$cadUrl
    $cadKeyFile=Join-Path $cadLocal 'access.key'
    if (!(Test-Path -LiteralPath $cadKeyFile)) {
        $cadRandom=[Security.Cryptography.RandomNumberGenerator]::Create();$cadBytes=New-Object byte[] 32;$cadRandom.GetBytes($cadBytes);$cadRandom.Dispose()
        [IO.File]::WriteAllText($cadKeyFile,[Convert]::ToBase64String($cadBytes))
    }
    $env:TRADESIGHT_CAD_KEY=[IO.File]::ReadAllText($cadKeyFile).Trim()
    $cadPair="$cadUrl/#key=$([Uri]::EscapeDataString($env:TRADESIGHT_CAD_KEY))"
    Write-Host "Private pairing link — keep private: $cadPair"
    Write-Host 'Use this link on your phone. This temporary address lasts while this console and the PC stay running.'
    if (!$NoBrowser) { Start-Process $cadPair -WindowStyle Hidden }
    & $FreeCadPython (Join-Path $PSScriptRoot 'worker/server.py') --host 127.0.0.1 --port $Port --freecad-python $FreeCadPython
} finally {
    if (!$cadProcess.HasExited) { Stop-Process -Id $cadProcess.Id }
}
