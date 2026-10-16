param(
    [switch]$Remote,
    [switch]$Lan,
    [switch]$NoBrowser,
    [ValidateRange(1,65535)][int]$Port = 8766,
    [ValidateRange(1,65535)][int]$HttpsPort = 9443,
    [string]$FreeCadPython = 'C:\Program Files\FreeCAD 1.1\bin\python.exe'
)
$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath $FreeCadPython)) { throw 'FreeCAD python.exe was not found. Set -FreeCadPython to its installed path.' }
$cadRoot = $PSScriptRoot
$cadLocal = Join-Path $cadRoot '.local'
New-Item -ItemType Directory -Force -Path $cadLocal | Out-Null
$cadKeyFile = Join-Path $cadLocal 'access.key'
if (!(Test-Path -LiteralPath $cadKeyFile)) {
    $cadRandom = [Security.Cryptography.RandomNumberGenerator]::Create()
    $cadBytes = New-Object byte[] 32
    $cadRandom.GetBytes($cadBytes); $cadRandom.Dispose()
    [IO.File]::WriteAllText($cadKeyFile, [Convert]::ToBase64String($cadBytes))
}
$env:TRADESIGHT_CAD_KEY = [IO.File]::ReadAllText($cadKeyFile).Trim()
$cadHost = if ($Lan) { '0.0.0.0' } else { '127.0.0.1' }
$cadUrl = "http://127.0.0.1:$Port"
if ($Remote) {
    $cadTailscale = Join-Path $env:ProgramFiles 'Tailscale\tailscale.exe'
    if (!(Test-Path -LiteralPath $cadTailscale)) { throw 'Install Tailscale on the PC and phone, then sign in to the same account on both.' }
    $cadStatusText = & $cadTailscale status --json 2>&1
    if ($LASTEXITCODE -ne 0) { throw 'Tailscale is not accessible. Open Tailscale on your Windows desktop, connect it, then run this launcher from your own PowerShell window.' }
    $cadTsStatus = $cadStatusText | ConvertFrom-Json
    if ($cadTsStatus.BackendState -ne 'Running') { throw 'Connect Tailscale on this PC and your phone, then run this launcher again.' }
    $cadDns = $cadTsStatus.Self.DNSName.TrimEnd('.')
    if (!$cadDns) { throw 'Enable MagicDNS and HTTPS in Tailscale first.' }
    $cadUrl = "https://${cadDns}:$HttpsPort"
    $cadRoutes = & $cadTailscale serve status --json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect Tailscale Serve routes.' }
    if ($cadRoutes.TCP -and $cadRoutes.TCP.PSObject.Properties.Name -contains "$HttpsPort") {
        $cadHandlers = $cadRoutes.Web.PSObject.Properties | Where-Object { $_.Name -eq "${cadDns}:$HttpsPort" }
        $cadProxy = $cadHandlers.Value.Handlers.'/'.Proxy
        if ($cadProxy -ne "http://127.0.0.1:$Port") { throw "Tailscale HTTPS port $HttpsPort already belongs to another service. Use -HttpsPort with another port." }
    } else {
        & $cadTailscale serve --bg "--https=$HttpsPort" "http://127.0.0.1:$Port"
        if ($LASTEXITCODE -ne 0) { throw 'Tailscale HTTPS setup failed. Follow its HTTPS prompt and retry.' }
    }
    $env:TRADESIGHT_CAD_ORIGIN = $cadUrl
}
$cadPair = "$cadUrl/#key=$([Uri]::EscapeDataString($env:TRADESIGHT_CAD_KEY))"
Write-Host "TradeSight CAD: $cadUrl"
Write-Host "Private pairing link (keep private): $cadPair"
if ($Lan) { Write-Host "For Wi-Fi access use this PC's Wi-Fi IPv4 address with port $Port and enter the access key." }
if ($Remote) { Write-Host 'Open the private pairing link on your phone with Tailscale connected. The PC must stay awake and online.' }
Write-Host 'Press Ctrl+C to stop CAD processing. Existing drawings and offline models remain saved.'
if (!$NoBrowser) { Start-Process $cadPair -WindowStyle Hidden }
& $FreeCadPython (Join-Path $cadRoot 'worker/server.py') --host $cadHost --port $Port --freecad-python $FreeCadPython
if ($LASTEXITCODE -ne 0) { throw 'CAD service stopped with an error. Check whether another CAD service is already running.' }
