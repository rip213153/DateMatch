$ErrorActionPreference = "Stop"

# Normalize Windows PATH key casing in current session to avoid duplicate-key issues.
$processEnv = [System.Environment]::GetEnvironmentVariables("Process")
$resolvedPath = $processEnv["Path"]
if ([string]::IsNullOrWhiteSpace($resolvedPath)) {
  $resolvedPath = $processEnv["PATH"]
}
if ([string]::IsNullOrWhiteSpace($resolvedPath)) {
  $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
  if (-not [string]::IsNullOrWhiteSpace($machinePath) -and -not [string]::IsNullOrWhiteSpace($userPath)) {
    $resolvedPath = "$machinePath;$userPath"
  } elseif (-not [string]::IsNullOrWhiteSpace($machinePath)) {
    $resolvedPath = $machinePath
  } else {
    $resolvedPath = $userPath
  }
}
[System.Environment]::SetEnvironmentVariable("Path", $resolvedPath, "Process")
[System.Environment]::SetEnvironmentVariable("PATH", $null, "Process")

# Always run from this script's directory.
Set-Location -LiteralPath $PSScriptRoot

npm run dev
