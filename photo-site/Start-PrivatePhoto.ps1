param([ValidateRange(1,65535)][int]$HttpsPort = 8443)
$ErrorActionPreference = 'Stop'
$photoRoot = Split-Path -Parent $PSScriptRoot
$photoPython = Join-Path $PSScriptRoot '.venv/Scripts/python.exe'
$photoTailscale = Join-Path $env:ProgramFiles 'Tailscale/tailscale.exe'
if (!(Test-Path -LiteralPath $photoTailscale)) {
    throw 'Install Tailscale on this PC and your phone from https://tailscale.com/download, then sign in to the same account on both devices.'
}
if (!(Test-Path -LiteralPath $photoPython)) { throw 'Complete the Python setup in photo-site/README.md first.' }
if (!(Test-Path -LiteralPath (Join-Path $PSScriptRoot 'dist/index.html'))) { throw 'Run npm run build:photo first.' }
if (!(Test-Path -LiteralPath (Join-Path $PSScriptRoot 'model/tradesight-model.json'))) { throw 'Download the Small model first; see photo-site/README.md.' }
$photoStatus = & $photoTailscale status --json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $photoStatus.BackendState -ne 'Running') {
    throw 'Open Tailscale and sign in on this PC first.'
}
$photoDns = $photoStatus.Self.DNSName.TrimEnd('.')
if (!$photoDns) { throw 'Enable MagicDNS and HTTPS in your Tailscale account, then retry.' }
$photoServe = & $photoTailscale serve status --json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect the existing Tailscale Serve configuration.' }
# Never replace another service already using this HTTPS port.
if ($photoServe.TCP -and $photoServe.TCP.PSObject.Properties.Name -contains "$HttpsPort") {
    throw "Tailscale Serve already uses port $HttpsPort. Select another port with -HttpsPort or manage the existing route manually."
}
$photoPreviousKey = $env:TRADESIGHT_PHOTO_KEY
$photoPreviousOrigin = $env:TRADESIGHT_PHOTO_ORIGIN
$photoPreviousLocation = Get-Location
$photoUrl = "https://${photoDns}:$HttpsPort"
try {
    if (!$env:TRADESIGHT_PHOTO_KEY) {
        $photoRandom = [Security.Cryptography.RandomNumberGenerator]::Create()
        $photoBytes = New-Object byte[] 32
        $photoRandom.GetBytes($photoBytes)
        $photoRandom.Dispose()
        $env:TRADESIGHT_PHOTO_KEY = [Convert]::ToBase64String($photoBytes)
    }
    $env:TRADESIGHT_PHOTO_ORIGIN = $photoUrl
    & $photoTailscale serve --bg "--https=$HttpsPort" http://127.0.0.1:8765
    if ($LASTEXITCODE -ne 0) { throw 'Private HTTPS setup failed. Follow the Tailscale HTTPS prompt and retry.' }
    Write-Host "Private photo address: $photoUrl"
    Write-Host 'Connect Tailscale on your phone, then open this address on mobile data or any Wi-Fi.'
    Write-Host "Photo access key: $env:TRADESIGHT_PHOTO_KEY"
    Write-Host 'Keep this key private. The PC must stay awake, online, and this service must keep running.'
    Write-Host 'Remote access is not verified until a photo finishes from the phone on mobile data.'
    Set-Location -LiteralPath $photoRoot
    & $photoPython photo-site/worker/server.py --host 127.0.0.1
    if ($LASTEXITCODE -ne 0) { throw 'The Windows photo service did not start successfully.' }
} finally {
    # Route configuration persists until explicitly stopped; the worker stops with this session.
    Set-Location -LiteralPath $photoPreviousLocation.Path
    $env:TRADESIGHT_PHOTO_KEY = $photoPreviousKey
    $env:TRADESIGHT_PHOTO_ORIGIN = $photoPreviousOrigin
}
