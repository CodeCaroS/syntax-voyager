[CmdletBinding()]
param(
  [ValidateSet("build", "build:vercel", "content:build", "dev", "lint", "test", "test:e2e")]
  [string]$NpmScript = "test",
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$NpmArguments
)

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path.TrimEnd("\")
$existing = subst | Where-Object {
  $_.EndsWith("=> $projectRoot", [StringComparison]::OrdinalIgnoreCase)
} | Select-Object -First 1
$drive = if ($existing) {
  $existing.Substring(0, 2)
} else {
  "V:"
}
$created = -not $existing

if ($created) {
  if (Get-PSDrive -Name $drive[0] -ErrorAction SilentlyContinue) {
    throw "$drive is already in use. Map the project to another drive and rerun there."
  }
  subst $drive $projectRoot
}

Push-Location "$drive\"
try {
  & npm.cmd run $NpmScript @NpmArguments
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
  if ($created) {
    subst $drive /D
  }
}

exit $exitCode
