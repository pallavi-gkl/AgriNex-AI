$routes = @('/signin', '/signup', '/farmer/dashboard', '/consumer/marketplace', '/consumer/notifications', '/orders', '/settings')
foreach ($route in $routes) {
  $url = 'http://localhost:3001' + $route
  try {
    $resp = Invoke-WebRequest -Uri $url -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "$route -> HTTP $($resp.StatusCode)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "$route -> HTTP $code"
  }
}
